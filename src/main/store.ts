import Store from 'electron-store';
import type { Settings, Session } from '@shared/types';
import { DEFAULT_SETTINGS, VALIDATION } from '@shared/constants';

// Schema for electron-store validation
const schema = {
  settings: {
    type: 'object',
    properties: {
      focusDuration: { type: 'number', minimum: VALIDATION.FOCUS_DURATION_MIN, maximum: VALIDATION.FOCUS_DURATION_MAX },
      shortBreakDuration: { type: 'number', minimum: VALIDATION.SHORT_BREAK_MIN, maximum: VALIDATION.SHORT_BREAK_MAX },
      longBreakDuration: { type: 'number', minimum: VALIDATION.LONG_BREAK_MIN, maximum: VALIDATION.LONG_BREAK_MAX },
      sessionsBeforeLongBreak: { type: 'number', minimum: VALIDATION.SESSIONS_BEFORE_LONG_BREAK_MIN, maximum: VALIDATION.SESSIONS_BEFORE_LONG_BREAK_MAX },
      theme: { type: 'string', enum: ['light', 'dark', 'system'] },
      notificationsEnabled: { type: 'boolean' },
      soundEnabled: { type: 'boolean' },
      minimizeToTray: { type: 'boolean' },
      autoStartBreaks: { type: 'boolean' },
      autoStartFocus: { type: 'boolean' },
    },
    required: [
      'focusDuration',
      'shortBreakDuration',
      'longBreakDuration',
      'sessionsBeforeLongBreak',
      'theme',
      'notificationsEnabled',
      'soundEnabled',
      'minimizeToTray',
      'autoStartBreaks',
      'autoStartFocus',
    ],
  },
  sessions: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        type: { type: 'string', enum: ['focus', 'break-short', 'break-long'] },
        plannedDuration: { type: 'number', minimum: 1 },
        actualDuration: { type: 'number', minimum: 0 },
        startTime: { type: 'string' },
        endTime: { type: 'string' },
        completed: { type: 'boolean' },
        interrupted: { type: 'boolean' },
      },
      required: ['id', 'type', 'plannedDuration', 'actualDuration', 'startTime', 'endTime', 'completed', 'interrupted'],
    },
  },
} as const;

interface StoreSchema {
  settings: Settings;
  sessions: Session[];
}

// Initialize electron-store with schema and defaults
const store = new Store<StoreSchema>({
  schema: schema as any, // electron-store schema typing is complex
  defaults: {
    settings: DEFAULT_SETTINGS,
    sessions: [],
  },
  name: 'pomodoro-focus',
});

// Settings operations
export function getSettings(): Settings {
  return store.get('settings', DEFAULT_SETTINGS);
}

export function updateSettings(partial: Partial<Settings>): Settings {
  const current = getSettings();
  const updated = { ...current, ...partial };
  store.set('settings', updated);
  return updated;
}

export function resetSettings(): Settings {
  store.set('settings', DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}

// Session operations
export function getSessions(): Session[] {
  return store.get('sessions', []);
}

export function addSession(session: Session): void {
  const sessions = getSessions();
  sessions.push(session);
  store.set('sessions', sessions);
}

export function clearSessions(): void {
  store.set('sessions', []);
}

// Export store instance for advanced usage if needed
export default store;
