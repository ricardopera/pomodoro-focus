import { app, Tray, Menu, nativeImage, BrowserWindow } from 'electron';
import path from 'path';
import type { AppState } from '@shared/types';

let tray: Tray | null = null;
let mainWindow: BrowserWindow | null = null;

export function createTray(window: BrowserWindow): Tray {
  mainWindow = window;

  // Create tray icon using PNG file
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
  // Use PNG icon for better Windows compatibility
  // Tray icons should be 16x16 or 32x32 on Windows
  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, 'icons', 'app-icon.png')
    : path.join(__dirname, '../../public/icons/app-icon.png');

  const icon = nativeImage.createFromPath(iconPath);
  
  // Resize to tray size (Windows expects 16x16)
  return icon.resize({ width: 16, height: 16 });
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
