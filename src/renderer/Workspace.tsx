import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  HistoryScreen,
  MiniTimer,
  NavBar,
  SettingsScreen,
  StatsScreen,
  TasksScreen,
  TimerScreen,
  TitleBar,
  Toast,
  type ScreenName,
  type ToastMessage,
} from './components';
import { api } from './api';
import { playChime, playTick } from './audio';
import { useTimer, type TimerEvent } from './hooks/useTimer';
import { DATA_VERSION, MAX_SESSIONS, PHASE_LABEL } from '../shared/constants';
import { cleanText, formatClock } from '../shared/format';
import { phaseProgress } from '../shared/pomodoro';
import { summarize } from '../shared/stats';
import type {
  AppData,
  PhaseKind,
  SessionRecord,
  Settings,
  TaskItem,
  WindowMode,
} from '../shared/types';

const APP_VERSION = __APP_VERSION__;

const uid = (): string => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const NOTIFICATION_TEXT: Record<PhaseKind, { title: string; body: string }> = {
  focus: { title: 'Foco concluído', body: 'Levante, respire, olhe para longe.' },
  shortBreak: { title: 'Pausa curta encerrada', body: 'Pronto para o próximo bloco?' },
  longBreak: { title: 'Pausa longa encerrada', body: 'Novo ciclo começando agora.' },
};

interface WorkspaceProps {
  initialData: AppData;
}

