/**
 * Generate PNG and ICO icons from SVG for the app icon
 * Creates a simple PNG icon programmatically and converts to ICO
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a simple 512x512 PNG icon (red tomato on white background)
function createPngIcon() {
  // PNG file signature
  const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  const width = 512;
  const height = 512;
  
  // Create IHDR chunk (image header)
  function createIHDR() {
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr.writeUInt8(8, 8);    // Bit depth
    ihdr.writeUInt8(2, 9);    // Color type (RGB)
    ihdr.writeUInt8(0, 10);   // Compression
    ihdr.writeUInt8(0, 11);   // Filter
    ihdr.writeUInt8(0, 12);   // Interlace
    return createChunk('IHDR', ihdr);
  }
  
  // Create a chunk with CRC
  function createChunk(type, data) {
    const typeBuffer = Buffer.from(type, 'ascii');
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);
    
    const crcData = Buffer.concat([typeBuffer, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(calculateCRC(crcData), 0);
    
    return Buffer.concat([length, typeBuffer, data, crc]);
  }
  
  // CRC-32 calculation
  function calculateCRC(buffer) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buffer.length; i++) {
      crc ^= buffer[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ ((crc & 1) ? 0xEDB88320 : 0);
      }
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }
  
  // Create image data (red tomato circle)
  function createIDAT() {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 20;
    
    const scanlines = [];
    
    for (let y = 0; y < height; y++) {
      const scanline = Buffer.alloc(1 + width * 3);
      scanline[0] = 0; // No filter
      
      for (let x = 0; x < width; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const pixelIndex = 1 + x * 3;
        
        if (distance <= radius) {
          // Red tomato with gradient
          const intensity = 1 - (distance / radius) * 0.3;
          scanline[pixelIndex] = Math.floor(230 * intensity);
          scanline[pixelIndex + 1] = Math.floor(70 * intensity);
          scanline[pixelIndex + 2] = Math.floor(70 * intensity);
        } else {
          // White background
          scanline[pixelIndex] = 255;
          scanline[pixelIndex + 1] = 255;
          scanline[pixelIndex + 2] = 255;
        }
      }
      
      scanlines.push(scanline);
    }
    
    const imageData = Buffer.concat(scanlines);
    const compressed = zlib.deflateSync(imageData, { level: 6 });
    
    return createChunk('IDAT', compressed);
  }
  
  // Create IEND chunk
  function createIEND() {
    return createChunk('IEND', Buffer.alloc(0));
  }
  
  return Buffer.concat([
    pngSignature,
    createIHDR(),
    createIDAT(),
    createIEND()
  ]);
}

// Create ICO file from PNG data
function createIcoIcon(pngData) {
  // ICO file header
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);  // Reserved (must be 0)
  header.writeUInt16LE(1, 2);  // Type (1 = ICO)
  header.writeUInt16LE(1, 4);  // Number of images
  
  // ICO directory entry
  const dirEntry = Buffer.alloc(16);
  dirEntry.writeUInt8(0, 0);      // Width (0 = 256)
  dirEntry.writeUInt8(0, 1);      // Height (0 = 256)
  dirEntry.writeUInt8(0, 2);      // Color palette (0 = no palette)
  dirEntry.writeUInt8(0, 3);      // Reserved (must be 0)
  dirEntry.writeUInt16LE(1, 4);   // Color planes
  dirEntry.writeUInt16LE(32, 6);  // Bits per pixel
  dirEntry.writeUInt32LE(pngData.length, 8);  // Size of image data
  dirEntry.writeUInt32LE(22, 12); // Offset of image data (6 + 16)
  
  return Buffer.concat([header, dirEntry, pngData]);
}

// Generate icons
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
const buildIconsDir = path.join(__dirname, '..', 'dist-electron', 'icons');
const buildDir = path.join(__dirname, '..', 'build');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

if (!fs.existsSync(buildIconsDir)) {
  fs.mkdirSync(buildIconsDir, { recursive: true });
}

if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

console.log('🎨 Generating app icons...');

// Check if custom icon exists, otherwise generate programmatic one
const customIconPath = path.join(iconsDir, 'app-icon.png');
let pngIcon;

if (fs.existsSync(customIconPath)) {
  console.log('📸 Using existing app-icon.png');
  pngIcon = fs.readFileSync(customIconPath);
} else {
  console.log('🎨 Generating programmatic icon');
  pngIcon = createPngIcon();
}

const buildPngPath = path.join(buildIconsDir, 'app-icon.png');

// Only write to public/icons if it doesn't exist
if (!fs.existsSync(customIconPath)) {
  const pngPath = path.join(iconsDir, 'app-icon.png');
  fs.writeFileSync(pngPath, pngIcon);
  console.log(`✅ Generated ${pngPath}`);
}

fs.writeFileSync(buildPngPath, pngIcon);
console.log(`✅ Generated ${buildPngPath}`);

// Generate ICO for Windows
const icoIcon = createIcoIcon(pngIcon);
const icoPath = path.join(buildDir, 'icon.ico');
fs.writeFileSync(icoPath, icoIcon);

console.log(`✅ Generated ${icoPath}`);

// Copy PNG to build directory for macOS
const macIconPath = path.join(buildDir, 'icon.png');
fs.writeFileSync(macIconPath, pngIcon);
console.log(`✅ Generated ${macIconPath}`);

// Create icon directory structure for Linux
const linuxIconSizes = [16, 32, 48, 64, 128, 256, 512];
linuxIconSizes.forEach(size => {
  const sizeDir = path.join(buildDir, `${size}x${size}`);
  if (!fs.existsSync(sizeDir)) {
    fs.mkdirSync(sizeDir, { recursive: true });
  }
  
  // For now, just copy the same 512x512 icon for all sizes
  // In production, you'd want to generate properly scaled versions
  const iconPath = path.join(sizeDir, 'icon.png');
  fs.writeFileSync(iconPath, pngIcon);
  console.log(`✅ Generated ${iconPath}`);
});

console.log('🎉 Icon generation complete!');

