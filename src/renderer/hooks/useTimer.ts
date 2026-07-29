import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { nextPhase, phaseSeconds, shouldAutoStart } from '../../shared/pomodoro';
import type {
  PhaseKind,
  SessionRecord,
  Settings,
  SessionOutcome,
  TimerSnapshot,
} from '../../shared/types';

/** Everything that happens to a session is reported through one channel. */
export interface TimerEvent {
  type: 'finished' | 'skipped' | 'discarded' | 'started';
  /** The session that just ended, when there is one worth logging. */
  record: SessionRecord | null;
  /** Phase the timer moved to. */
  nextKind: PhaseKind;
  autoStarted: boolean;
}

/** Sessions shorter than this are not worth a line in the history. */
const MIN_LOGGED_SECONDS = 30;

const uid = (): string => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export interface TimerApi {
  snapshot: TimerSnapshot;
  elapsedSeconds: number;
  start: () => void;
  pause: () => void;
  toggle: () => void;
  reset: () => void;
  skip: () => void;
  selectPhase: (kind: PhaseKind) => void;
  /** Adds time to the running phase, in minutes (can be negative). */
  extend: (minutes: number) => void;
  setMeta: (meta: Partial<Pick<TimerSnapshot, 'title' | 'notes' | 'taskId'>>) => void;
}

