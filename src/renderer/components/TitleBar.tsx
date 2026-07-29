import { CloseIcon, CompactIcon, ExpandIcon, MinimizeIcon, PinIcon } from './Icons';
import type { WindowMode } from '../../shared/types';

interface TitleBarProps {
  mode: WindowMode;
  pinned: boolean;
  onTogglePin: () => void;
  onToggleMode: () => void;
  onMinimize: () => void;
  onClose: () => void;
  label?: string;
}

/**
 * The window is frameless, so this bar is both the drag handle and the only
 * chrome the app shows. Buttons are kept to the minimum.
 */
export function TitleBar({
  mode,
  pinned,
  onTogglePin,
  onToggleMode,
  onMinimize,
  onClose,
  label,
}: TitleBarProps) {
  return (
    <header className={`titlebar ${mode === 'mini' ? 'titlebar--mini' : ''}`}>
      <div className="titlebar__drag">
        <span className="titlebar__dot" aria-hidden />
        <span className="titlebar__title">{label ?? 'Pomodoro Focus'}</span>
      </div>
      <div className="titlebar__actions">
        <button
          type="button"
          className={`iconbtn ${pinned ? 'is-active' : ''}`}
          onClick={onTogglePin}
          title={pinned ? 'Desafixar da frente' : 'Manter sempre à frente'}
          aria-pressed={pinned}
        >
          <PinIcon />
        </button>
        <button
          type="button"
          className="iconbtn"
          onClick={onToggleMode}
          title={mode === 'mini' ? 'Voltar ao tamanho normal' : 'Modo compacto'}
        >
          {mode === 'mini' ? <ExpandIcon /> : <CompactIcon />}
        </button>
        <button type="button" className="iconbtn" onClick={onMinimize} title="Minimizar">
          <MinimizeIcon />
        </button>
        <button type="button" className="iconbtn iconbtn--danger" onClick={onClose} title="Fechar">
          <CloseIcon />
        </button>
      </div>
    </header>
  );
}
