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
const releaseDir = path.join(rootDir, 'release', 'win-unpacked');
const asarPath = path.join(releaseDir, 'resources', 'app.asar');
const electronSrcDir = path.join(rootDir, 'node_modules', 'electron', 'dist');

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

// Remove old asar if exists - skip if busy
if (fs.existsSync(asarPath)) {
  console.log('🗑️  Removing old app.asar...');
  try {
    fs.unlinkSync(asarPath);
    console.log('✅ Removed successfully');
  } catch (err) {
    if (err.code === 'EBUSY') {
      console.log('⚠️  File is busy, will be overwritten by asar pack');
    } else {
      throw err;
    }
  }
}

// Pack into asar
console.log('📦 Packing into app.asar...');
try {
  execSync(`npx asar pack "${tempDir}" "${asarPath}"`, { stdio: 'inherit' });
  console.log('✅ Successfully packed app.asar');
  
  // Copy Electron distribution if not exists
  const electronExe = path.join(releaseDir, 'Pomodoro Focus.exe');
  if (!fs.existsSync(electronExe)) {
    console.log('📦 Copying Electron distribution...');
    
    // Create release directory if not exists
    if (!fs.existsSync(releaseDir)) {
      fs.mkdirSync(releaseDir, { recursive: true });
    }
    
    // Copy all electron files
    const electronFiles = fs.readdirSync(electronSrcDir);
    electronFiles.forEach(file => {
      const srcFile = path.join(electronSrcDir, file);
      const destFile = path.join(releaseDir, file);
      
      // Skip resources folder (we're creating our own)
      if (file === 'resources') return;
      
      if (fs.statSync(srcFile).isDirectory()) {
        fs.cpSync(srcFile, destFile, { recursive: true });
      } else {
        fs.copyFileSync(srcFile, destFile);
      }
    });
    
    // Rename electron.exe to Pomodoro Focus.exe
    const electronSrc = path.join(releaseDir, 'electron.exe');
    if (fs.existsSync(electronSrc)) {
      fs.renameSync(electronSrc, electronExe);
      console.log('✅ Renamed electron.exe to Pomodoro Focus.exe');
    }
  }
  
  // Copy icons to resources folder (for tray icon)
  const iconsResourceDir = path.join(releaseDir, 'resources', 'icons');
  const publicIconsDir = path.join(rootDir, 'public', 'icons');
  if (fs.existsSync(publicIconsDir)) {
    console.log('📦 Copying icons to resources...');
    fs.mkdirSync(iconsResourceDir, { recursive: true });
    fs.cpSync(publicIconsDir, iconsResourceDir, { recursive: true });
    console.log('✅ Icons copied to resources');
  }
  
  // Copy sounds to resources folder
  const soundsResourceDir = path.join(releaseDir, 'resources', 'sounds');
  const publicSoundsDir = path.join(rootDir, 'public', 'sounds');
  if (fs.existsSync(publicSoundsDir)) {
    console.log('📦 Copying sounds to resources...');
    fs.mkdirSync(soundsResourceDir, { recursive: true });
    fs.cpSync(publicSoundsDir, soundsResourceDir, { recursive: true });
    console.log('✅ Sounds copied to resources');
  }
  
  // Copy launcher.vbs to release folder for no-console execution
  const launcherSrc = path.join(rootDir, 'scripts', 'launcher.vbs');
  const launcherDest = path.join(releaseDir, 'Pomodoro Focus (No Console).vbs');
  if (fs.existsSync(launcherSrc)) {
    fs.copyFileSync(launcherSrc, launcherDest);
    console.log('✅ Created no-console launcher');
    console.log('');
    console.log('⚠️  IMPORTANT: Use "Pomodoro Focus (No Console).vbs" to run without console!');
    console.log('   Do NOT use "Pomodoro Focus.exe" directly (it will show console)');
  }
} catch (error) {
  console.error('❌ Failed to pack app.asar:', error.message);
  process.exit(1);
}

// Clean up temp directory
console.log('🧹 Cleaning up...');
fs.rmSync(tempDir, { recursive: true, force: true });

console.log('🎉 Done!');
