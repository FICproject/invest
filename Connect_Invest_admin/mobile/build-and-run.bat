@echo off
echo ========================================================
echo  Cleaning build and launching Connect Invest Admin...
echo ========================================================
cd /d "%~dp0"

echo 1. Removing stale SVG artifacts...
if exist "node_modules\react-native-svg" rmdir /s /q "node_modules\react-native-svg"

echo 2. Bundling clean JavaScript bundle into APK...
if not exist "android\app\src\main\assets" mkdir "android\app\src\main\assets"
call npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android\app\src\main\assets\index.android.bundle --assets-dest android\app\src\main\res

echo 3. Building and installing APK...
cd android
call gradlew.bat app:installDebug --no-daemon

echo 4. Launching on emulator...
adb shell am start -n com.connectinvestadminmobile/.MainActivity

echo ========================================================
echo  APP STARTED!
echo ========================================================
pause
