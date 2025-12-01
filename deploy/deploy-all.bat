@echo off
REM Atomic Clock Display - Complete Deployment Script
REM Version: 2.0.0-Final
REM Deploys all components: Web, Local, Screen Saver, and Documentation

echo ========================================
echo Atomic Clock Display - Complete Deployment
echo ========================================
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

REM Create deployment directory structure
echo [!] Creating deployment directory structure...
if exist "AtomicClockDisplay-Complete" rmdir /s /q "AtomicClockDisplay-Complete"
mkdir "AtomicClockDisplay-Complete"
mkdir "AtomicClockDisplay-Complete\web-application"
mkdir "AtomicClockDisplay-Complete\local-kiosk"
mkdir "AtomicClockDisplay-Complete\windows-screen-saver"
mkdir "AtomicClockDisplay-Complete\documentation"
mkdir "AtomicClockDisplay-Complete\server-files"

REM Copy web application files
echo [!] Deploying web application files...
xcopy "..\build-output-optimized\web\*" "AtomicClockDisplay-Complete\web-application\" /E /I /Y >nul
if %errorLevel% == 0 (
    echo [✓] Web application deployed successfully
) else (
    echo [✗] Failed to deploy web application
)

REM Copy local kiosk files
echo [!] Deploying local kiosk files...
xcopy "..\build-output-optimized\local-deploy\*" "AtomicClockDisplay-Complete\local-kiosk\" /E /I /Y >nul
if %errorLevel% == 0 (
    echo [✓] Local kiosk deployed successfully
) else (
    echo [✗] Failed to deploy local kiosk
)

REM Copy Windows screen saver files
echo [!] Deploying Windows screen saver...
xcopy "..\deploy\windows-screensaver\*" "AtomicClockDisplay-Complete\windows-screen-saver\" /E /I /Y >nul
if %errorLevel% == 0 (
    echo [✓] Windows screen saver deployed successfully
) else (
    echo [✗] Failed to deploy Windows screen saver
)

REM Copy documentation files
echo [!] Deploying documentation...
copy "..\README.md" "AtomicClockDisplay-Complete\documentation\" >nul
copy "..\OPTIMIZATION_HARDENING_COMPLETE.md" "AtomicClockDisplay-Complete\documentation\" >nul
copy "..\deploy\windows-screensaver\README.md" "AtomicClockDisplay-Complete\documentation\ScreenSaver-README.md" >nul
copy "..\deploy\windows-screensaver\DEPLOYMENT.md" "AtomicClockDisplay-Complete\documentation\ScreenSaver-DEPLOYMENT.md" >nul
copy "..\deploy\windows-screensaver\INSTALLATION_GUIDE.txt" "AtomicClockDisplay-Complete\documentation\" >nul

REM Copy server files
echo [!] Deploying server files...
copy "..\build-output-optimized\web\server.py" "AtomicClockDisplay-Complete\server-files\" >nul
copy "..\build-output-optimized\web\server.hardened.py" "AtomicClockDisplay-Complete\server-files\" >nul

REM Create deployment scripts
echo [!] Creating deployment scripts...

REM Web application launcher
echo @echo off > "AtomicClockDisplay-Complete\web-application\start-web.bat"
echo echo Starting Atomic Clock Display Web Application... >> "AtomicClockDisplay-Complete\web-application\start-web.bat"
echo cd /d "%%~dp0" >> "AtomicClockDisplay-Complete\web-application\start-web.bat"
echo python server.py >> "AtomicClockDisplay-Complete\web-application\start-web.bat"
echo pause >> "AtomicClockDisplay-Complete\web-application\start-web.bat"

REM Local kiosk launcher
echo @echo off > "AtomicClockDisplay-Complete\local-kiosk\start-kiosk.bat"
echo echo Starting Atomic Clock Display Kiosk Mode... >> "AtomicClockDisplay-Complete\local-kiosk\start-kiosk.bat"
echo cd /d "%%~dp0" >> "AtomicClockDisplay-Complete\local-kiosk\start-kiosk.bat"
echo start "" "http://localhost:8080" >> "AtomicClockDisplay-Complete\local-kiosk\start-kiosk.bat"
echo python ..\server-files\server.py >> "AtomicClockDisplay-Complete\local-kiosk\start-kiosk.bat"
echo pause >> "AtomicClockDisplay-Complete\local-kiosk\start-kiosk.bat"

REM Windows screen saver installer
echo @echo off > "AtomicClockDisplay-Complete\windows-screen-saver\install.bat"
echo echo Installing Atomic Clock Display Screen Saver... >> "AtomicClockDisplay-Complete\windows-screen-saver\install.bat"
echo cd /d "%%~dp0" >> "AtomicClockDisplay-Complete\windows-screen-saver\install.bat"
echo call install.bat >> "AtomicClockDisplay-Complete\windows-screen-saver\install.bat"

