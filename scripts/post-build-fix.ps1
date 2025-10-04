# Fix Windows executable subsystem after NSIS build
# This runs AFTER electron-builder completes

Write-Host "`n========================================"
Write-Host "🔧 Post-build: Converting NSIS executable to GUI mode"
Write-Host "========================================`n"

$installerPath = "release\Pomodoro Focus Setup *.exe"
$unpackedExe = "release\win-unpacked\Pomodoro Focus.exe"

# Check if rcedit is available
$rcEditPath = "node_modules\rcedit\bin\rcedit-x64.exe"

if (Test-Path $rcEditPath) {
    Write-Host "✅ Found rcedit at: $rcEditPath`n"
    
    # Fix unpacked executable
    if (Test-Path $unpackedExe) {
        Write-Host "🔄 Converting unpacked executable..."
        Write-Host "   Target: $unpackedExe"
        
        try {
            & $rcEditPath $unpackedExe --set-subsystem windows --set-icon "build\icon.ico"
            Write-Host "✅ Unpacked executable converted to GUI mode`n"
        } catch {
            Write-Host "❌ Failed to convert unpacked executable: $_`n"
        }
    }
    
    Write-Host "`nℹ️  Note: NSIS installer will extract this modified executable"
    Write-Host "✅ Console window should NOT appear when app runs`n"
    
} else {
    Write-Host "❌ rcedit not found at: $rcEditPath"
    Write-Host "   Run: npm install --save-dev rcedit`n"
    exit 1
}

Write-Host "========================================`n"
