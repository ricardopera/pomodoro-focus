import { describe, expect, it } from 'vitest';
import {
  cleanText,
  dayKey,
  daysBetween,
  formatClock,
  formatDayLabel,
  formatDuration,
  formatTime,
} from '../format';

describe('formatClock', () => {
  it('formats minutes and seconds', () => {
    expect(formatClock(1500)).toBe('25:00');
    expect(formatClock(59)).toBe('00:59');
    expect(formatClock(0)).toBe('00:00');
  });

  it('adds an hour segment past 60 minutes', () => {
    expect(formatClock(3725)).toBe('1:02:05');
  });

  it('never shows negative time', () => {
    expect(formatClock(-30)).toBe('00:00');
  });
});

describe('formatDuration', () => {
  it('reads as minutes below an hour', () => {
    expect(formatDuration(600)).toBe('10min');
    expect(formatDuration(0)).toBe('0min');
  });

  it('reads as hours above an hour', () => {
    expect(formatDuration(3600)).toBe('1h');
    expect(formatDuration(5400)).toBe('1h 30min');
  });
});

describe('dayKey and daysBetween', () => {
  it('uses the local calendar day', () => {
    expect(dayKey(new Date(2026, 6, 29, 23, 30))).toBe('2026-07-29');
  });

  it('ignores the time of day when counting days', () => {
    const today = new Date(2026, 6, 29, 1, 0);
    const yesterday = new Date(2026, 6, 28, 23, 59);
    expect(daysBetween(today, yesterday)).toBe(1);
    expect(daysBetween(today, today)).toBe(0);
  });
});

describe('formatDayLabel', () => {
  const now = new Date(2026, 6, 29, 12, 0);

  it('names the two most recent days', () => {
    expect(formatDayLabel(new Date(2026, 6, 29, 9, 0).toISOString(), now)).toBe('Hoje');
    expect(formatDayLabel(new Date(2026, 6, 28, 9, 0).toISOString(), now)).toBe('Ontem');
  });

  it('falls back to a short date', () => {
    expect(formatDayLabel(new Date(2026, 6, 20, 9, 0).toISOString(), now)).toBe('20/07');
  });
});

describe('formatTime', () => {
  it('pads hours and minutes', () => {
    expect(formatTime(new Date(2026, 6, 29, 9, 5).toISOString())).toBe('09:05');
  });
});

describe('cleanText', () => {
  it('collapses whitespace and trims', () => {
    expect(cleanText('  revisar   proposta \n final ')).toBe('revisar proposta final');
  });

  it('respects the maximum length', () => {
    expect(cleanText('abcdef', 3)).toBe('abc');
  });
});
