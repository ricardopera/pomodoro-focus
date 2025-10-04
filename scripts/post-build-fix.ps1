# Fix Windows executable subsystem after NSIS build
# This runs AFTER electron-builder completes

Write-Host "`n========================================"
Write-Host "Post-build: Converting executable to GUI mode"
Write-Host "========================================`n"

$unpackedExe = "release\win-unpacked\Pomodoro Focus.exe"
$iconPath = "build\icon.ico"
$rcEditScript = "scripts\post-build-rcedit.cjs"

# Check if rcedit is available
$rcEditModule = "node_modules\rcedit"

if (Test-Path $rcEditModule) {
    Write-Host "Found rcedit module`n"
    
    # Check if unpacked executable exists
    if (Test-Path $unpackedExe) {
        Write-Host "Target: $unpackedExe"
        Write-Host "Icon: $iconPath`n"
        
        # Run Node.js script to modify executable
        Write-Host "Running rcedit...`n"
        node $rcEditScript $unpackedExe $iconPath
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`nSuccess: Executable converted to GUI mode"
            Write-Host "Note: NSIS installer will extract this modified executable"
            Write-Host "Console window should NOT appear when app runs`n"
        } else {
            Write-Host "`nError: Failed to modify executable`n"
            exit 1
        }
        
    } else {
        Write-Host "Error: Unpacked executable not found: $unpackedExe`n"
        exit 1
    }
    
} else {
    Write-Host "Error: rcedit not found at: $rcEditModule"
    Write-Host "Run: npm install --save-dev rcedit`n"
    exit 1
}

Write-Host "========================================`n"


