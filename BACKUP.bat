@echo off
title GSRS - Manual Backup Tool

echo =====================================================================
echo    GSRS LOCAL BACKUP UTILITY
echo =====================================================================
echo.
echo Packaging SQLite database, uploaded photos, and records...
echo.

npx tsx scripts/create-backup.ts
if %errorlevel% neq 0 (
    echo [ERROR] Backup creation encountered an issue.
    pause
    exit /b 1
)

echo.
echo =====================================================================
echo Backup created successfully in the "storage\backups\" folder.
echo You can copy this ZIP archive to a flash drive or another PC.
echo =====================================================================
echo.
pause
