@echo off 
echo Starting Atomic Clock Display Kiosk Mode... 
cd /d "%~dp0" 
start "" "http://localhost:8080" 
python ..\server-files\server.py 
pause 
