@echo off
title Atomic Clock Display - Local Network Deployment
color 0B
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║        🌐 Local Network Deployment - Atomic Clock          ║
echo ║              Simple Web Server + Firewall Setup             ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Get local IP address
echo 🌐 Detecting network configuration...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /R /C:"IPv4.*Address"') do (
    set LOCAL_IP=%%a
)
set LOCAL_IP=%LOCAL_IP: =%

if "%LOCAL_IP%"=="" (
    echo ❌ Could not detect local IP address
    echo Please ensure you're connected to a network
    pause
    exit /b 1
)

echo ✅ Local IP detected: %LOCAL_IP%
echo.

REM Set deployment configuration
set DEPLOY_PORT=8080
set DEPLOY_DIR=local-deploy
set FIREWALL_RULE=AtomicClockDisplay-WebServer

echo 📋 Deployment Configuration:
echo    Local IP: %LOCAL_IP%
echo    Port: %DEPLOY_PORT%
echo    Directory: %DEPLOY_DIR%
echo    Firewall Rule: %FIREWALL_RULE%
echo.

REM Create deployment directory
if not exist "%DEPLOY_DIR%" mkdir "%DEPLOY_DIR%"

REM Clean previous deployment
echo 🧹 Cleaning previous deployment...
if exist "%DEPLOY_DIR%\*" del /q "%DEPLOY_DIR%\*"
for /d %%d in ("%DEPLOY_DIR%\*") do rmdir /s /q "%%d"

REM Prepare web files
echo 📦 Preparing web files...
echo.

REM Copy optimized files
echo 📄 Copying main files...
copy "index.html" "%DEPLOY_DIR%\index.html"
copy "style.css" "%DEPLOY_DIR%\style.css"
copy "script.js" "%DEPLOY_DIR%\script.js"

REM Copy theme files
if not exist "%DEPLOY_DIR%\styles" mkdir "%DEPLOY_DIR%\styles"
xcopy "styles\*" "%DEPLOY_DIR%\styles\" /E /I /Q

