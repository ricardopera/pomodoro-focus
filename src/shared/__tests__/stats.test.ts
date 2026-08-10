import { describe, expect, it } from 'vitest';
import { currentStreak, dailySeries, summarize, topTopics } from '../stats';
import type { SessionRecord, SessionOutcome, PhaseKind } from '../types';

const NOW = new Date(2026, 6, 29, 15, 0);

let counter = 0;

function session(
  daysAgo: number,
  overrides: Partial<SessionRecord> & { kind?: PhaseKind; outcome?: SessionOutcome } = {}
): SessionRecord {
  const started = new Date(NOW);
  started.setDate(started.getDate() - daysAgo);
  counter += 1;
  return {
    id: `s${counter}`,
    kind: 'focus',
    title: 'Escrever proposta',
    notes: '',
    taskId: null,
    plannedSeconds: 1500,
    actualSeconds: 1500,
    startedAt: started.toISOString(),
    endedAt: started.toISOString(),
    outcome: 'completed',
    ...overrides,
  };
}

describe('summarize', () => {
  it('counts today, the week and the total', () => {
    const summary = summarize([session(0), session(0), session(3), session(20)], NOW);
    expect(summary.todayCount).toBe(2);
    expect(summary.todaySeconds).toBe(3000);
    expect(summary.weekCount).toBe(3);
    expect(summary.totalCount).toBe(4);
  });

  it('counts time from interrupted sessions but not the session itself', () => {
    const summary = summarize(
      [session(0), session(0, { outcome: 'abandoned', actualSeconds: 300 })],
      NOW
    );
    expect(summary.todayCount).toBe(1);
    expect(summary.todaySeconds).toBe(1800);
  });

  it('ignores breaks entirely', () => {
    const summary = summarize([session(0, { kind: 'shortBreak' }), session(0)], NOW);
    expect(summary.totalCount).toBe(1);
    expect(summary.totalSeconds).toBe(1500);
  });

  it('reports the best day and the average of active days', () => {
    const summary = summarize([session(0), session(0), session(1)], NOW);
    expect(summary.bestDayCount).toBe(2);
    expect(summary.averageSeconds).toBe(2250);
  });

  it('handles an empty history', () => {
    const summary = summarize([], NOW);
    expect(summary).toMatchObject({ todayCount: 0, totalCount: 0, streak: 0, averageSeconds: 0 });
  });
});

describe('currentStreak', () => {
  it('counts consecutive days ending today', () => {
    expect(currentStreak([session(0), session(1), session(2)], NOW)).toBe(3);
  });

  it('survives a day that is still in progress', () => {
    expect(currentStreak([session(1), session(2)], NOW)).toBe(2);
  });

  it('breaks after two silent days', () => {
    expect(currentStreak([session(2), session(3)], NOW)).toBe(0);
  });

  it('stops at the first gap', () => {
    expect(currentStreak([session(0), session(1), session(4)], NOW)).toBe(2);
  });
});

describe('dailySeries', () => {
  it('zero-fills the requested window', () => {
    const series = dailySeries([session(0), session(2)], 5, NOW);
    expect(series).toHaveLength(5);
    expect(series.at(-1)?.count).toBe(1);
    expect(series.at(-2)?.count).toBe(0);
    expect(series.at(-3)?.count).toBe(1);
  });
});

describe('topTopics', () => {
  it('groups by session name, ordered by time spent', () => {
    const topics = topTopics([
      session(0, { title: 'Estudar' }),
      session(0, { title: 'Escrever' }),
      session(1, { title: 'Escrever' }),
    ]);
    expect(topics[0]).toMatchObject({ title: 'Escrever', count: 2, seconds: 3000 });
    expect(topics[1]).toMatchObject({ title: 'Estudar', count: 1 });
  });

  it('groups nameless sessions under a single label', () => {
    const topics = topTopics([session(0, { title: '' }), session(0, { title: '   ' })]);
    expect(topics).toHaveLength(1);
    expect(topics[0].title).toBe('Sem nome');
  });
});
