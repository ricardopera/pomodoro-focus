/**
 * Development launcher: starts Vite for the UI, builds the main process and
 * opens Electron pointing at the dev server.
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const server = await createServer({
  configFile: path.join(root, 'vite.config.ts'),
  mode: 'development',
});
await server.listen();

const address = server.httpServer?.address();
const port = typeof address === 'object' && address ? address.port : 5173;
const url = `http://localhost:${port}`;
console.log(`▸ UI running at ${url}`);

const { default: electronPath } = await import('electron');
const child = spawn(electronPath, [path.join(root, 'dist/main/index.cjs')], {
  stdio: 'inherit',
  env: { ...process.env, ELECTRON_RENDERER_URL: url, NODE_ENV: 'development' },
});

const stop = async (code = 0) => {
  await server.close();
  process.exit(code);
};

child.on('close', (code) => void stop(code ?? 0));
process.on('SIGINT', () => {
  child.kill();
  void stop(0);
});
