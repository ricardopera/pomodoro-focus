import { PHASE_LABEL, PHASE_TAGLINE } from '../../shared/constants';
import { formatClock } from '../../shared/format';
import type { PhaseKind, TimerStatus } from '../../shared/types';

interface TimerRingProps {
  kind: PhaseKind;
  status: TimerStatus;
  progress: number;
  remainingSeconds: number;
  cycleCount: number;
  longBreakInterval: number;
  size?: number;
}

const STROKE = 10;

/** The centrepiece: a progress ring wrapped around the remaining time. */
export function TimerRing({
  kind,
  status,
  progress,
  remainingSeconds,
  cycleCount,
  longBreakInterval,
  size = 262,
}: TimerRingProps) {
  const radius = (size - STROKE * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - Math.min(1, Math.max(0, progress)));
  const center = size / 2;
  const completedInCycle = cycleCount % longBreakInterval;
  const dots = Array.from({ length: longBreakInterval }, (_, index) => index < completedInCycle);

  return (
    <div className={`ring ring--${status}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <defs>
          <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--accent-2)" />
          </linearGradient>
        </defs>
        <circle
          className="ring__track"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={STROKE}
          fill="none"
        />
        <circle
          className="ring__progress"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={STROKE}
          fill="none"
          stroke="url(#ring-gradient)"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>

      <div className="ring__content">
        <span className="ring__phase">{PHASE_LABEL[kind]}</span>
        <span
          className="ring__clock"
          role="timer"
          aria-live="off"
          aria-label={`${formatClock(remainingSeconds)} restantes`}
        >
          {formatClock(remainingSeconds)}
        </span>
        {kind === 'focus' ? (
          <span
            className="ring__dots"
            title={`${completedInCycle} de ${longBreakInterval} até a pausa longa`}
          >
            {dots.map((filled, index) => (
              <i key={index} className={filled ? 'is-filled' : ''} />
            ))}
          </span>
        ) : (
          <span className="ring__tagline">{PHASE_TAGLINE[kind]}</span>
        )}
      </div>
    </div>
  );
}
