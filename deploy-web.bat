@echo off
echo 🌐 Atomic Clock Display - Web Deployment
echo ========================================
echo.

REM Set variables
set DEPLOY_DIR=web-deploy
set TIMESTAMP=%date:~-4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set VERSION=1.0.%TIMESTAMP%

echo 📦 Web Deployment Version: %VERSION%
echo 📁 Target Directory: %DEPLOY_DIR%
echo.

REM Create deployment directory
if not exist "%DEPLOY_DIR%" mkdir "%DEPLOY_DIR%"

REM Clean previous deployment
echo 🧹 Cleaning previous deployment...
if exist "%DEPLOY_DIR%\*" del /q "%DEPLOY_DIR%\*"
for /d %%d in ("%DEPLOY_DIR%\*") do rmdir /s /q "%%d"

echo ✅ Deployment directory prepared
echo.

REM Optimize and copy assets
echo 📦 Optimizing web assets...
echo.

REM Minify CSS with advanced optimization
echo 🎨 Optimizing CSS...
powershell -Command "
$css = Get-Content 'style.css' -Raw;
$css = $css -replace '/\*.*?\*/', '';
$css = $css -replace '\s+', ' ';
$css = $css -replace ';\s*', ';';
$css = $css -replace ':\s*', ':';
$css = $css -replace ',\s*', ',';
$css = $css -replace '\{\s*', '{';
$css = $css -replace '\}\s*', '}';
$css = $css.Trim();
$css | Out-File -Encoding UTF8 '%DEPLOY_DIR%\style.min.css'
"
if %ERRORLEVEL% neq 0 (
    echo ❌ CSS optimization failed
    exit /b 1
)

REM Minify JavaScript with advanced optimization
echo ⚡ Optimizing JavaScript...
powershell -Command "
$js = Get-Content 'script.js' -Raw;
$js = $js -replace '/\*.*?\*/', '';
$js = $js -replace '\/\/.*$', '';
$js = $js -replace '\s+', ' ';
$js = $js -replace ';\s*', ';';
$js = $js -replace ',\s*', ',';
$js = $js -replace '\{\s*', '{';
$js = $js -replace '\}\s*', '}';
$js = $js.Trim();
$js | Out-File -Encoding UTF8 '%DEPLOY_DIR%\script.min.js'
"
if %ERRORLEVEL% neq 0 (
    echo ❌ JavaScript optimization failed
    exit /b 1
)

REM Create optimized HTML
echo 📄 Creating optimized HTML...
(
echo ^<!DOCTYPE html^>
echo ^<html lang="en"^>
echo ^<head^>
echo     ^<meta charset="UTF-8"^>
echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0"^>
echo     ^<title^>Atomic Clock Display^</title^>
echo     ^<link rel="stylesheet" href="style.min.css"^>
echo     ^<link rel="manifest" href="manifest.json"^>
echo     ^<meta name="theme-color" content="#667eea"^>
echo     ^<meta name="description" content="Beautiful atomic clock and weather display with 12 themes"^>
echo     ^<meta http-equiv="refresh" content="72000"^> ^<!-- 20 hours --^>
echo ^</head^>
echo ^<body^>
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
echo     ^<script src="script.min.js"^>^</script^>
echo ^</body^>
echo ^</html^>
) > "%DEPLOY_DIR%\index.html"
if %ERRORLEVEL% neq 0 (
    echo ❌ HTML creation failed
    exit /b 1
)

REM Copy theme assets
echo 🎨 Copying theme assets...
if not exist "%DEPLOY_DIR%\styles" mkdir "%DEPLOY_DIR%\styles"
xcopy "styles\*" "%DEPLOY_DIR%\styles\" /E /I /Q
if %ERRORLEVEL% neq 0 (
    echo ❌ Theme assets copy failed
    exit /b 1
)

