@echo off
echo Stopping LostFinder Application...
echo.

echo Stopping Node.js processes...
taskkill /f /im node.exe 2>nul
taskkill /f /im npm.cmd 2>nul

echo Stopping React development server...
taskkill /f /im "react-scripts" 2>nul

echo.
echo All processes stopped.
echo Press any key to close this window...
pause > nul 