import { PHASE_LABEL } from '../../shared/constants';
import type { PhaseKind } from '../../shared/types';

const ORDER: PhaseKind[] = ['focus', 'shortBreak', 'longBreak'];

interface PhaseTabsProps {
  current: PhaseKind;
  onSelect: (kind: PhaseKind) => void;
}

export function PhaseTabs({ current, onSelect }: PhaseTabsProps) {
  return (
    <div className="phasetabs" role="tablist" aria-label="Tipo de sessão">
      <span
        className="phasetabs__thumb"
        style={{ transform: `translateX(${ORDER.indexOf(current) * 100}%)` }}
        aria-hidden
      />
      {ORDER.map((kind) => (
        <button
          key={kind}
          type="button"
          role="tab"
          aria-selected={current === kind}
          className={`phasetabs__tab ${current === kind ? 'is-active' : ''}`}
          onClick={() => onSelect(kind)}
        >
          {PHASE_LABEL[kind]}
        </button>
      ))}
    </div>
  );
}
