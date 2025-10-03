import type { AppState, Session } from '@shared/types';
import { TIMER_STATES } from '@shared/constants';
import { addSession } from './store';

let timerInterval: NodeJS.Timeout | null = null;
let appState: AppState = {
  currentState: TIMER_STATES.IDLE,
  timeLeft: 0,
  sessionsCompleted: 0,
  isPaused: false,
  startTimestamp: null,
};
let currentSessionId: string | null = null;

type TimerTickCallback = (state: AppState) => void;
type TimerCompleteCallback = () => void;

let onTick: TimerTickCallback | null = null;
let onComplete: TimerCompleteCallback | null = null;

// Session tracking
let sessionStartedAt: Date | null = null;
let sessionInterruptions = 0;
let plannedDurationMinutes = 0;

export function setTimerTickCallback(callback: TimerTickCallback): void {
  onTick = callback;
}

export function setTimerCompleteCallback(callback: TimerCompleteCallback): void {
  onComplete = callback;
}

export function getAppState(): AppState {
  return { ...appState };
}

export function startTimer(type: 'focus' | 'break-short' | 'break-long', durationMinutes: number): AppState {
  stopTimer(); // Clear any existing timer

  const state = type === 'focus' ? TIMER_STATES.FOCUS : 
                type === 'break-short' ? TIMER_STATES.BREAK_SHORT : 
                TIMER_STATES.BREAK_LONG;

  const now = Date.now();
  appState = {
    currentState: state,
    timeLeft: durationMinutes * 60 * 1000, // Convert to milliseconds
    sessionsCompleted: appState.sessionsCompleted,
    isPaused: false,
    startTimestamp: now,
  };

  currentSessionId = generateSessionId();
  sessionStartedAt = new Date(now);
  sessionInterruptions = 0;
  plannedDurationMinutes = durationMinutes;

  timerInterval = setInterval(() => {
    if (!appState.isPaused) {
      appState.timeLeft = Math.max(0, appState.timeLeft - 1000);

      if (onTick) {
        onTick({ ...appState });
      }

      if (appState.timeLeft <= 0) {
        completeTimer(true);
      }
    }
  }, 1000);

  if (onTick) {
    onTick({ ...appState });
  }

  return { ...appState };
}

export function pauseTimer(): AppState {
  if (appState.currentState === TIMER_STATES.IDLE) {
    return { ...appState };
  }

  appState.isPaused = true;
  sessionInterruptions++;

  if (onTick) {
    onTick({ ...appState });
  }

  return { ...appState };
}

export function resumeTimer(): AppState {
  if (appState.currentState === TIMER_STATES.IDLE || !appState.isPaused) {
    return { ...appState };
  }

  appState.isPaused = false;

  if (onTick) {
    onTick({ ...appState });
  }

  return { ...appState };
}

export function resetTimer(): AppState {
  stopTimer();

  // Save incomplete session if there was one
  if (currentSessionId && sessionStartedAt) {
    const endTime = new Date();
    const actualDuration = Math.round((endTime.getTime() - sessionStartedAt.getTime()) / 1000 / 60);

    const session: Session = {
      id: currentSessionId,
      type: appState.currentState === TIMER_STATES.FOCUS ? 'focus' :
            appState.currentState === TIMER_STATES.BREAK_SHORT ? 'break-short' :
            'break-long',
      plannedDuration: plannedDurationMinutes,
      actualDuration,
      startTime: sessionStartedAt.toISOString(),
      endTime: endTime.toISOString(),
      completed: false,
      interrupted: true,
    };
    addSession(session);
  }

  appState = {
    currentState: TIMER_STATES.IDLE,
    timeLeft: 0,
    sessionsCompleted: appState.sessionsCompleted,
    isPaused: false,
    startTimestamp: null,
  };

  currentSessionId = null;
  sessionStartedAt = null;
  sessionInterruptions = 0;
  plannedDurationMinutes = 0;

  if (onTick) {
    onTick({ ...appState });
  }

  return { ...appState };
}

function stopTimer(): void {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function completeTimer(wasCompleted: boolean): void {
  stopTimer();

  if (currentSessionId && sessionStartedAt) {
    const endTime = new Date();
    const actualDuration = Math.round((endTime.getTime() - sessionStartedAt.getTime()) / 1000 / 60);

    const session: Session = {
      id: currentSessionId,
      type: appState.currentState === TIMER_STATES.FOCUS ? 'focus' :
            appState.currentState === TIMER_STATES.BREAK_SHORT ? 'break-short' :
            'break-long',
      plannedDuration: plannedDurationMinutes,
      actualDuration,
      startTime: sessionStartedAt.toISOString(),
      endTime: endTime.toISOString(),
      completed: wasCompleted,
      interrupted: !wasCompleted,
    };
    addSession(session);

    // Increment completed sessions counter only for completed focus sessions
    if (wasCompleted && appState.currentState === TIMER_STATES.FOCUS) {
      appState.sessionsCompleted = (appState.sessionsCompleted + 1) % 4; // Reset to 0 after 4
    }
  }

  appState = {
    currentState: TIMER_STATES.IDLE,
    timeLeft: 0,
    sessionsCompleted: appState.sessionsCompleted,
    isPaused: false,
    startTimestamp: null,
  };

  currentSessionId = null;
  sessionStartedAt = null;
  sessionInterruptions = 0;
  plannedDurationMinutes = 0;

  if (onComplete) {
    onComplete();
  }

  if (onTick) {
    onTick({ ...appState });
  }
}

function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

