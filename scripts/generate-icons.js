/**
 * Rasterises the two SVG sources into every icon the app and the installer
 * need. Run it after touching public/icons/*.svg.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pngToIco from 'png-to-ico';
import sharp from 'sharp';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const iconsDir = path.join(root, 'public', 'icons');
const buildDir = path.join(root, 'build');

// Windows caps .ico entries at 256px; larger frames only bloat the file.
const ICO_SIZES = [16, 24, 32, 48, 64, 128, 256];
const LINUX_SIZES = [16, 32, 48, 64, 128, 256, 512];

async function render(source, size, target) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await sharp(source, { density: 384 }).resize(size, size).png().toFile(target);
  return target;
}

async function main() {
  const appSvg = path.join(iconsDir, 'app-icon.svg');
  const traySvg = path.join(iconsDir, 'tray-icon.svg');

  // Window + notification icon.
  await render(appSvg, 512, path.join(iconsDir, 'app-icon.png'));
  await render(appSvg, 512, path.join(buildDir, 'icon.png'));

  // Tray needs a small, crisp monochrome glyph.
  await render(traySvg, 32, path.join(iconsDir, 'tray-icon.png'));

  // Windows .ico bundles several resolutions.
  const icoParts = [];
  for (const size of ICO_SIZES) {
    icoParts.push(await render(appSvg, size, path.join(buildDir, 'ico', `${size}.png`)));
  }
  await fs.writeFile(path.join(buildDir, 'icon.ico'), await pngToIco(icoParts));
  await fs.rm(path.join(buildDir, 'ico'), { recursive: true, force: true });

  // Linux expects one file per size inside the build resources directory.
  for (const size of LINUX_SIZES) {
    await render(appSvg, size, path.join(buildDir, `${size}x${size}`, 'icon.png'));
  }

  console.log('✔ icons generated');
}

main().catch((error) => {
  console.error('✖ icon generation failed:', error);
  process.exit(1);
});
