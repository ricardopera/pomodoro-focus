import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { setupIpcHandlers, cleanupIpcHandlers } from './ipc';
import { createTray, destroyTray } from './tray';
import { getSettings } from './store';

let mainWindow: BrowserWindow | null = null;
let isQuitting = false;

// Verbose logging only in development
const isDev = process.env.NODE_ENV !== 'production';

// Helper for conditional logging
const log = (...args: any[]) => {
  if (isDev) {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
};

const logError = (...args: any[]) => {
  if (isDev) {
    // eslint-disable-next-line no-console
    console.error(...args);
  }
};

if (isDev) {
  app.commandLine.appendSwitch('enable-logging');
  app.commandLine.appendSwitch('v', '1');
} else {
  // In production, suppress all console output
  app.commandLine.appendSwitch('disable-logging');
}

// Disable GPU to prevent renderer crashes on some Windows systems
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logError('[MAIN] Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  logError('[MAIN] Unhandled Rejection at:', promise, 'reason:', reason);
});

app.on('will-quit', () => {
  log('[MAIN] will-quit event');
});

app.on('quit', () => {
  log('[MAIN] quit event');
  ipcMain.removeAllListeners();
});

function createWindow(): BrowserWindow {
  log('[MAIN] Creating window...');
  const settings = getSettings();
  log('[MAIN] Settings loaded:', settings);

  // Create app icon
  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, 'icons', 'app-icon.png')
    : path.join(__dirname, '../../public/icons/app-icon.png');

  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    minWidth: 350,
    minHeight: 500,
    frame: false, // Remove frame to hide menu bar
    resizable: true,
    show: false, // Don't show until ready
    backgroundColor: '#1e293b', // Set background color
    icon: iconPath,
    webPreferences: {
      preload: app.isPackaged 
        ? path.join(__dirname, '..', 'preload', 'index.cjs')
        : path.join(__dirname, '../preload/index.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true, // Enable sandbox for security
    },
  });

  // Load URL based on environment
  const ELECTRON_RENDERER_URL = process.env.ELECTRON_RENDERER_URL;
  log('[MAIN] ELECTRON_RENDERER_URL:', ELECTRON_RENDERER_URL);
  log('[MAIN] Loading URL...');
  log('[MAIN] __dirname:', __dirname);
  log('[MAIN] app.isPackaged:', app.isPackaged);

  if (ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(ELECTRON_RENDERER_URL);
    log('[MAIN] Loaded from dev server:', ELECTRON_RENDERER_URL);
  } else if (app.isPackaged) {
    // In packaged app, renderer files are in dist/renderer
    const indexPath = path.join(__dirname, '..', 'renderer', 'index.html');
    log('[MAIN] Loading from:', indexPath);
    mainWindow.loadFile(indexPath);
    log('[MAIN] Loaded from file (packaged)');
  } else {
    // Development: load from default Vite port
    mainWindow.loadURL('http://localhost:5173');
    log('[MAIN] Loaded from local dev server');
  }

  log('[MAIN] Window created');

  // Open DevTools for debugging (comment out for production)
  // if (app.isPackaged) {
  //   mainWindow.webContents.openDevTools({ mode: 'detach' });
  // }

  // Window event listeners
  mainWindow.on('close', (event) => {
    log('[MAIN] Window close event, isQuitting:', isQuitting, 'minimizeToTray:', settings.minimizeToTray);
    
    // Minimize to tray instead of closing if enabled
    if (!isQuitting && settings.minimizeToTray) {
      event.preventDefault();
      mainWindow?.hide();
      log('[MAIN] Window hidden (minimized to tray)');
    }
  });

  mainWindow.on('closed', () => {
    log('[MAIN] Window closed event');
    mainWindow = null;
  });

  // Listen for crashes or errors
  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    logError('[MAIN] Failed to load:', errorCode, errorDescription);
  });

  mainWindow.webContents.on('crashed', () => {
    logError('[MAIN] Renderer process crashed');
  });

  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    logError('[MAIN] Renderer process gone:', details);
    logError('[MAIN] Reason:', details.reason);
    logError('[MAIN] Exit code:', details.exitCode);
  });

  mainWindow.webContents.on('did-finish-load', () => {
    log('[MAIN] Page finished loading');
    mainWindow?.show();
    mainWindow?.focus();
    log('[MAIN] Window shown and focused');
  });

  mainWindow.webContents.on('dom-ready', () => {
    log('[MAIN] DOM ready');
  });

  mainWindow.on('unresponsive', () => {
    logError('[MAIN] Window became unresponsive');
  });

  mainWindow.on('responsive', () => {
    log('[MAIN] Window became responsive again');
  });

  return mainWindow;
}

// App event handlers
app.whenReady().then(() => {
  log('[MAIN] App is ready');
  
  createWindow();
  log('[MAIN] IPC handlers setup');
  if (mainWindow) {
    setupIpcHandlers(mainWindow);
  }

  // Tray integration
  if (mainWindow) {
    createTray(mainWindow);
    log('[MAIN] Tray created');
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });
});

app.on('window-all-closed', () => {
  log('[MAIN] window-all-closed event, platform:', process.platform);
  
  // Commented out for debugging - allows app to quit on window close
  // if (process.platform !== 'darwin') {
  //   app.quit();
  // }
});

app.on('before-quit', () => {
  log('[MAIN] before-quit event');
  isQuitting = true;
  cleanupIpcHandlers();
  destroyTray();
});

// Quit when all windows are closed (except on macOS)
app.on('will-quit', () => {
  log('[MAIN] App will quit');
  ipcMain.removeAllListeners();
});

