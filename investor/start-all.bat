@echo off
echo ======================================================================
echo   CONNECT INVEST - Launching Investor Platform, Mobile & Backend
echo ======================================================================

echo [1/3] Starting Unified Backend API Server (Port 5000)...
start "Connect Invest Unified Backend (Port 5000)" cmd /k "cd /d %~dp0..\backend && npm run dev"

echo [2/3] Starting Investor Web Platform (Port 5174)...
start "Investor Web Platform (Port 5174)" cmd /k "cd /d %~dp0website && npm run dev"

echo [3/3] Starting Investor Mobile Metro Bundler (Port 8081)...
start "Investor Mobile Metro Bundler (Port 8081)" cmd /k "cd /d %~dp0mobile && adb reverse tcp:8081 tcp:8081 && adb reverse tcp:5000 tcp:5000 && npm start"

echo.
echo ======================================================================
echo   ALL SYSTEMS LIVE:
echo   - Unified Backend API:  http://localhost:5000
echo   - Investor Web Portal:  http://localhost:5174
echo   - Mobile App Bundler:   Connected via Port 5000 / 8081
echo ======================================================================
timeout /t 5 >nul
start http://localhost:5174
