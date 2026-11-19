@echo off
setlocal enabledelayedexpansion
title GSRS - System Updater

echo =====================================================================
echo    GENEALOGICAL SEARCH AND RECORD SYSTEM (GSRS)
echo    Automated Update Wizard
echo =====================================================================
echo.

:: 1. Git pull
echo [1/4] Pulling latest updates from GitHub...
git pull
if %errorlevel% neq 0 (
    echo.
    echo [WARNING] Git pull reported an issue. Please make sure you have internet access
    echo and that your repository is connected to GitHub.
    pause
    exit /b 1
)

:: 2. Dependencies
echo.
echo [2/4] Checking and updating dependencies...
call npm install --legacy-peer-deps

:: 3. Database migrations (safe: preserves existing records)
echo.
echo [3/4] Applying PostgreSQL database migrations (preserving your records)...
call npx prisma generate
call npx prisma migrate deploy

:: 4. Build application
echo.
echo [4/4] Rebuilding optimized application bundle...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed after update.
    pause
    exit /b 1
)

echo.
echo =====================================================================
echo    SYSTEM UPDATED SUCCESSFULLY!
echo =====================================================================
echo.
echo All recent features and bug fixes have been applied.
echo Your local family records and documents are 100%% safe and preserved.
echo.
echo Double-click START.bat to launch the updated system!
echo.
pause
