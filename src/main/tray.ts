import { app, Tray, Menu, nativeImage, BrowserWindow } from 'electron';
import type { AppState } from '@shared/types';

let tray: Tray | null = null;
let mainWindow: BrowserWindow | null = null;

export function createTray(window: BrowserWindow): Tray {
  mainWindow = window;

  // Create tray icon (will need actual icon file later)
  const icon = createTrayIcon();
  tray = new Tray(icon);

  tray.setToolTip('Pomodoro Focus');
  updateTrayMenu('idle');

  // Show/hide window on tray click
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  return tray;
}

export function updateTrayMenu(timerState: AppState['currentState']): void {
  if (!tray || !mainWindow) return;

  const contextMenu = Menu.buildFromTemplate([
    {
      label: `Status: ${formatState(timerState)}`,
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'Mostrar',
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      },
    },
    {
      label: 'Ocultar',
      click: () => {
        mainWindow?.hide();
      },
    },
    { type: 'separator' },
    {
      label: 'Sair',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
}

export function updateTrayTitle(timeLeft: number): void {
  if (!tray) return;

  const minutes = Math.floor(timeLeft / 1000 / 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);
  const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // On Windows/Linux, update tooltip; on macOS, update title
  if (process.platform === 'darwin') {
    tray.setTitle(timeString);
  } else {
    tray.setToolTip(`Pomodoro Focus - ${timeString}`);
  }
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy();
    tray = null;
  }
  mainWindow = null;
}

function createTrayIcon(): Electron.NativeImage {
  // Use the SVG icon from public/icons
  // For better quality on all platforms
  const iconSvg = `
    <svg width="64" height="64" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="60" fill="#E74C3C" stroke="#C0392B" stroke-width="4"/>
      <path d="M 64 10 Q 50 15 45 25 Q 55 20 64 20 Q 73 20 83 25 Q 78 15 64 10 Z" fill="#27AE60" stroke="#229954" stroke-width="2"/>
      <circle cx="64" cy="64" r="45" fill="none" stroke="white" stroke-width="3" opacity="0.3"/>
      <path d="M 64 19 A 45 45 0 0 1 109 64 L 64 64 Z" fill="white" opacity="0.5"/>
      <line x1="64" y1="64" x2="64" y2="35" stroke="white" stroke-width="4" stroke-linecap="round"/>
      <line x1="64" y1="64" x2="85" y2="64" stroke="white" stroke-width="3" stroke-linecap="round"/>
      <circle cx="64" cy="64" r="5" fill="white"/>
    </svg>
  `;

  return nativeImage.createFromDataURL(
    `data:image/svg+xml;base64,${Buffer.from(iconSvg).toString('base64')}`
  );
}

function formatState(state: AppState['currentState']): string {
  switch (state) {
    case 'idle':
      return 'Ocioso';
    case 'focus':
      return 'Foco';
    case 'break-short':
      return 'Pausa Curta';
    case 'break-long':
      return 'Pausa Longa';
    default:
      return 'Desconhecido';
  }
}
