@echo off
cls
echo ======================================================================
echo             CONNECT INVEST - UNIFIED MONOREPO LAUNCHER
echo ======================================================================
echo.
echo   Select which environment to launch:
echo.
echo   [1] Start Admin Ecosystem     (Unified Backend + Admin Web + Admin Mobile)
echo   [2] Start Investor Ecosystem  (Unified Backend + Investor Web + Investor Mobile)
echo   [3] Start Full Platform       (Unified Backend + Admin Web + Investor Web)
echo   [4] Start Backend Only        (Unified Backend on Port 5000)
echo   [5] Seed Database             (Reset and seed initial test accounts)
echo.
echo ======================================================================
set /p choice="Enter choice [1-5]: "

if "%choice%"=="1" (
    echo Launching Admin Ecosystem...
    cd /d "%~dp0Connect_Invest_admin"
    call start-all.bat
    exit /b
)
if "%choice%"=="2" (
    echo Launching Investor Ecosystem...
    cd /d "%~dp0investor"
    call start-all.bat
    exit /b
)
if "%choice%"=="3" (
    echo Launching Full Platform...
    start "Connect Invest Unified Backend (Port 5000)" cmd /k "cd /d %~dp0backend && npm run dev"
    start "Admin Web Console (Port 5173)" cmd /k "cd /d %~dp0Connect_Invest_admin\Admin_Website && npm run dev"
    start "Investor Web Platform (Port 5174)" cmd /k "cd /d %~dp0investor\website && npm run dev"
    timeout /t 5 >nul
    start http://localhost:5173
    start http://localhost:5174
    exit /b
)
if "%choice%"=="4" (
    echo Launching Unified Backend...
    start "Connect Invest Unified Backend (Port 5000)" cmd /k "cd /d %~dp0backend && npm run dev"
    exit /b
)
if "%choice%"=="5" (
    echo Seeding database...
    cd /d "%~dp0backend"
    node src\seeders\seedData.js
    pause
    exit /b
)

echo Invalid choice.
pause

