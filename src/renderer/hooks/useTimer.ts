import { useState, useEffect, useCallback } from 'react';
import type { AppState } from '@shared/types';

export function useTimer() {
  const [timerState, setTimerState] = useState<AppState>({
    currentState: 'idle',
    timeLeft: 0,
    sessionsCompleted: 0,
    isPaused: false,
    startTimestamp: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Listen for timer tick events
    const unsubscribeTick = window.electronAPI.timer.onTick((state) => {
      setTimerState(state);
    });

    // Listen for timer complete events
    const unsubscribeComplete = window.electronAPI.timer.onComplete(() => {
      // State will be updated via onTick
    });

    return () => {
      unsubscribeTick();
      unsubscribeComplete();
    };
  }, []);

  const startTimer = useCallback(
    async (type: 'focus' | 'break-short' | 'break-long'): Promise<void> => {
      setIsLoading(true);
      try {
        const state = await window.electronAPI.timer.start(type);
        setTimerState(state);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const pauseTimer = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const state = await window.electronAPI.timer.pause();
      setTimerState(state);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resumeTimer = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const state = await window.electronAPI.timer.resume();
      setTimerState(state);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetTimer = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const state = await window.electronAPI.timer.reset();
      setTimerState(state);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    timerState,
    isLoading,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
  };
}
