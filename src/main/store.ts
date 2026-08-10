import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { DATA_VERSION, DEFAULT_DATA, MAX_SESSIONS } from '../shared/constants';
import { restoreTimer, sanitizeSettings } from '../shared/pomodoro';
import type { AppData, SessionRecord, TaskItem } from '../shared/types';

/**
 * A tiny JSON store: read once at startup, write atomically (temp file +
 * rename) so a crash mid-write can never leave a truncated file behind.
 */
export class Store {
  private readonly file: string;
  private readonly backup: string;
  private cache: AppData;
  private writeTimer: NodeJS.Timeout | null = null;

  constructor(fileName = 'pomodoro-data.json') {
    const dir = app.getPath('userData');
    this.file = path.join(dir, fileName);
    this.backup = `${this.file}.bak`;
    this.cache = this.read();
  }

  get data(): AppData {
    return this.cache;
  }

  private read(): AppData {
    for (const candidate of [this.file, this.backup]) {
      try {
        if (!fs.existsSync(candidate)) continue;
        const raw = JSON.parse(fs.readFileSync(candidate, 'utf-8')) as unknown;
        return normalize(raw);
      } catch (error) {
        console.error(`[store] could not read ${candidate}:`, error);
      }
    }
    return structuredClone(DEFAULT_DATA);
  }

  /** Replaces the whole document; writes are debounced. */
  set(next: AppData): AppData {
    this.cache = normalize(next);
    this.scheduleWrite();
    return this.cache;
  }

  private scheduleWrite(): void {
    if (this.writeTimer) clearTimeout(this.writeTimer);
    this.writeTimer = setTimeout(() => this.flush(), 400);
  }

  /** Forces a synchronous write — used before quitting. */
  flush(): void {
    if (this.writeTimer) {
      clearTimeout(this.writeTimer);
      this.writeTimer = null;
    }
    try {
      fs.mkdirSync(path.dirname(this.file), { recursive: true });
      const temp = `${this.file}.tmp`;
      fs.writeFileSync(temp, JSON.stringify(this.cache, null, 2), 'utf-8');
      if (fs.existsSync(this.file)) fs.copyFileSync(this.file, this.backup);
      fs.renameSync(temp, this.file);
    } catch (error) {
      console.error('[store] write failed:', error);
    }
  }
}

function normalize(raw: unknown): AppData {
  const input = (raw ?? {}) as Partial<AppData>;
  const settings = sanitizeSettings(input.settings);
  const sessions = Array.isArray(input.sessions)
    ? input.sessions.filter(isSession).slice(-MAX_SESSIONS)
    : [];
  const tasks = Array.isArray(input.tasks) ? input.tasks.filter(isTask) : [];
  const { timer } = restoreTimer(input.timer, settings);

  return { version: DATA_VERSION, settings, sessions, tasks, timer };
}

function isSession(value: unknown): value is SessionRecord {
  const s = value as Partial<SessionRecord> | null;
  return (
    !!s &&
    typeof s.id === 'string' &&
    typeof s.startedAt === 'string' &&
    (s.kind === 'focus' || s.kind === 'shortBreak' || s.kind === 'longBreak')
  );
}

function isTask(value: unknown): value is TaskItem {
  const t = value as Partial<TaskItem> | null;
  return !!t && typeof t.id === 'string' && typeof t.title === 'string';
}
