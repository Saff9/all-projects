# Technical Design

## Direction

The target production build should use C++ because the game needs open-world streaming, physics, AI, animation, terrain, and desktop/mobile performance control.

Recommended production path:

- Unreal Engine with C++ for the main game.
- Desktop first.
- Android mobile after the core game is stable.

Reason: a fully custom C++ engine would delay gameplay for too long. Unreal gives rendering, physics, animation, landscape, foliage, packaging, and mobile export while still allowing serious C++ systems.

## Prototype path

The repository starts with:

- Human-written design docs.
- A simple browser preview for map/game-flow testing.
- C++ folders ready for later implementation.

When the engine/toolchain is available, create an Unreal C++ project inside `game/ValleyboundUE/` or a native C++ prototype under `game/src/`.

## Core systems

### Character

- Third-person movement.
- Ground detection.
- Slope handling.
- Jumping and landing.
- Stamina.
- Carry weight.
- Weather modifiers.

### Physics

- Rigid body interaction.
- Push/pull objects.
- Rolling stones and logs.
- Breakable small debris.
- Water current forces.
- Snow/ice friction changes.

### World

- Streaming terrain chunks.
- Biomes by altitude and region.
- Procedural foliage placement with hand-authored landmarks.
- Seasonal material swaps.
- Weather state per region.

### AI

- Villager schedules.
- Animal flocking.
- Predator/prey expansion later.
- NPC memory of player help.
- Route choice affected by weather and blocked paths.

### Interaction

- Context-sensitive interaction.
- Inventory.
- Field notebook.
- Crafting and repair.
- Trading.

### Save system

- Player position and inventory.
- World repairs.
- Region trust.
- Seasonal date.
- NPC state.
- Animal ownership/herd state.

## Desktop and mobile strategy

Desktop:

- Full terrain draw distance.
- Higher foliage density.
- Better shadows.
- More active physics objects.
- Keyboard, mouse, and controller.

Mobile:

- Smaller world chunks.
- Reduced foliage density.
- Lower texture resolution.
- Simplified physics for background objects.
- Touch controls.
- Aggressive LODs.

The game should be designed for both, but built desktop-first so the core systems are not weakened too early.

## Performance targets

Desktop prototype:

- 60 FPS on a mid-range gaming PC.
- Stable physics at fixed timestep.
- No major hitch when crossing chunk boundaries.

Mobile later:

- 30 FPS minimum on mid-range Android.
- 60 FPS target for higher-end phones.

## Code style

- Clear names.
- Small systems with direct responsibilities.
- Comments only where they explain decisions or non-obvious math.
- No generated-looking banners or filler comments.
- Keep gameplay data separate from engine code where possible.
