"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/main/index.ts
var import_electron3 = require("electron");
var import_path2 = __toESM(require("path"), 1);

// src/main/ipc.ts
var import_electron = require("electron");

// src/shared/constants.ts
var DEFAULT_SETTINGS = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
  theme: "system",
  notificationsEnabled: true,
  soundEnabled: true,
  minimizeToTray: true,
  autoStartBreaks: true,
  autoStartFocus: false
};
var TIMER_STATES = {
  IDLE: "idle",
  FOCUS: "focus",
  BREAK_SHORT: "break-short",
  BREAK_LONG: "break-long"
};
var IPC_CHANNELS = {
  // Settings
  SETTINGS_GET: "settings:get",
  SETTINGS_UPDATE: "settings:update",
  SETTINGS_RESET: "settings:reset",
  SETTINGS_CHANGED: "settings:changed",
  // Timer
  TIMER_START: "timer:start",
  TIMER_PAUSE: "timer:pause",
  TIMER_RESUME: "timer:resume",
  TIMER_RESET: "timer:reset",
  TIMER_TICK: "timer:tick",
  TIMER_COMPLETE: "timer:complete",
  // Sessions
  SESSIONS_GET: "sessions:get",
  // Statistics
  STATISTICS_GET: "statistics:get"
};
var VALIDATION = {
  FOCUS_DURATION_MIN: 1,
  FOCUS_DURATION_MAX: 60,
  SHORT_BREAK_MIN: 1,
  SHORT_BREAK_MAX: 30,
  LONG_BREAK_MIN: 5,
  LONG_BREAK_MAX: 60,
  SESSIONS_BEFORE_LONG_BREAK_MIN: 2,
  SESSIONS_BEFORE_LONG_BREAK_MAX: 10
};

