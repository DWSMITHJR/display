@echo off
REM Atomic Clock Display - Windows Screen Saver Package Creator
REM Version: 2.0.0-ScreenSaver

echo ========================================
echo Atomic Clock Display Screen Saver
REM Package Creator
echo ========================================
echo.

REM Check for 7-Zip
where 7z >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] 7-Zip not found. Using built-in compression...
    set USE_7Z=0
) else (
    echo [✓] 7-Zip found
    set USE_7Z=1
)

REM Create package directory
set PACKAGE_DIR=AtomicClockScreenSaver
set VERSION=2.0.0
set PACKAGE_NAME=AtomicClockScreenSaver-v%VERSION%

echo [!] Creating package directory...
if exist "%PACKAGE_DIR%" rmdir /s /q "%PACKAGE_DIR%"
mkdir "%PACKAGE_DIR%"

REM Copy core files
echo [!] Copying core files...
copy "AtomicClock.scr" "%PACKAGE_DIR%\"
copy "install.bat" "%PACKAGE_DIR%\"
copy "uninstall.bat" "%PACKAGE_DIR%\"
copy "requirements.txt" "%PACKAGE_DIR%\"
copy "README.md" "%PACKAGE_DIR%\"
copy "config.html" "%PACKAGE_DIR%\"

REM Copy web files
echo [!] Copying web application files...
mkdir "%PACKAGE_DIR%\web"
xcopy "..\..\build-output-optimized\web\*" "%PACKAGE_DIR%\web\" /E /I /Y

REM Copy documentation
echo [!] Copying documentation...
mkdir "%PACKAGE_DIR%\docs"
copy "..\..\README.md" "%PACKAGE_DIR%\docs\"
copy "..\..\OPTIMIZATION_HARDENING_COMPLETE.md" "%PACKAGE_DIR%\docs\"

REM Create quick start guide
echo [!] Creating quick start guide...
echo # Atomic Clock Display - Quick Start Guide > "%PACKAGE_DIR%\QUICKSTART.txt"
echo. >> "%PACKAGE_DIR%\QUICKSTART.txt"
echo 1. Double-click install.bat >> "%PACKAGE_DIR%\QUICKSTART.txt"
echo 2. Follow the installation prompts >> "%PACKAGE_DIR%\QUICKSTART.txt"
echo 3. Open Windows Settings ^> Personalization ^> Lock screen >> "%PACKAGE_DIR%\QUICKSTART.txt"
echo 4. Click "Screen saver settings" >> "%PACKAGE_DIR%\QUICKSTART.txt"
echo 5. Select "Atomic Clock" from the dropdown >> "%PACKAGE_DIR%\QUICKSTART.txt"
echo 6. Set your preferred timeout and click "Apply" >> "%PACKAGE_DIR%\QUICKSTART.txt"
echo. >> "%PACKAGE_DIR%\QUICKSTART.txt"
echo Enjoy your new screen saver! >> "%PACKAGE_DIR%\QUICKSTART.txt"

REM Create version info
echo [!] Creating version info...
echo Atomic Clock Display Screen Saver > "%PACKAGE_DIR%\VERSION.txt"
echo Version: %VERSION% >> "%PACKAGE_DIR%\VERSION.txt"
echo Build Date: %date% %time% >> "%PACKAGE_DIR%\VERSION.txt"
echo Platform: Windows 10/11 >> "%PACKAGE_DIR%\VERSION.txt"
echo Python: 3.8+ Required >> "%PACKAGE_DIR%\VERSION.txt"

REM Create package
echo [!] Creating distribution package...
if "%USE_7Z%"=="1" (
    7z a -tzip "%PACKAGE_NAME%.zip" "%PACKAGE_DIR%\*" -mx9
    if %errorLevel%==0 (
        echo [✓] Package created: %PACKAGE_NAME%.zip
    ) else (
        echo [✗] Failed to create package with 7-Zip
    )
) else (
    powershell -command "Compress-Archive -Path '%PACKAGE_DIR%\*' -DestinationPath '%PACKAGE_NAME%.zip' -Force"
    if %errorLevel%==0 (
        echo [✓] Package created: %PACKAGE_NAME%.zip
    ) else (
        echo [✗] Failed to create package with PowerShell
    )
)

REM Calculate package size
if exist "%PACKAGE_NAME%.zip" (
    for %%I in ("%PACKAGE_NAME%.zip") do set SIZE=%%~zI
    set /a SIZE_MB=%SIZE%/1048576
    echo [✓] Package size: %SIZE_MB% MB
)

REM Clean up
echo [!] Cleaning up temporary files...
rmdir /s /q "%PACKAGE_DIR%"

echo.
echo ========================================
echo Package Creation Complete!
echo ========================================
echo.
if exist "%PACKAGE_NAME%.zip" (
    echo [✓] Package created successfully!
    echo [📦] File: %PACKAGE_NAME%.zip
    echo [📊] Size: %SIZE_MB% MB
    echo.
    echo Distribution ready!
    echo.
    echo To deploy:
    echo 1. Copy %PACKAGE_NAME%.zip to target computer
    echo 2. Extract the archive
    echo 3. Run install.bat as administrator
    echo.
) else (
    echo [✗] Package creation failed!
    echo Please check the error messages above.
    echo.
)

pause
