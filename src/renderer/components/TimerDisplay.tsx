import type { AppState } from '@shared/types';

interface TimerDisplayProps {
  timerState: AppState;
}

export function TimerDisplay({ timerState }: TimerDisplayProps) {
  const { timeLeft, currentState } = timerState;

  const minutes = Math.floor(timeLeft / 1000 / 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const getStateLabel = () => {
    switch (currentState) {
      case 'focus':
        return 'Foco';
      case 'break-short':
        return 'Pausa Curta';
      case 'break-long':
        return 'Pausa Longa';
      default:
        return 'Ocioso';
    }
  };

  const getStateColor = () => {
    switch (currentState) {
      case 'focus':
        return '#E74C3C'; // Red
      case 'break-short':
        return '#3498DB'; // Blue
      case 'break-long':
        return '#2ECC71'; // Green
      default:
        return '#95A5A6'; // Gray
    }
  };

  return (
    <div className="timer-display">
      <div className="timer-state" style={{ color: getStateColor() }}>
        {getStateLabel()}
      </div>
      <div className="timer-time" style={{ fontSize: '4rem', fontWeight: 'bold' }}>
        {timeString}
      </div>
      {currentState !== 'idle' && (
        <div className="timer-progress">
          <div
            className="timer-progress-bar"
            style={{
              width: '100%',
              height: '4px',
              backgroundColor: '#ECF0F1',
              borderRadius: '2px',
              overflow: 'hidden',
              marginTop: '1rem',
            }}
          >
            <div
              style={{
                height: '100%',
                backgroundColor: getStateColor(),
                transition: 'width 1s linear',
                width: '50%', // TODO: Calculate actual progress
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
