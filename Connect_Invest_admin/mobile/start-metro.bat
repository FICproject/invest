@echo off
echo ========================================================
echo  Forge Connect Admin - Starting Metro Bundler
echo ========================================================
cd /d "%~dp0"
adb reverse tcp:8081 tcp:8081
adb reverse tcp:5000 tcp:5000
npm start

