import type { Settings } from './types';

// Default settings values
export const DEFAULT_SETTINGS: Settings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
  theme: 'system',
  notificationsEnabled: true,
  soundEnabled: true,
  minimizeToTray: true,
  autoStartBreaks: true,
  autoStartFocus: false,
};

// Timer states
export const TIMER_STATES = {
  IDLE: 'idle' as const,
  FOCUS: 'focus' as const,
  BREAK_SHORT: 'break-short' as const,
  BREAK_LONG: 'break-long' as const,
};

// IPC Channel names
export const IPC_CHANNELS = {
  // Settings
  SETTINGS_GET: 'settings:get',
  SETTINGS_UPDATE: 'settings:update',
  SETTINGS_RESET: 'settings:reset',
  SETTINGS_CHANGED: 'settings:changed',

  // Timer
  TIMER_START: 'timer:start',
  TIMER_PAUSE: 'timer:pause',
  TIMER_RESUME: 'timer:resume',
  TIMER_RESET: 'timer:reset',
  TIMER_TICK: 'timer:tick',
  TIMER_COMPLETE: 'timer:complete',

  // Sessions
  SESSIONS_GET: 'sessions:get',
  
  // Statistics
  STATISTICS_GET: 'statistics:get',
} as const;

// Validation constants
export const VALIDATION = {
  FOCUS_DURATION_MIN: 1,
  FOCUS_DURATION_MAX: 60,
  SHORT_BREAK_MIN: 1,
  SHORT_BREAK_MAX: 30,
  LONG_BREAK_MIN: 5,
  LONG_BREAK_MAX: 60,
  SESSIONS_BEFORE_LONG_BREAK_MIN: 2,
  SESSIONS_BEFORE_LONG_BREAK_MAX: 10,
} as const;

// Performance targets
export const PERFORMANCE = {
  STARTUP_TARGET_MS: 200,
  MEMORY_TARGET_MB: 100,
  TIMER_PRECISION_TOLERANCE_MS: 2000, // ±2s in 25min
} as const;
