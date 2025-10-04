/**
 * Patches Electron executable to GUI mode BEFORE building
 * This ensures the base electron.exe doesn't show console
 */

const path = require('path');
const fs = require('fs');

async function patchElectronToGUI() {
  console.log('🔧 Patching Electron executable to GUI mode...');
  
  // Find electron.exe in node_modules
  const electronPath = require.resolve('electron');
  const electronDir = path.join(path.dirname(electronPath), 'dist');
  const electronExe = path.join(electronDir, 'electron.exe');
  
  console.log('📂 Electron directory:', electronDir);
  console.log('📄 Electron executable:', electronExe);
  
  if (!fs.existsSync(electronExe)) {
    console.error('❌ electron.exe not found at:', electronExe);
    process.exit(1);
  }
  
  try {
    const rcedit = require('rcedit');
    
    // Change Electron base executable to GUI mode
    await rcedit(electronExe, {
      'subsystem': 'windows'
    });
    
    console.log('✅ Successfully patched Electron to GUI mode');
    console.log('✅ All builds from this Electron will be GUI mode (no console)');
    
  } catch (error) {
    console.error('❌ Failed to patch Electron:', error.message);
    process.exit(1);
  }
}

patchElectronToGUI().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
