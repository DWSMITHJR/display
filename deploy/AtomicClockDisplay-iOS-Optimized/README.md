# Status Clock & Weather Display

A simple, beautiful status clock and weather display for desktop and mobile devices.

## 🚀 **Installation**

**Just open `index.html` in any web browser.**

That's it! No setup, no installation, no configuration required.

---

## ✨ **Features**

- **Status Clock** - Real-time with seconds, date, and timezone
- **Weather Display** - Current weather with location detection
- **12 Beautiful Themes** - Original, Dark, Ocean, Sunset, Forest, Cyberpunk, Galaxy, Aurora, Vintage, Minimal, Neon, Candy
- **Auto-Rotate Themes** - Automatic theme cycling every 30 seconds
- **Draggable Theme Panel** - Move anywhere on screen with visual feedback
- **Responsive Design** - Perfect adaptation to any screen size
- **Dynamic Adjustment** - Auto-adjusts on window resize and orientation change
- **Fullscreen Mode** - Perfect for kiosks and displays
- **Click to Refresh** - Update weather manually
- **Theme Persistence** - Selected theme remembered across sessions
- **Cross-Browser** - Works on all modern browsers (Safari, Chrome, Firefox, Edge)
- **Mobile & Tablet** - Touch-optimized interactions
- **Performance Optimized** - Smooth animations and efficient updates

---

## 🎨 **Themes**

- **Original** - Classic purple gradient design
- **Dark** - Modern dark theme with glass effects
- **Ocean** - Calming blue ocean theme  
- **Sunset** - Warm orange and yellow gradients
- **Forest** - Natural green and brown tones
- **Cyberpunk** - Neon purple and dark blue with glow effects
- **Galaxy** - Deep space purple and blue
- **Aurora** - Bright cyan and blue gradients
- **Vintage** - Classic sepia and cream tones
- **Minimal** - Clean, minimalist design
- **Neon** - Electric pink and cyan with intense glow effects
- **Candy** - Sweet pink and pastel colors

---

## 📱 **Usage**

1. Open `index.html` in your browser
2. The clock and weather start automatically
3. Use the theme selector (top-right) to change themes
4. Enable "Auto-rotate" for automatic theme cycling every 30 seconds
5. Drag the theme panel to reposition it
6. Press F or click the fullscreen button for kiosk mode
7. Resize window or rotate device - layout auto-adjusts
8. Click weather display to refresh manually

---

## ⚙️ **Requirements**

- Any modern web browser (Chrome 60+, Firefox 55+, Safari 12+, Edge 79+)
- Internet connection for weather updates
- JavaScript enabled (required for all features)
- CSS3 support for themes and animations
- Optional: Touch screen for mobile interactions
- Optional: Geolocation for automatic location detection

---

## 🌐 **Weather Data**

- **Location**: Automatic detection with Atlanta, GA fallback
- **Service**: Open-Meteo API (free, no API key required)
- **Updates**: Every 10 minutes automatically, manual refresh available
- **Data**: Temperature, humidity, wind speed, pressure, UV index, visibility
- **Features**: Real-time updates, loading indicators, error handling

---

## **Files**

```text
display/
├── index.html              # Main application
├── style.css               # Responsive styles & themes
├── script.js               # Core functionality (60KB)
├── README.md               # This documentation
├── START.bat               # Quick start (Windows)
├── launch.bat              # Alternative launcher
├── launch.ps1              # PowerShell launcher
├── open.html               # Simple opener
├── styles/                 # Theme files
│   ├── dark.css            # Dark theme
│   ├── ocean.css           # Ocean theme
│   ├── sunset.css          # Sunset theme
│   ├── forest.css          # Forest theme
│   ├── cyberpunk.css       # Cyberpunk theme
│   ├── galaxy.css          # Galaxy theme
│   ├── aurora.css          # Aurora theme
│   ├── vintage.css         # Vintage theme
│   ├── minimal.css         # Minimal theme
│   ├── neon.css            # Neon theme
│   ├── candy.css           # Candy theme
│   └── THEME_TEMPLATE.css  # Template for new themes
├── deploy/                 # Deployment packages
│   ├── AtomicClockDisplay-iOS.zip        # iOS optimized package
│   ├── AtomicClockDisplay-Complete.zip   # Full package
│   ├── DEPLOYMENT_READY.md               # Deployment guide
│   └── AtomicClockDisplay-Complete/      # Full deployment files
├── android/                # Android build files
└── ios/                    # iOS build files
```

---

## **Troubleshooting**

**Weather not updating?**

- Check internet connection
- Click weather display to refresh

**Theme not saving?**

- Enable localStorage in browser

**Fullscreen not working?**

- Press F11 or use fullscreen button

---

## 📚 **Documentation & Guides**

### 🚀 **Deployment & Installation**

- [📱 iOS Loading Guide](deploy/AtomicClockDisplay-Complete/iOS_LOADING_GUIDE.md) - Complete iOS setup instructions
- [📦 Deployment Ready](deploy/DEPLOYMENT_READY.md) - All deployment packages and instructions
- [📋 Installation Guide](INSTALL.md) - Detailed installation instructions
- [📦 Deploy Guide](DEPLOY.md) - Basic deployment instructions
- [🧹 Cleanup Guide](CLEANUP.md) - Project cleanup and maintenance

### ⚙️ **Technical Documentation**

- [🔧 Optimization & Hardening](OPTIMIZATION_HARDENING_COMPLETE.md) - Performance optimizations
- [🧪 Test Report](TEST_REPORT.md) - Comprehensive testing results
- [📊 Test Data](TEST_REPORT.json) - Testing data and metrics

### 🎨 **Theme System**

- [🎭 Theme Rotation Guide](THEME_ROTATION_GUIDE.md) - Automatic theme cycling

### 📱 **Platform-Specific Guides**

- [🤖 Android Build](android/README.md) - Android app development
- [📱 iOS Build](ios/README.md) - iOS app development

---

## 📄 **License**

MIT License - Free to use and modify.

---

**Ready in 5 seconds! Just open `index.html` and enjoy!** ⚡

🕐🌤️
