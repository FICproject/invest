@echo off
echo ======================================================================
echo   CONNECT INVEST - Launching Unified Backend, Web & Mobile
echo ======================================================================

echo [1/3] Starting Unified Backend API Server (Port 5000)...
start "Connect Invest Unified Backend (Port 5000)" cmd /k "cd /d %~dp0..\backend && npm run dev"

echo [2/3] Starting Admin Web Console (Port 5173)...
start "Admin Web Console (Port 5173)" cmd /k "cd /d %~dp0Admin_Website && npm run dev"

echo [3/3] Starting Mobile Metro Bundler (Port 8081)...
start "Mobile Metro Bundler (Port 8081)" cmd /k "cd /d %~dp0mobile && adb reverse tcp:8081 tcp:8081 && adb reverse tcp:5000 tcp:5000 && npm start"

echo.
echo ======================================================================
echo   ALL SYSTEMS LIVE:
echo   - Unified Backend: http://localhost:5000
echo   - Admin Web Console: http://localhost:5173
echo   - Mobile App: Connected via Port 5000
echo ======================================================================
timeout /t 5 >nul
start http://localhost:5173
