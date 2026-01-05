# First Playable Prototype

## Goal

Build a small but honest playable slice of Valleybound.

The prototype should answer these questions:

- Does movement feel grounded?
- Does the valley layout invite exploration?
- Do houses, animals, and seasons create the right mood?
- Is the first quest understandable without heavy UI?
- Can the project scale into desktop and mobile builds?

## Prototype content

Map:

- One compact valley.
- Lake edge.
- Small village.
- Orchard field.
- River crossing.
- Meadow.
- Mountain pass entrance.

Player:

- Third-person character.
- Walk, run, jump.
- Camera follow.
- Basic interaction.

World:

- Chinar trees.
- Pine trees.
- Old and modern houses.
- Sheep and cows.
- Daylight and seasonal color.

Physics:

- Gravity.
- Terrain collision.
- Pushable branches/logs.
- Simple bridge repair.

Quest:

- The Broken Crossing.
- Clear debris.
- Collect wood.
- Repair bridge.
- Reach family house.

## Current browser concept preview

The browser preview is a top-down concept map, not the final game. It is useful for early decisions:

- Map zone placement.
- Seasonal mood.
- First interactions.
- Animal and house density.

## C++/Unreal implementation sequence

1. Create Unreal C++ project.
2. Add landscape blockout.
3. Add third-person character controller.
4. Add interaction component.
5. Add seasonal material parameter collection.
6. Add placeholder houses and trees.
7. Add simple animal actors.
8. Add first quest state machine.
9. Package desktop preview.
10. Start Android performance pass.
