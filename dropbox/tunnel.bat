@echo off
title DropBox Tunnel
"%~dp0cloudflared.exe" tunnel --url http://localhost:8080
pause
