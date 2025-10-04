/**
 * Generate icons from the app-icon.png (tomato from MCP Image Server)
 * Creates proper ICO, PNG and multi-size icons for all platforms
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const publicIconsDir = path.join(rootDir, 'public', 'icons');
const buildDir = path.join(rootDir, 'build');
const distElectronIconsDir = path.join(rootDir, 'dist-electron', 'icons');

// Ensure directories exist
[buildDir, distElectronIconsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

console.log('🎨 Generating app icons from tomato PNG...');

// Source icon (tomato from MCP Image Server)
const sourceIconPath = path.join(publicIconsDir, 'app-icon.png');

if (!fs.existsSync(sourceIconPath)) {
  console.error('❌ Source icon not found:', sourceIconPath);
  console.error('Please ensure app-icon.png exists in public/icons/');
  process.exit(1);
}

console.log('📸 Using source icon:', sourceIconPath);

async function generateIcons() {
  try {
    // Copy source to dist-electron for runtime
    const distIconPath = path.join(distElectronIconsDir, 'app-icon.png');
    fs.copyFileSync(sourceIconPath, distIconPath);
    console.log(`✅ Generated ${distIconPath}`);

    // Generate 256x256 PNG for ICO conversion (Windows requirement)
    const png256Path = path.join(buildDir, 'icon-256.png');
    await sharp(sourceIconPath)
      .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(png256Path);
    
    // Generate ICO file from 256x256 PNG (Windows)
    const icoPath = path.join(buildDir, 'icon.ico');
    const icoBuffer = await pngToIco(png256Path);
    fs.writeFileSync(icoPath, icoBuffer);
    console.log(`✅ Generated ${icoPath}`);

    // Generate 512x512 PNG for macOS
    const buildPngPath = path.join(buildDir, 'icon.png');
    await sharp(sourceIconPath)
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(buildPngPath);
    console.log(`✅ Generated ${buildPngPath}`);

    // Generate Linux icon sizes
    const linuxIconSizes = [16, 32, 48, 64, 128, 256, 512];
    for (const size of linuxIconSizes) {
      const sizeDir = path.join(buildDir, `${size}x${size}`);
      if (!fs.existsSync(sizeDir)) {
        fs.mkdirSync(sizeDir, { recursive: true });
      }
      
      const iconPath = path.join(sizeDir, 'icon.png');
      await sharp(sourceIconPath)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(iconPath);
      console.log(`✅ Generated ${iconPath}`);
    }

    // Clean up temporary file
    fs.unlinkSync(png256Path);

    console.log('🎉 Icon generation complete!');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
