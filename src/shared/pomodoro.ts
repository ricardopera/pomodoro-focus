import { DEFAULT_SETTINGS, DEFAULT_TIMER, LIMITS } from './constants';
import type { PhaseKind, Settings, TimerSnapshot } from './types';

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/** Duration, in seconds, of a phase under the given settings. */
export function phaseSeconds(kind: PhaseKind, settings: Settings): number {
  switch (kind) {
    case 'focus':
      return Math.round(settings.focusMinutes * 60);
    case 'shortBreak':
      return Math.round(settings.shortBreakMinutes * 60);
    case 'longBreak':
      return Math.round(settings.longBreakMinutes * 60);
  }
}

export interface PhaseTransition {
  kind: PhaseKind;
  /** Focus sessions completed since the last long break. */
  cycleCount: number;
}

/**
 * The heart of the technique: focus -> short break, and every
 * `longBreakInterval` focus sessions, a long break instead.
 */
export function nextPhase(
  current: PhaseKind,
  cycleCount: number,
  settings: Settings,
  /** A skipped focus session does not count towards the long break. */
  counts = true
): PhaseTransition {
  if (current !== 'focus') {
    return { kind: 'focus', cycleCount: current === 'longBreak' ? 0 : cycleCount };
  }

  const completed = counts ? cycleCount + 1 : cycleCount;
  const interval = Math.max(LIMITS.longBreakInterval.min, Math.round(settings.longBreakInterval));
  if (completed > 0 && completed % interval === 0) {
    return { kind: 'longBreak', cycleCount: completed };
  }
  return { kind: 'shortBreak', cycleCount: completed };
}

export function shouldAutoStart(kind: PhaseKind, settings: Settings): boolean {
  return kind === 'focus' ? settings.autoStartFocus : settings.autoStartBreaks;
}

/** How far along the current phase is, from 0 to 1. */
export function phaseProgress(plannedSeconds: number, remainingSeconds: number): number {
  if (plannedSeconds <= 0) return 0;
  const elapsed = plannedSeconds - remainingSeconds;
  return clamp(elapsed / plannedSeconds, 0, 1);
}

/** Merges stored settings with the defaults and clamps every number. */
export function sanitizeSettings(raw: unknown): Settings {
  const input = (raw ?? {}) as Partial<Settings>;
  const merged: Settings = { ...DEFAULT_SETTINGS, ...input };
  return {
    ...merged,
    focusMinutes: Math.round(
      clamp(merged.focusMinutes, LIMITS.focusMinutes.min, LIMITS.focusMinutes.max)
    ),
    shortBreakMinutes: Math.round(
      clamp(merged.shortBreakMinutes, LIMITS.shortBreakMinutes.min, LIMITS.shortBreakMinutes.max)
    ),
    longBreakMinutes: Math.round(
      clamp(merged.longBreakMinutes, LIMITS.longBreakMinutes.min, LIMITS.longBreakMinutes.max)
    ),
    longBreakInterval: Math.round(
      clamp(merged.longBreakInterval, LIMITS.longBreakInterval.min, LIMITS.longBreakInterval.max)
    ),
    dailyGoal: Math.round(clamp(merged.dailyGoal, LIMITS.dailyGoal.min, LIMITS.dailyGoal.max)),
    soundVolume: clamp(merged.soundVolume, 0, 1),
  };
}

/**
 * Rebuilds the timer after a restart. A session that was running keeps
 * running against the wall clock; one whose deadline already passed is
 * reported back so the caller can log it and move on.
 */
export interface RestoredTimer {
  timer: TimerSnapshot;
  /** Seconds the expired session actually ran, when it expired while away. */
  expired: boolean;
}

export function restoreTimer(raw: unknown, settings: Settings, now = Date.now()): RestoredTimer {
  const input = (raw ?? {}) as Partial<TimerSnapshot>;
  const kind: PhaseKind =
    input.kind === 'shortBreak' || input.kind === 'longBreak' || input.kind === 'focus'
      ? input.kind
      : 'focus';
  const planned =
    typeof input.plannedSeconds === 'number' && input.plannedSeconds > 0
      ? Math.round(input.plannedSeconds)
      : phaseSeconds(kind, settings);

  const base: TimerSnapshot = {
    ...DEFAULT_TIMER,
    kind,
    plannedSeconds: planned,
    remainingSeconds: clamp(
      typeof input.remainingSeconds === 'number' ? Math.round(input.remainingSeconds) : planned,
      0,
      planned
    ),
    cycleCount: Math.max(0, Math.round(input.cycleCount ?? 0)),
    title: typeof input.title === 'string' ? input.title : '',
    notes: typeof input.notes === 'string' ? input.notes : '',
    taskId: typeof input.taskId === 'string' ? input.taskId : null,
    startedAt: typeof input.startedAt === 'number' ? input.startedAt : null,
    status: 'idle',
    deadline: null,
  };

  if (input.status === 'paused') {
    return { timer: { ...base, status: 'paused' }, expired: false };
  }

  if (input.status === 'running' && typeof input.deadline === 'number') {
    const remaining = Math.ceil((input.deadline - now) / 1000);
    if (remaining > 0) {
      return {
        timer: {
          ...base,
          status: 'running',
          deadline: input.deadline,
          remainingSeconds: Math.min(remaining, planned),
        },
        expired: false,
      };
    }
    // Finished while the app was closed.
    return { timer: { ...base, status: 'idle', remainingSeconds: 0 }, expired: true };
  }

  return { timer: base, expired: false };
}

/** Short, human label for the taskbar/tray tooltip. */
export function timerTooltip(kind: PhaseKind, clock: string, title: string): string {
  const phase = kind === 'focus' ? 'Foco' : kind === 'shortBreak' ? 'Pausa curta' : 'Pausa longa';
  return title ? `${phase} • ${clock} — ${title}` : `${phase} • ${clock}`;
}
