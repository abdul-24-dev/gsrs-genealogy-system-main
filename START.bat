@echo off
setlocal enabledelayedexpansion
title GSRS - Genealogical Search and Record System

echo =====================================================================
echo    GENEALOGICAL SEARCH AND RECORD SYSTEM (GSRS)
echo =====================================================================
echo.

:: 1. Check if node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please run INSTALL.bat first.
    pause
    exit /b 1
)

:: 2. Check if .next directory exists
if not exist ".next" (
    echo [WARNING] Production build not found. Building application now...
    call npm run build
    if %errorlevel% neq 0 (
        echo [ERROR] Build failed.
        pause
        exit /b 1
    )
)

:: 3. Check if already running on port 3000
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
    echo [INFO] GSRS is already running on http://127.0.0.1:3000
    echo Opening browser to http://127.0.0.1:3000 ...
    start http://127.0.0.1:3000
    exit /b 0
)

:: 4. Start Next.js server
echo Starting GSRS Local Server...
echo URL: http://127.0.0.1:3000
echo.
echo Leave this window open while using the system.
echo To safely shut down, close this window or run STOP.bat.
echo.

:: Launch browser in background after server initializes
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://127.0.0.1:3000"

:: Start Next.js production server on port 3000
call npx next start -p 3000 -H 127.0.0.1
