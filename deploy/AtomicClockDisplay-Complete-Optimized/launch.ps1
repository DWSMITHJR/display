# Status Clock & Weather Display Launcher
Write-Host "Launching Status Clock & Weather Display..." -ForegroundColor Green

$filePath = "C:\Users\donal\source\repos\display\index.html"

if (Test-Path $filePath) {
    Start-Process $filePath
    Write-Host "Status Clock & Weather Display launched in default browser." -ForegroundColor Green
} else {
    Write-Host "Error: index.html not found at $filePath" -ForegroundColor Red
}

Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
