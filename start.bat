@echo off
title SalingJaga - Dev Server
color 1F
echo.
echo  ================================================
echo    SalingJaga ^| Platform Tanggap Musibah
echo    http://localhost:5173
echo  ================================================
echo.

cd /d "%~dp0"

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Node.js tidak ditemukan di PATH.
    echo  Download dari https://nodejs.org dan install ulang.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo  [INFO] Menginstall dependensi...
    call npm install
)

echo  [INFO] Membuka browser di http://localhost:5173 ...
start "" "http://localhost:5173"

echo  [INFO] Dev server berjalan. Tekan Ctrl+C untuk stop.
echo.
call node_modules\.bin\vite.cmd
pause
