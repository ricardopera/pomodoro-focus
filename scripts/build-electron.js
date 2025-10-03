// Build script for main process and preload
import { build } from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildMain() {
  console.log('🔨 Building main process...');
  
  await build({
    entryPoints: [path.join(__dirname, '../src/main/index.ts')],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'cjs',
    outfile: path.join(__dirname, '../dist/main/index.cjs'),
    external: ['electron', 'electron-store'],
    sourcemap: true,
    minify: false,
    logLevel: 'info',
  });
  
  console.log('✅ Main process built successfully');
}

async function buildPreload() {
  console.log('🔨 Building preload script...');
  
  await build({
    entryPoints: [path.join(__dirname, '../src/preload/index.ts')],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'cjs',
    outfile: path.join(__dirname, '../dist/preload/index.cjs'),
    external: ['electron'],
    sourcemap: true,
    minify: false,
    logLevel: 'info',
  });
  
  console.log('✅ Preload script built successfully');
}

async function buildAll() {
  try {
    await Promise.all([buildMain(), buildPreload()]);
    console.log('\n🎉 Build complete!\n');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildAll();
