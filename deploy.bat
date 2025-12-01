@echo off
title Atomic Clock Display - Deployment Launcher
color 0A
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║           🚀 Atomic Clock Display - Deployment 🚀           ║
echo ║              Optimized Build & Deploy System                ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

:menu
echo Please select deployment option:
echo.
echo 1. 🌐 Build Web Deployment (PWA Ready)
echo 2. 📱 Build Mobile Deployment (Android + iOS)
echo 3. 🏭 Build All Platforms (Complete Package)
echo 4. ⚡ Quick Web Deploy (Minified + PWA)
echo 5. 🤖 Quick Android Build (APKs Only)
echo 6. 🍎 Quick iOS Prep (Assets Only)
echo 7. 📋 View Build Status
echo 8. 🧹 Clean All Builds
echo 9. 📖 Deployment Documentation
echo 0. Exit
echo.
set /p choice="Enter your choice (0-9): "

if "%choice%"=="1" goto web-deploy
if "%choice%"=="2" goto mobile-deploy
if "%choice%"=="3" goto all-deploy
if "%choice%"=="4" goto quick-web
if "%choice%"=="5" goto quick-android
if "%choice%"=="6" goto quick-ios
if "%choice%"=="7" goto status
if "%choice%"=="8" goto clean
if "%choice%"=="9" goto docs
if "%choice%"=="0" goto exit
echo Invalid choice. Please try again.
goto menu

:web-deploy
echo.
echo 🌐 Starting Web Deployment...
echo ============================
call deploy-web.bat
echo.
pause
goto menu

:mobile-deploy
echo.
echo 📱 Starting Mobile Deployment...
echo ===============================
call deploy-mobile.bat
echo.
pause
goto menu

:all-deploy
echo.
echo 🏭 Starting Complete Build...
echo ===========================
call build-all.bat
echo.
pause
goto menu

:quick-web
echo.
echo ⚡ Quick Web Deploy...
echo ====================
echo Optimizing assets for web deployment...

REM Quick web optimization
if not exist "quick-web" mkdir "quick-web"
powershell -Command "(Get-Content 'style.css') -replace '/\*.*?\*/', '' -replace '\s+', ' ' | Out-File -Encoding UTF8 'quick-web\style.min.css'"
powershell -Command "(Get-Content 'script.js') -replace '/\*.*?\*/', '' -replace '\/\/.*$', '' -replace '\s+', ' ' | Out-File -Encoding UTF8 'quick-web\script.min.js'"
powershell -Command "(Get-Content 'index.html') -replace 'style.css', 'style.min.css' -replace 'script.js', 'script.min.js' | Out-File -Encoding UTF8 'quick-web\index.html'"

if not exist "quick-web\styles" mkdir "quick-web\styles"
xcopy "styles\*" "quick-web\styles\" /E /I /Q

echo ✅ Quick web deployment ready in quick-web/
echo 📁 Upload quick-web/ folder to your web server
echo.
pause
goto menu

:quick-android
echo.
echo 🤖 Quick Android Build...
echo =========================
cd android
echo 🧹 Cleaning...
call gradlew clean
echo 🔨 Building debug APK...
call gradlew assembleDebug
echo 🔨 Building release APK...
call gradlew assembleRelease
echo 📁 Copying APKs...
if not exist "..\quick-android" mkdir "..\quick-android"
copy "app\build\outputs\apk\debug\app-debug.apk" "..\quick-android\AtomicClockDisplay-debug.apk"
copy "app\build\outputs\apk\release\app-release.apk" "..\quick-android\AtomicClockDisplay-release.apk"
cd ..
echo ✅ Android APKs ready in quick-android/
echo.
pause
goto menu

:quick-ios
echo.
echo 🍎 Quick iOS Preparation...
echo ===========================
if not exist "quick-ios" mkdir "quick-ios"
if not exist "quick-ios\display" mkdir "quick-ios\display"
echo 📁 Copying assets...
copy "index.html" "quick-ios\display\"
copy "style.css" "quick-ios\display\"
copy "script.js" "quick-ios\display\"
if not exist "quick-ios\display\styles" mkdir "quick-ios\display\styles"
xcopy "styles\*" "quick-ios\display\styles\" /E /I /Q
echo ✅ iOS assets ready in quick-ios/display/
echo 📋 Open AtomicClockDisplay.xcodeproj in Xcode to build
echo.
pause
goto menu

