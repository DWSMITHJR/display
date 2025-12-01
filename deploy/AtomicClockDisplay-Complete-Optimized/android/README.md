# Atomic Clock Display - Android App

A native Android application wrapper for the Atomic Clock & Weather Display, optimized for kiosk and dashboard deployments.

## Features

### 🎯 Core Functionality
- **WebView Integration**: Native Android app wrapping the web display
- **Offline Support**: Works without internet connection
- **Auto-Start**: Launches on device boot
- **Kiosk Mode**: Locks device to display only
- **Network Monitoring**: Automatic refresh on connectivity changes

### 🔧 Android-Specific Features
- **Fullscreen Mode**: Immersive display experience
- **Landscape Lock**: Fixed orientation for displays
- **Keep Screen On**: Prevents screen timeout
- **Hardware Acceleration**: Smooth graphics performance
- **Touch Optimization**: Enhanced touch interactions

### 🏢 Kiosk Features
- **Device Admin**: Prevents exiting the app
- **Home Screen Launcher**: Can replace default launcher
- **Auto-Restart**: Automatically restarts if closed
- **System UI Hidden**: Complete immersive experience

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
- **Network**: WiFi or mobile data for weather updates

## Installation

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

### Network Configuration

- **WiFi**: Configure WiFi settings for weather updates
- **Offline Mode**: App works offline with cached data
- **Auto-Refresh**: Updates every 20 hours automatically

## Features Overview

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

## Development

### Project Structure
```
android/
├── app/
│   ├── src/main/
│   │   ├── java/com/display/atomicclock/
│   │   │   ├── MainActivity.kt          # Main activity
│   │   │   ├── KioskModeReceiver.kt     # Device admin
│   │   │   ├── BootReceiver.kt          # Boot receiver
│   │   │   └── NetworkChangeReceiver.kt # Network monitoring
│   │   ├── res/
│   │   │   ├── layout/                  # UI layouts
│   │   │   ├── values/                  # Resources
│   │   │   └── xml/                     # XML configs
│   │   └── assets/
│   │       └── display/                 # Web content
│   ├── build.gradle                    # App build config
│   └── proguard-rules.pro              # Code obfuscation
├── build.gradle                        # Project build config
├── gradle.properties                   # Gradle settings
├── settings.gradle                     # Project settings
└── build-apk.bat                       # Build script
```

### Building

1. **Debug Build**:
   ```bash
   ./gradlew assembleDebug
   ```

2. **Release Build**:
   ```bash
   ./gradlew assembleRelease
   ```

3. **Signed APK**:
   ```bash
   ./gradlew assembleRelease
   # Sign with your keystore
   ```

### Customization

#### App Configuration
Edit `app/build.gradle`:
```gradle
defaultConfig {
    applicationId "com.display.atomicclock"
    versionCode 1
    versionName "1.0"
    minSdk 24
    targetSdk 34
}
```

#### WebView Settings
Edit `MainActivity.kt`:
```kotlin
webView.settings.apply {
    javaScriptEnabled = true
    domStorageEnabled = true
    // Add custom settings
}
```

#### Kiosk Mode
Edit `AndroidManifest.xml`:
```xml
<activity
    android:name=".MainActivity"
    android:screenOrientation="landscape"
    android:launchMode="singleTask">
```

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

### Performance Optimization

- Use release build for production
- Enable hardware acceleration
- Clear cache regularly
- Monitor memory usage

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

### Contributing
- Fork the repository
- Create feature branch
- Submit pull request
- Follow coding standards

## License

This Android wrapper is licensed under the same terms as the main Atomic Clock Display project.

---

**Note**: This Android app is a wrapper around the web-based Atomic Clock Display. All core functionality is implemented in the web application, while this native app provides Android-specific features and kiosk mode capabilities.