REM Create local-optimized HTML with network features
echo 🌐 Creating network-optimized HTML...
(
echo ^<!DOCTYPE html^>
echo ^<html lang="en"^>
echo ^<head^>
echo     ^<meta charset="UTF-8"^>
echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0"^>
echo     ^<title^>Atomic Clock Display - Local Network^</title^>
echo     ^<link rel="stylesheet" href="style.css"^>
echo     ^<meta name="description" content="Atomic Clock Display - Local Network Deployment"^>
echo     ^<meta http-equiv="refresh" content="72000"^> ^<!-- 20 hours --^>
echo     ^<style^>
echo         .network-status {
echo             position: fixed;
echo             top: 10px;
echo             left: 10px;
echo             background: rgba(0, 0, 0, 0.8);
echo             color: white;
echo             padding: 8px 12px;
echo             border-radius: 6px;
echo             font-size: 12px;
echo             z-index: 1000;
echo             backdrop-filter: blur(10px);
echo             border: 1px solid rgba(255, 255, 255, 0.2);
echo         }
echo         .network-status.online {
echo             background: rgba(0, 128, 0, 0.8);
echo         }
echo         .network-status.offline {
echo             background: rgba(128, 0, 0, 0.8);
echo         }
echo     ^</style^>
echo ^</head^>
echo ^<body^>
echo     ^<div id="network-status" class="network-status"^>
echo         🌐 Local Network - %LOCAL_IP%:%DEPLOY_PORT%
echo     ^</div^>
echo     ^<div id="theme-panel" class="style-selector"^>
echo         ^<div class="style-selector-label"^>Themes^</div^>
echo         ^<select id="style-dropdown" title="Select a theme"^>
echo             ^<option value="style.css"^>Original^</option^>
echo             ^<option value="styles/dark.css"^>Dark^</option^>
echo             ^<option value="styles/ocean.css"^>Ocean^</option^>
echo             ^<option value="styles/sunset.css"^>Sunset^</option^>
echo             ^<option value="styles/forest.css"^>Forest^</option^>
echo             ^<option value="styles/cyberpunk.css"^>Cyberpunk^</option^>
echo             ^<option value="styles/galaxy.css"^>Galaxy^</option^>
echo             ^<option value="styles/aurora.css"^>Aurora^</option^>
echo             ^<option value="styles/vintage.css"^>Vintage^</option^>
echo             ^<option value="styles/minimal.css"^>Minimal^</option^>
echo             ^<option value="styles/neon.css"^>Neon^</option^>
echo             ^<option value="styles/candy.css"^>Candy^</option^>
echo         ^</select^>
echo         ^<div class="theme-controls"^>
echo             ^<label for="auto-rotate" class="auto-rotate-label"^>
echo                 ^<input type="checkbox" id="auto-rotate" title="Auto-rotate themes every 30 seconds"^>
echo                 Auto-rotate
echo             ^</label^>
echo             ^<a href="README.md" target="_blank" class="readme-link" title="Open Documentation (README)"^>📖^</a^>
echo             ^<button id="fullscreen-toggle" class="fullscreen-btn" title="Toggle Fullscreen (F)"^>
echo                 ^<span id="fullscreen-icon"^>⛶^</span^>
echo             ^</button^>
echo         ^</div^>
echo     ^</div^>
echo     ^<div class="container"^>
echo         ^<header class="day-display"^>
echo             ^<h1 id="day-name"^>Loading...^</h1^>
echo             ^<p id="time-period"^>Morning^</p^>
echo         ^</header^>
echo         ^<main class="content"^>
echo             ^<section class="time-section"^>
echo                 ^<div class="time-display"^>
echo                     ^<div id="time" class="time"^>Loading...^</div^>
echo                     ^<div id="seconds" class="seconds"^>00^</div^>
echo                     ^<div id="period" class="period"^>AM^</div^>
echo                 ^</div^>
echo             ^</section^>
echo             ^<section class="weather-section"^>
echo                 ^<div class="weather-display"^>
echo                     ^<div class="weather-main"^>
echo                         ^<div id="weather-icon" class="weather-icon"^>🌤️^</div^>
echo                         ^<div id="temperature" class="temperature"^>--°F^</div^>
echo                         ^<div class="weather-info"^>
echo                             ^<div id="weather-description" class="weather-description"^>Loading weather...^</div^>
echo                             ^<div id="location" class="location"^>Detecting location...^</div^>
echo                         ^</div^>
echo                     ^</div^>
echo                     ^<div class="weather-details"^>
echo                         ^<div class="weather-detail-row"^>
echo                             ^<span class="weather-detail-label"^>🌡️^</span^>
echo                             ^<span id="feels-like" class="weather-detail-value"^>--°F^</span^>
echo                             ^<span class="weather-detail-label"^>💧^</span^>
echo                             ^<span id="humidity" class="weather-detail-value"^>--%^</span^>
echo                         ^</div^>
echo                         ^<div class="weather-detail-row"^>
echo                             ^<span class="weather-detail-label"^>💨^</span^>
echo                             ^<span id="wind-speed" class="weather-detail-value"^>-- mph^</span^>
echo                             ^<span class="weather-detail-label"^>👁️^</span^>
echo                             ^<span id="visibility" class="weather-detail-value"^>-- mi^</span^>
echo                         ^</div^>
echo                     ^</div^>
echo                     ^<div id="weather-update-time" class="weather-update-time"^>^</div^>
echo                 ^</div^>
echo             ^</section^>
echo         ^</main^>
echo     ^</div^>
echo     ^<script^>
echo         // Network status monitoring
echo         function updateNetworkStatus() {
echo             const status = document.getElementById('network-status');
echo             const isOnline = navigator.onLine;
echo             
echo             if (isOnline) {
echo                 status.className = 'network-status online';
echo                 status.innerHTML = '🌐 Local Network - %LOCAL_IP%:%DEPLOY_PORT% - Online';
echo             } else {
echo                 status.className = 'network-status offline';
echo                 status.innerHTML = '🌐 Local Network - %LOCAL_IP%:%DEPLOY_PORT% - Offline';
echo             }
echo         }
echo         
echo         // Update network status immediately and on changes
echo         updateNetworkStatus();
echo         window.addEventListener('online', updateNetworkStatus);
echo         window.addEventListener('offline', updateNetworkStatus);
echo         
echo         // Update status every 30 seconds
echo         setInterval(updateNetworkStatus, 30000);
echo     ^</script^>
echo     ^<script src="script.js"^>^</script^>
echo ^</body^>
echo ^</html^>
) > "%DEPLOY_DIR%\index.html"

