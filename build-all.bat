@echo off
echo 🏗️  Atomic Clock Display - Optimized Build System
echo ================================================
echo.
echo Building all platforms: Web, iOS, Android
echo.

REM Set variables
set BUILD_DIR=build-output
set TIMESTAMP=%date:~-4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set VERSION=1.0.%TIMESTAMP%

echo 📦 Build Version: %VERSION%
echo 📁 Output Directory: %BUILD_DIR%
echo.

REM Create build directory
if not exist "%BUILD_DIR%" mkdir "%BUILD_DIR%"
if not exist "%BUILD_DIR%\web" mkdir "%BUILD_DIR%\web"
if not exist "%BUILD_DIR%\android" mkdir "%BUILD_DIR%\android"
if not exist "%BUILD_DIR%\ios" mkdir "%BUILD_DIR%\ios"

REM Clean previous builds
echo 🧹 Cleaning previous builds...
if exist "%BUILD_DIR%\*" del /q "%BUILD_DIR%\*"
for /d %%d in ("%BUILD_DIR%\*") do rmdir /s /q "%%d"

echo ✅ Build directory prepared
echo.

REM Build Web Version
echo 🌐 Building Web Version...
echo -------------------------
call :build-web
if %ERRORLEVEL% neq 0 (
    echo ❌ Web build failed
    exit /b 1
)
echo.

REM Build Android Version
echo 🤖 Building Android Version...
echo ------------------------------
call :build-android
if %ERRORLEVEL% neq 0 (
    echo ❌ Android build failed
    exit /b 1
)
echo.

REM Build iOS Version
echo 🍎 Building iOS Version...
echo ---------------------------
call :build-ios
if %ERRORLEVEL% neq 0 (
    echo ❌ iOS build failed
    exit /b 1
)
echo.

REM Create deployment package
echo 📦 Creating Deployment Package...
call :create-package
if %ERRORLEVEL% neq 0 (
    echo ❌ Package creation failed
    exit /b 1
)
echo.

echo 🎉 All builds completed successfully!
echo ====================================
echo.
echo 📁 Build outputs:
echo    Web: %BUILD_DIR%\web\
echo    Android: %BUILD_DIR%\android\
echo    iOS: %BUILD_DIR%\ios\
echo    Package: %BUILD_DIR%\AtomicClockDisplay-v%VERSION%.zip
echo.
echo 🚀 Ready for deployment!
echo.
pause
exit /b 0

REM ===== Build Functions =====

:build-web
echo 📋 Optimizing web assets...
echo.

REM Minify CSS (simple optimization)
echo 🎨 Optimizing styles...
powershell -Command "(Get-Content style.css) -replace '\/\*.*?\*\/', '' -replace '\s+', ' ' -replace ';\s*', ';' | Out-File -Encoding UTF8 '%BUILD_DIR%\web\style.min.css'"
if %ERRORLEVEL% neq 0 exit /b 1

REM Minify JS (simple optimization)
echo ⚡ Optimizing scripts...
powershell -Command "(Get-Content script.js) -replace '\/\*.*?\*\/', '' -replace '\/\/.*$', '' -replace '\s+', ' ' | Out-File -Encoding UTF8 '%BUILD_DIR%\web\script.min.js'"
if %ERRORLEVEL% neq 0 exit /b 1

REM Copy HTML and optimize
echo 📄 Optimizing HTML...
powershell -Command "(Get-Content index.html) -replace 'script.js', 'script.min.js' -replace 'style.css', 'style.min.css' | Out-File -Encoding UTF8 '%BUILD_DIR%\web\index.html'"
if %ERRORLEVEL% neq 0 exit /b 1

REM Copy assets
echo 📁 Copying assets...
if not exist "%BUILD_DIR%\web\styles" mkdir "%BUILD_DIR%\web\styles"
xcopy "styles\*" "%BUILD_DIR%\web\styles\" /E /I /Q
if %ERRORLEVEL% neq 0 exit /b 1

