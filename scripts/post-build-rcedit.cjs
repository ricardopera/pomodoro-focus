/**
 * Post-build script to ensure executable is GUI mode
 * Called by post-build-fix.ps1
 */

const rcedit = require('rcedit');
const path = require('path');

const exePath = process.argv[2];
const iconPath = process.argv[3];

if (!exePath || !iconPath) {
  console.error('Usage: node post-build-rcedit.cjs <exe-path> <icon-path>');
  process.exit(1);
}

console.log('🔄 Running rcedit...');
console.log('   Executable:', exePath);
console.log('   Icon:', iconPath);

rcedit(exePath, {
  'subsystem': 'windows',
  'icon': iconPath
}).then(() => {
  console.log('✅ Successfully modified executable');
  console.log('   ✅ Subsystem: WINDOWS (GUI mode)');
  console.log('   ✅ Icon: embedded');
  process.exit(0);
}).catch(err => {
  console.error('❌ rcedit failed:', err.message);
  process.exit(1);
});