REM Create network status script
echo 📡 Creating network monitoring script...
(
echo // Network monitoring for local deployment
echo console.log('🌐 Atomic Clock Display - Local Network Deployment');
echo console.log('📡 Server: %LOCAL_IP%:%DEPLOY_PORT%');
echo.
echo // Enhanced network monitoring
echo function monitorNetwork() {
echo     const status = {
echo         online: navigator.onLine,
echo         connection: navigator.connection || navigator.mozConnection || navigator.webkitConnection,
echo         server: '%LOCAL_IP%:%DEPLOY_PORT%'
echo     };
echo     
echo     // Log network status
echo     console.log('📊 Network Status:', status);
echo     
echo     // Update UI if network status element exists
echo     const statusElement = document.getElementById('network-status');
echo     if (statusElement) {
echo         statusElement.innerHTML = `🌐 Local Network - ${status.server} - ${status.online ? 'Online' : 'Offline'}`;
echo         statusElement.className = `network-status ${status.online ? 'online' : 'offline'}`;
echo     }
echo     
echo     return status;
echo }
echo.
echo // Monitor network changes
echo window.addEventListener('online', () =^> {
echo     console.log('🌐 Network connection restored');
echo     monitorNetwork();
echo });
echo.
echo window.addEventListener('offline', () =^> {
echo     console.log('📡 Network connection lost');
echo     monitorNetwork();
echo });
echo.
echo // Initial network check
echo document.addEventListener('DOMContentLoaded', monitorNetwork);
echo.
echo // Periodic network check
echo setInterval(monitorNetwork, 30000);
) > "%DEPLOY_DIR%\network-monitor.js"

REM Create simple web server script
echo 🌐 Creating web server script...
(
echo @echo off
echo title Atomic Clock Display - Local Web Server
echo color 0A
echo.
echo echo 🌐 Starting Atomic Clock Display Web Server...
echo echo ==========================================
echo echo.
echo echo 📡 Server Information:
echo echo    Local IP: %LOCAL_IP%
echo echo    Port: %DEPLOY_PORT%
echo echo    Directory: %DEPLOY_DIR%
echo echo.
echo echo 🌐 Access URLs:
echo echo    Local: http://localhost:%DEPLOY_PORT%
echo echo    Network: http://%LOCAL_IP%:%DEPLOY_PORT%
echo echo.
echo echo 🔥 Starting server on port %DEPLOY_PORT%...
echo echo.
echo.
echo REM Check if Python is available
echo python --version ^>nul 2^>^&1
echo if %%ERRORLEVEL%% EQU 0 (
echo     echo ✅ Python detected, starting Python server...
echo     cd /d "%DEPLOY_DIR%"
echo     python -m http.server %DEPLOY_PORT%
echo     goto :end
echo )
echo.
echo REM Check if Node.js is available
echo node --version ^>nul 2^>^&1
echo if %%ERRORLEVEL%% EQU 0 (
echo     echo ✅ Node.js detected, checking for http-server...
echo     where http-server ^>nul 2^>^&1
echo     if %%ERRORLEVEL%% EQU 0 (
echo         echo ✅ http-server found, starting Node.js server...
echo         cd /d "%DEPLOY_DIR%"
echo         http-server -p %DEPLOY_PORT% -o
echo         goto :end
echo     ) else (
echo         echo ⚠️  http-server not found, please install: npm install -g http-server
echo     )
echo )
echo.
echo REM Fallback to Python 3
echo python3 --version ^>nul 2^>^&1
echo if %%ERRORLEVEL%% EQU 0 (
echo     echo ✅ Python 3 detected, starting server...
echo     cd /d "%DEPLOY_DIR%"
echo     python3 -m http.server %DEPLOY_PORT%
echo     goto :end
echo )
echo.
echo echo ❌ No suitable web server found
echo echo Please install Python 3, Node.js with http-server, or use another web server
echo echo.
echo pause
echo goto :end
echo.
echo :end
echo echo.
echo echo 🛑 Server stopped
echo pause
) > "%DEPLOY_DIR%\start-server.bat"

