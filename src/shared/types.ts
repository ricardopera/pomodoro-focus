/**
 * Domain types shared between the main process, the preload bridge and the UI.
 * Everything here is plain data so it can cross the IPC boundary untouched.
 */

/** The three phases of the Pomodoro technique. */
export type PhaseKind = 'focus' | 'shortBreak' | 'longBreak';

export type TimerStatus = 'idle' | 'running' | 'paused';

/** How a session ended. */
export type SessionOutcome = 'completed' | 'skipped' | 'abandoned';

export type ThemeName = 'midnight' | 'aurora' | 'ember' | 'paper';

export interface Settings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  /** Number of focus sessions before a long break. */
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  /** Ask for a name/description before a focus session starts. */
  requireSessionName: boolean;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  /** 0..1 */
  soundVolume: number;
  tickingEnabled: boolean;
  alwaysOnTop: boolean;
  minimizeToTray: boolean;
  /** Dim the interface while focusing so only the timer remains. */
  focusDimming: boolean;
  theme: ThemeName;
  /** Focus sessions the user aims to complete per day. */
  dailyGoal: number;
}

/** A finished (or interrupted) block of time, kept in the history log. */
export interface SessionRecord {
  id: string;
  kind: PhaseKind;
  /** What the user was working on. Empty for breaks. */
  title: string;
  /** Free-form description of the session. */
  notes: string;
  taskId: string | null;
  plannedSeconds: number;
  /** Time actually spent focusing/resting. */
  actualSeconds: number;
  startedAt: string;
  endedAt: string;
  outcome: SessionOutcome;
}

/** An item on the user's plan for the day. */
export interface TaskItem {
  id: string;
  title: string;
  notes: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  done: boolean;
  createdAt: string;
}

/** The live timer, persisted so a restart never loses a running session. */
export interface TimerSnapshot {
  kind: PhaseKind;
  status: TimerStatus;
  plannedSeconds: number;
  remainingSeconds: number;
  /** Epoch ms when the current run ends. Null while idle/paused. */
  deadline: number | null;
  /** Epoch ms when this session first started. Null while idle. */
  startedAt: number | null;
  /** Focus sessions completed in the current long-break cycle. */
  cycleCount: number;
  title: string;
  notes: string;
  taskId: string | null;
}

/** Everything persisted to disk. */
export interface AppData {
  version: number;
  settings: Settings;
  tasks: TaskItem[];
  sessions: SessionRecord[];
  timer: TimerSnapshot;
}

export type WindowMode = 'normal' | 'mini';

/** Commands the tray/global shortcuts push down to the UI. */
export type RemoteCommand = 'toggle' | 'start' | 'pause' | 'reset' | 'skip';

export interface TrayState {
  status: TimerStatus;
  kind: PhaseKind;
  remainingSeconds: number;
  title: string;
}

export interface NotifyPayload {
  title: string;
  body: string;
}
