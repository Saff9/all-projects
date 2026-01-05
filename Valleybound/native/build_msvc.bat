@echo off
setlocal

if not exist build mkdir build

cl /std:c++17 /EHsc /O2 /W4 /permissive- /DUNICODE /D_UNICODE ^
  src\main.cpp src\game.cpp src\world.cpp src\save.cpp ^
  /Fe:build\ValleyboundPrototype.exe ^
  user32.lib gdi32.lib

if errorlevel 1 (
  echo Build failed.
  exit /b 1
)

echo Built build\ValleyboundPrototype.exe
