// Simple Electron launcher for development
// This bypasses electron-vite and runs Electron directly

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startDev() {
  console.log('🚀 Starting Vite dev server...');
  
  // Start Vite dev server
  const server = await createServer({
    configFile: path.join(__dirname, '..', 'vite.config.ts'),
    mode: 'development',
  });
  
  await server.listen();
  
  const address = server.httpServer.address();
  const port = typeof address === 'object' ? address.port : 5173;
  const url = `http://localhost:${port}`;
  
  console.log(`✅ Vite dev server running at ${url}`);
  
  // Set environment variable for Electron
  process.env.ELECTRON_RENDERER_URL = url;
  process.env.NODE_ENV = 'development';
  
  console.log('🚀 Starting Electron...');
  
  // Start Electron - dynamic import since electron is CJS
  const { default: electronPath } = await import('electron');
  const electron = spawn(electronPath, [path.join(__dirname, '..', 'dist/main/index.cjs')], {
    stdio: 'inherit',
    env: {
      ...process.env,
      ELECTRON_RENDERER_URL: url,
      NODE_ENV: 'development',
    },
  });
  
  electron.on('close', (code) => {
    console.log(`\n👋 Electron exited with code ${code}`);
    server.close();
    process.exit(code);
  });
  
  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping...');
    electron.kill();
    server.close();
    process.exit(0);
  });
}

startDev().catch((err) => {
  console.error('❌ Error starting dev server:', err);
  process.exit(1);
});
