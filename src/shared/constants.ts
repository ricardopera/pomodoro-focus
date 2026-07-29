import type { AppData, PhaseKind, Settings, TimerSnapshot } from './types';

export const DATA_VERSION = 2;

export const DEFAULT_SETTINGS: Settings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  autoStartBreaks: true,
  autoStartFocus: false,
  requireSessionName: false,
  notificationsEnabled: true,
  soundEnabled: true,
  soundVolume: 0.6,
  tickingEnabled: false,
  alwaysOnTop: false,
  minimizeToTray: true,
  focusDimming: true,
  theme: 'midnight',
  dailyGoal: 8,
};

export const DEFAULT_TIMER: TimerSnapshot = {
  kind: 'focus',
  status: 'idle',
  plannedSeconds: DEFAULT_SETTINGS.focusMinutes * 60,
  remainingSeconds: DEFAULT_SETTINGS.focusMinutes * 60,
  deadline: null,
  startedAt: null,
  cycleCount: 0,
  title: '',
  notes: '',
  taskId: null,
};

export const DEFAULT_DATA: AppData = {
  version: DATA_VERSION,
  settings: DEFAULT_SETTINGS,
  tasks: [],
  sessions: [],
  timer: DEFAULT_TIMER,
};

/** Bounds used by the settings screen and by sanitisation on load. */
export const LIMITS = {
  focusMinutes: { min: 1, max: 180 },
  shortBreakMinutes: { min: 1, max: 60 },
  longBreakMinutes: { min: 1, max: 120 },
  longBreakInterval: { min: 2, max: 12 },
  dailyGoal: { min: 1, max: 24 },
} as const;

export const PHASE_LABEL: Record<PhaseKind, string> = {
  focus: 'Foco',
  shortBreak: 'Pausa curta',
  longBreak: 'Pausa longa',
};

export const PHASE_TAGLINE: Record<PhaseKind, string> = {
  focus: 'Uma coisa de cada vez.',
  shortBreak: 'Respire, alongue, olhe longe.',
  longBreak: 'Descanse de verdade. Você merece.',
};

/** Maximum number of sessions kept in the history log. */
export const MAX_SESSIONS = 2000;

export const IPC = {
  dataLoad: 'data:load',
  dataSave: 'data:save',
  windowMinimize: 'window:minimize',
  windowClose: 'window:close',
  windowMode: 'window:mode',
  windowAlwaysOnTop: 'window:always-on-top',
  progressSet: 'progress:set',
  notify: 'notify',
  trayUpdate: 'tray:update',
  command: 'app:command',
} as const;
