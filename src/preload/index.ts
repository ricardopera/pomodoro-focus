import { contextBridge, ipcRenderer } from 'electron';
import { IPC } from '../shared/constants';
import type { AppData, NotifyPayload, RemoteCommand, TrayState, WindowMode } from '../shared/types';

/** The only surface the renderer gets. No node, no ipcRenderer leaks. */
const api = {
  loadData: (): Promise<AppData> => ipcRenderer.invoke(IPC.dataLoad),
  saveData: (data: AppData): void => ipcRenderer.send(IPC.dataSave, data),

  minimize: (): void => ipcRenderer.send(IPC.windowMinimize),
  close: (): void => ipcRenderer.send(IPC.windowClose),
  setWindowMode: (mode: WindowMode): void => ipcRenderer.send(IPC.windowMode, mode),
  setAlwaysOnTop: (value: boolean): void => ipcRenderer.send(IPC.windowAlwaysOnTop, value),

  /** `fraction` between 0 and 1, or -1 to clear the taskbar progress bar. */
  setProgress: (fraction: number): void => ipcRenderer.send(IPC.progressSet, fraction),
  notify: (payload: NotifyPayload): void => ipcRenderer.send(IPC.notify, payload),
  updateTray: (state: TrayState): void => ipcRenderer.send(IPC.trayUpdate, state),

  /** Tray menu entries and shortcuts arrive here. Returns an unsubscribe fn. */
  onCommand: (handler: (command: RemoteCommand) => void): (() => void) => {
    const listener = (_event: unknown, command: RemoteCommand) => handler(command);
    ipcRenderer.on(IPC.command, listener);
    return () => ipcRenderer.removeListener(IPC.command, listener);
  },
};

export type PomodoroApi = typeof api;

contextBridge.exposeInMainWorld('pomodoro', api);
