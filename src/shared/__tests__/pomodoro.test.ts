import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '../constants';
import {
  clamp,
  nextPhase,
  phaseProgress,
  phaseSeconds,
  restoreTimer,
  sanitizeSettings,
  shouldAutoStart,
} from '../pomodoro';
import type { Settings } from '../types';

const settings: Settings = { ...DEFAULT_SETTINGS };

describe('phaseSeconds', () => {
  it('converts each phase duration to seconds', () => {
    expect(phaseSeconds('focus', settings)).toBe(25 * 60);
    expect(phaseSeconds('shortBreak', settings)).toBe(5 * 60);
    expect(phaseSeconds('longBreak', settings)).toBe(15 * 60);
  });
});

describe('nextPhase', () => {
  it('sends a completed focus session to a short break', () => {
    expect(nextPhase('focus', 0, settings)).toEqual({ kind: 'shortBreak', cycleCount: 1 });
  });

  it('sends the fourth focus session to the long break', () => {
    expect(nextPhase('focus', 3, settings)).toEqual({ kind: 'longBreak', cycleCount: 4 });
  });

  it('honours a custom long break interval', () => {
    const custom = { ...settings, longBreakInterval: 2 };
    expect(nextPhase('focus', 1, custom).kind).toBe('longBreak');
    expect(nextPhase('focus', 0, custom).kind).toBe('shortBreak');
  });

  it('does not count a skipped focus session towards the long break', () => {
    expect(nextPhase('focus', 3, settings, false)).toEqual({ kind: 'shortBreak', cycleCount: 3 });
  });

  it('returns to focus after a break and resets the cycle after a long one', () => {
    expect(nextPhase('shortBreak', 2, settings)).toEqual({ kind: 'focus', cycleCount: 2 });
    expect(nextPhase('longBreak', 4, settings)).toEqual({ kind: 'focus', cycleCount: 0 });
  });
});

describe('shouldAutoStart', () => {
  it('follows the matching setting for each phase', () => {
    const config = { ...settings, autoStartBreaks: true, autoStartFocus: false };
    expect(shouldAutoStart('shortBreak', config)).toBe(true);
    expect(shouldAutoStart('longBreak', config)).toBe(true);
    expect(shouldAutoStart('focus', config)).toBe(false);
  });
});

describe('phaseProgress', () => {
  it('reports elapsed fraction and stays inside 0..1', () => {
    expect(phaseProgress(100, 100)).toBe(0);
    expect(phaseProgress(100, 25)).toBeCloseTo(0.75);
    expect(phaseProgress(100, -20)).toBe(1);
    expect(phaseProgress(0, 0)).toBe(0);
  });
});

describe('clamp', () => {
  it('bounds values and rejects NaN', () => {
    expect(clamp(5, 1, 10)).toBe(5);
    expect(clamp(-3, 1, 10)).toBe(1);
    expect(clamp(99, 1, 10)).toBe(10);
    expect(clamp(Number.NaN, 2, 10)).toBe(2);
  });
});

describe('sanitizeSettings', () => {
  it('fills in defaults for missing fields', () => {
    expect(sanitizeSettings({})).toEqual(DEFAULT_SETTINGS);
    expect(sanitizeSettings(undefined).focusMinutes).toBe(25);
  });

  it('clamps out-of-range numbers', () => {
    const result = sanitizeSettings({ focusMinutes: 999, longBreakInterval: 1, soundVolume: 4 });
    expect(result.focusMinutes).toBe(180);
    expect(result.longBreakInterval).toBe(2);
    expect(result.soundVolume).toBe(1);
  });

  it('keeps valid custom values', () => {
    expect(sanitizeSettings({ focusMinutes: 50, theme: 'paper' }).focusMinutes).toBe(50);
    expect(sanitizeSettings({ theme: 'paper' }).theme).toBe('paper');
  });
});

describe('restoreTimer', () => {
  const now = 1_700_000_000_000;

  it('starts fresh when there is nothing stored', () => {
    const { timer, expired } = restoreTimer(undefined, settings, now);
    expect(timer.status).toBe('idle');
    expect(timer.remainingSeconds).toBe(25 * 60);
    expect(expired).toBe(false);
  });

  it('keeps a running session going against the wall clock', () => {
    const { timer, expired } = restoreTimer(
      {
        kind: 'focus',
        status: 'running',
        plannedSeconds: 1500,
        remainingSeconds: 1500,
        deadline: now + 600_000,
        startedAt: now - 900_000,
        cycleCount: 1,
        title: 'Relatório',
        notes: 'Fechar seção 3',
        taskId: null,
      },
      settings,
      now
    );
    expect(timer.status).toBe('running');
    expect(timer.remainingSeconds).toBe(600);
    expect(timer.title).toBe('Relatório');
    expect(expired).toBe(false);
  });

  it('reports a session whose deadline passed while the app was closed', () => {
    const { timer, expired } = restoreTimer(
      {
        status: 'running',
        deadline: now - 5_000,
        plannedSeconds: 1500,
        startedAt: now - 1_505_000,
      },
      settings,
      now
    );
    expect(expired).toBe(true);
    expect(timer.status).toBe('idle');
    expect(timer.remainingSeconds).toBe(0);
  });

  it('restores a paused session with its remaining time', () => {
    const { timer } = restoreTimer(
      { status: 'paused', plannedSeconds: 1500, remainingSeconds: 420, startedAt: now - 60_000 },
      settings,
      now
    );
    expect(timer.status).toBe('paused');
    expect(timer.remainingSeconds).toBe(420);
    expect(timer.deadline).toBeNull();
  });
});
