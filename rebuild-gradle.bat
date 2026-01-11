@echo off
echo Cleaning Gradle caches and rebuilding project...
echo.

cd /d "%~dp0"

echo [1/3] Cleaning Gradle build cache...
call gradlew.bat clean

echo.
echo [2/3] Clearing .gradle and build folders...
if exist .gradle rmdir /s /q .gradle
if exist build rmdir /s /q build
if exist app\build rmdir /s /q app\build

echo.
echo [3/3] Done! Please open Android Studio and run:
echo    File ^> Sync Project with Gradle Files
echo.
pause

