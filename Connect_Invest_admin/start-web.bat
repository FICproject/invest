@echo off
echo ========================================================
echo   Starting Connect Invest Admin Website & Unified Backend
echo ========================================================

start "Connect Invest Unified Backend (Port 5000)" cmd /k "cd /d %~dp0..\backend && npm run dev"
start "Admin Web Console (Port 5173)" cmd /k "cd /d %~dp0Admin_Website && npm run dev"

echo Servers started in separate windows!
echo Web: http://localhost:5173
echo API: http://localhost:5000