export function useTimer(
  initial: TimerSnapshot,
  settings: Settings,
  onEvent: (event: TimerEvent) => void
): TimerApi {
  const [snapshot, setSnapshot] = useState<TimerSnapshot>(initial);

  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const eventRef = useRef(onEvent);
  eventRef.current = onEvent;
  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;

  /** Builds the history entry for the session that is ending. */
  const buildRecord = useCallback(
    (
      current: TimerSnapshot,
      actualSeconds: number,
      outcome: SessionOutcome
    ): SessionRecord | null => {
      if (current.startedAt === null) return null;
      if (outcome !== 'completed' && actualSeconds < MIN_LOGGED_SECONDS) return null;
      const endedAt = new Date();
      return {
        id: uid(),
        kind: current.kind,
        title: current.kind === 'focus' ? current.title.trim() : '',
        notes: current.kind === 'focus' ? current.notes.trim() : '',
        taskId: current.kind === 'focus' ? current.taskId : null,
        plannedSeconds: current.plannedSeconds,
        actualSeconds: Math.max(0, Math.round(actualSeconds)),
        startedAt: new Date(current.startedAt).toISOString(),
        endedAt: endedAt.toISOString(),
        outcome,
      };
    },
    []
  );

  /** Moves to the next phase, carrying the task description only into focus. */
  const advance = useCallback(
    (current: TimerSnapshot, outcome: Exclude<SessionOutcome, 'abandoned'>) => {
      const config = settingsRef.current;
      const elapsed =
        outcome === 'completed'
          ? current.plannedSeconds
          : current.plannedSeconds - current.remainingSeconds;
      const record = buildRecord(current, elapsed, outcome);
      const transition = nextPhase(
        current.kind,
        current.cycleCount,
        config,
        outcome === 'completed'
      );
      const planned = phaseSeconds(transition.kind, config);
      const autoStart = shouldAutoStart(transition.kind, config);
      const now = Date.now();

      const next: TimerSnapshot = {
        kind: transition.kind,
        status: autoStart ? 'running' : 'idle',
        plannedSeconds: planned,
        remainingSeconds: planned,
        deadline: autoStart ? now + planned * 1000 : null,
        startedAt: autoStart ? now : null,
        cycleCount: transition.cycleCount,
        // The description of the work carries over to the next focus block.
        title: current.title,
        notes: current.notes,
        taskId: current.taskId,
      };

      setSnapshot(next);
      eventRef.current({
        type: outcome === 'completed' ? 'finished' : 'skipped',
        record,
        nextKind: transition.kind,
        autoStarted: autoStart,
      });
    },
    [buildRecord]
  );

  // The clock is driven by wall time, so it never drifts and survives sleep.
  useEffect(() => {
    if (snapshot.status !== 'running' || snapshot.deadline === null) return;

    const tick = () => {
      const current = snapshotRef.current;
      if (current.status !== 'running' || current.deadline === null) return;
      const remaining = Math.max(0, Math.ceil((current.deadline - Date.now()) / 1000));
      if (remaining <= 0) {
        advance(current, 'completed');
        return;
      }
      if (remaining !== current.remainingSeconds) {
        setSnapshot((prev) =>
          prev.status === 'running' ? { ...prev, remainingSeconds: remaining } : prev
        );
      }
    };

    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [snapshot.status, snapshot.deadline, advance]);

  // An idle timer always shows the duration configured in settings.
  useEffect(() => {
    setSnapshot((prev) => {
      if (prev.status !== 'idle') return prev;
      const planned = phaseSeconds(prev.kind, settings);
      if (planned === prev.plannedSeconds && planned === prev.remainingSeconds) return prev;
      return { ...prev, plannedSeconds: planned, remainingSeconds: planned };
    });
  }, [settings]);

  const start = useCallback(() => {
    setSnapshot((prev) => {
      if (prev.status === 'running') return prev;
      const now = Date.now();
      const remaining = prev.remainingSeconds > 0 ? prev.remainingSeconds : prev.plannedSeconds;
      return {
        ...prev,
        status: 'running',
        remainingSeconds: remaining,
        deadline: now + remaining * 1000,
        startedAt: prev.startedAt ?? now,
      };
    });
    eventRef.current({
      type: 'started',
      record: null,
      nextKind: snapshotRef.current.kind,
      autoStarted: false,
    });
  }, []);

  const pause = useCallback(() => {
    setSnapshot((prev) => {
      if (prev.status !== 'running' || prev.deadline === null) return prev;
      const remaining = Math.max(0, Math.ceil((prev.deadline - Date.now()) / 1000));
      return { ...prev, status: 'paused', remainingSeconds: remaining, deadline: null };
    });
  }, []);

  const toggle = useCallback(() => {
    if (snapshotRef.current.status === 'running') pause();
    else start();
  }, [pause, start]);

  /** Back to the start of the current phase; long-enough work is still logged. */
  const reset = useCallback(() => {
    const current = snapshotRef.current;
    const elapsed = current.plannedSeconds - current.remainingSeconds;
    const record = buildRecord(current, elapsed, 'abandoned');
    const duration = phaseSeconds(current.kind, settingsRef.current);
    setSnapshot({
      ...current,
      status: 'idle',
      plannedSeconds: duration,
      remainingSeconds: duration,
      deadline: null,
      startedAt: null,
    });
    eventRef.current({ type: 'discarded', record, nextKind: current.kind, autoStarted: false });
  }, [buildRecord]);

  const skip = useCallback(() => {
    advance(snapshotRef.current, 'skipped');
  }, [advance]);

  /** Manual phase switch from the tabs: the current session is dropped. */
  const selectPhase = useCallback(
    (kind: PhaseKind) => {
      const current = snapshotRef.current;
      if (current.kind === kind && current.status === 'idle') return;
      const elapsed = current.plannedSeconds - current.remainingSeconds;
      const record = current.status === 'idle' ? null : buildRecord(current, elapsed, 'abandoned');
      const duration = phaseSeconds(kind, settingsRef.current);
      setSnapshot({
        ...current,
        kind,
        status: 'idle',
        plannedSeconds: duration,
        remainingSeconds: duration,
        deadline: null,
        startedAt: null,
      });
      eventRef.current({ type: 'discarded', record, nextKind: kind, autoStarted: false });
    },
    [buildRecord]
  );

  const extend = useCallback((minutes: number) => {
    setSnapshot((prev) => {
      const delta = Math.round(minutes * 60);
      const remaining = Math.max(1, prev.remainingSeconds + delta);
      const planned = Math.max(remaining, prev.plannedSeconds + delta);
      return {
        ...prev,
        remainingSeconds: remaining,
        plannedSeconds: planned,
        deadline: prev.status === 'running' ? Date.now() + remaining * 1000 : prev.deadline,
      };
    });
  }, []);

  const setMeta = useCallback(
    (meta: Partial<Pick<TimerSnapshot, 'title' | 'notes' | 'taskId'>>) => {
      setSnapshot((prev) => ({ ...prev, ...meta }));
    },
    []
  );

  const elapsedSeconds = Math.max(0, snapshot.plannedSeconds - snapshot.remainingSeconds);

  return useMemo(
    () => ({
      snapshot,
      elapsedSeconds,
      start,
      pause,
      toggle,
      reset,
      skip,
      selectPhase,
      extend,
      setMeta,
    }),
    [snapshot, elapsedSeconds, start, pause, toggle, reset, skip, selectPhase, extend, setMeta]
  );
}
