# Animation and Audio Plan

## Animation principles

Animation should be grounded and readable. The player must feel foot placement, weight, slope, cold, fatigue, and carrying load.

No movement should feel like a floating camera. Even the prototype should aim for believable acceleration, deceleration, and turning.

## Player animation set

Prototype:

- Idle.
- Walk.
- Jog.
- Sprint.
- Jump start.
- Falling.
- Landing.
- Crouch idle.
- Crouch walk.
- Interact/pickup.
- Push/pull.

Full game:

- Climb low ledge.
- Climb steep rock.
- Swim.
- Wade through river.
- Carry light item.
- Carry heavy beam.
- Use axe.
- Use rope.
- Warm hands near fire.
- Slip on ice.
- Recover from stumble.

## Animal animation set

Sheep:

- Idle graze.
- Walk.
- Trot.
- Startled hop.
- Follow herd.
- Sleep/rest.

Cow:

- Idle.
- Graze.
- Slow walk.
- Turn.
- React to player.

Dog later:

- Follow.
- Bark.
- Sit.
- Track scent.

## NPC animation set

Prototype:

- Idle.
- Talk.
- Walk.
- Sit.
- Carry bundle.

Full game:

- Chop wood.
- Repair wall.
- Cook.
- Pray/reflect.
- Trade at stall.
- Lead animal.
- Clear snow.
- Fish.

## Audio principles

The game should sound like a living valley, not a music track with some effects on top.

Important layers:

- Wind changes by altitude.
- River sound changes by distance and speed.
- Snow muffles footstep detail.
- Autumn leaves crunch underfoot.
- Chinar leaves rustle differently from pine forest.
- Villages have soft human activity, tools, animals, and distant voices.

## Sound categories

Player:

- Footsteps by surface: dirt, grass, stone, snow, wood, shallow water.
- Cloth movement.
- Breathing by stamina and altitude.
- Jump, land, slide, climb, pickup.

World:

- Wind.
- River.
- Rain.
- Snowfall ambience.
- Thunder.
- Trees.
- Market murmur.
- Distant bells.

Animals:

- Sheep bleats.
- Cow lowing.
- Hooves on dirt.
- Birds.
- Dogs later.

Music:

- Minimal and location-aware.
- Use soft acoustic textures and regional inspiration carefully.
- Music should leave space for wind, river, and footsteps.

## Implementation notes

Use placeholder sounds in the prototype, then replace with recorded or licensed audio. Do not bake timing assumptions into gameplay code; animation and audio should be data-driven through events.
