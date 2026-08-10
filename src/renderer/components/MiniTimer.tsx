import { PauseIcon, PlayIcon, SkipIcon } from './Icons';
import { PHASE_LABEL } from '../../shared/constants';
import { formatClock } from '../../shared/format';
import type { TimerSnapshot } from '../../shared/types';

interface MiniTimerProps {
  snapshot: TimerSnapshot;
  progress: number;
  onToggle: () => void;
  onSkip: () => void;
}

/** The compact pill: a clock, what you are doing, and two buttons. */
export function MiniTimer({ snapshot, progress, onToggle, onSkip }: MiniTimerProps) {
  const running = snapshot.status === 'running';
  return (
    <div className="mini">
      <div className="mini__info">
        <span className="mini__phase">{PHASE_LABEL[snapshot.kind]}</span>
        <span className="mini__clock">{formatClock(snapshot.remainingSeconds)}</span>
        <span className="mini__title">
          {snapshot.kind === 'focus' ? snapshot.title || 'Sessão sem nome' : 'Descanse'}
        </span>
      </div>
      <div className="mini__actions">
        <button
          type="button"
          className="controls__primary controls__primary--small"
          onClick={onToggle}
          title={running ? 'Pausar' : 'Iniciar'}
        >
          {running ? <PauseIcon width={18} height={18} /> : <PlayIcon width={18} height={18} />}
        </button>
        <button type="button" className="controls__ghost" onClick={onSkip} title="Pular etapa">
          <SkipIcon width={15} height={15} />
        </button>
      </div>
      <div className="mini__bar">
        <span style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
    </div>
  );
}
