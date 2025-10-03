import type { AppState } from '@shared/types';

interface TimerControlsProps {
  timerState: AppState;
  onStart: (type: 'focus' | 'break-short' | 'break-long') => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  isLoading: boolean;
}

export function TimerControls({
  timerState,
  onStart,
  onPause,
  onResume,
  onReset,
  isLoading,
}: TimerControlsProps) {
  const { currentState, isPaused } = timerState;

  if (currentState === 'idle') {
    return (
      <div className="timer-controls">
        <button
          className="btn btn-primary btn-large"
          onClick={() => onStart('focus')}
          disabled={isLoading}
        >
          🍅 Iniciar Foco
        </button>
        <div className="timer-controls-secondary">
          <button
            className="btn btn-secondary"
            onClick={() => onStart('break-short')}
            disabled={isLoading}
          >
            ☕ Pausa Curta
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => onStart('break-long')}
            disabled={isLoading}
          >
            🌟 Pausa Longa
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="timer-controls">
      <div className="timer-controls-primary">
        {isPaused ? (
          <button className="btn btn-success" onClick={onResume} disabled={isLoading}>
            ▶️ Retomar
          </button>
        ) : (
          <button className="btn btn-warning" onClick={onPause} disabled={isLoading}>
            ⏸️ Pausar
          </button>
        )}
        <button className="btn btn-danger" onClick={onReset} disabled={isLoading}>
          ⏹️ Parar
        </button>
      </div>
    </div>
  );
}