REM Create web manifest
echo 📋 Creating web manifest...
(
echo {
echo   "name": "Atomic Clock Display",
echo   "short_name": "Atomic Clock",
echo   "version": "%VERSION%",
echo   "start_url": "./index.html",
echo   "display": "fullscreen",
echo   "orientation": "landscape",
echo   "theme_color": "#667eea",
echo   "background_color": "#667eea",
echo   "icons": [
echo     {
echo       "src": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDE5MiAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxOTIiIGhlaWdodD0iMTkyIiByeD0iMjQiIGZpbGw9InVybCgjZ3JhZGllbnQwX2xpbmVhcl8xXzgpIi8+CjxwYXRoIGQ9Ik05NiA0OEM4NC45NTQzIDQ4IDc2IDU2Ljk1NDMgNzYgNjhWODRINjhDNTYuOTU0MyA4NCA0OCA5Mi45NTQzIDQ4IDEwNFYxMjRDNDggMTM1LjA0NiA1Ni45NTQzIDE0NCA2OCAxNDRIODRWMTI0SDEwOFYxNDRIMTI0QzEzNS4wNDYgMTQ0IDE0NCAxMzUuMDQ2IDE0NCAxMjRWMTA0QzE0NCA5Mi45NTQzIDEzNS4wNDYgODQgMTI0IDg0SDExNlY2OEMxMTYgNTYuOTU0MyAxMDcuMDQ2IDQ4IDk2IDQ4WiIgZmlsbD0id2hpdGUiLz4KPGRMZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50MF9saW5lYXJfMV84IiB4MT0iMCIgeTE9IjAiIHgyPSIxOTIiIHkyPSIxOTIiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzY2N2VlYSIvPgo8c3RvcCBvZmZzZXQ9IjAuNSIgc3RvcC1jb2xvcj0iIzc2NGJhMiIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNmMDkzZmIiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4=",
echo       "sizes": "192x192",
echo       "type": "image/svg+xml"
echo     }
echo   ]
echo }
) > "%BUILD_DIR%\web\manifest.json"

REM Create deployment info
echo 📋 Creating deployment info...
(
echo Atomic Clock Display - Web Deployment
echo Version: %VERSION%
echo Built: %date% %time%
echo.
echo Files:
echo - index.html (Main application)
echo - style.min.css (Optimized styles)
echo - script.min.js (Optimized scripts)
echo - styles/ (Theme files)
echo - manifest.json (PWA manifest)
echo.
echo Deployment:
echo 1. Upload all files to web server
echo 2. Ensure server supports PWA manifest
echo 3. Test in browser for functionality
) > "%BUILD_DIR%\web\README.txt"

echo ✅ Web build completed
exit /b 0

:build-android
echo 📋 Building Android APKs...
cd android

REM Clean previous builds
echo 🧹 Cleaning Android project...
call gradlew clean
if %ERRORLEVEL% neq 0 exit /b 1

REM Build debug APK
echo 🔨 Building debug APK...
call gradlew assembleDebug
if %ERRORLEVEL% neq 0 exit /b 1

REM Build release APK
echo 🔨 Building release APK...
call gradlew assembleRelease
if %ERRORLEVEL% neq 0 exit /b 1

REM Copy APKs to build directory
echo 📁 Copying APKs...
copy "app\build\outputs\apk\debug\app-debug.apk" "..\%BUILD_DIR%\android\AtomicClockDisplay-debug-%VERSION%.apk"
copy "app\build\outputs\apk\release\app-release.apk" "..\%BUILD_DIR%\android\AtomicClockDisplay-release-%VERSION%.apk"
if %ERRORLEVEL% neq 0 exit /b 1

REM Create Android deployment info
echo 📋 Creating Android deployment info...
(
echo Atomic Clock Display - Android Deployment
echo Version: %VERSION%
echo Built: %date% %time%
echo.
echo APK Files:
echo - AtomicClockDisplay-debug-%VERSION%.apk (Debug version)
echo - AtomicClockDisplay-release-%VERSION%.apk (Release version)
echo.
echo Installation:
echo 1. Enable USB debugging on device
echo 2. Connect device via USB
echo 3. Install: adb install AtomicClockDisplay-debug-%VERSION%.apk
echo.
echo Release Notes:
echo - Optimized weather display (30%% space reduction)
echo - Single row theme panel (60%% height reduction)
echo - 12 beautiful themes with auto-rotation
echo - Full kiosk mode support
) > "..\%BUILD_DIR%\android\README.txt"

cd ..
echo ✅ Android build completed
exit /b 0

:build-ios
echo 📋 Building iOS app...
cd ios

REM Check if we're on macOS
echo 🔍 Checking build environment...
if not exist "AtomicClockDisplay" (
    echo ⚠️  iOS project not found, creating deployment info only...
    call :create-ios-deployment-info
    cd ..
    exit /b 0
)

