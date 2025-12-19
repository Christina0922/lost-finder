@echo off
title LostFinder Client - Port 3000
cd /d %~dp0

echo ========================================
echo Starting LostFinder Client...
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo [ERROR] node_modules folder not found!
    echo Please run install-deps.bat first.
    echo.
    pause
    exit /b 1
)

REM Check if react-scripts exists
if not exist "node_modules\.bin\react-scripts.cmd" (
    echo [ERROR] react-scripts not found!
    echo Please run install-deps.bat first.
    echo.
    pause
    exit /b 1
)

echo [OK] Dependencies found.
echo [OK] Starting React development server...
echo.
echo The app will open at: http://localhost:3000
echo Press Ctrl+C to stop the server.
echo.
echo ========================================
echo.

call npm start

