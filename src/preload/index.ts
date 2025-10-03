import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/constants';
import type { AppState, Settings, Session, Statistics } from '../shared/types';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Settings API
  settings: {
    get: (): Promise<Settings> => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET),
    update: (partial: Partial<Settings>): Promise<Settings> =>
      ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_UPDATE, partial),
    reset: (): Promise<Settings> => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_RESET),
    onChange: (callback: (settings: Settings) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, settings: Settings) => callback(settings);
      ipcRenderer.on(IPC_CHANNELS.SETTINGS_CHANGED, listener);
      return () => ipcRenderer.removeListener(IPC_CHANNELS.SETTINGS_CHANGED, listener);
    },
  },

  // Timer API
  timer: {
    start: (type: 'focus' | 'break-short' | 'break-long'): Promise<AppState> =>
      ipcRenderer.invoke(IPC_CHANNELS.TIMER_START, type),
    pause: (): Promise<AppState> => ipcRenderer.invoke(IPC_CHANNELS.TIMER_PAUSE),
    resume: (): Promise<AppState> => ipcRenderer.invoke(IPC_CHANNELS.TIMER_RESUME),
    reset: (): Promise<AppState> => ipcRenderer.invoke(IPC_CHANNELS.TIMER_RESET),
    onTick: (callback: (state: AppState) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, state: AppState) => callback(state);
      ipcRenderer.on(IPC_CHANNELS.TIMER_TICK, listener);
      return () => ipcRenderer.removeListener(IPC_CHANNELS.TIMER_TICK, listener);
    },
    onComplete: (callback: () => void) => {
      const listener = () => callback();
      ipcRenderer.on(IPC_CHANNELS.TIMER_COMPLETE, listener);
      return () => ipcRenderer.removeListener(IPC_CHANNELS.TIMER_COMPLETE, listener);
    },
  },

  // Sessions API
  sessions: {
    get: (): Promise<Session[]> => ipcRenderer.invoke(IPC_CHANNELS.SESSIONS_GET),
  },

  // Statistics API
  statistics: {
    get: (): Promise<Statistics> => ipcRenderer.invoke(IPC_CHANNELS.STATISTICS_GET),
  },

  // Window control API
  minimize: (): void => ipcRenderer.send('window:minimize'),
  close: (): void => ipcRenderer.send('window:close'),
});

// Type definitions for window.electronAPI
export interface ElectronAPI {
  settings: {
    get: () => Promise<Settings>;
    update: (partial: Partial<Settings>) => Promise<Settings>;
    reset: () => Promise<Settings>;
    onChange: (callback: (settings: Settings) => void) => () => void;
  };
  timer: {
    start: (type: 'focus' | 'break-short' | 'break-long') => Promise<AppState>;
    pause: () => Promise<AppState>;
    resume: () => Promise<AppState>;
    reset: () => Promise<AppState>;
    onTick: (callback: (state: AppState) => void) => () => void;
    onComplete: (callback: () => void) => () => void;
  };
  sessions: {
    get: () => Promise<Session[]>;
  };
  statistics: {
    get: () => Promise<Statistics>;
  };
  minimize: () => void;
  close: () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
