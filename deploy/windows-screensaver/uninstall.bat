@echo off
REM Atomic Clock Display - Windows Screen Saver Uninstaller
REM Version: 2.0.0-ScreenSaver

echo ========================================
echo Atomic Clock Display Screen Saver
echo ========================================
echo.
echo This will uninstall the Atomic Clock Display screen saver.
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

REM Confirm uninstallation
set /p confirm="Are you sure you want to uninstall? (y/N): "
if /i not "%confirm%"=="y" (
    echo Uninstallation cancelled.
    pause
    exit /b 0
)

REM Uninstall the screen saver
echo [!] Uninstalling screen saver...
python AtomicClock.scr /uninstall

if %errorLevel% == 0 (
    echo.
    echo [✓] Uninstallation successful!
    echo.
    echo The Atomic Clock Display screen saver has been removed from your system.
    echo.
) else (
    echo [✗] Uninstallation failed
    pause
    exit /b 1
)

echo Press any key to exit...
pause >nul
