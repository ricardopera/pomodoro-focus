"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/preload/index.ts
var index_exports = {};
module.exports = __toCommonJS(index_exports);
var import_electron = require("electron");

// src/shared/constants.ts
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

// src/preload/index.ts
import_electron.contextBridge.exposeInMainWorld("electronAPI", {
  // Settings API
  settings: {
    get: () => import_electron.ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET),
    update: (partial) => import_electron.ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_UPDATE, partial),
    reset: () => import_electron.ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_RESET),
    onChange: (callback) => {
      const listener = (_event, settings) => callback(settings);
      import_electron.ipcRenderer.on(IPC_CHANNELS.SETTINGS_CHANGED, listener);
      return () => import_electron.ipcRenderer.removeListener(IPC_CHANNELS.SETTINGS_CHANGED, listener);
    }
  },
  // Timer API
  timer: {
    start: (type) => import_electron.ipcRenderer.invoke(IPC_CHANNELS.TIMER_START, type),
    pause: () => import_electron.ipcRenderer.invoke(IPC_CHANNELS.TIMER_PAUSE),
    resume: () => import_electron.ipcRenderer.invoke(IPC_CHANNELS.TIMER_RESUME),
    reset: () => import_electron.ipcRenderer.invoke(IPC_CHANNELS.TIMER_RESET),
    onTick: (callback) => {
      const listener = (_event, state) => callback(state);
      import_electron.ipcRenderer.on(IPC_CHANNELS.TIMER_TICK, listener);
      return () => import_electron.ipcRenderer.removeListener(IPC_CHANNELS.TIMER_TICK, listener);
    },
    onComplete: (callback) => {
      const listener = () => callback();
      import_electron.ipcRenderer.on(IPC_CHANNELS.TIMER_COMPLETE, listener);
      return () => import_electron.ipcRenderer.removeListener(IPC_CHANNELS.TIMER_COMPLETE, listener);
    }
  },
  // Sessions API
  sessions: {
    get: () => import_electron.ipcRenderer.invoke(IPC_CHANNELS.SESSIONS_GET)
  },
  // Statistics API
  statistics: {
    get: () => import_electron.ipcRenderer.invoke(IPC_CHANNELS.STATISTICS_GET)
  },
  // Window control API
  minimize: () => import_electron.ipcRenderer.send("window:minimize"),
  close: () => import_electron.ipcRenderer.send("window:close")
});
//# sourceMappingURL=index.cjs.map
