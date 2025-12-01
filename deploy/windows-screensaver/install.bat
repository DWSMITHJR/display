@echo off
REM Atomic Clock Display - Windows Screen Saver Installer
REM Version: 2.0.0-ScreenSaver

echo ========================================
echo Atomic Clock Display Screen Saver
echo ========================================
echo.
echo This will install the Atomic Clock Display as a Windows screen saver.
echo.

REM Check for administrator privileges
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [✓] Running with administrator privileges
) else (
    echo [!] Warning: Not running as administrator
    echo [!] Some features may not work correctly
    echo.
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorLevel% neq 0 (
    echo [✗] Python is not installed or not in PATH
    echo [!] Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

echo [✓] Python found

REM Check if webview is installed
python -c "import webview" >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] Installing pywebview dependency...
    pip install pywebview
    if %errorLevel% neq 0 (
        echo [✗] Failed to install pywebview
        pause
        exit /b 1
    )
)

echo [✓] Dependencies installed

REM Check if server is running
curl -s http://localhost:8080 >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] Starting local server...
    start /B python ..\..\build-output-optimized\web\server.py
    timeout /t 3 /nobreak >nul
)

echo [✓] Server is running

REM Install the screen saver
echo [!] Installing screen saver...
python AtomicClock.scr /install

if %errorLevel% == 0 (
    echo.
    echo [✓] Installation successful!
    echo.
    echo To configure the screen saver:
    echo 1. Right-click on desktop and select "Personalize"
    echo 2. Click on "Lock screen" then "Screen saver settings"
    echo 3. Select "Atomic Clock" from the dropdown
    echo 4. Configure settings and click "Apply"
    echo.
) else (
    echo [✗] Installation failed
    pause
    exit /b 1
)

echo Press any key to open Screen Saver Settings...
pause >nul

REM Open screen saver settings
rundll32.exe desk.cpl,InstallScreenSaver AtomicClock.scr

echo Installation complete!
