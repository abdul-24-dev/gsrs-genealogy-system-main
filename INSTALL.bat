@echo off
setlocal enabledelayedexpansion
title GSRS - Setup and Installation

echo =====================================================================
echo    GENEALOGICAL SEARCH AND RECORD SYSTEM (GSRS)
echo    Automated Local Installation Wizard
echo =====================================================================
echo.

:: 1. Check Node.js
echo [1/6] Checking Node.js environment...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Node.js is NOT installed on this computer!
    echo.
    echo GSRS requires Node.js version 18.x or 20.x or higher to run.
    echo Please follow these simple steps:
    echo   1. Visit: https://nodejs.org
    echo   2. Download the LTS Long Term Support installer for Windows.
    echo   3. Run the installer and finish setup.
    echo   4. Re-run this INSTALL.bat script.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VERSION=%%v
echo [OK] Node.js is detected: !NODE_VERSION!
echo.

:: 2. Check and prepare .env file
echo [2/6] Configuring local environment...
if not exist ".env" (
    echo Copying .env.example to .env ...
    copy .env.example .env >nul
)
echo [OK] Environment configured.
echo.

:: 3. Prepare storage directories
echo [3/6] Initializing local storage directories...
if not exist "storage" mkdir storage
if not exist "storage\uploads" mkdir "storage\uploads"
if not exist "storage\backups" mkdir "storage\backups"
echo [OK] Storage directories ready.
echo.

:: 4. Install dependencies
echo [4/6] Installing application packages (this may take 1-3 minutes)...
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies. Check your internet connection and try again.
    pause
    exit /b 1
)
echo [OK] Dependencies installed successfully.
echo.

:: 5. Generate Prisma Client and Push Database Schema
echo [5/6] Setting up SQLite database and running migrations...
call npx prisma generate
call npx prisma db push
if %errorlevel% neq 0 (
    echo [ERROR] Database initialization failed.
    pause
    exit /b 1
)
echo [OK] Database schema initialized.
echo.

:: 6. Build production Next.js application
echo [6/6] Building production Next.js application bundle...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Production build failed.
    pause
    exit /b 1
)
echo.
echo =====================================================================
echo    INSTALLATION COMPLETE!
echo =====================================================================
echo.
echo GSRS has been successfully installed on this computer.
echo.
echo To start the system:
echo   Double-click START.bat
echo.
echo A fresh, independent database has been configured.
echo When you start for the first time, you will create your
echo master administrator account via the First-Time Setup Wizard.
echo.
pause
