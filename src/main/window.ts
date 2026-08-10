import { BrowserWindow, shell } from 'electron';
import path from 'node:path';
import type { WindowMode } from '../shared/types';

const NORMAL_SIZE = { width: 460, height: 760 };
const MINI_SIZE = { width: 340, height: 150 };

export const isDev = !!process.env.ELECTRON_RENDERER_URL;

/** Resolves a path inside the packaged app (or the repo, in development). */
export function appPath(...segments: string[]): string {
  return path.join(__dirname, '..', '..', ...segments);
}

export function createMainWindow(alwaysOnTop: boolean): BrowserWindow {
  const window = new BrowserWindow({
    ...NORMAL_SIZE,
    minWidth: 380,
    minHeight: 560,
    show: false,
    frame: false,
    resizable: true,
    maximizable: false,
    fullscreenable: false,
    backgroundColor: '#0a0b12',
    alwaysOnTop,
    autoHideMenuBar: true,
    icon: appPath('public', 'icons', 'app-icon.png'),
    webPreferences: {
      preload: appPath('dist', 'preload', 'index.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      spellcheck: false,
    },
  });

  window.setMenuBarVisibility(false);

  window.once('ready-to-show', () => {
    window.show();
    window.focus();
  });

  // Links always open in the user's browser, never inside the app.
  window.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev) {
    void window.loadURL(process.env.ELECTRON_RENDERER_URL as string);
  } else {
    void window.loadFile(appPath('dist', 'renderer', 'index.html'));
  }

  return window;
}

/** Switches between the full window and the compact always-on-top pill. */
export function applyWindowMode(
  window: BrowserWindow,
  mode: WindowMode,
  alwaysOnTop: boolean
): void {
  const bounds = window.getBounds();
  const target = mode === 'mini' ? MINI_SIZE : NORMAL_SIZE;

  window.setMinimumSize(
    mode === 'mini' ? MINI_SIZE.width : 380,
    mode === 'mini' ? MINI_SIZE.height : 560
  );
  window.setResizable(mode !== 'mini');
  window.setBounds(
    {
      x: bounds.x,
      y: bounds.y,
      width: target.width,
      height: target.height,
    },
    true
  );
  window.setAlwaysOnTop(mode === 'mini' ? true : alwaysOnTop, 'floating');
}
