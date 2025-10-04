/**
 * afterPack hook for electron-builder
 * Changes the executable subsystem from CONSOLE to WINDOWS (GUI mode)
 * and ensures the icon is properly embedded
 */

const fs = require('fs');
const path = require('path');

exports.default = async function(context) {
  // Only for Windows
  if (context.electronPlatformName !== 'win32') {
    return;
  }

  console.log('🔧 afterPack: Converting executable to GUI mode...');
  
  const appOutDir = context.appOutDir;
  const exeName = context.packager.appInfo.productFilename + '.exe';
  const exePath = path.join(appOutDir, exeName);
  const iconPath = path.join(process.cwd(), 'build', 'icon.ico');
  
  console.log('📂 App directory:', appOutDir);
  console.log('📄 Target executable:', exeName);
  console.log('🎨 Icon path:', iconPath);
  
  if (!fs.existsSync(exePath)) {
    console.error('❌ Executable not found:', exePath);
    throw new Error('Executable not found');
  }
  
  if (!fs.existsSync(iconPath)) {
    console.error('❌ Icon not found:', iconPath);
    throw new Error('Icon file not found');
  }
  
  try {
    const rcedit = require('rcedit');
    
    // Change subsystem to Windows (GUI) AND set icon
    await rcedit(exePath, {
      'subsystem': 'windows',  // Remove console window
      'icon': iconPath          // Embed the icon in the executable
    });
    
    console.log('✅ Successfully converted executable to GUI mode');
    console.log('✅ Successfully embedded icon in executable');
    console.log('✅ No console window will appear');
    
  } catch (error) {
    console.error('❌ Failed to modify executable:', error.message);
    throw error; // Fail the build if this is critical
  }
};