export function Workspace({ initialData }: WorkspaceProps) {
  const [settings, setSettings] = useState<Settings>(initialData.settings);
  const [tasks, setTasks] = useState<TaskItem[]>(initialData.tasks);
  const [sessions, setSessions] = useState<SessionRecord[]>(initialData.sessions);
  const [screen, setScreen] = useState<ScreenName>('timer');
  const [mode, setMode] = useState<WindowMode>('normal');
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const notify = useCallback((text: string) => setToast({ id: Date.now(), text }), []);

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  /** Logs a finished session and keeps the task counters in sync. */
  const logSession = useCallback((record: SessionRecord) => {
    setSessions((prev) => [...prev, record].slice(-MAX_SESSIONS));
    if (record.kind === 'focus' && record.outcome === 'completed' && record.taskId) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === record.taskId
            ? { ...task, completedPomodoros: task.completedPomodoros + 1 }
            : task
        )
      );
    }
  }, []);

  const handleTimerEvent = useCallback(
    (event: TimerEvent) => {
      const config = settingsRef.current;
      if (event.record) logSession(event.record);

      if (event.type === 'started') {
        if (config.soundEnabled) playChime('start', config.soundVolume * 0.6);
        return;
      }

      if (event.type === 'finished') {
        // Without a record (a session too short to log) the phase that just
        // ended is still implied by the one that follows it.
        const finishedKind: PhaseKind =
          event.record?.kind ?? (event.nextKind === 'focus' ? 'shortBreak' : 'focus');
        const text = NOTIFICATION_TEXT[finishedKind];
        if (config.soundEnabled) {
          playChime(finishedKind === 'focus' ? 'focusEnd' : 'breakEnd', config.soundVolume);
        }
        if (config.notificationsEnabled) {
          api.notify({
            title: text.title,
            body: `${text.body} Próximo: ${PHASE_LABEL[event.nextKind].toLowerCase()}.`,
          });
        }
        notify(
          event.autoStarted
            ? `${PHASE_LABEL[event.nextKind]} começou automaticamente.`
            : `Agora: ${PHASE_LABEL[event.nextKind].toLowerCase()}. Quando quiser, é só iniciar.`
        );
      }
    },
    [logSession, notify]
  );

  const timer = useTimer(initialData.timer, settings, handleTimerEvent);
  const { snapshot } = timer;

  // ---------------------------------------------------------------- effects

  // Persist. While running, the deadline is what matters, so the ticking
  // second is normalised away to avoid a write every second.
  const persistedTimer = useMemo(
    () =>
      JSON.stringify(
        snapshot.status === 'running'
          ? { ...snapshot, remainingSeconds: snapshot.plannedSeconds }
          : snapshot
      ),
    [snapshot]
  );

  useEffect(() => {
    const data: AppData = {
      version: DATA_VERSION,
      settings,
      tasks,
      sessions,
      timer: JSON.parse(persistedTimer),
    };
    api.saveData(data);
  }, [settings, tasks, sessions, persistedTimer]);

  // Theme + phase drive every colour in the stylesheet.
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  useEffect(() => {
    document.documentElement.dataset.phase = snapshot.kind;
  }, [snapshot.kind]);

  useEffect(() => {
    api.setAlwaysOnTop(settings.alwaysOnTop);
  }, [settings.alwaysOnTop]);

  useEffect(() => {
    api.setWindowMode(mode);
  }, [mode]);

  // Taskbar progress bar mirrors the ring.
  const progress = phaseProgress(snapshot.plannedSeconds, snapshot.remainingSeconds);
  useEffect(() => {
    api.setProgress(snapshot.status === 'idle' ? -1 : progress);
  }, [snapshot.status, progress]);

  useEffect(() => {
    document.title = `${formatClock(snapshot.remainingSeconds)} · ${PHASE_LABEL[snapshot.kind]}`;
  }, [snapshot.remainingSeconds, snapshot.kind]);

  // The tray only needs a coarse clock; rebuilding its menu every second is
  // wasteful, so it refreshes every five.
  const trayTick = Math.floor(snapshot.remainingSeconds / 5);
  useEffect(() => {
    api.updateTray({
      status: snapshot.status,
      kind: snapshot.kind,
      remainingSeconds: snapshot.remainingSeconds,
      title: snapshot.title,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot.status, snapshot.kind, snapshot.title, trayTick]);

  useEffect(() => {
    if (!settings.tickingEnabled || snapshot.status !== 'running') return;
    playTick(settings.soundVolume);
  }, [settings.tickingEnabled, settings.soundVolume, snapshot.status, snapshot.remainingSeconds]);

  // A focus session cannot start nameless when the user asked for that rule.
  const guardedStart = useCallback(() => {
    if (
      settingsRef.current.requireSessionName &&
      snapshot.kind === 'focus' &&
      snapshot.status === 'idle' &&
      !snapshot.title.trim()
    ) {
      notify('Dê um nome à sessão antes de começar.');
      setScreen('timer');
      document.querySelector<HTMLInputElement>('.composer__title')?.focus();
      return;
    }
    timer.toggle();
  }, [notify, snapshot.kind, snapshot.status, snapshot.title, timer]);

  // Tray menu and keyboard both funnel into the same handlers.
  useEffect(
    () =>
      api.onCommand((command) => {
        if (command === 'toggle') guardedStart();
        else if (command === 'start') guardedStart();
        else if (command === 'pause') timer.pause();
        else if (command === 'reset') timer.reset();
        else if (command === 'skip') timer.skip();
      }),
    [guardedStart, timer]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (event.ctrlKey || event.altKey || event.metaKey) return;

      const phases: Record<string, PhaseKind> = {
        '1': 'focus',
        '2': 'shortBreak',
        '3': 'longBreak',
      };

      if (event.code === 'Space') {
        event.preventDefault();
        guardedStart();
      } else if (event.key.toLowerCase() === 'r') {
        timer.reset();
      } else if (event.key.toLowerCase() === 's') {
        timer.skip();
      } else if (event.key.toLowerCase() === 'm') {
        setMode((prev) => (prev === 'mini' ? 'normal' : 'mini'));
      } else if (phases[event.key]) {
        timer.selectPhase(phases[event.key]);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [guardedStart, timer]);

  // A session that ran out while the app was closed deserves a heads-up.
  const announcedRestore = useRef(false);
  useEffect(() => {
    if (announcedRestore.current) return;
    announcedRestore.current = true;
    if (initialData.timer.status === 'running') {
      notify('Sessão retomada de onde você parou.');
    } else if (initialData.timer.startedAt && initialData.timer.remainingSeconds === 0) {
      notify('A sessão anterior terminou enquanto o app estava fechado.');
    }
  }, [initialData.timer, notify]);

  // ------------------------------------------------------------- derived UI

  const summary = useMemo(() => summarize(sessions), [sessions]);

  const suggestions = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (let i = sessions.length - 1; i >= 0 && list.length < 12; i -= 1) {
      const title = sessions[i].title.trim();
      if (sessions[i].kind !== 'focus' || !title) continue;
      const key = title.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      list.push(title);
    }
    return list;
  }, [sessions]);

  // ---------------------------------------------------------------- actions

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const addTask = useCallback(
    (draft: { title: string; notes: string; estimatedPomodoros: number }) => {
      setTasks((prev) => [
        ...prev,
        {
          id: uid(),
          title: draft.title,
          notes: draft.notes,
          estimatedPomodoros: draft.estimatedPomodoros,
          completedPomodoros: 0,
          done: false,
          createdAt: new Date().toISOString(),
        },
      ]);
    },
    []
  );

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task)));
  }, []);

  const removeTask = useCallback(
    (id: string) => {
      setTasks((prev) => prev.filter((task) => task.id !== id));
      // Only the session pointing at this task loses its link.
      if (snapshot.taskId === id) timer.setMeta({ taskId: null });
    },
    [snapshot.taskId, timer]
  );

  const focusTask = useCallback(
    (task: TaskItem) => {
      timer.setMeta({ taskId: task.id, title: task.title, notes: task.notes });
      if (snapshot.kind !== 'focus') timer.selectPhase('focus');
      setScreen('timer');
      notify(`Sessão preparada: ${task.title}`);
    },
    [notify, snapshot.kind, timer]
  );

  const updateSession = useCallback((id: string, patch: { title: string; notes: string }) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === id
          ? { ...session, title: cleanText(patch.title, 80), notes: cleanText(patch.notes) }
          : session
      )
    );
  }, []);

  const removeSession = useCallback((id: string) => {
    setSessions((prev) => prev.filter((session) => session.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setSessions([]);
    notify('Histórico apagado.');
  }, [notify]);

  // ----------------------------------------------------------------- render

  if (mode === 'mini') {
    return (
      <div className="app app--mini" data-status={snapshot.status}>
        <TitleBar
          mode="mini"
          pinned={settings.alwaysOnTop}
          onTogglePin={() => updateSettings({ alwaysOnTop: !settings.alwaysOnTop })}
          onToggleMode={() => setMode('normal')}
          onMinimize={api.minimize}
          onClose={api.close}
          label=""
        />
        <MiniTimer
          snapshot={snapshot}
          progress={progress}
          onToggle={guardedStart}
          onSkip={timer.skip}
        />
      </div>
    );
  }

  const dimmed =
    settings.focusDimming && snapshot.status === 'running' && snapshot.kind === 'focus';

  return (
    <div className={`app ${dimmed ? 'is-dimmed' : ''}`} data-status={snapshot.status}>
      <div className="app__aura" aria-hidden />

      <div className="chrome">
        <TitleBar
          mode="normal"
          pinned={settings.alwaysOnTop}
          onTogglePin={() => updateSettings({ alwaysOnTop: !settings.alwaysOnTop })}
          onToggleMode={() => setMode('mini')}
          onMinimize={api.minimize}
          onClose={api.close}
        />
      </div>

      <Toast toast={toast} onDismiss={() => setToast(null)} />

      <main className="app__main">
        {screen === 'timer' && (
          <TimerScreen
            timer={{ ...timer, toggle: guardedStart }}
            settings={settings}
            tasks={tasks}
            suggestions={suggestions}
            todayCount={summary.todayCount}
            todaySeconds={summary.todaySeconds}
          />
        )}
        {screen === 'tasks' && (
          <TasksScreen
            tasks={tasks}
            activeTaskId={snapshot.taskId}
            onAdd={addTask}
            onToggleDone={toggleTask}
            onRemove={removeTask}
            onFocus={focusTask}
          />
        )}
        {screen === 'history' && (
          <HistoryScreen sessions={sessions} onUpdate={updateSession} onRemove={removeSession} />
        )}
        {screen === 'stats' && <StatsScreen sessions={sessions} dailyGoal={settings.dailyGoal} />}
        {screen === 'settings' && (
          <SettingsScreen
            settings={settings}
            onChange={updateSettings}
            onClearHistory={clearHistory}
            version={APP_VERSION}
          />
        )}
      </main>

      <NavBar current={screen} onSelect={setScreen} />
    </div>
  );
}
