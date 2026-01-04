# Production Backlog

## Milestone 0: Pre-production package

Status: started.

Deliverables:

- Game design document.
- World map plan.
- People and story flow.
- Animation and audio plan.
- Technical direction.
- Browser concept preview.

Exit criteria:

- First route and story premise are clear.
- Platform direction is chosen.
- First playable scope is small enough to build.

## Milestone 1: Desktop movement prototype

Goal: one human character moving through a rough valley blockout.

Tasks:

- Create Unreal C++ project.
- Add third-person character class.
- Implement walk, jog, sprint, jump, crouch.
- Add camera follow with collision.
- Add slope-aware movement.
- Add stamina and movement speed modifiers.
- Build one terrain blockout with river and hills.

Exit criteria:

- Player can move around the valley without camera or collision problems.
- Snow/winter movement can slow the character.

## Milestone 2: Interaction and physics

Goal: make the world react physically.

Tasks:

- Add interaction component.
- Add pickup, carry, push, and drop.
- Add simple rigid bodies: logs, stones, branches.
- Add bridge repair interaction.
- Add surface materials for dirt, wood, stone, grass, snow, shallow water.
- Add debug physics display.

Exit criteria:

- The Broken Crossing quest works with physical debris and repair materials.

## Milestone 3: Valley art blockout

Goal: make the prototype recognizable as the Valleybound world.

Tasks:

- Add old Kashmiri-inspired house blockout.
- Add modern house blockout.
- Add chinar tree placeholder.
- Add pine/deodar placeholder.
- Add river rocks and wooden fences.
- Add village props: wood pile, trough, baskets, hay, cart.

Exit criteria:

- A screenshot reads as a Kashmir-inspired mountain valley even with placeholder art.

## Milestone 4: Animals

Goal: first sheep and cow behavior.

Tasks:

- Add sheep actor.
- Add cow actor.
- Add idle, graze, walk, and startled states.
- Add player approach response.
- Add simple herd/follow behavior.
- Add Rafiq's Stray Sheep quest.

Exit criteria:

- Sheep can be calmly guided back to a shepherd area.

## Milestone 5: Seasons and weather

Goal: the same valley changes with the year.

Tasks:

- Add season state.
- Add material swaps/tints.
- Add autumn leaf layer.
- Add winter snow layer.
- Add rain and snow particles.
- Add wind strength by altitude.
- Add weather influence on animals and movement.

Exit criteria:

- Spring, summer, autumn, and winter are visually and mechanically distinct.

## Milestone 6: Story slice

Goal: finish the opening hour in rough form.

Tasks:

- Add Ayaan's arrival.
- Add Ghulam Nabi, Zooni, and Rafiq placeholder NPCs.
- Add dialogue system.
- Add field notebook UI.
- Add first three quests.
- Add restored family house as home base.

Exit criteria:

- A new player can complete the first route without developer guidance.

## Milestone 7: Mobile feasibility pass

Goal: prove the game can scale down to Android.

Tasks:

- Add touch movement and camera controls.
- Add low foliage density mode.
- Add lower shadow settings.
- Add simplified physics budget.
- Package Android test build.

Exit criteria:

- Prototype runs acceptably on a mid-range Android device.
