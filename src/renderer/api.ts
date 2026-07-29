import { DEFAULT_DATA } from '../shared/constants';
import type { PomodoroApi } from '../preload';
import type { AppData } from '../shared/types';

declare global {
  interface Window {
    pomodoro?: PomodoroApi;
  }
}

/**
 * The renderer talks to Electron through this shim. When the UI runs in a
 * plain browser (tests, `vite dev` in a tab) it degrades to localStorage so
 * every screen stays usable.
 */
const STORAGE_KEY = 'pomodoro-focus:data';

const browserFallback: PomodoroApi = {
  loadData: async () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AppData) : structuredClone(DEFAULT_DATA);
    } catch {
      return structuredClone(DEFAULT_DATA);
    }
  },
  saveData: (data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* storage full or unavailable — nothing to do */
    }
  },
  minimize: () => {},
  close: () => {},
  setWindowMode: () => {},
  setAlwaysOnTop: () => {},
  setProgress: () => {},
  notify: ({ title, body }) => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  },
  updateTray: () => {},
  onCommand: () => () => {},
};

export const api: PomodoroApi =
  typeof window !== 'undefined' && window.pomodoro ? window.pomodoro : browserFallback;

export const isElectron = typeof window !== 'undefined' && !!window.pomodoro;
