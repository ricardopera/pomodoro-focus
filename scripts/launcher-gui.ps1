# PowerShell script to launch Pomodoro Focus without console window
# This can be compiled to .exe using ps2exe

$exePath = Join-Path $PSScriptRoot "Pomodoro Focus.exe"

# Start the process hidden
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = $exePath
$psi.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
$psi.CreateNoWindow = $true

try {
    [System.Diagnostics.Process]::Start($psi) | Out-Null
} catch {
    # Fallback to regular start if hidden fails
    Start-Process $exePath
}
