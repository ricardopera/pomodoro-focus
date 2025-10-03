import { ipcMain, BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '@shared/constants';
import type { AppState, Settings, Session, Statistics } from '@shared/types';
import { getSettings, updateSettings, resetSettings, getSessions } from './store';
import { 
  startTimer, 
  pauseTimer, 
  resumeTimer, 
  resetTimer,
  setTimerTickCallback,
  setTimerCompleteCallback,
} from './timer';
import { calculateStatistics } from './statistics';

let mainWindow: BrowserWindow | null = null;

export function setupIpcHandlers(window: BrowserWindow): void {
  mainWindow = window;

  // Setup timer callbacks to send events to renderer
  setTimerTickCallback((state: AppState) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(IPC_CHANNELS.TIMER_TICK, state);
    }
  });

  setTimerCompleteCallback(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(IPC_CHANNELS.TIMER_COMPLETE);
    }
  });

  // Settings handlers
  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, (): Settings => {
    return getSettings();
  });

  ipcMain.handle(IPC_CHANNELS.SETTINGS_UPDATE, (_event, partial: Partial<Settings>): Settings => {
    const updated = updateSettings(partial);
    
    // Notify renderer of settings change
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(IPC_CHANNELS.SETTINGS_CHANGED, updated);
    }
    
    return updated;
  });

  ipcMain.handle(IPC_CHANNELS.SETTINGS_RESET, (): Settings => {
    const defaults = resetSettings();
    
    // Notify renderer of settings change
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(IPC_CHANNELS.SETTINGS_CHANGED, defaults);
    }
    
    return defaults;
  });

  // Timer handlers
  ipcMain.handle(IPC_CHANNELS.TIMER_START, (_event, type: 'focus' | 'break-short' | 'break-long'): AppState => {
    const settings = getSettings();
    const duration = type === 'focus' ? settings.focusDuration :
                     type === 'break-short' ? settings.shortBreakDuration :
                     settings.longBreakDuration;
    
    return startTimer(type, duration);
  });

  ipcMain.handle(IPC_CHANNELS.TIMER_PAUSE, (): AppState => {
    return pauseTimer();
  });

  ipcMain.handle(IPC_CHANNELS.TIMER_RESUME, (): AppState => {
    return resumeTimer();
  });

  ipcMain.handle(IPC_CHANNELS.TIMER_RESET, (): AppState => {
    return resetTimer();
  });

  // Sessions handler
  ipcMain.handle(IPC_CHANNELS.SESSIONS_GET, (): Session[] => {
    return getSessions();
  });

  // Statistics handler
  ipcMain.handle(IPC_CHANNELS.STATISTICS_GET, (): Statistics => {
    return calculateStatistics();
  });

  // Window control handlers
  ipcMain.on('window:minimize', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.minimize();
    }
  });

  ipcMain.on('window:close', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.close();
    }
  });
}

export function cleanupIpcHandlers(): void {
  // Remove all handlers
  ipcMain.removeHandler(IPC_CHANNELS.SETTINGS_GET);
  ipcMain.removeHandler(IPC_CHANNELS.SETTINGS_UPDATE);
  ipcMain.removeHandler(IPC_CHANNELS.SETTINGS_RESET);
  ipcMain.removeHandler(IPC_CHANNELS.TIMER_START);
  ipcMain.removeHandler(IPC_CHANNELS.TIMER_PAUSE);
  ipcMain.removeHandler(IPC_CHANNELS.TIMER_RESUME);
  ipcMain.removeHandler(IPC_CHANNELS.TIMER_RESET);
  ipcMain.removeHandler(IPC_CHANNELS.SESSIONS_GET);
  ipcMain.removeHandler(IPC_CHANNELS.STATISTICS_GET);
  
  mainWindow = null;
}