REM Create firewall configuration script
echo 🔥 Creating firewall configuration script...
(
echo @echo off
echo title Atomic Clock Display - Firewall Configuration
echo color 0E
echo.
echo echo 🔥 Configuring Windows Firewall for Atomic Clock Display
echo echo =====================================================
echo echo.
echo echo 📡 Opening port %DEPLOY_PORT% for local network access...
echo echo.
echo.
echo REM Check if running as administrator
echo net session ^>nul 2^>^&1
echo if %%ERRORLEVEL%% NEQ 0 (
echo     echo ❌ This script requires administrator privileges
echo     echo Please right-click and select "Run as administrator"
echo     echo.
echo     pause
echo     exit /b 1
echo )
echo.
echo echo ✅ Running with administrator privileges
echo echo.
echo.
echo REM Remove existing rule (if any)
echo echo 🗑️  Removing existing firewall rule...
echo netsh advfirewall firewall delete rule name="%FIREWALL_RULE%" ^>nul 2^>^&1
echo.
echo REM Add new inbound rule
echo echo 🔓 Adding inbound rule for port %DEPLOY_PORT%...
echo netsh advfirewall firewall add rule name="%FIREWALL_RULE%" ^
echo     dir=in action=allow protocol=TCP localport=%DEPLOY_PORT% ^
echo     profile=private,public description="Atomic Clock Display Web Server"
echo.
echo if %%ERRORLEVEL%% EQU 0 (
echo     echo ✅ Inbound rule added successfully
echo ) else (
echo     ❌ Failed to add inbound rule
echo     pause
echo     exit /b 1
echo )
echo.
echo REM Add new outbound rule
echo echo 🔓 Adding outbound rule for port %DEPLOY_PORT%...
echo netsh advfirewall firewall add rule name="%FIREWALL_RULE%-out" ^
echo     dir=out action=allow protocol=TCP localport=%DEPLOY_PORT% ^
echo     profile=private,public description="Atomic Clock Display Web Server Outbound"
echo.
echo if %%ERRORLEVEL%% EQU 0 (
echo     echo ✅ Outbound rule added successfully
echo ) else (
echo     echo ⚠️  Failed to add outbound rule (non-critical)
echo )
echo.
echo REM Show firewall rules
echo echo 📋 Current firewall rules for Atomic Clock Display:
echo netsh advfirewall firewall show rule name="%FIREWALL_RULE%"
echo echo.
echo netsh advfirewall firewall show rule name="%FIREWALL_RULE%-out"
echo echo.
echo echo 🔥 Firewall configuration completed!
echo echo.
echo echo 🌐 Your Atomic Clock Display is now accessible on:
echo echo    Local: http://localhost:%DEPLOY_PORT%
echo echo    Network: http://%LOCAL_IP%:%DEPLOY_PORT%
echo echo.
echo echo 📝 Note: Make sure your network allows incoming connections
echo echo        on port %DEPLOY_PORT% for other devices to access
echo.
echo pause
) > "%DEPLOY_DIR%\configure-firewall.bat"

REM Create deployment documentation
echo 📋 Creating deployment documentation...
(
echo Atomic Clock Display - Local Network Deployment
echo =================================================
echo.
echo Version: 1.0.%date:~-4%%date:~4,2%%date:~7,2%
echo Built: %date% %time%
echo.
echo 🌐 Network Configuration:
echo -------------------------
echo Local IP: %LOCAL_IP%
echo Port: %DEPLOY_PORT%
echo Firewall Rule: %FIREWALL_RULE%
echo.
echo 🚀 Quick Start:
echo ----------------
echo 1. Configure Firewall: Run configure-firewall.bat as administrator
echo 2. Start Server: Run start-server.bat
echo 3. Access: Open http://localhost:%DEPLOY_PORT% in browser
echo 4. Network Access: Use http://%LOCAL_IP%:%DEPLOY_PORT% from other devices
echo.
echo 📋 Step-by-Step Instructions:
echo ==============================
echo.
echo 1️⃣  Configure Windows Firewall:
echo    - Right-click configure-firewall.bat
echo    - Select "Run as administrator"
echo    - Confirm the firewall rules are added
echo.
echo 2️⃣  Start the Web Server:
echo    - Run start-server.bat
echo    - The server will start on port %DEPLOY_PORT%
echo    - Keep the server window open
echo.
echo 3️⃣  Access the Application:
echo    - On this computer: http://localhost:%DEPLOY_PORT%
echo    - On other devices: http://%LOCAL_IP%:%DEPLOY_PORT%
echo    - The app will show network status in top-left corner
echo.
echo 4️⃣  Share with Network:
echo    - Other devices on same network can access
echo    - Works with WiFi, Ethernet, and local networks
echo    - No internet connection required for basic functionality
echo.
echo 🔧 Troubleshooting:
echo ------------------
echo.
echo ❌ Firewall Issues:
echo    - Run configure-firewall.bat as administrator
echo    - Check Windows Firewall settings
echo    - Verify port %DEPLOY_PORT% is allowed
echo.
echo ❌ Server Won't Start:
echo    - Install Python 3 or Node.js with http-server
echo    - Check if port %DEPLOY_PORT% is already in use
echo    - Try running as administrator
echo.
echo ❌ Network Access Issues:
echo    - Verify all devices are on same network
echo    - Check router firewall settings
echo    - Confirm IP address: %LOCAL_IP%
echo.
echo ❌ Browser Issues:
echo    - Try different browser (Chrome, Firefox, Edge)
echo    - Clear browser cache
echo    - Disable browser extensions
echo.
echo 🌐 Network Features:
echo --------------------
echo - Real-time network status monitoring
echo - Offline detection and indication
echo - Automatic status updates every 30 seconds
echo - Visual indicators for connection state
echo.
echo 📱 Device Compatibility:
echo ------------------------
echo - Windows PCs and laptops
echo - Mac computers
echo - Linux systems
echo - Smartphones and tablets
echo - Smart TVs with web browsers
echo - Digital signage displays
echo.
echo 🔒 Security Notes:
echo ------------------
echo - Only accessible on local network
echo - No external internet access required
echo - Firewall rules limit access to port %DEPLOY_PORT%
echo - No user data transmitted externally
echo.
echo 🎯 Use Cases:
echo -------------
echo - Office dashboards and status displays
echo - Home automation interfaces
echo - Kiosk and digital signage
echo - Meeting room displays
echo - Network monitoring stations
echo - Educational demonstrations
echo.
echo 📞 Support:
echo ------------
echo If you encounter issues:
echo 1. Check this documentation
echo 2. Verify network connectivity
echo 3. Confirm firewall settings
echo 4. Test with different browsers
echo 5. Check system requirements
echo.
echo 🎉 Enjoy your Atomic Clock Display on the local network!
) > "%DEPLOY_DIR%\README.txt"

