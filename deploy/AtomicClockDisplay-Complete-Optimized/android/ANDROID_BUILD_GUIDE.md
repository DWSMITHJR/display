# Android Build Guide - Atomic Clock Display

## Overview

Complete guide for building the Android application wrapper for the Atomic Clock & Weather Display.

## Requirements

### Development Environment

- **Android Studio**: Latest version recommended
- **Android SDK**: API level 24 (Android 7.0) minimum
- **Java JDK**: Version 8 or higher
- **Gradle**: 8.2.0 or higher

### Device Requirements

- **Android Version**: 7.0 (API 24) or higher
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 100MB available space
- **Display**: 720p minimum, 1080p recommended

## Installation Steps

### Option 1: Build from Source

1. **Clone Repository**

   ```bash
   git clone <repository-url>
   cd display/android
   ```

2. **Install Dependencies**

   - Install Android Studio
   - Set up Android SDK
   - Configure JAVA_HOME

3. **Build APK**

   ```bash
   # Windows
   build-apk.bat
   
   # Or manually:
   ./gradlew assembleDebug
   ./gradlew assembleRelease
   ```

4. **Install on Device**

   ```bash
   # Enable USB debugging first
   adb install app/build/outputs/apk/debug/app-debug.apk
   ```

### Option 2: Install Pre-built APK

1. Download the latest APK from releases
2. Enable "Install from unknown sources" in device settings
3. Install the APK file

## Configuration

### Basic Setup

1. **Launch App**: Open Atomic Clock Display
2. **Grant Permissions**: Allow location and network access
3. **Configure Theme**: Select preferred display theme
4. **Set Location**: Enable location for weather updates

### Kiosk Mode Setup

1. **Enable Device Admin**:

   - Go to Settings → Security → Device admin apps
   - Enable "Atomic Clock Display"

2. **Set as Home App**:

   - Go to Settings → Apps → Default apps
   - Set "Atomic Clock Display" as home launcher

3. **Enable Kiosk Mode**:

   - Long press on the app icon
   - Select "Enable Kiosk Mode"

## Features

### Display Features

- **12 Themes**: Original, Dark, Ocean, Sunset, Forest, Cyberpunk, Galaxy, Aurora, Vintage, Minimal, Neon, Candy
- **Atomic Clock**: Precise time with seconds display
- **Weather Data**: Current conditions and forecast
- **Location Detection**: Automatic timezone and location
- **Responsive Design**: Adapts to screen size

### Android Integration

- **WebView**: Native wrapper for web content
- **JavaScript Bridge**: Android-specific features
- **File Access**: Local asset loading
- **Network API**: Connectivity monitoring
- **Storage**: Theme preferences persistence

### Kiosk Mode

- **Lock Task**: Prevents app switching
- **System UI Hidden**: No navigation bars
- **Auto-Start**: Launches on boot
- **Crash Recovery**: Automatic restart

## Troubleshooting

### Common Issues

1. **App Won't Install**

   - Check Android version (minimum 7.0)
   - Enable "Install from unknown sources"
   - Clear storage and retry

2. **No Internet Connection**

   - Check WiFi/mobile data
   - Verify network permissions
   - Try offline mode

3. **Kiosk Mode Not Working**

   - Enable device admin permissions
   - Set as home launcher
   - Check Android version compatibility

4. **Display Issues**

   - Check screen resolution
   - Verify hardware acceleration
   - Restart the app

### Debug Mode

Enable debug logging:

```bash
adb logcat -s AtomicClockDisplay
```

## Security

### Permissions Required

- `INTERNET`: Weather data and time sync
- `ACCESS_NETWORK_STATE`: Network monitoring
- `ACCESS_FINE_LOCATION`: Location for weather
- `SYSTEM_ALERT_WINDOW`: Kiosk mode
- `DEVICE_ADMIN`: Kiosk lock

### Data Privacy

- No personal data collected
- Location used only for weather
- Local storage only
- No analytics or tracking

## Support

### Documentation

- [Main Display Documentation](../README.md)
- [Theme Configuration](../styles/)
- [API Integration](../script.js)

### Issues

- Report bugs via GitHub Issues
- Include device model and Android version
- Provide error logs if available

---

**Note**: This Android app is a wrapper around the web-based Atomic Clock Display. All core functionality is implemented in the web application, while this native app provides Android-specific features and kiosk mode capabilities.
