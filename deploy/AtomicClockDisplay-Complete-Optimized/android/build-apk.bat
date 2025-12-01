@echo off
echo Building Atomic Clock Display APK...
echo.

REM Check if Android SDK is available
if not defined ANDROID_HOME (
    echo ERROR: ANDROID_HOME environment variable is not set.
    echo Please set ANDROID_HOME to your Android SDK path.
    echo Example: set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
    pause
    exit /b 1
)

echo Android SDK found at: %ANDROID_HOME%

REM Clean previous builds
echo Cleaning previous builds...
call gradlew clean
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to clean project.
    pause
    exit /b 1
)

REM Build debug APK
echo Building debug APK...
call gradlew assembleDebug
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to build debug APK.
    pause
    exit /b 1
)

REM Build release APK
echo Building release APK...
call gradlew assembleRelease
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to build release APK.
    pause
    exit /b 1
)

echo.
echo Build completed successfully!
echo.
echo APK locations:
echo Debug APK: app\build\outputs\apk\debug\app-debug.apk
echo Release APK: app\build\outputs\apk\release\app-release.apk
echo.
echo To install on device:
echo 1. Enable USB debugging in Developer Options
echo 2. Connect device via USB
echo 3. Run: adb install app\build\outputs\apk\debug\app-debug.apk
echo.
pause
