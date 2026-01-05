# QA Plan

## Build verification

Run from `game/native`:

```bat
build_msvc.bat
```

or:

```bat
cmake -S . -B build
cmake --build build --config Release
```

Expected result:

- `ValleyboundPrototype.exe` is created.
- Launch opens a 1280 by 800 native Windows window.
- Escape exits cleanly and writes `valleybound_save.dat`.

## Gameplay smoke test

1. Start a fresh save.
2. Move with WASD.
3. Sprint with Shift and confirm stamina drains.
4. Press 1, 2, 3, 4 and confirm seasons change.
5. Press F near Ghulam Nabi and confirm dialogue.
6. Inspect the broken crossing.
7. Gather wood.
8. Push debris away from the crossing.
9. Repair the bridge.
10. Enter the river before repair and confirm current pushes the player.
11. Visit the family house.
12. Interact with the stray sheep.
13. Gather wood and herbs.
14. Repair the family roof.
15. Press F5, move away, press F9, and confirm save/load restores state.

## Known limitations

- Rendering is temporary GDI debug art, not final game graphics.
- The prototype is 2D top-down for systems testing.
- Audio is limited to Windows message beeps.
- Animals have simple wander/scare behavior only.
- Save files are versioned but not migrated between incompatible versions.

## Preview image

Run:

```powershell
powershell -ExecutionPolicy Bypass -File tools\render_preview.ps1
```

This creates `artifacts\valleybound_native_preview.png`.
