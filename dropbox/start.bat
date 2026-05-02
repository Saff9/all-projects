@echo off
title DropBox
echo.
echo   DropBox running at http://localhost:8080
echo.
python "%~dp0server.py" %*
pause
