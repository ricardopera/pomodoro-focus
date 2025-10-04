#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');
const buildDir = path.join(rootDir, 'build');
const iconSource = path.join(rootDir, 'public', 'icons', 'app-icon.png');
const iconDest = path.join(buildDir, 'icon.png');

console.log('🔧 Preparing build...');

// Create build directory if it doesn't exist
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
  console.log('✅ Created build directory');
}

// Copy icon to build directory
if (fs.existsSync(iconSource)) {
  fs.copyFileSync(iconSource, iconDest);
  console.log('✅ Copied icon to build directory');
} else {
  console.error('❌ Icon file not found:', iconSource);
  process.exit(1);
}

console.log('🎉 Build preparation complete!');