:status
echo.
echo 📊 Build Status Report
echo ======================
echo.

REM Check build directories
if exist "web-deploy" (
    echo ✅ Web deployment: Ready
    dir "web-deploy" | find "File(s)"
) else (
    echo ❌ Web deployment: Not built
)

echo.
if exist "mobile-deploy" (
    echo ✅ Mobile deployment: Ready
    dir "mobile-deploy" | find "File(s)"
) else (
    echo ❌ Mobile deployment: Not built
)

echo.
if exist "build-output" (
    echo ✅ Complete build: Ready
    dir "build-output" | find "File(s)"
) else (
    echo ❌ Complete build: Not built
)

echo.
if exist "quick-web" (
    echo ✅ Quick web: Ready
) else (
    echo ❌ Quick web: Not built
)

if exist "quick-android" (
    echo ✅ Quick Android: Ready
) else (
    echo ❌ Quick Android: Not built
)

if exist "quick-ios" (
    echo ✅ Quick iOS: Ready
) else (
    echo ❌ Quick iOS: Not built
)

echo.
pause
goto menu

:clean
echo.
echo 🧹 Cleaning All Builds...
echo ========================
echo.

if exist "web-deploy" (
    echo 🗑️  Removing web-deploy...
    rmdir /s /q "web-deploy"
)

if exist "mobile-deploy" (
    echo 🗑️  Removing mobile-deploy...
    rmdir /s /q "mobile-deploy"
)

if exist "build-output" (
    echo 🗑️  Removing build-output...
    rmdir /s /q "build-output"
)

if exist "quick-web" (
    echo 🗑️  Removing quick-web...
    rmdir /s /q "quick-web"
)

if exist "quick-android" (
    echo 🗑️  Removing quick-android...
    rmdir /s /q "quick-android"
)

if exist "quick-ios" (
    echo 🗑️  Removing quick-ios...
    rmdir /s /q "quick-ios"
)

REM Clean Android build files
if exist "android\app\build" (
    echo 🗑️  Cleaning Android build files...
    rmdir /s /q "android\app\build"
)

REM Clean iOS build files
if exist "ios\build" (
    echo 🗑️  Cleaning iOS build files...
    rmdir /s /q "ios\build"
)

echo ✅ All builds cleaned successfully!
echo.
pause
goto menu

:docs
echo.
echo 📖 Deployment Documentation
echo ============================
echo.

echo 📋 Available Documentation:
echo.
echo 1. DEPLOYMENT_OPTIMIZATION_COMPLETE.md - Complete optimization guide
echo 2. THEME_PANEL_OPTIMIZATION_COMPLETE.md - Theme panel optimization
echo 3. WEATHER_OPTIMIZATION_COMPLETE.md - Weather display optimization
echo 4. README.md - Main project documentation
echo 5. android/README.md - Android deployment guide
echo 6. ios/README.md - iOS deployment guide
echo.

echo 🚀 Quick Start Guides:
echo.
echo Web Deployment:
echo   - Run deploy-web.bat for full PWA deployment
echo   - Run option 4 for quick web deploy
echo   - Upload web-deploy/ or quick-web/ to server
echo.
echo Android Deployment:
echo   - Run deploy-mobile.bat for full mobile deployment
echo   - Run option 5 for quick Android build
echo   - Install APKs from mobile-deploy/android/ or quick-android/
echo.
echo iOS Deployment:
echo   - Run deploy-mobile.bat for full mobile deployment
echo   - Run option 6 for quick iOS preparation
echo   - Open Xcode project and build for device/App Store
echo.
echo Complete Package:
echo   - Run build-all.bat for all platforms
echo   - Find complete package in build-output/
echo.
pause
goto menu

:exit
echo.
echo 🎉 Thank you for using Atomic Clock Display Deployment System!
echo 🚀 Your optimized builds are ready for production deployment!
echo.
timeout /t 3 >nul
exit
