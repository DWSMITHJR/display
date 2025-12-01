# Atomic Clock Display - iOS App

A native iOS application wrapper for the Atomic Clock & Weather Display, optimized for kiosk and dashboard deployments with Guided Access support.

## Features

### 🎯 Core Functionality

- **WebView Integration**: Native iOS app wrapping the web display
- **Offline Support**: Works without internet connection
- **Guided Access Mode**: iOS kiosk mode functionality
- **Auto-Start**: Launches on device boot (requires configuration)
- **Network Monitoring**: Automatic refresh on connectivity changes

### 🔧 iOS-Specific Features

- **Guided Access Support**: Full iOS kiosk mode integration
- **Landscape Lock**: Fixed orientation for professional displays
- **Keep Screen On**: Prevents screen timeout
- **Hardware Acceleration**: Smooth graphics performance
- **Touch Optimization**: Enhanced touch interactions
- **Battery Monitoring**: iOS battery status integration

### 🏢 Kiosk Features

- **Guided Access**: iOS native kiosk mode
- **Single App Mode**: MDM-based single app deployment
- **System UI Hidden**: Complete immersive experience
- **Auto-Restart**: Automatic restart if closed
- **Volume Control**: Hardware volume button integration

## Requirements

### Development Environment

- **Xcode**: Version 15.0 or higher
- **iOS SDK**: iOS 13.0 minimum
- **Swift**: Version 5.0 or higher
- **macOS**: Latest version recommended

### Device Requirements

- **iOS Version**: 13.0 or higher
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 100MB available space
- **Display**: Any iPhone or iPad screen size
- **Network**: WiFi or cellular data for weather updates

## Installation

### Option 1: Build from Source

1. **Clone Repository**

   ```bash
   git clone <repository-url>
   cd display/ios
   ```

2. **Open in Xcode**

   ```bash
   open AtomicClockDisplay.xcodeproj
   ```

3. **Configure Signing**

   - Select your development team
   - Configure bundle identifier
   - Set provisioning profile

4. **Build App**

   ```bash
   # Using Xcode
   Product → Build
   
   # Or using command line
   ./build-ipa.sh
   ```

5. **Install on Device**

   ```bash
   # Connect device and run
   xcodebuild -scheme AtomicClockDisplay -destination 'platform=iOS,name=Your Device' install
   ```

### Option 2: Install Pre-built IPA

1. Download the latest IPA from releases
2. Trust the developer certificate in Settings
3. Install the IPA file using Xcode or iOS App Signer

## Configuration

### Basic Setup

1. **Launch App**: Open Atomic Clock Display
2. **Grant Permissions**: Allow location and network access
3. **Configure Theme**: Select preferred display theme
4. **Set Location**: Enable location for weather updates

### Guided Access Setup

1. **Enable Guided Access**:

   - Go to Settings → Accessibility → Guided Access
   - Turn on Guided Access
   - Set passcode if desired

2. **Start Guided Access**:

   - Open Atomic Clock Display
   - Triple-click the Home/Power button
   - Tap "Start" to begin Guided Access

3. **Configure Guided Access Options**:

   - Disable hardware buttons
   - Hide touch areas
   - Set time limits if needed

### Single App Mode (MDM)

1. **Configure MDM Profile**:
   - Use Apple Configurator or MDM solution
   - Create Single App Mode profile
   - Target Atomic Clock Display bundle ID

2. **Deploy Profile**:
   - Install profile on target devices
   - Supervise devices if required
   - Lock to single app mode

## Features Overview

### Display Features

- **12 Themes**: Original, Dark, Ocean, Sunset, Forest, Cyberpunk, Galaxy, Aurora, Vintage, Minimal, Neon, Candy
- **Atomic Clock**: Precise time with seconds display
- **Weather Data**: Current conditions and forecast
- **Location Detection**: Automatic timezone and location
- **Responsive Design**: Adapts to screen size

### iOS Integration

- **WebView**: Native wrapper for web content
- **JavaScript Bridge**: iOS-specific features
- **File Access**: Local asset loading
- **Network API**: Connectivity monitoring
- **Storage**: Theme preferences persistence

### Guided Access Features

- **Lock Task**: Prevents app switching
- **System UI Hidden**: No navigation bars
- **Auto-Start**: Launches on boot
- **Crash Recovery**: Automatic restart
- **Hardware Control**: Volume and button management

## Development

### Project Structure

