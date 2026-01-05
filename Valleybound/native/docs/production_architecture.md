# Native Production Architecture

The native prototype is a gameplay laboratory for Valleybound. It is not meant to compete with Unreal for final rendering, animation, terrain, or asset workflows. Its job is to keep the core rules honest before the larger 3D build.

## Current layers

### Platform

File: `src/main.cpp`

Responsibilities:

- Win32 window.
- Input polling.
- Timing.
- Back buffer lifecycle.
- Save/load hotkeys.
- Main loop.

### Game

File: `src/game.cpp`

Responsibilities:

- Player movement.
- Stamina.
- Quest state.
- Physics interaction.
- Animal updates.
- River current.
- Weather and time.
- Temporary GDI rendering.

### World

File: `src/world.cpp`

Responsibilities:

- Prototype map population.
- Debris.
- Animals.
- Houses.
- NPC markers.
- World helper math.

### Save

File: `src/save.cpp`

Responsibilities:

- Binary save header.
- Save version.
- Player, quest, season, weather, time, bridge, home repair, inventory, and resource-node state.

## Simulation

The main loop uses a fixed 60 Hz simulation step. Rendering can happen once per frame, but gameplay math should advance at the fixed step so physics, movement, stamina, and quest-trigger behavior remain stable across faster and slower machines.

## Near-term refactor targets

The next production step is to split `game.cpp` into focused systems:

- `player.cpp`
- `physics.cpp`
- `quest.cpp`
- `weather.cpp`
- `animal.cpp`
- `renderer_gdi.cpp`
- `resources.cpp`

This should happen once the prototype gets one or two more gameplay features, not before. Splitting too early would add files without improving the design.

## Final game path

The final production game should move to Unreal C++ for:

- 3D character animation.
- Terrain and world partition.
- Physics and collision.
- Mobile/desktop packaging.
- Audio.
- Lighting and seasons.
- Asset pipeline.

The native prototype should remain useful as a compact reference for mechanics and quest logic.
