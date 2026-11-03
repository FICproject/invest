@echo off
echo ========================================================
echo   Starting Connect Invest Investor Website & Backend
echo ========================================================

start "Connect Invest Unified Backend (Port 5000)" cmd /k "cd /d %~dp0..\backend && npm run dev"
start "Investor Web Platform (Port 5174)" cmd /k "cd /d %~dp0website && npm run dev"

echo Servers started in separate windows!
echo Web Portal: http://localhost:5174
echo API Server: http://localhost:5000
timeout /t 5 >nul
start http://localhost:5174
