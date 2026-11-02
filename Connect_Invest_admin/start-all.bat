@echo off
echo ======================================================================
echo   CONNECT INVEST - Launching Website, Mobile & Backend Simultaneously
echo ======================================================================

echo [1/3] Starting Backend API Server (Port 5000)...
start "Backend Server (Port 5000)" cmd /k "cd /d %~dp0backend && npm run start"

echo [2/3] Starting Web Frontend (Vite Port 5173)...
start "Web Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo [3/3] Starting Mobile Metro Bundler (Port 8081)...
start "Mobile Metro Bundler (Port 8081)" cmd /k "cd /d %~dp0mobile && adb reverse tcp:8081 tcp:8081 && adb reverse tcp:5000 tcp:5000 && npm start"

echo.
echo ======================================================================
echo   ALL SYSTEMS LIVE:
echo   - Backend API: http://localhost:5000
echo   - Web Console: http://localhost:5173
echo   - Mobile App:  Connected via Port 5000 / 10.0.2.2
echo ======================================================================
timeout /t 5 >nul
start http://localhost:5173

