@echo off 
echo ======================================== 
echo Atomic Clock Display - Deployment Launcher 
echo ======================================== 
echo. 
echo Select deployment option: 
echo 1. Web Application (Browser-based) 
echo 2. Local Kiosk (Standalone) 
echo 3. Windows Screen Saver 
echo 4. Open Documentation 
echo 5. Exit 
echo. 
set /p choice="Enter your choice (1-5): " 
if "%choice%"=="1" call web-application\start-web.bat 
if "%choice%"=="2" call local-kiosk\start-kiosk.bat 
if "%choice%"=="3" call windows-screen-saver\install.bat 
if "%choice%"=="4" start documentation\README.md 
if "%choice%"=="5" exit 
