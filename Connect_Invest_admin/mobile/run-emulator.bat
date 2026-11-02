@echo off
echo ========================================================
echo  Forge Connect Admin - Launching on Android Emulator
echo ========================================================

echo 1. Forwarding Metro port (8081) and Backend port (5000)...
adb reverse tcp:8081 tcp:8081
adb reverse tcp:5000 tcp:5000

echo 2. Launching Android Application...
adb shell am start -n com.connectinvestadminmobile/.MainActivity

echo ========================================================
echo  App launched! Check your emulator screen.
echo ========================================================
pause

