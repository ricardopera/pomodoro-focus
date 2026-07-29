import { PauseIcon, PlayIcon, ResetIcon, SkipIcon } from './Icons';
import type { TimerStatus } from '../../shared/types';

interface ControlsProps {
  status: TimerStatus;
  onToggle: () => void;
  onReset: () => void;
  onSkip: () => void;
  onExtend: (minutes: number) => void;
  canReset: boolean;
}

export function Controls({ status, onToggle, onReset, onSkip, onExtend, canReset }: ControlsProps) {
  const running = status === 'running';
  return (
    <div className="controls">
      <button
        type="button"
        className="controls__ghost"
        onClick={onReset}
        disabled={!canReset}
        title="Reiniciar etapa (R)"
      >
        <ResetIcon />
      </button>

      <button
        type="button"
        className="controls__primary"
        onClick={onToggle}
        title={running ? 'Pausar (Espaço)' : 'Iniciar (Espaço)'}
      >
        {running ? <PauseIcon width={26} height={26} /> : <PlayIcon width={26} height={26} />}
        <span className="controls__primary-label">{running ? 'Pausar' : 'Iniciar'}</span>
      </button>

      <button type="button" className="controls__ghost" onClick={onSkip} title="Pular etapa (S)">
        <SkipIcon />
      </button>

      <button
        type="button"
        className="controls__extend"
        onClick={() => onExtend(5)}
        title="Adicionar 5 minutos"
      >
        +5
      </button>
    </div>
  );
}
