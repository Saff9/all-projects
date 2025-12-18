@echo off
title TeleVault Android APK Builder
echo ========================================================
echo       Building TeleVault Android APK
echo ========================================================
echo.
cd frontend
echo [1/3] Building Web Assets...
cmd.exe /c "npm run build"

echo.
echo [2/3] Syncing Capacitor Android Project...
cmd.exe /c "npx cap sync android"

echo.
echo [3/3] Opening Android Studio or Building Gradle...
echo To build the final APK, open Android Studio:
echo cmd.exe /c "npx cap open android"
echo Or run:
echo cd android && gradlew assembleDebug
echo.
pause
