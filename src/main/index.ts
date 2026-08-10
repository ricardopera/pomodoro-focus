import { app, BrowserWindow } from 'electron';
import { IPC } from '../shared/constants';
import type { RemoteCommand } from '../shared/types';
import { registerIpc, unregisterIpc } from './ipc';
import { Store } from './store';
import { AppTray } from './tray';
import { createMainWindow, isDev } from './window';

// Windows needs this for notifications to carry the app's name and icon.
app.setAppUserModelId('com.ricardopera.pomodoro-focus');

let mainWindow: BrowserWindow | null = null;
let tray: AppTray | null = null;
let store: Store | null = null;
let isQuitting = false;

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  });

  void app.whenReady().then(bootstrap);
}

function bootstrap(): void {
  store = new Store();
  const settings = store.data.settings;

  mainWindow = createMainWindow(settings.alwaysOnTop);

  const sendCommand = (command: RemoteCommand) => {
    mainWindow?.webContents.send(IPC.command, command);
  };

  tray = new AppTray(mainWindow, sendCommand, () => {
    isQuitting = true;
  });
  tray.init();

  registerIpc({
    window: mainWindow,
    store,
    tray,
    requestClose: () => {
      if (store?.data.settings.minimizeToTray) {
        mainWindow?.hide();
      } else {
        isQuitting = true;
        app.quit();
      }
    },
  });

  mainWindow.on('close', (event) => {
    if (isQuitting || !store?.data.settings.minimizeToTray) return;
    event.preventDefault();
    mainWindow?.hide();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (isDev) {
    mainWindow.webContents.on('before-input-event', (_event, input) => {
      if (input.key === 'F12') mainWindow?.webContents.toggleDevTools();
    });
  }
}

app.on('before-quit', () => {
  isQuitting = true;
  store?.flush();
});

app.on('will-quit', () => {
  unregisterIpc();
  tray?.destroy();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) bootstrap();
});
