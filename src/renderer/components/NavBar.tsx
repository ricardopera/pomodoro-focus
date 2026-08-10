import { ChartIcon, HistoryIcon, SettingsIcon, TasksIcon, TimerIcon } from './Icons';

export type ScreenName = 'timer' | 'tasks' | 'history' | 'stats' | 'settings';

const ITEMS: { name: ScreenName; label: string; Icon: typeof TimerIcon }[] = [
  { name: 'timer', label: 'Timer', Icon: TimerIcon },
  { name: 'tasks', label: 'Tarefas', Icon: TasksIcon },
  { name: 'history', label: 'Histórico', Icon: HistoryIcon },
  { name: 'stats', label: 'Estatísticas', Icon: ChartIcon },
  { name: 'settings', label: 'Ajustes', Icon: SettingsIcon },
];

interface NavBarProps {
  current: ScreenName;
  onSelect: (name: ScreenName) => void;
}

export function NavBar({ current, onSelect }: NavBarProps) {
  return (
    <nav className="nav chrome" aria-label="Seções">
      {ITEMS.map(({ name, label, Icon }) => (
        <button
          key={name}
          type="button"
          className={`nav__item ${current === name ? 'is-active' : ''}`}
          onClick={() => onSelect(name)}
          title={label}
          aria-current={current === name}
        >
          <Icon />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
