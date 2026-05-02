@echo off
title DropBox Server + Tunnel
start /min cmd /c "python "%~dp0server.py""
timeout /t 3 >nul
"%~dp0cloudflared.exe" tunnel --url http://localhost:8080
