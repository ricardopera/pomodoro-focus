import { Controls } from './Controls';
import { PhaseTabs } from './PhaseTabs';
import { SessionComposer } from './SessionComposer';
import { TimerRing } from './TimerRing';
import { formatDuration } from '../../shared/format';
import { phaseProgress } from '../../shared/pomodoro';
import type { Settings, TaskItem } from '../../shared/types';
import type { TimerApi } from '../hooks/useTimer';

interface TimerScreenProps {
  timer: TimerApi;
  settings: Settings;
  tasks: TaskItem[];
  suggestions: string[];
  todayCount: number;
  todaySeconds: number;
}

export function TimerScreen({
  timer,
  settings,
  tasks,
  suggestions,
  todayCount,
  todaySeconds,
}: TimerScreenProps) {
  const { snapshot } = timer;
  const progress = phaseProgress(snapshot.plannedSeconds, snapshot.remainingSeconds);
  const goalRatio = Math.min(1, todayCount / Math.max(1, settings.dailyGoal));

  return (
    <div className="screen screen--timer">
      <PhaseTabs current={snapshot.kind} onSelect={timer.selectPhase} />

      <TimerRing
        kind={snapshot.kind}
        status={snapshot.status}
        progress={progress}
        remainingSeconds={snapshot.remainingSeconds}
        cycleCount={snapshot.cycleCount}
        longBreakInterval={settings.longBreakInterval}
      />

      <Controls
        status={snapshot.status}
        onToggle={timer.toggle}
        onReset={timer.reset}
        onSkip={timer.skip}
        onExtend={timer.extend}
        canReset={snapshot.status !== 'idle' || timer.elapsedSeconds > 0}
      />

      <SessionComposer
        title={snapshot.title}
        notes={snapshot.notes}
        taskId={snapshot.taskId}
        tasks={tasks}
        suggestions={suggestions}
        readOnly={snapshot.kind !== 'focus'}
        onChange={timer.setMeta}
      />

      <div className="daygoal chrome">
        <div className="daygoal__head">
          <span>
            Hoje: <strong>{todayCount}</strong>/{settings.dailyGoal} pomodoros
          </span>
          <span className="daygoal__time">{formatDuration(todaySeconds)} focados</span>
        </div>
        <div className="daygoal__bar">
          <span style={{ width: `${goalRatio * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
