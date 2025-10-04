#!/usr/bin/env node

/**
 * Script to manually pack the application into app.asar
 * This is useful when electron-builder fails but you want to test the packaged app
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const tempDir = path.join(rootDir, 'temp-app');
const asarPath = path.join(rootDir, 'release', 'win-unpacked', 'resources', 'app.asar');

console.log('📦 Packing application manually...');

// Clean up temp directory if exists
if (fs.existsSync(tempDir)) {
  console.log('🧹 Cleaning up temp directory...');
  fs.rmSync(tempDir, { recursive: true, force: true });
}

// Create temp directory
console.log('📁 Creating temp directory...');
fs.mkdirSync(tempDir, { recursive: true });

// Copy necessary files
console.log('📋 Copying files...');
const filesToCopy = [
  { src: 'dist', dest: 'dist', isDir: true },
  { src: 'package.json', dest: 'package.json', isDir: false },
  { src: 'index.html', dest: 'index.html', isDir: false },
];

filesToCopy.forEach(({ src, dest, isDir }) => {
  const srcPath = path.join(rootDir, src);
  const destPath = path.join(tempDir, dest);
  
  if (!fs.existsSync(srcPath)) {
    console.warn(`⚠️  Warning: ${src} not found, skipping...`);
    return;
  }
  
  if (isDir) {
    fs.cpSync(srcPath, destPath, { recursive: true });
  } else {
    fs.copyFileSync(srcPath, destPath);
  }
  console.log(`  ✓ Copied ${src}`);
});

// Copy all node_modules (production dependencies with their transitive deps)
console.log('📦 Copying node_modules...');
const srcNodeModules = path.join(rootDir, 'node_modules');
const destNodeModules = path.join(tempDir, 'node_modules');

if (fs.existsSync(srcNodeModules)) {
  console.log('  This may take a moment...');
  fs.cpSync(srcNodeModules, destNodeModules, { 
    recursive: true,
    filter: (src) => {
      // Skip dev dependencies and unnecessary files
      const relativePath = path.relative(srcNodeModules, src);
      
      // Skip .bin folder
      if (relativePath.startsWith('.bin')) return false;
      
      // Skip common dev-only packages (optional optimization)
      const devPackages = [
        '@types/', 'typescript', 'vite', 'vitest', 'eslint', 
        'prettier', '@vitejs/', 'electron-builder', 'electron-vite'
      ];
      
      for (const devPkg of devPackages) {
        if (relativePath.startsWith(devPkg)) return false;
      }
      
      return true;
    }
  });
  console.log('  ✓ node_modules copied');
} else {
  console.error('❌ node_modules not found! Run npm install first.');
  process.exit(1);
}

// Remove old asar if exists
if (fs.existsSync(asarPath)) {
  console.log('🗑️  Removing old app.asar...');
  fs.unlinkSync(asarPath);
}

// Pack into asar
console.log('📦 Packing into app.asar...');
try {
  execSync(`npx asar pack "${tempDir}" "${asarPath}"`, { stdio: 'inherit' });
  console.log('✅ Successfully packed app.asar');
} catch (error) {
  console.error('❌ Failed to pack app.asar:', error.message);
  process.exit(1);
}

// Clean up temp directory
console.log('🧹 Cleaning up...');
fs.rmSync(tempDir, { recursive: true, force: true });

console.log('🎉 Done!');