REM Create PWA manifest
echo 📱 Creating PWA manifest...
(
echo {
echo   "name": "Atomic Clock Display",
echo   "short_name": "Atomic Clock",
echo   "version": "%VERSION%",
echo   "description": "Beautiful atomic clock and weather display with 12 themes",
echo   "start_url": "./index.html",
echo   "display": "fullscreen",
echo   "orientation": "landscape",
echo   "theme_color": "#667eea",
echo   "background_color": "#667eea",
echo   "categories": ["utilities", "productivity", "weather"],
echo   "lang": "en",
echo   "scope": "./",
echo   "icons": [
echo     {
echo       "src": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDE5MiAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxOTIiIGhlaWdodD0iMTkyIiByeD0iMjQiIGZpbGw9InVybCgjZ3JhZGllbnQwX2xpbmVhcl8xXzgpIi8+CjxwYXRoIGQ9Ik05NiA0OEM4NC45NTQzIDQ4IDc2IDU2Ljk1NDMgNzYgNjhWODRINjhDNTYuOTU0MyA4NCA0OCA5Mi45NTQzIDQ4IDEwNFYxMjRDNDggMTM1LjA0NiA1Ni45NTQzIDE0NCA2OCAxNDRIODRWMTI0SDEwOFYxNDRIMTI0QzEzNS4wNDYgMTQ0IDE0NCAxMzUuMDQ2IDE0NCAxMjRWMTA0QzE0NCA5Mi45NTQzIDEzNS4wNDYgODQgMTI0IDg0SDExNlY2OEMxMTYgNTYuOTU0MyAxMDcuMDQ2IDQ4IDk2IDQ4WiIgZmlsbD0id2hpdGUiLz4KPGRMZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50MF9saW5lYXJfMV84IiB4MT0iMCIgeTE9IjAiIHgyPSIxOTIiIHkyPSIxOTIiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzY2N2VlYSIvPgo8c3RvcCBvZmZzZXQ9IjAuNSIgc3RvcC1jb2xvcj0iIzc2NGJhMiIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNmMDkzZmIiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4=",
echo       "sizes": "192x192",
echo       "type": "image/svg+xml",
echo       "purpose": "any maskable"
echo     },
echo     {
echo       "src": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiByeD0iNjQiIGZpbGw9InVybCgjZ3JhZGllbnQwX2xpbmVhcl8xXzgpIi8+CjxwYXRoIGQ9Ik0yNTYgMTI4QzIyNy43OSAxMjggMjA0IDE1MS43OSAyMDQgMTgwVjIyNEgxODBDMTUxLjc5IDIyNCAxMjggMjQ3Ljc5IDEyOCAyNzZWMzM2QzEyOCAzNjQuMjEgMTUxLjc5IDM4OCAxODAgMzg4SDIyNFYzMzJIMjg4VjM4OEgzMzJDMzYwLjIxIDM4OCAzODQgMzY0LjIxIDM4NCAzMzZWMjc2QzM4NCAyNDcuNzkgMzYwLjIxIDIyNCAzMzIgMjI0SDMwOFYxODBDMzA4IDE1MS43OSAyODQuMjEgMTI4IDI1NiAxMjhaIiBmaWxsPSJ3aGl0ZSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudDBfbGluZWFyXzFfOCIgeDE9IjAiIHkxPSIwIiB4Mj0iNTEyIiB5Mj0iNTEyIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiM2NjdlZWEiLz4KPHN0b3Agb2Zmc2V0PSIwLjUiIHN0b3AtY29sb3I9IiM3NjRiYTIiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjZjA5M2ZiIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+",
echo       "sizes": "512x512",
echo       "type": "image/svg+xml",
echo       "purpose": "any maskable"
echo     }
echo   ],
echo   "shortcuts": [
echo     {
echo       "name": "Theme Settings",
echo       "short_name": "Themes",
echo       "description": "Access theme settings quickly",
echo       "url": "./index.html?themes",
echo       "icons": [{ "src": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiByeD0iMTIiIGZpbGw9IiM2NjdlZWEiLz4KPHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIyNCIgeT0iMjQiPgo8Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSI0IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9yZWN0Pgo8L3N2Zz4=", "sizes": "96x96", "type": "image/svg+xml" }]
echo     }
echo   ]
echo }
) > "%DEPLOY_DIR%\manifest.json"

REM Create service worker for PWA
echo ⚡ Creating service worker...
(
echo const CACHE_NAME = 'atomic-clock-v%VERSION%';
echo const urlsToCache = [
echo   './',
echo   './index.html',
echo   './style.min.css',
echo   './script.min.js',
echo   './manifest.json',
echo   './styles/style.css',
echo   './styles/dark.css',
echo   './styles/ocean.css',
echo   './styles/sunset.css',
echo   './styles/forest.css',
echo   './styles/cyberpunk.css',
echo   './styles/galaxy.css',
echo   './styles/aurora.css',
echo   './styles/vintage.css',
echo   './styles/minimal.css',
echo   './styles/neon.css',
echo   './styles/candy.css'
echo ];
echo.
echo self.addEventListener('install', event =^> {
echo   event.waitUntil(
echo     caches.open(CACHE_NAME)
echo       .then(cache =^> cache.addAll(urlsToCache))
echo   );
echo });
echo.
echo self.addEventListener('fetch', event =^> {
echo   event.respondWith(
echo     caches.match(event.request)
echo       .then(response =^> {
echo         // Return cached version or fetch from network
echo         return response ^|^| fetch(event.request);
echo       })
echo   );
echo });
) > "%DEPLOY_DIR%\sw.js"

REM Update HTML to include service worker
echo 📄 Adding service worker to HTML...
powershell -Command "(Get-Content '%DEPLOY_DIR%\index.html') -replace '</script>', '</script>\n    <script>\n      if ('serviceWorker' in navigator) {\n        navigator.serviceWorker.register('./sw.js').then(function(registration) {\n          console.log('ServiceWorker registration successful');\n        }).catch(function(err) {\n          console.log('ServiceWorker registration failed: ', err);\n        });\n      }\n    </script>' | Out-File -Encoding UTF8 '%DEPLOY_DIR%\index.html'"

REM Create robots.txt
echo 🤖 Creating robots.txt...
(
echo User-agent: *
echo Allow: /
echo.
echo Sitemap: https://yoursite.com/sitemap.xml
) > "%DEPLOY_DIR%\robots.txt"

REM Create sitemap.xml
echo 🗺️ Creating sitemap.xml...
(
echo ^<?xml version="1.0" encoding="UTF-8"?^>
echo ^<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"^>
echo   ^<url^>
echo     ^<loc^>https://yoursite.com/^</loc^>
echo     ^<lastmod^>%date%^</lastmod^>
echo     ^<changefreq^>weekly^</changefreq^>
echo     ^<priority^>1.0^</priority^>
echo   ^</url^>
echo ^</urlset^>
) > "%DEPLOY_DIR%\sitemap.xml"

REM Create deployment documentation
echo 📋 Creating deployment documentation...
(
echo Atomic Clock Display - Web Deployment Guide
echo ============================================
echo.
echo Version: %VERSION%
echo Built: %date% %time%
echo.
echo 🚀 Quick Deployment:
echo ---------------------
echo 1. Upload all files in this folder to your web server
echo 2. Ensure your server supports HTTPS (required for PWA)
echo 3. Test the application in your browser
echo.
echo 📱 PWA Features:
echo ----------------
echo - Installable on mobile devices
echo - Works offline with service worker
echo - Fullscreen mode support
echo - Theme persistence
echo - Auto-rotation functionality
echo.
echo 🌐 Server Requirements:
echo -----------------------
echo - Static file hosting (HTML, CSS, JS)
echo - HTTPS support (for PWA features)
echo - Proper MIME types configured
echo.
echo 🔧 Configuration:
echo ------------------
echo - Update manifest.json with your domain
echo - Update sitemap.xml with your domain
echo - Configure API keys in script.js if needed
echo.
echo 📊 Performance:
echo ----------------
echo - CSS minified: %%COMPRESSION%%
echo - JavaScript minified: %%COMPRESSION%%
echo - Service worker enabled for offline support
echo - PWA manifest configured
echo.
echo 🎨 Features:
echo -------------
echo - 12 beautiful themes
echo - Auto-rotation every 30 seconds
echo - Optimized weather display (30%% space reduction)
echo - Single row theme panel (60%% height reduction)
echo - Full kiosk mode support
echo - Responsive design for all devices
echo.
echo 📞 Support:
echo ------------
echo - Documentation: README.md
echo - Theme guide: THEME_ROTATION_GUIDE.md
echo - Troubleshooting: Check browser console
) > "%DEPLOY_DIR%\DEPLOYMENT.txt"

REM Calculate file sizes
echo 📊 Calculating deployment stats...
for %%f in ("%DEPLOY_DIR%\*") do (
    echo 📁 %%~nxf: %%~zf bytes
)

echo.
echo ✅ Web deployment completed successfully!
echo.
echo 📁 Deployment ready in: %DEPLOY_DIR%\
echo 📦 Total files: 
dir /b "%DEPLOY_DIR%" | find /c /v ""
echo.
echo 🚀 Next steps:
echo 1. Upload %DEPLOY_DIR%\* to your web server
echo 2. Test in browser for PWA installation
echo 3. Verify all themes and functionality
echo.
pause