REM Create master launcher
echo @echo off > "AtomicClockDisplay-Complete\START.bat"
echo echo ======================================== >> "AtomicClockDisplay-Complete\START.bat"
echo echo Atomic Clock Display - Deployment Launcher >> "AtomicClockDisplay-Complete\START.bat"
echo echo ======================================== >> "AtomicClockDisplay-Complete\START.bat"
echo echo. >> "AtomicClockDisplay-Complete\START.bat"
echo echo Select deployment option: >> "AtomicClockDisplay-Complete\START.bat"
echo echo 1. Web Application (Browser-based) >> "AtomicClockDisplay-Complete\START.bat"
echo echo 2. Local Kiosk (Standalone) >> "AtomicClockDisplay-Complete\START.bat"
echo echo 3. Windows Screen Saver >> "AtomicClockDisplay-Complete\START.bat"
echo echo 4. Open Documentation >> "AtomicClockDisplay-Complete\START.bat"
echo echo 5. Exit >> "AtomicClockDisplay-Complete\START.bat"
echo echo. >> "AtomicClockDisplay-Complete\START.bat"
echo set /p choice="Enter your choice (1-5): " >> "AtomicClockDisplay-Complete\START.bat"
echo if "%%choice%%"=="1" call web-application\start-web.bat >> "AtomicClockDisplay-Complete\START.bat"
echo if "%%choice%%"=="2" call local-kiosk\start-kiosk.bat >> "AtomicClockDisplay-Complete\START.bat"
echo if "%%choice%%"=="3" call windows-screen-saver\install.bat >> "AtomicClockDisplay-Complete\START.bat"
echo if "%%choice%%"=="4" start documentation\README.md >> "AtomicClockDisplay-Complete\START.bat"
echo if "%%choice%%"=="5" exit >> "AtomicClockDisplay-Complete\START.bat"

REM Create version info
echo Atomic Clock Display - Complete Deployment Package > "AtomicClockDisplay-Complete\VERSION.txt"
echo Version: 2.0.0-Final >> "AtomicClockDisplay-Complete\VERSION.txt"
echo Build Date: %date% %time% >> "AtomicClockDisplay-Complete\VERSION.txt"
echo Deployment Date: %date% %time% >> "AtomicClockDisplay-Complete\VERSION.txt"
echo Platform: Windows 10/11, macOS, Linux >> "AtomicClockDisplay-Complete\VERSION.txt"
echo Python: 3.8+ Required >> "AtomicClockDisplay-Complete\VERSION.txt"

REM Create deployment summary
echo. > "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo ======================================== >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo ATOMIC CLOCK DISPLAY - DEPLOYMENT SUMMARY >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo ======================================== >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo. >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo COMPONENTS DEPLOYED: >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo. >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo 1. Web Application (web-application/) >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo    - Browser-based deployment >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo    - All 12 themes included >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo    - Performance optimized >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo    - Security hardened >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo. >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo 2. Local Kiosk (local-kiosk/) >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo    - Standalone deployment >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo    - Fullscreen mode support >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo    - Touch screen optimized >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo    - Kiosk-specific features >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo. >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo 3. Windows Screen Saver (windows-screen-saver/) >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo    - Native Windows integration >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo    - Automatic installer >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo    - Configuration interface >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo    - Enterprise deployment ready >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo. >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo 4. Documentation (documentation/) >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo    - Complete user guides >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo    - Installation instructions >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo    - Troubleshooting guides >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo    - Technical documentation >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo. >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo 5. Server Files (server-files/) >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo    - Local server implementations >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo    - Hardened security versions >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo    - Production ready configurations >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo. >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo QUICK START: >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo 1. Run START.bat to launch deployment menu >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo 2. Select your desired deployment option >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo 3. Follow the on-screen instructions >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo. >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"
echo For detailed instructions, see documentation\README.md >> "AtomicClockDisplay-Complete\DEPLOYMENT_SUMMARY.txt"

REM Create final package
echo [!] Creating final deployment package...
if exist "AtomicClockDisplay-Complete.zip" del "AtomicClockDisplay-Complete.zip"

REM Try 7-Zip first, then PowerShell
where 7z >nul 2>&1
if %errorLevel% == 0 (
    7z a -tzip "AtomicClockDisplay-Complete.zip" "AtomicClockDisplay-Complete\*" -mx9 >nul
    set ZIP_SUCCESS=1
) else (
    powershell -command "Compress-Archive -Path 'AtomicClockDisplay-Complete\*' -DestinationPath 'AtomicClockDisplay-Complete.zip' -Force" >nul
    if %errorLevel% == 0 set ZIP_SUCCESS=1
)

if defined ZIP_SUCCESS (
    echo [✓] Deployment package created successfully
    for %%I in ("AtomicClockDisplay-Complete.zip") do set SIZE_MB=%%~zI
    set /a SIZE_MB=%SIZE_MB%/1048576
    echo [📦] Package size: %SIZE_MB% MB
) else (
    echo [✗] Failed to create deployment package
)

REM Verify deployment
echo [!] Verifying deployment...
if exist "AtomicClockDisplay-Complete\web-application\index.html" (
    echo [✓] Web application files verified
) else (
    echo [✗] Web application files missing
)

if exist "AtomicClockDisplay-Complete\local-kiosk\index.html" (
    echo [✓] Local kiosk files verified
) else (
    echo [✗] Local kiosk files missing
)

if exist "AtomicClockDisplay-Complete\windows-screen-saver\AtomicClock.scr" (
    echo [✓] Windows screen saver files verified
) else (
    echo [✗] Windows screen saver files missing
)

if exist "AtomicClockDisplay-Complete\documentation\README.md" (
    echo [✓] Documentation files verified
) else (
    echo [✗] Documentation files missing
)

echo.
echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo.

if exist "AtomicClockDisplay-Complete.zip" (
    echo [✓] Complete deployment package created!
    echo [📦] File: AtomicClockDisplay-Complete.zip
    echo [📊] Size: %SIZE_MB% MB
    echo.
    echo Deployment includes:
    echo • Web Application (Browser-based)
    echo • Local Kiosk (Standalone)
    echo • Windows Screen Saver
    echo • Complete Documentation
    echo • Server Files
    echo.
    echo To deploy:
    echo 1. Extract AtomicClockDisplay-Complete.zip
    echo 2. Run START.bat for interactive deployment
    echo 3. Select your desired deployment option
    echo.
) else (
    echo [✗] Deployment package creation failed
    echo Please check the error messages above.
    echo.
)

echo Press any key to exit...
pause >nul