```
ios/
├── AtomicClockDisplay/
│   ├── AtomicClockDisplay/
│   │   ├── AppDelegate.swift          # App delegate
│   │   ├── SceneDelegate.swift        # Scene delegate
│   │   ├── ViewController.swift       # Main view controller
│   │   ├── Main.storyboard            # UI layout
│   │   ├── LaunchScreen.storyboard    # Launch screen
│   │   ├── Assets.xcassets/            # App icons and assets
│   │   ├── Info.plist                 # App configuration
│   │   └── display/                   # Web content
│   │       ├── index.html
│   │       ├── style.css
│   │       ├── script.js
│   │       └── styles/                # Theme files
│   └── AtomicClockDisplay.xcodeproj/  # Xcode project
├── build-ipa.sh                        # Build script (macOS)
├── build-ipa.bat                       # Build script (Windows)
└── README.md                           # This documentation
```

### Building

1. **Debug Build**:

   ```bash
   xcodebuild -scheme AtomicClockDisplay -configuration Debug build
   ```

2. **Release Build**:

   ```bash
   xcodebuild -scheme AtomicClockDisplay -configuration Release build
   ```

3. **Archive Build**:

   ```bash
   xcodebuild -scheme AtomicClockDisplay archive
   ```

### Customization

#### App Configuration

Edit `Info.plist`:

```xml
<key>CFBundleDisplayName</key>
<string>Atomic Clock Display</string>
<key>CFBundleIdentifier</key>
<string>com.display.atomicclock</string>
```

#### WebView Settings

Edit `ViewController.swift`:

```swift
let preferences = WKPreferences()
preferences.javaScriptEnabled = true
webConfiguration.preferences = preferences
```

#### Guided Access Configuration

Edit `ViewController.swift`:

```swift
private func configureGuidedAccess() {
    if UIAccessibility.isGuidedAccessEnabled {
        hideUIControls()
    }
}
```

## Troubleshooting

### Common Issues

1. **App Won't Install**

   - Check iOS version (minimum 13.0)
   - Verify developer certificate
   - Check bundle identifier uniqueness

2. **No Internet Connection**

   - Check WiFi/cellular data
   - Verify network permissions
   - Try offline mode

3. **Guided Access Not Working**

   - Enable Guided Access in Settings
   - Triple-click Home/Power button
   - Check iOS version compatibility

4. **Display Issues**

   - Check screen orientation
   - Verify WebView configuration
   - Restart the app

### Debug Mode

Enable debug logging:

```swift
print("Debug: WebView loaded")
```

### Performance Optimization

- Use release build for production
- Enable hardware acceleration
- Clear cache regularly
- Monitor memory usage

## Security

### Permissions Required

- `NSLocationWhenInUseUsageDescription`: Location for weather
- `NSLocationAlwaysAndWhenInUseUsageDescription`: Background location
- `NSAppTransportSecurity`: Network security configuration

### Data Privacy

- No personal data collected
- Location used only for weather
- Local storage only
- No analytics or tracking

## App Store Deployment

### Preparation

1. **Update Bundle ID**:
   ```xml
   <key>CFBundleIdentifier</key>
   <string>com.yourcompany.atomicclock</string>
   ```

2. **Configure Signing**:
   - Use distribution certificate
   - Set up provisioning profile
   - Update export options

3. **Build for App Store**:
   ```bash
   xcodebuild -scheme AtomicClockDisplay -configuration Release archive
   ```

### Upload to App Store

1. **Export Archive**:
   ```bash
   xcodebuild -exportArchive -archivePath build/AtomicClockDisplay.xcarchive -exportPath build/ipa -exportOptionsPlist exportOptions.plist
   ```

2. **Upload to App Store Connect**:
   ```bash
   xcrun altool --upload-app --type ios --file build/ipa/AtomicClockDisplay.ipa --username "your@email.com" --password "app-specific-password"
   ```

## Support

### Documentation

- [Main Display Documentation](../README.md)
- [Theme Configuration](../styles/)
- [API Integration](../script.js)

### Issues

- Report bugs via GitHub Issues
- Include device model and iOS version
- Provide crash logs if available

### Contributing

- Fork the repository
- Create feature branch
- Submit pull request
- Follow coding standards

## License

This iOS wrapper is licensed under the same terms as the main Atomic Clock Display project.

---

**Note**: This iOS app is a wrapper around the web-based Atomic Clock Display. All core functionality is implemented in the web application, while this native app provides iOS-specific features and Guided Access capabilities.
