@echo off
setlocal enabledelayedexpansion
title GSRS - Stop System

echo =====================================================================
echo    STOPPING GENEALOGICAL SEARCH AND RECORD SYSTEM (GSRS)
echo =====================================================================
echo.

set FOUND=0

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    set PID=%%a
    if defined PID (
        set FOUND=1
        echo Stopping GSRS server process on PID !PID!...
        taskkill /F /PID !PID! >nul 2>nul
        echo [OK] GSRS server process stopped.
    )
)

if "!FOUND!"=="0" (
    echo [INFO] No running GSRS server found on port 3000.
)

echo.
echo Application safely stopped. Database remains preserved.
echo.
timeout /t 2 >nul
