#!/bin/bash

# iOS Build Script for Atomic Clock Display
# This script builds the iOS app and generates an IPA file

echo "🏗️  Building Atomic Clock Display for iOS..."
echo "=========================================="

# Check if Xcode is available
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ ERROR: Xcode is not installed or not in PATH"
    echo "Please install Xcode from the App Store"
    exit 1
fi

# Check if we're in the right directory
if [ ! -d "AtomicClockDisplay" ]; then
    echo "❌ ERROR: AtomicClockDisplay project not found"
    echo "Please run this script from the ios/ directory"
    exit 1
fi

# Set project and workspace variables
PROJECT_NAME="AtomicClockDisplay"
SCHEME_NAME="AtomicClockDisplay"
WORKSPACE_NAME="AtomicClockDisplay.xcodeproj"
BUILD_DIR="build"
ARCHIVE_PATH="$BUILD_DIR/AtomicClockDisplay.xcarchive"
IPA_DIR="$BUILD_DIR/ipa"

echo "📋 Project Configuration:"
echo "   Project: $PROJECT_NAME"
echo "   Scheme: $SCHEME_NAME"
echo "   Target: iOS 13.0+"
echo ""

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf "$BUILD_DIR"
if [ $? -ne 0 ]; then
    echo "❌ ERROR: Failed to clean previous builds"
    exit 1
fi

# Build for iOS Simulator (Debug)
echo "📱 Building for iOS Simulator (Debug)..."
xcodebuild -project "$WORKSPACE_NAME" \
           -scheme "$SCHEME_NAME" \
           -destination 'platform=iOS Simulator,name=iPhone 15,OS=latest' \
           -configuration Debug \
           clean build \
           -derivedDataPath "$BUILD_DIR/DerivedData"

if [ $? -ne 0 ]; then
    echo "❌ ERROR: Debug build failed"
    exit 1
fi

echo "✅ Debug build completed successfully"

# Build for iOS Device (Release)
echo "📱 Building for iOS Device (Release)..."
xcodebuild -project "$WORKSPACE_NAME" \
           -scheme "$SCHEME_NAME" \
           -destination 'generic/platform=iOS' \
           -configuration Release \
           archive \
           -archivePath "$ARCHIVE_PATH" \
           -derivedDataPath "$BUILD_DIR/DerivedData"

if [ $? -ne 0 ]; then
    echo "❌ ERROR: Release build failed"
    exit 1
fi

echo "✅ Release build completed successfully"

# Export IPA
echo "📦 Exporting IPA..."
mkdir -p "$IPA_DIR"

xcodebuild -exportArchive \
           -archivePath "$ARCHIVE_PATH" \
           -exportPath "$IPA_DIR" \
           -exportOptionsPlist exportOptions.plist

if [ $? -ne 0 ]; then
    echo "❌ ERROR: IPA export failed"
    exit 1
fi

echo "✅ IPA exported successfully"

# Create export options if it doesn't exist
if [ ! -f "exportOptions.plist" ]; then
    echo "📄 Creating export options plist..."
    cat > exportOptions.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>development</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
    <key>compileBitcode</key>
    <false/>
    <key>signingStyle</key>
    <string>automatic</string>
    <key>destination</key>
    <string>export</string>
    <key>provisioningProfiles</key>
    <dict>
        <key>com.display.atomicclock</key>
        <string>YOUR_PROVISIONING_PROFILE</string>
    </dict>
</dict>
</plist>
EOF
    echo "⚠️  Please update exportOptions.plist with your Team ID and provisioning profile"
fi

# Display build results
echo ""
echo "🎉 Build completed successfully!"
echo "==============================="
echo "📱 Simulator App: $BUILD_DIR/DerivedData/Build/Products/Debug-iphonesimulator/$PROJECT_NAME.app"
echo "📦 Device IPA: $IPA_DIR/$PROJECT_NAME.ipa"
echo "📋 Archive: $ARCHIVE_PATH"
echo ""

# Installation instructions
echo "📋 Installation Instructions:"
echo "=============================="
echo "1. For Simulator:"
echo "   - Open $BUILD_DIR/DerivedData/Build/Products/Debug-iphonesimulator/$PROJECT_NAME.app"
echo "   - Or use: xcrun simctl install booted '$BUILD_DIR/DerivedData/Build/Products/Debug-iphonesimulator/$PROJECT_NAME.app'"
echo ""
echo "2. For Device:"
echo "   - Connect your iOS device"
echo "   - Install IPA: xcrun devicectl install device '$IPA_DIR/$PROJECT_NAME.ipa'"
echo "   - Or use Xcode: Window > Devices and Simulators > Install App"
echo ""
echo "3. For App Store:"
echo "   - Update exportOptions.plist with distribution settings"
echo "   - Re-run export with App Store method"
echo ""

# App Store Connect upload (optional)
echo "🚀 Optional: Upload to App Store Connect"
echo "========================================"
echo "To upload to App Store Connect:"
echo "1. Update exportOptions.plist with method 'app-store'"
echo "2. Run: xcodebuild -exportArchive -archivePath '$ARCHIVE_PATH' -exportPath '$IPA_DIR' -exportOptionsPlist exportOptions.plist"
echo "3. Then: xcrun altool --upload-app --type ios --file '$IPA_DIR/$PROJECT_NAME.ipa' --username 'YOUR_APPLE_ID' --password 'YOUR_APP_SPECIFIC_PASSWORD'"
echo ""

echo "✅ iOS build process completed!"
