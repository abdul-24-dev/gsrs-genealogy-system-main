@echo off
title GSRS - Auto-Seed Test Users & Data

echo =====================================================================
echo    SEEDING GSRS USER ACCOUNTS & DEMO HERITAGE DATA
echo =====================================================================
echo.

node scripts/seed-users.js
if %errorlevel% neq 0 (
    echo [ERROR] Seeding failed.
    pause
    exit /b 1
)

echo.
echo Accounts are ready for testing!
echo.
pause
