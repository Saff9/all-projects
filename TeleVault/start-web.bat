@echo off
title TeleVault Server Launcher
echo ========================================================
echo       TeleVault - Zero-Knowledge Telegram Cloud Drive
echo ========================================================
echo.
echo [1/2] Starting Python FastAPI Backend Engine on http://127.0.0.1:8000 ...
start "TeleVault Backend Engine" cmd /k "cd /d ""%~dp0backend"" && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Starting React Vite Frontend on http://localhost:5173 ...
cd /d "%~dp0frontend"
npm run dev
