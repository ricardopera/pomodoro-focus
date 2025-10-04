/**
 * afterPack hook for electron-builder
 * Changes the executable subsystem from CONSOLE to WINDOWS (GUI mode)
 * and ensures the icon is properly embedded
 */

const fs = require('fs');
const path = require('path');

exports.default = async function(context) {
  console.log('\n========================================');
  console.log('🔧 afterPack hook started');
  console.log('========================================\n');
  
  console.log('Platform:', context.electronPlatformName);
  console.log('Arch:', context.arch);
  console.log('Targets:', context.targets.map(t => t.name).join(', '));
  
  // Only for Windows
  if (context.electronPlatformName !== 'win32') {
    console.log('⏭️  Skipping: Not a Windows build\n');
    return;
  }

  console.log('\n🔧 Converting executable to GUI mode...');
  
  const appOutDir = context.appOutDir;
  const exeName = context.packager.appInfo.productFilename + '.exe';
  const exePath = path.join(appOutDir, exeName);
  const iconPath = path.join(process.cwd(), 'build', 'icon.ico');
  
  console.log('📂 App output directory:', appOutDir);
  console.log('📄 Target executable name:', exeName);
  console.log('📄 Target executable path:', exePath);
  console.log('🎨 Icon path:', iconPath);
  
  // Verify executable exists
  if (!fs.existsSync(exePath)) {
    console.error('\n❌ ERROR: Executable not found!');
    console.error('   Expected path:', exePath);
    console.error('   Directory contents:');
    try {
      const files = fs.readdirSync(appOutDir);
      files.forEach(f => console.error('   -', f));
    } catch (e) {
      console.error('   Could not list directory:', e.message);
    }
    throw new Error('Executable not found: ' + exePath);
  }
  console.log('✅ Executable found');
  
  // Verify icon exists
  if (!fs.existsSync(iconPath)) {
    console.error('\n❌ ERROR: Icon file not found!');
    console.error('   Expected path:', iconPath);
    throw new Error('Icon file not found: ' + iconPath);
  }
  
  const iconStats = fs.statSync(iconPath);
  console.log('✅ Icon found (size:', iconStats.size, 'bytes)');
  
  try {
    console.log('\n🔄 Running rcedit...');
    const rcedit = require('rcedit');
    
    // Change subsystem to Windows (GUI) AND set icon
    const options = {
      'subsystem': 'windows',  // Remove console window
      'icon': iconPath          // Embed the icon in the executable
    };
    
    console.log('   Options:', JSON.stringify(options, null, 2));
    
    await rcedit(exePath, options);
    
    console.log('\n✅ SUCCESS: Executable modified');
    console.log('   ✅ Subsystem changed to: WINDOWS (GUI mode)');
    console.log('   ✅ Icon embedded in executable');
    console.log('   ✅ NO CONSOLE WINDOW will appear');
    
  } catch (error) {
    console.error('\n❌ FATAL ERROR: Failed to modify executable');
    console.error('   Error type:', error.constructor.name);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    throw error; // Fail the build if this is critical
  }
  
  console.log('\n========================================');
  console.log('✅ afterPack hook completed successfully');
  console.log('========================================\n');
};
