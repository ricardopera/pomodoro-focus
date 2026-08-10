/** Pure formatting helpers. No DOM, no Electron — safe to unit test. */

/** `1500` -> `"25:00"`, `3725` -> `"1:02:05"`. */
export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

/** `5400` -> `"1h 30min"`, `600` -> `"10min"`, `0` -> `"0min"`. */
export function formatDuration(totalSeconds: number): string {
  const minutes = Math.round(Math.max(0, totalSeconds) / 60);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}min`;
}

/** Local calendar day key, e.g. `"2026-07-29"`. */
export function dayKey(date: Date | string | number): string {
  const d = date instanceof Date ? date : new Date(date);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Days between two calendar days, ignoring the time of day. */
export function daysBetween(a: Date, b: Date): number {
  const ms = startOfDay(a).getTime() - startOfDay(b).getTime();
  return Math.round(ms / 86_400_000);
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const RELATIVE_DAYS = ['Hoje', 'Ontem'];

/** `"Hoje"`, `"Ontem"` or `"29/07"`. */
export function formatDayLabel(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const diff = daysBetween(now, date);
  if (diff >= 0 && diff < RELATIVE_DAYS.length) return RELATIVE_DAYS[diff];
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;
}

/** Collapses whitespace and trims — used before persisting user text. */
export function cleanText(value: string, maxLength = 400): string {
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}
