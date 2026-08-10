import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps): IconProps => ({
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
  ...props,
});

export const PlayIcon = (props: IconProps) => (
  <svg {...base(props)} fill="currentColor" stroke="none">
    <path d="M8 5.6c0-.8.9-1.3 1.6-.9l8.2 5.4c.6.4.6 1.4 0 1.8l-8.2 5.4c-.7.4-1.6-.1-1.6-.9V5.6z" />
  </svg>
);

export const PauseIcon = (props: IconProps) => (
  <svg {...base(props)} fill="currentColor" stroke="none">
    <rect x="7" y="5" width="3.6" height="14" rx="1.4" />
    <rect x="13.4" y="5" width="3.6" height="14" rx="1.4" />
  </svg>
);

export const ResetIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" />
    <path d="M3.2 4.5v4.2h4.2" />
  </svg>
);

export const SkipIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M5 5.5 15 12 5 18.5z" fill="currentColor" stroke="none" />
    <path d="M18.5 5v14" />
  </svg>
);

export const TimerIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4.2l2.6 1.6M9.5 2.5h5" />
  </svg>
);

export const TasksIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 6.5 5.8 8.4 9 5" />
    <path d="M4 16.5 5.8 18.4 9 15" />
    <path d="M12.5 7h7.5M12.5 17H20" />
  </svg>
);

export const HistoryIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3.5 12a8.5 8.5 0 1 0 2.2-5.7" />
    <path d="M3.2 3.8V8h4.2" />
    <path d="M12 7.5V12l3 1.8" />
  </svg>
);

export const ChartIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 20V10M10 20V5M16 20v-7M22 20H2" />
  </svg>
);

export const SettingsIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M19.4 14.4a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.56-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1-1.56V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.56 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1.4z" />
  </svg>
);

export const PlusIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const TrashIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 7h16M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7" />
    <path d="M6.5 7 7.4 19a1.6 1.6 0 0 0 1.6 1.5h6a1.6 1.6 0 0 0 1.6-1.5L17.5 7" />
  </svg>
);

export const CheckIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </svg>
);

export const MinimizeIcon = (props: IconProps) => (
  <svg {...base(props)} strokeWidth={1.5}>
    <path d="M5 12h14" />
  </svg>
);

export const CloseIcon = (props: IconProps) => (
  <svg {...base(props)} strokeWidth={1.5}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

export const CompactIcon = (props: IconProps) => (
  <svg {...base(props)} strokeWidth={1.5}>
    <rect x="3.5" y="8.5" width="17" height="7" rx="2" />
  </svg>
);

export const ExpandIcon = (props: IconProps) => (
  <svg {...base(props)} strokeWidth={1.5}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
  </svg>
);

export const PinIcon = (props: IconProps) => (
  <svg {...base(props)} strokeWidth={1.5}>
    <path d="M9 3.5h6l-.8 5.2 3 3.1H6.8l3-3.1z" />
    <path d="M12 11.8V20.5" />
  </svg>
);

export const EditIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z" />
    <path d="M14.5 6.5 17.5 9.5" />
  </svg>
);

export const TargetIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);

export const FlameIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 3s5 4.2 5 9a5 5 0 0 1-10 0c0-1.6.7-3 1.6-4.2.4 1 1.1 1.8 2 2.1C11 8 12 5.5 12 3z" />
  </svg>
);
