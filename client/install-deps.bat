@echo off
title LostFinder Client - Install Dependencies
echo ========================================
echo Installing client dependencies...
echo ========================================
cd /d %~dp0

echo.
echo Step 1: Removing old node_modules (if exists)...
if exist node_modules (
    echo Removing node_modules folder...
    rmdir /s /q node_modules
)

echo.
echo Step 2: Configuring npm to use copy instead of symlinks...
call npm config set fund false
call npm config set audit false

echo Step 3: Installing dependencies with --legacy-peer-deps...
echo Installing: i18next, react-i18next, date-fns, react-helmet-async...
call npm install i18next react-i18next i18next-browser-languagedetector i18next-http-backend date-fns react-helmet-async --legacy-peer-deps --save
echo.
echo Installing all other dependencies...
call npm install --legacy-peer-deps --no-optional

echo.
echo Step 4: Verifying react-scripts installation...
if exist "node_modules\.bin\react-scripts.cmd" (
    echo [SUCCESS] react-scripts is installed!
) else (
    echo [ERROR] react-scripts is NOT installed!
    echo Trying to install react-scripts directly...
    call npm install react-scripts@5.0.1 --legacy-peer-deps --save --no-optional
)

echo.
echo ========================================
echo Installation complete!
echo ========================================
echo.
echo You can now run: npm start
echo Or double-click: start-client.bat
echo.
pause

