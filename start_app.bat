@echo off
title PrepPilot AI - 1-Click Platform Launcher
echo ==================================================================
echo   PREPPILOT AI - STUDENT PLACEMENT & INTERVIEW PLATFORM
echo ==================================================================
echo.
echo [1/3] Verifying Node.js environment...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH! Please install Node.js 18+.
    pause
    exit /b 1
)

echo [2/3] Starting PrepPilot AI Server on http://localhost:5000...
start "PrepPilot Backend (Port 5000)" cmd /k "npm run dev:server"

timeout /t 2 /nobreak >nul

echo [3/3] Launching web application in your default browser...
start http://localhost:5000

echo.
echo ==================================================================
echo   Platform is running!
echo   - Web Application: http://localhost:5000
echo   - VS Code Live Server: http://127.0.0.1:5500
echo.
echo   Demo Logins:
echo   - Student: student@preppilot.ai (password: password123)
echo   - Dean:    admin@preppilot.ai   (password: admin123)
echo ==================================================================
echo.
echo Keep this window or the background server window open while using the app.
pause