REM Create quick launch script
echo 🚀 Creating quick launch script...
(
echo @echo off
echo title Atomic Clock Display - Quick Launch
echo color 0C
echo.
echo echo 🚀 Atomic Clock Display - Quick Network Launch
echo echo ===============================================
echo echo.
echo echo 🌐 Network Information:
echo echo    IP: %LOCAL_IP%
echo echo    Port: %DEPLOY_PORT%
echo echo.
echo echo 🔧 Quick Options:
echo echo.
echo echo 1. 🔥 Configure Firewall ^(Administrator^)
echo echo 2. 🌐 Start Web Server
echo echo 3. 📋 View Network Info
echo echo 4. 🌐 Open in Browser
echo echo 5. 📱 Generate QR Code
echo echo 0. Exit
echo echo.
echo set /p choice="Select option (0-5): "
echo.
echo if "%%choice%%"=="1" goto firewall
echo if "%%choice%%"=="2" goto server
echo if "%%choice%%"=="3" goto info
echo if "%%choice%%"=="4" goto browser
echo if "%%choice%%"=="5" goto qr
echo if "%%choice%%"=="0" goto exit
echo echo Invalid choice
echo goto menu
echo.
echo :firewall
echo echo 🔥 Configuring firewall...
echo call "%DEPLOY_DIR%\configure-firewall.bat"
echo goto menu
echo.
echo :server
echo echo 🌐 Starting web server...
echo call "%DEPLOY_DIR%\start-server.bat"
echo goto menu
echo.
echo :info
echo echo 📋 Network Information:
echo echo ====================
echo echo Local IP: %LOCAL_IP%
echo echo Port: %DEPLOY_PORT%
echo echo Local URL: http://localhost:%DEPLOY_PORT%
echo echo Network URL: http://%LOCAL_IP%:%DEPLOY_PORT%
echo echo.
echo echo 📡 Network Status:
echo ping -n 1 %LOCAL_IP% ^>nul 2^>^&1
echo if %%ERRORLEVEL%% EQU 0 (
echo     echo ✅ Network connection active
echo ) else (
echo     ❌ Network connection issue
echo )
echo echo.
echo pause
echo goto menu
echo.
echo :browser
echo echo 🌐 Opening browser...
echo start http://localhost:%DEPLOY_PORT%
echo goto menu
echo.
echo :qr
echo echo 📱 QR Code for mobile access:
echo echo ==============================
echo echo.
echo echo Scan this QR code with your mobile device:
echo echo URL: http://%LOCAL_IP%:%DEPLOY_PORT%
echo echo.
echo echo 💡 Tip: Use a QR code generator app to create
echo echo     a QR code for the URL above
echo echo.
echo pause
echo goto menu
echo.
echo :exit
echo exit
) > "%DEPLOY_DIR%\quick-launch.bat"

echo ✅ Local deployment package created successfully!
echo.
echo 📁 Deployment ready in: %DEPLOY_DIR%\
echo.
echo 🌐 Access URLs:
echo    Local: http://localhost:%DEPLOY_PORT%
echo    Network: http://%LOCAL_IP%:%DEPLOY_PORT%
echo.
echo 🚀 Next steps:
echo 1. Run %DEPLOY_DIR%\configure-firewall.bat as administrator
echo 2. Run %DEPLOY_DIR%\start-server.bat to start the server
echo 3. Open browser to http://localhost:%DEPLOY_PORT%
echo 4. Share http://%LOCAL_IP%:%DEPLOY_PORT% with other devices
echo.
pause
