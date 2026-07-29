import { ipcMain, type BrowserWindow } from 'electron';
import { IPC } from '../shared/constants';
import type { AppData, NotifyPayload, TrayState, WindowMode } from '../shared/types';
import { showNotification } from './notifications';
import type { Store } from './store';
import type { AppTray } from './tray';
import { applyWindowMode } from './window';

interface WiringContext {
  window: BrowserWindow;
  store: Store;
  tray: AppTray;
  /** Called when the user closes the window; decides hide vs quit. */
  requestClose: () => void;
}

export function registerIpc({ window, store, tray, requestClose }: WiringContext): void {
  ipcMain.handle(IPC.dataLoad, () => store.data);

  ipcMain.on(IPC.dataSave, (_event, data: AppData) => {
    store.set(data);
  });

  ipcMain.on(IPC.windowMinimize, () => window.minimize());
  ipcMain.on(IPC.windowClose, () => requestClose());

  ipcMain.on(IPC.windowMode, (_event, mode: WindowMode) => {
    applyWindowMode(window, mode, store.data.settings.alwaysOnTop);
  });

  ipcMain.on(IPC.windowAlwaysOnTop, (_event, value: boolean) => {
    window.setAlwaysOnTop(value, 'floating');
  });

  ipcMain.on(IPC.progressSet, (_event, fraction: number) => {
    // -1 removes the taskbar progress bar on Windows.
    const value = Number.isFinite(fraction) ? Math.min(1, Math.max(0, fraction)) : -1;
    window.setProgressBar(fraction < 0 ? -1 : value);
  });

  ipcMain.on(IPC.notify, (_event, payload: NotifyPayload) => {
    showNotification(window, payload);
  });

  ipcMain.on(IPC.trayUpdate, (_event, state: TrayState) => {
    tray.update(state);
  });
}

export function unregisterIpc(): void {
  for (const channel of Object.values(IPC)) {
    ipcMain.removeHandler(channel);
    ipcMain.removeAllListeners(channel);
  }
}
