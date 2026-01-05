# Valleybound Native Prototype

This is the first real C++ desktop prototype for Valleybound. It is not the final 3D game yet; it is a native Windows build used to prove core gameplay logic without HTML or a game engine.

## What it has

- Native Win32 window and game loop.
- Real-time input.
- Fixed 60 Hz simulation step.
- Fixed-step movement and physics.
- Pushable debris at a broken crossing.
- Bridge repair quest.
- River current that pushes the player away from unsafe water.
- Seasons with movement and visual changes.
- Day time and simple weather.
- Inventory resources used by quests.
- Gatherable wood, stone, and herbs.
- Family house roof repair after the first route.
- NPC dialogue markers.
- Sheep and cows with simple wandering behavior.
- Old and modern Kashmiri-inspired house markers.

## Controls

- WASD or arrow keys: move
- Shift: sprint
- F: interact
- F5: save
- F9: load
- 1, 2, 3, 4: switch seasons
- Escape: quit

Talk to nearby NPCs with F. Gather resources with F. Push debris by walking into it. Winter and snow slow the player, and the river current can drag the player if the bridge is not repaired.

## Build

Open a Visual Studio Developer Command Prompt in this folder and run:

```bat
build_msvc.bat
```

The executable will be written to:

```text
build\ValleyboundPrototype.exe
```

If MSVC is not available on PATH, install Visual Studio Build Tools with the C++ desktop workload or open the project from a Visual Studio Developer Command Prompt.

## CMake build

If CMake is installed:

```bat
cmake -S . -B build
cmake --build build --config Release
```

## Save data

The prototype saves to `valleybound_save.dat` in the working directory. The save currently stores player position, stamina, quest state, season, weather, time of day, bridge state, home repair state, inventory, and depleted resource nodes.

## Static preview

If the C++ compiler is not installed yet, generate a visual preview image:

```powershell
powershell -ExecutionPolicy Bypass -File tools\render_preview.ps1
```

The preview is saved to `artifacts\valleybound_native_preview.png`.
