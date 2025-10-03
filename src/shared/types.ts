// Core application state types

export type TimerState = 'idle' | 'focus' | 'break-short' | 'break-long';

export interface AppState {
  currentState: TimerState;
  timeLeft: number; // milliseconds
  sessionsCompleted: number; // 0-3 (resets to 0 after 4)
  isPaused: boolean;
  startTimestamp: number | null; // Date.now() when timer started
}

export interface Settings {
  focusDuration: number; // minutes (1-60)
  shortBreakDuration: number; // minutes (1-30)
  longBreakDuration: number; // minutes (5-60)
  sessionsBeforeLongBreak: number; // 2-10
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  minimizeToTray: boolean;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
}

export type SessionType = 'focus' | 'break-short' | 'break-long';

export interface Session {
  id: string; // UUIDv4
  type: SessionType;
  plannedDuration: number; // minutes
  actualDuration: number; // minutes
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  completed: boolean;
  interrupted: boolean;
}

export interface Statistics {
  todayFocusMinutes: number;
  todaySessionsCompleted: number;
  weekFocusMinutes: number;
  weekSessionsCompleted: number;
  currentStreak: number; // consecutive days
  longestStreak: number;
}

// IPC Event payloads

export interface TimerTickPayload {
  timeRemaining: number; // milliseconds
  timeElapsed: number; // milliseconds
  progress: number; // 0.0 - 1.0
}

export interface TimerCompletePayload {
  sessionId: string;
  type: SessionType;
  nextState: TimerState;
  sessionsCompleted: number;
}

export interface StartTimerRequest {
  type: SessionType;
  duration: number; // milliseconds
}

export interface StartTimerResponse {
  success: boolean;
  sessionId?: string;
  startTime?: string;
  error?: string;
}

export interface UpdateSettingsRequest {
  focusDuration?: number;
  shortBreakDuration?: number;
  longBreakDuration?: number;
  sessionsBeforeLongBreak?: number;
  theme?: 'light' | 'dark' | 'system';
  notificationsEnabled?: boolean;
  soundEnabled?: boolean;
  minimizeToTray?: boolean;
  autoStartBreaks?: boolean;
  autoStartFocus?: boolean;
}

export interface UpdateSettingsResponse {
  success: boolean;
  settings?: Settings;
  error?: string;
}

export interface GetSessionsRequest {
  from?: string; // ISO date (YYYY-MM-DD)
  to?: string; // ISO date
  limit?: number;
}

export interface GetSessionsResponse {
  sessions: Session[];
  total: number;
}
