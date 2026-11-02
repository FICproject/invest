 @echo off
echo ========================================================
echo  Checking Android Crash Log for Connect Invest Admin
echo ========================================================
adb logcat -d -s AndroidRuntime:E ReactNative:E ReactNativeJS:E
echo ========================================================
pause