// src/main/store.ts
var import_electron_store = __toESM(require("electron-store"), 1);
var schema = {
  settings: {
    type: "object",
    properties: {
      focusDuration: { type: "number", minimum: VALIDATION.FOCUS_DURATION_MIN, maximum: VALIDATION.FOCUS_DURATION_MAX },
      shortBreakDuration: { type: "number", minimum: VALIDATION.SHORT_BREAK_MIN, maximum: VALIDATION.SHORT_BREAK_MAX },
      longBreakDuration: { type: "number", minimum: VALIDATION.LONG_BREAK_MIN, maximum: VALIDATION.LONG_BREAK_MAX },
      sessionsBeforeLongBreak: { type: "number", minimum: VALIDATION.SESSIONS_BEFORE_LONG_BREAK_MIN, maximum: VALIDATION.SESSIONS_BEFORE_LONG_BREAK_MAX },
      theme: { type: "string", enum: ["light", "dark", "system"] },
      notificationsEnabled: { type: "boolean" },
      soundEnabled: { type: "boolean" },
      minimizeToTray: { type: "boolean" },
      autoStartBreaks: { type: "boolean" },
      autoStartFocus: { type: "boolean" }
    },
    required: [
      "focusDuration",
      "shortBreakDuration",
      "longBreakDuration",
      "sessionsBeforeLongBreak",
      "theme",
      "notificationsEnabled",
      "soundEnabled",
      "minimizeToTray",
      "autoStartBreaks",
      "autoStartFocus"
    ]
  },
  sessions: {
    type: "array",
    items: {
      type: "object",
      properties: {
        id: { type: "string" },
        type: { type: "string", enum: ["focus", "break-short", "break-long"] },
        plannedDuration: { type: "number", minimum: 1 },
        actualDuration: { type: "number", minimum: 0 },
        startTime: { type: "string" },
        endTime: { type: "string" },
        completed: { type: "boolean" },
        interrupted: { type: "boolean" }
      },
      required: ["id", "type", "plannedDuration", "actualDuration", "startTime", "endTime", "completed", "interrupted"]
    }
  }
};
var store = new import_electron_store.default({
  schema,
  // electron-store schema typing is complex
  defaults: {
    settings: DEFAULT_SETTINGS,
    sessions: []
  },
  name: "pomodoro-focus"
});
function getSettings() {
  return store.get("settings", DEFAULT_SETTINGS);
}
function updateSettings(partial) {
  const current = getSettings();
  const updated = { ...current, ...partial };
  store.set("settings", updated);
  return updated;
}
function resetSettings() {
  store.set("settings", DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}
function getSessions() {
  return store.get("sessions", []);
}
function addSession(session) {
  const sessions = getSessions();
  sessions.push(session);
  store.set("sessions", sessions);
}

// src/main/timer.ts
var timerInterval = null;
var appState = {
  currentState: TIMER_STATES.IDLE,
  timeLeft: 0,
  sessionsCompleted: 0,
  isPaused: false,
  startTimestamp: null
};
var currentSessionId = null;
var onTick = null;
var onComplete = null;
var sessionStartedAt = null;
var sessionInterruptions = 0;
var plannedDurationMinutes = 0;
function setTimerTickCallback(callback) {
  onTick = callback;
}
function setTimerCompleteCallback(callback) {
  onComplete = callback;
}
function startTimer(type, durationMinutes) {
  stopTimer();
  const state = type === "focus" ? TIMER_STATES.FOCUS : type === "break-short" ? TIMER_STATES.BREAK_SHORT : TIMER_STATES.BREAK_LONG;
  const now = Date.now();
  appState = {
    currentState: state,
    timeLeft: durationMinutes * 60 * 1e3,
    // Convert to milliseconds
    sessionsCompleted: appState.sessionsCompleted,
    isPaused: false,
    startTimestamp: now
  };
  currentSessionId = generateSessionId();
  sessionStartedAt = new Date(now);
  sessionInterruptions = 0;
  plannedDurationMinutes = durationMinutes;
  timerInterval = setInterval(() => {
    if (!appState.isPaused) {
      appState.timeLeft = Math.max(0, appState.timeLeft - 1e3);
      if (onTick) {
        onTick({ ...appState });
      }
      if (appState.timeLeft <= 0) {
        completeTimer(true);
      }
    }
  }, 1e3);
  if (onTick) {
    onTick({ ...appState });
  }
  return { ...appState };
}
function pauseTimer() {
  if (appState.currentState === TIMER_STATES.IDLE) {
    return { ...appState };
  }
  appState.isPaused = true;
  sessionInterruptions++;
  if (onTick) {
    onTick({ ...appState });
  }
  return { ...appState };
}
function resumeTimer() {
  if (appState.currentState === TIMER_STATES.IDLE || !appState.isPaused) {
    return { ...appState };
  }
  appState.isPaused = false;
  if (onTick) {
    onTick({ ...appState });
  }
  return { ...appState };
}
function resetTimer() {
  stopTimer();
  if (currentSessionId && sessionStartedAt) {
    const endTime = /* @__PURE__ */ new Date();
    const actualDuration = Math.round((endTime.getTime() - sessionStartedAt.getTime()) / 1e3 / 60);
    const session = {
      id: currentSessionId,
      type: appState.currentState === TIMER_STATES.FOCUS ? "focus" : appState.currentState === TIMER_STATES.BREAK_SHORT ? "break-short" : "break-long",
      plannedDuration: plannedDurationMinutes,
      actualDuration,
      startTime: sessionStartedAt.toISOString(),
      endTime: endTime.toISOString(),
      completed: false,
      interrupted: true
    };
    addSession(session);
  }
  appState = {
    currentState: TIMER_STATES.IDLE,
    timeLeft: 0,
    sessionsCompleted: appState.sessionsCompleted,
    isPaused: false,
    startTimestamp: null
  };
  currentSessionId = null;
  sessionStartedAt = null;
  sessionInterruptions = 0;
  plannedDurationMinutes = 0;
  if (onTick) {
    onTick({ ...appState });
  }
  return { ...appState };
}
function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}
function completeTimer(wasCompleted) {
  stopTimer();
  if (currentSessionId && sessionStartedAt) {
    const endTime = /* @__PURE__ */ new Date();
    const actualDuration = Math.round((endTime.getTime() - sessionStartedAt.getTime()) / 1e3 / 60);
    const session = {
      id: currentSessionId,
      type: appState.currentState === TIMER_STATES.FOCUS ? "focus" : appState.currentState === TIMER_STATES.BREAK_SHORT ? "break-short" : "break-long",
      plannedDuration: plannedDurationMinutes,
      actualDuration,
      startTime: sessionStartedAt.toISOString(),
      endTime: endTime.toISOString(),
      completed: wasCompleted,
      interrupted: !wasCompleted
    };
    addSession(session);
    if (wasCompleted && appState.currentState === TIMER_STATES.FOCUS) {
      appState.sessionsCompleted = (appState.sessionsCompleted + 1) % 4;
    }
  }
  appState = {
    currentState: TIMER_STATES.IDLE,
    timeLeft: 0,
    sessionsCompleted: appState.sessionsCompleted,
    isPaused: false,
    startTimestamp: null
  };
  currentSessionId = null;
  sessionStartedAt = null;
  sessionInterruptions = 0;
  plannedDurationMinutes = 0;
  if (onComplete) {
    onComplete();
  }
  if (onTick) {
    onTick({ ...appState });
  }
}
function generateSessionId() {
  return `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// src/main/statistics.ts
function calculateStatistics() {
  const sessions = getSessions();
  const now = /* @__PURE__ */ new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todaySessions = sessions.filter((s) => {
    const sessionDate = new Date(s.startTime);
    return sessionDate >= todayStart && s.type === "focus" && s.completed;
  });
  const todayFocusMinutes = todaySessions.reduce((sum, s) => sum + s.actualDuration, 0);
  const todaySessionsCompleted = todaySessions.length;
  const weekStart = getMonday(now);
  const weekSessions = sessions.filter((s) => {
    const sessionDate = new Date(s.startTime);
    return sessionDate >= weekStart && s.type === "focus" && s.completed;
  });
  const weekFocusMinutes = weekSessions.reduce((sum, s) => sum + s.actualDuration, 0);
  const weekSessionsCompleted = weekSessions.length;
  const { currentStreak, longestStreak } = calculateStreaks(sessions);
  return {
    todayFocusMinutes,
    todaySessionsCompleted,
    weekFocusMinutes,
    weekSessionsCompleted,
    currentStreak,
    longestStreak
  };
}
function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}
function calculateStreaks(sessions) {
  if (sessions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }
  const focusSessions = sessions.filter((s) => s.type === "focus" && s.completed);
  const dayMap = /* @__PURE__ */ new Map();
  focusSessions.forEach((session) => {
    const date = new Date(session.startTime);
    const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    dayMap.set(dayKey, true);
  });
  const sortedDays = Array.from(dayMap.keys()).sort();
  if (sortedDays.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }
  const today = /* @__PURE__ */ new Date();
  let currentStreak = 0;
  let checkDate = new Date(today);
  while (true) {
    const checkKey = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;
    if (dayMap.has(checkKey)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  let longestStreak = 0;
  let tempStreak = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const prevDate = new Date(sortedDays[i - 1]);
    const currDate = new Date(sortedDays[i]);
    const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1e3 * 60 * 60 * 24));
    if (diffDays === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);
  return { currentStreak, longestStreak };
}

// src/main/ipc.ts
var mainWindow = null;
function setupIpcHandlers(window) {
  mainWindow = window;
  setTimerTickCallback((state) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(IPC_CHANNELS.TIMER_TICK, state);
    }
  });
  setTimerCompleteCallback(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(IPC_CHANNELS.TIMER_COMPLETE);
    }
  });
  import_electron.ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, () => {
    return getSettings();
  });
  import_electron.ipcMain.handle(IPC_CHANNELS.SETTINGS_UPDATE, (_event, partial) => {
    const updated = updateSettings(partial);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(IPC_CHANNELS.SETTINGS_CHANGED, updated);
    }
    return updated;
  });
  import_electron.ipcMain.handle(IPC_CHANNELS.SETTINGS_RESET, () => {
    const defaults = resetSettings();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(IPC_CHANNELS.SETTINGS_CHANGED, defaults);
    }
    return defaults;
  });
  import_electron.ipcMain.handle(IPC_CHANNELS.TIMER_START, (_event, type) => {
    const settings = getSettings();
    const duration = type === "focus" ? settings.focusDuration : type === "break-short" ? settings.shortBreakDuration : settings.longBreakDuration;
    return startTimer(type, duration);
  });
  import_electron.ipcMain.handle(IPC_CHANNELS.TIMER_PAUSE, () => {
    return pauseTimer();
  });
  import_electron.ipcMain.handle(IPC_CHANNELS.TIMER_RESUME, () => {
    return resumeTimer();
  });
  import_electron.ipcMain.handle(IPC_CHANNELS.TIMER_RESET, () => {
    return resetTimer();
  });
  import_electron.ipcMain.handle(IPC_CHANNELS.SESSIONS_GET, () => {
    return getSessions();
  });
  import_electron.ipcMain.handle(IPC_CHANNELS.STATISTICS_GET, () => {
    return calculateStatistics();
  });
  import_electron.ipcMain.on("window:minimize", () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.minimize();
    }
  });
  import_electron.ipcMain.on("window:close", () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.close();
    }
  });
}
function cleanupIpcHandlers() {
  import_electron.ipcMain.removeHandler(IPC_CHANNELS.SETTINGS_GET);
  import_electron.ipcMain.removeHandler(IPC_CHANNELS.SETTINGS_UPDATE);
  import_electron.ipcMain.removeHandler(IPC_CHANNELS.SETTINGS_RESET);
  import_electron.ipcMain.removeHandler(IPC_CHANNELS.TIMER_START);
  import_electron.ipcMain.removeHandler(IPC_CHANNELS.TIMER_PAUSE);
  import_electron.ipcMain.removeHandler(IPC_CHANNELS.TIMER_RESUME);
  import_electron.ipcMain.removeHandler(IPC_CHANNELS.TIMER_RESET);
  import_electron.ipcMain.removeHandler(IPC_CHANNELS.SESSIONS_GET);
  import_electron.ipcMain.removeHandler(IPC_CHANNELS.STATISTICS_GET);
  mainWindow = null;
}

// src/main/tray.ts
var import_electron2 = require("electron");
var import_path = __toESM(require("path"), 1);
var tray = null;
var mainWindow2 = null;
function createTray(window) {
  mainWindow2 = window;
  const icon = createTrayIcon();
  tray = new import_electron2.Tray(icon);
  tray.setToolTip("Pomodoro Focus");
  updateTrayMenu("idle");
  tray.on("click", () => {
    if (mainWindow2) {
      if (mainWindow2.isVisible()) {
        mainWindow2.hide();
      } else {
        mainWindow2.show();
        mainWindow2.focus();
      }
    }
  });
  return tray;
}
function updateTrayMenu(timerState) {
  if (!tray || !mainWindow2) return;
  const contextMenu = import_electron2.Menu.buildFromTemplate([
    {
      label: `Status: ${formatState(timerState)}`,
      enabled: false
    },
    { type: "separator" },
    {
      label: "Mostrar",
      click: () => {
        mainWindow2?.show();
        mainWindow2?.focus();
      }
    },
    {
      label: "Ocultar",
      click: () => {
        mainWindow2?.hide();
      }
    },
    { type: "separator" },
    {
      label: "Sair",
      click: () => {
        import_electron2.app.quit();
      }
    }
  ]);
  tray.setContextMenu(contextMenu);
}
function destroyTray() {
  if (tray) {
    tray.destroy();
    tray = null;
  }
  mainWindow2 = null;
}
function createTrayIcon() {
  const iconPath = import_electron2.app.isPackaged ? import_path.default.join(process.resourcesPath, "icons", "app-icon.png") : import_path.default.join(__dirname, "../../public/icons/app-icon.png");
  const icon = import_electron2.nativeImage.createFromPath(iconPath);
  return icon.resize({ width: 16, height: 16 });
}
function formatState(state) {
  switch (state) {
    case "idle":
      return "Ocioso";
    case "focus":
      return "Foco";
    case "break-short":
      return "Pausa Curta";
    case "break-long":
      return "Pausa Longa";
    default:
      return "Desconhecido";
  }
}

// src/main/index.ts
var mainWindow3 = null;
var isQuitting = false;
var isDev = process.env.NODE_ENV !== "production";
if (isDev) {
  import_electron3.app.commandLine.appendSwitch("enable-logging");
  import_electron3.app.commandLine.appendSwitch("v", "1");
}
import_electron3.app.commandLine.appendSwitch("disable-gpu");
import_electron3.app.commandLine.appendSwitch("disable-software-rasterizer");
process.on("uncaughtException", (error) => {
  console.error("[MAIN] Uncaught Exception:", error);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("[MAIN] Unhandled Rejection at:", promise, "reason:", reason);
});
import_electron3.app.on("will-quit", () => {
  console.log("[MAIN] will-quit event");
});
import_electron3.app.on("quit", () => {
  console.log("[MAIN] quit event");
  import_electron3.ipcMain.removeAllListeners();
});
function createWindow() {
  console.log("[MAIN] Creating window...");
  const settings = getSettings();
  console.log("[MAIN] Settings loaded:", settings);
  const iconPath = import_electron3.app.isPackaged ? import_path2.default.join(process.resourcesPath, "icons", "app-icon.png") : import_path2.default.join(__dirname, "../../public/icons/app-icon.png");
  mainWindow3 = new import_electron3.BrowserWindow({
    width: 400,
    height: 600,
    minWidth: 350,
    minHeight: 500,
    frame: false,
    // Remove frame to hide menu bar
    resizable: true,
    show: false,
    // Don't show until ready
    backgroundColor: "#1e293b",
    // Set background color
    icon: iconPath,
    webPreferences: {
      preload: import_electron3.app.isPackaged ? import_path2.default.join(__dirname, "..", "preload", "index.cjs") : import_path2.default.join(__dirname, "../preload/index.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
      // Enable sandbox for security
    }
  });
  const ELECTRON_RENDERER_URL = process.env.ELECTRON_RENDERER_URL;
  console.log("[MAIN] ELECTRON_RENDERER_URL:", ELECTRON_RENDERER_URL);
  console.log("[MAIN] Loading URL...");
  console.log("[MAIN] __dirname:", __dirname);
  console.log("[MAIN] app.isPackaged:", import_electron3.app.isPackaged);
  if (ELECTRON_RENDERER_URL) {
    mainWindow3.loadURL(ELECTRON_RENDERER_URL);
    console.log("[MAIN] Loaded from dev server:", ELECTRON_RENDERER_URL);
  } else if (import_electron3.app.isPackaged) {
    const indexPath = import_path2.default.join(__dirname, "..", "renderer", "index.html");
    console.log("[MAIN] Loading from:", indexPath);
    mainWindow3.loadFile(indexPath);
    console.log("[MAIN] Loaded from file (packaged)");
  } else {
    mainWindow3.loadURL("http://localhost:5173");
    console.log("[MAIN] Loaded from local dev server");
  }
  console.log("[MAIN] Window created");
  if (import_electron3.app.isPackaged) {
    mainWindow3.webContents.openDevTools({ mode: "detach" });
  }
  mainWindow3.on("close", (event) => {
    console.log("[MAIN] Window close event, isQuitting:", isQuitting, "minimizeToTray:", settings.minimizeToTray);
    if (!isQuitting && settings.minimizeToTray) {
      event.preventDefault();
      mainWindow3?.hide();
      console.log("[MAIN] Window hidden (minimized to tray)");
    }
  });
  mainWindow3.on("closed", () => {
    console.log("[MAIN] Window closed event");
    mainWindow3 = null;
  });
  mainWindow3.webContents.on("did-fail-load", (_event, errorCode, errorDescription) => {
    console.error("[MAIN] Failed to load:", errorCode, errorDescription);
  });
  mainWindow3.webContents.on("crashed", () => {
    console.error("[MAIN] Renderer process crashed");
  });
  mainWindow3.webContents.on("render-process-gone", (_event, details) => {
    console.error("[MAIN] Renderer process gone:", details);
    console.error("[MAIN] Reason:", details.reason);
    console.error("[MAIN] Exit code:", details.exitCode);
  });
  mainWindow3.webContents.on("did-finish-load", () => {
    console.log("[MAIN] Page finished loading");
    mainWindow3?.show();
    mainWindow3?.focus();
    console.log("[MAIN] Window shown and focused");
  });
  mainWindow3.webContents.on("dom-ready", () => {
    console.log("[MAIN] DOM ready");
  });
  mainWindow3.on("unresponsive", () => {
    console.error("[MAIN] Window became unresponsive");
  });
  mainWindow3.on("responsive", () => {
    console.log("[MAIN] Window became responsive again");
  });
  return mainWindow3;
}
import_electron3.app.whenReady().then(() => {
  console.log("[MAIN] App is ready");
  createWindow();
  console.log("[MAIN] IPC handlers setup");
  if (mainWindow3) {
    setupIpcHandlers(mainWindow3);
  }
  if (mainWindow3) {
    createTray(mainWindow3);
    console.log("[MAIN] Tray created");
  }
  import_electron3.app.on("activate", () => {
    if (import_electron3.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow3) {
      mainWindow3.show();
    }
  });
});
import_electron3.app.on("window-all-closed", () => {
  console.log("[MAIN] window-all-closed event, platform:", process.platform);
});
import_electron3.app.on("before-quit", () => {
  console.log("[MAIN] before-quit event");
  isQuitting = true;
  cleanupIpcHandlers();
  destroyTray();
});
import_electron3.app.on("will-quit", () => {
  console.log("[MAIN] App will quit");
  import_electron3.ipcMain.removeAllListeners();
});
//# sourceMappingURL=index.cjs.map
