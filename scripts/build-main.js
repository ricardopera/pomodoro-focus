/** Bundles the Electron main process and the preload script with esbuild. */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const shared = {
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  external: ['electron'],
  sourcemap: true,
  logLevel: 'info',
};

await build({
  ...shared,
  entryPoints: [path.join(root, 'src/main/index.ts')],
  outfile: path.join(root, 'dist/main/index.cjs'),
});

await build({
  ...shared,
  entryPoints: [path.join(root, 'src/preload/index.ts')],
  outfile: path.join(root, 'dist/preload/index.cjs'),
});

console.log('✔ main process built');
