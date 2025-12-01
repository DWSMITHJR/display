@echo off
REM iOS Build Script for Atomic Clock Display (Windows)
REM This script builds the iOS app and generates an IPA file using Xcode on macOS

echo 🏗️  Building Atomic Clock Display for iOS...
echo ==========================================

REM Check if we're in the right directory
if not exist "AtomicClockDisplay" (
    echo ❌ ERROR: AtomicClockDisplay project not found
    echo Please run this script from the ios/ directory
    pause
    exit /b 1
)

REM Check for Xcode (this will only work on macOS)
echo 🔍 Checking for Xcode...
where xcodebuild >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ ERROR: Xcode is not available
    echo This build script requires macOS with Xcode installed
    echo Please transfer the project to a Mac and run build-ipa.sh
    pause
    exit /b 1
)

REM Set project variables
set PROJECT_NAME=AtomicClockDisplay
set SCHEME_NAME=AtomicClockDisplay
set WORKSPACE_NAME=AtomicClockDisplay.xcodeproj
set BUILD_DIR=build
set ARCHIVE_PATH=%BUILD_DIR%\AtomicClockDisplay.xcarchive
set IPA_DIR=%BUILD_DIR%\ipa

echo 📋 Project Configuration:
echo    Project: %PROJECT_NAME%
echo    Scheme: %SCHEME_NAME%
echo    Target: iOS 13.0+
echo.

REM Clean previous builds
echo 🧹 Cleaning previous builds...
if exist "%BUILD_DIR%" rmdir /s /q "%BUILD_DIR%"
if %ERRORLEVEL% neq 0 (
    echo ❌ ERROR: Failed to clean previous builds
    pause
    exit /b 1
)

REM Build for iOS Simulator (Debug)
echo 📱 Building for iOS Simulator (Debug)...
xcodebuild -project "%WORKSPACE_NAME%" ^
           -scheme "%SCHEME_NAME%" ^
           -destination "platform=iOS Simulator,name=iPhone 15,OS=latest" ^
           -configuration Debug ^
           clean build ^
           -derivedDataPath "%BUILD_DIR%\DerivedData"

if %ERRORLEVEL% neq 0 (
    echo ❌ ERROR: Debug build failed
    pause
    exit /b 1
)

echo ✅ Debug build completed successfully

REM Build for iOS Device (Release)
echo 📱 Building for iOS Device (Release)...
xcodebuild -project "%WORKSPACE_NAME%" ^
           -scheme "%SCHEME_NAME%" ^
           -destination "generic/platform=iOS" ^
           -configuration Release ^
           archive ^
           -archivePath "%ARCHIVE_PATH%" ^
           -derivedDataPath "%BUILD_DIR%\DerivedData"

if %ERRORLEVEL% neq 0 (
    echo ❌ ERROR: Release build failed
    pause
    exit /b 1
)

echo ✅ Release build completed successfully

REM Export IPA
echo 📦 Exporting IPA...
if not exist "%IPA_DIR%" mkdir "%IPA_DIR%"

xcodebuild -exportArchive ^
           -archivePath "%ARCHIVE_PATH%" ^
           -exportPath "%IPA_DIR%" ^
           -exportOptionsPlist exportOptions.plist

if %ERRORLEVEL% neq 0 (
    echo ❌ ERROR: IPA export failed
    pause
    exit /b 1
)

echo ✅ IPA exported successfully

REM Create export options if it doesn't exist
if not exist "exportOptions.plist" (
    echo 📄 Creating export options plist...
    (
        echo ^<?xml version="1.0" encoding="UTF-8"?^>
        echo ^<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd"^>
        echo ^<plist version="1.0"^>
        echo ^<dict^>
        echo     ^<key^>method^</key^>
        echo     ^<string^>development^</string^>
        echo     ^<key^>teamID^</key^>
        echo     ^<string^>YOUR_TEAM_ID^</string^>
        echo     ^<key^>uploadBitcode^</key^>
        echo     ^<false/^>
        echo     ^<key^>uploadSymbols^</key^>
        echo     ^<true/^>
        echo     ^<key^>compileBitcode^</key^>
        echo     ^<false/^>
        echo     ^<key^>signingStyle^</key^>
        echo     ^<string^>automatic^</string^>
        echo     ^<key^>destination^</key^>
        echo     ^<string^>export^</string^>
        echo ^</dict^>
        echo ^</plist^>
    ) > exportOptions.plist
    echo ⚠️  Please update exportOptions.plist with your Team ID and provisioning profile
)

REM Display build results
echo.
echo 🎉 Build completed successfully!
echo ===============================
echo 📱 Simulator App: %BUILD_DIR%\DerivedData\Build\Products\Debug-iphonesimulator\%PROJECT_NAME%.app
echo 📦 Device IPA: %IPA_DIR%\%PROJECT_NAME%.ipa
echo 📋 Archive: %ARCHIVE_PATH%
echo.

REM Installation instructions
echo 📋 Installation Instructions:
echo ==============================
echo 1. For Simulator:
echo    - Open %BUILD_DIR%\DerivedData\Build\Products\Debug-iphonesimulator\%PROJECT_NAME%.app
echo    - Or use: xcrun simctl install booted "%BUILD_DIR%\DerivedData\Build\Products\Debug-iphonesimulator\%PROJECT_NAME%.app"
echo.
echo 2. For Device:
echo    - Connect your iOS device
echo    - Install IPA: xcrun devicectl install device "%IPA_DIR%\%PROJECT_NAME%.ipa"
echo    - Or use Xcode: Window ^> Devices and Simulators ^> Install App
echo.
echo 3. For App Store:
echo    - Update exportOptions.plist with distribution settings
echo    - Re-run export with App Store method
echo.

echo ✅ iOS build process completed!
pause