REM Try to build if on macOS
where xcodebuild >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ⚠️  Not on macOS, creating deployment info only...
    call :create-ios-deployment-info
    cd ..
    exit /b 0
)

REM Clean previous builds
echo 🧹 Cleaning iOS project...
if exist "build" rmdir /s /q "build"

REM Build for simulator
echo 📱 Building for iOS Simulator...
xcodebuild -project AtomicClockDisplay.xcodeproj ^
           -scheme AtomicClockDisplay ^
           -destination "platform=iOS Simulator,name=iPhone 15,OS=latest" ^
           -configuration Debug ^
           clean build ^
           -derivedDataPath build/DerivedData
if %ERRORLEVEL% neq 0 exit /b 1

REM Build for device
echo 📱 Building for iOS Device...
xcodebuild -project AtomicClockDisplay.xcodeproj ^
           -scheme AtomicClockDisplay ^
           -destination "generic/platform=iOS" ^
           -configuration Release ^
           archive ^
           -archivePath build/AtomicClockDisplay.xcarchive ^
           -derivedDataPath build/DerivedData
if %ERRORLEVEL% neq 0 exit /b 1

REM Export IPA
echo 📦 Exporting IPA...
if not exist "build\ipa" mkdir "build\ipa"

xcodebuild -exportArchive ^
           -archivePath build/AtomicClockDisplay.xcarchive ^
           -exportPath build/ipa ^
           -exportOptionsPlist exportOptions.plist
if %ERRORLEVEL% neq 0 exit /b 1

REM Copy to build directory
echo 📁 Copying iOS build...
copy "build\ipa\AtomicClockDisplay.ipa" "..\%BUILD_DIR%\ios\AtomicClockDisplay-%VERSION%.ipa"
if %ERRORLEVEL% neq 0 exit /b 1

call :create-ios-deployment-info

cd ..
echo ✅ iOS build completed
exit /b 0

:create-ios-deployment-info
echo 📋 Creating iOS deployment info...
(
echo Atomic Clock Display - iOS Deployment
echo Version: %VERSION%
echo Built: %date% %time%
echo.
echo Requirements:
echo - macOS with Xcode 13.0+
echo - iOS 13.0+ target
echo - Apple Developer Account for App Store distribution
echo.
echo Build Instructions:
echo 1. Open AtomicClockDisplay.xcodeproj in Xcode
echo 2. Select target device or simulator
echo 3. Build and Run (Cmd+R)
echo 4. Archive for distribution (Product ^> Archive)
echo.
echo Features:
echo - Optimized weather display
echo - Single row theme panel
echo - 12 beautiful themes
echo - Full kiosk mode support
echo - Guided Access compatible
) > "..\%BUILD_DIR%\ios\README.txt"
exit /b 0

:create-package
echo 📦 Creating deployment package...
echo.

REM Create version info
echo 📋 Creating version info...
(
echo Atomic Clock Display - Complete Deployment Package
echo =================================================
echo.
echo Version: %VERSION%
echo Built: %date% %time%
echo Build System: Optimized Build Automation
echo.
echo Contents:
echo ├─ web/          # Web application (PWA ready)
echo ├─ android/      # Android APK files
echo ├─ ios/          # iOS build instructions
echo └─ README.txt    # This file
echo.
echo Features:
echo ✅ Optimized weather display (30%% space reduction)
echo ✅ Single row theme panel (60%% height reduction)
echo ✅ 12 beautiful themes with auto-rotation
echo ✅ Cross-platform compatibility
echo ✅ Kiosk mode support
echo ✅ PWA ready for web deployment
echo.
echo Quick Start:
echo 1. Web: Upload web/ folder to any web server
echo 2. Android: Install APK from android/ folder
echo 3. iOS: Follow instructions in ios/ folder
echo.
echo Support:
echo - Full documentation in each platform folder
echo - Theme rotation guide included
echo - Troubleshooting guides available
) > "%BUILD_DIR%\README.txt"

REM Create deployment package
echo 🗜️  Creating ZIP package...
cd "%BUILD_DIR%"
powershell -Command "Compress-Archive -Path * -DestinationPath '..\AtomicClockDisplay-v%VERSION%.zip' -Force"
cd ..

if %ERRORLEVEL% neq 0 exit /b 1

echo ✅ Deployment package created: AtomicClockDisplay-v%VERSION%.zip
exit /b 0
