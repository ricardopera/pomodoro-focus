import { dayKey, daysBetween } from './format';
import type { SessionRecord } from './types';

export interface DayBucket {
  key: string;
  date: Date;
  /** Completed focus sessions on that day. */
  count: number;
  /** Seconds actually focused on that day. */
  seconds: number;
}

export interface StatsSummary {
  todayCount: number;
  todaySeconds: number;
  weekCount: number;
  weekSeconds: number;
  totalCount: number;
  totalSeconds: number;
  /** Consecutive days, ending today or yesterday, with at least one pomodoro. */
  streak: number;
  bestDayCount: number;
  /** Average focus seconds per active day. */
  averageSeconds: number;
}

export interface TopicTotal {
  title: string;
  count: number;
  seconds: number;
}

export function isCompletedFocus(session: SessionRecord): boolean {
  return session.kind === 'focus' && session.outcome === 'completed';
}

export function focusSessions(sessions: SessionRecord[]): SessionRecord[] {
  return sessions.filter((s) => s.kind === 'focus');
}

/** Buckets completed focus work per calendar day. */
export function bucketByDay(sessions: SessionRecord[]): Map<string, DayBucket> {
  const map = new Map<string, DayBucket>();
  for (const session of focusSessions(sessions)) {
    const date = new Date(session.startedAt);
    const key = dayKey(date);
    const bucket = map.get(key) ?? { key, date, count: 0, seconds: 0 };
    if (session.outcome === 'completed') bucket.count += 1;
    bucket.seconds += Math.max(0, session.actualSeconds);
    map.set(key, bucket);
  }
  return map;
}

/** The last `days` calendar days, oldest first, with zero-filled gaps. */
export function dailySeries(
  sessions: SessionRecord[],
  days: number,
  now: Date = new Date()
): DayBucket[] {
  const buckets = bucketByDay(sessions);
  const series: DayBucket[] = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(now);
    date.setDate(date.getDate() - offset);
    date.setHours(0, 0, 0, 0);
    const key = dayKey(date);
    const bucket = buckets.get(key);
    series.push({ key, date, count: bucket?.count ?? 0, seconds: bucket?.seconds ?? 0 });
  }
  return series;
}

export function currentStreak(sessions: SessionRecord[], now: Date = new Date()): number {
  const buckets = bucketByDay(sessions);
  const active = new Set([...buckets.values()].filter((b) => b.count > 0).map((b) => b.key));
  if (active.size === 0) return 0;

  const cursor = new Date(now);
  // A streak stays alive until the end of the following day.
  if (!active.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!active.has(dayKey(cursor))) return 0;
  }

  let streak = 0;
  while (active.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function summarize(sessions: SessionRecord[], now: Date = new Date()): StatsSummary {
  const summary: StatsSummary = {
    todayCount: 0,
    todaySeconds: 0,
    weekCount: 0,
    weekSeconds: 0,
    totalCount: 0,
    totalSeconds: 0,
    streak: currentStreak(sessions, now),
    bestDayCount: 0,
    averageSeconds: 0,
  };

  for (const session of focusSessions(sessions)) {
    const seconds = Math.max(0, session.actualSeconds);
    const completed = session.outcome === 'completed';
    summary.totalSeconds += seconds;
    if (completed) summary.totalCount += 1;

    const age = daysBetween(now, new Date(session.startedAt));
    if (age === 0) {
      summary.todaySeconds += seconds;
      if (completed) summary.todayCount += 1;
    }
    if (age >= 0 && age < 7) {
      summary.weekSeconds += seconds;
      if (completed) summary.weekCount += 1;
    }
  }

  const buckets = [...bucketByDay(sessions).values()];
  summary.bestDayCount = buckets.reduce((max, b) => Math.max(max, b.count), 0);
  const activeDays = buckets.filter((b) => b.seconds > 0).length;
  summary.averageSeconds = activeDays > 0 ? Math.round(summary.totalSeconds / activeDays) : 0;

  return summary;
}

/** Focus time grouped by what the user said they were working on. */
export function topTopics(sessions: SessionRecord[], limit = 6, since?: Date): TopicTotal[] {
  const totals = new Map<string, TopicTotal>();
  for (const session of focusSessions(sessions)) {
    if (since && new Date(session.startedAt) < since) continue;
    const title = session.title.trim() || 'Sem nome';
    const entry = totals.get(title.toLowerCase()) ?? { title, count: 0, seconds: 0 };
    if (session.outcome === 'completed') entry.count += 1;
    entry.seconds += Math.max(0, session.actualSeconds);
    totals.set(title.toLowerCase(), entry);
  }
  return [...totals.values()].sort((a, b) => b.seconds - a.seconds).slice(0, limit);
}

/** Sessions of the most recent `days`, newest first. */
export function recentSessions(
  sessions: SessionRecord[],
  days = 30,
  now: Date = new Date()
): SessionRecord[] {
  return sessions
    .filter((s) => daysBetween(now, new Date(s.startedAt)) < days)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}
