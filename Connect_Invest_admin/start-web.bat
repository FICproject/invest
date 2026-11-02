@echo off
echo ========================================================
echo  Starting Connect Invest Admin Website and Backend
echo ========================================================

start "Backend Server (Port 5000)" cmd /k "cd /d %~dp0backend && npm run start"
start "Frontend Vite (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo Servers started in separate windows!
echo Web: http://localhost:5173
echo API: http://localhost:5000

