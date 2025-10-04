/**
 * Alternative approach: Use Windows editbin tool (from Visual Studio Build Tools)
 * This is more reliable in CI environments than rcedit
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

exports.default = async function(context) {
  console.log('\n========================================');
  console.log('🔧 afterPack-editbin hook started');
  console.log('========================================\n');
  
  if (context.electronPlatformName !== 'win32') {
    console.log('⏭️  Skipping: Not a Windows build\n');
    return;
  }

  const appOutDir = context.appOutDir;
  const exeName = context.packager.appInfo.productFilename + '.exe';
  const exePath = path.join(appOutDir, exeName);
  
  console.log('📂 App directory:', appOutDir);
  console.log('📄 Executable:', exePath);
  
  if (!fs.existsSync(exePath)) {
    throw new Error('Executable not found: ' + exePath);
  }
  
  try {
    // Try method 1: rcedit (preferred)
    try {
      console.log('\n🔄 Method 1: Trying rcedit...');
      const rcedit = require('rcedit');
      const iconPath = path.join(process.cwd(), 'build', 'icon.ico');
      
      await rcedit(exePath, {
        'subsystem': 'windows',
        'icon': iconPath
      });
      
      console.log('✅ Method 1 SUCCESS: rcedit worked!');
      return;
    } catch (err) {
      console.warn('⚠️  Method 1 failed:', err.message);
    }
    
    // Try method 2: editbin (Windows SDK tool)
    try {
      console.log('\n🔄 Method 2: Trying editbin (Visual Studio)...');
      
      // Find vswhere to locate Visual Studio
      const vswherePath = 'C:\\Program Files (x86)\\Microsoft Visual Studio\\Installer\\vswhere.exe';
      
      if (fs.existsSync(vswherePath)) {
        const vsPath = execSync(`"${vswherePath}" -latest -property installationPath`, { encoding: 'utf8' }).trim();
        const editbinPath = path.join(vsPath, 'VC\\Tools\\MSVC\\*\\bin\\Hostx64\\x64\\editbin.exe');
        
        console.log('   Found VS at:', vsPath);
        console.log('   Looking for editbin...');
        
        // Use editbin to change subsystem
        execSync(`"${editbinPath}" /SUBSYSTEM:WINDOWS "${exePath}"`, { stdio: 'inherit' });
        console.log('✅ Method 2 SUCCESS: editbin worked!');
        return;
      }
    } catch (err) {
      console.warn('⚠️  Method 2 failed:', err.message);
    }
    
    // If both fail, throw error
    throw new Error('All methods failed to convert executable to GUI mode');
    
  } catch (error) {
    console.error('\n❌ FATAL: Could not convert executable to GUI mode');
    console.error('   This means the console window WILL appear');
    console.error('   Error:', error.message);
    // Don't throw - let the build continue but warn
  }
  
  console.log('\n========================================\n');
};
