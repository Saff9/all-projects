# Unreal C++ Checklist

## Project setup

Recommended project name: Valleybound.

Settings:

- C++ project.
- Desktop target first.
- Scalable quality enabled for later mobile work.
- Starter content off unless needed for temporary materials.
- Source control ready from the start.

Plugins to consider:

- Enhanced Input.
- World Partition.
- Landmass.
- Water.
- Control Rig.
- Motion Warping.

## First C++ classes

### VCharacter

Role:

- Player movement.
- Stamina.
- Interaction ray/sphere.
- Carry state.

### VPlayerController

Role:

- Input mapping.
- Camera mode.
- Touch controls later.

### VInteractableComponent

Role:

- Shared interaction prompts.
- Quest events.
- Pickup/push/repair actions.

### VQuestSubsystem

Role:

- Track quest steps.
- Save quest state.
- Broadcast objective changes.

### VSeasonSubsystem

Role:

- Current season.
- Material parameter updates.
- Weather hooks.

### VAnimalCharacter

Role:

- Sheep/cow base class.
- Simple perception.
- State machine.
- Herd target.

### VWorldRepairActor

Role:

- Bridge, fence, roof, and shelter repair state.
- Required materials.
- Completed mesh swap.

## Input map

Desktop:

- Move.
- Look.
- Jump.
- Sprint.
- Crouch.
- Interact.
- Inventory.
- Notebook.

Mobile:

- Left virtual stick.
- Right camera drag.
- Context action button.
- Sprint toggle.
- Crouch toggle.
- Notebook button.

## First playable map

Map name: Valley_FirstRoute.

Required areas:

- Arrival path.
- Small canal or river crossing.
- Wood pile.
- Old family house.
- Shepherd meadow.
- Riverbank danger area.

## Coding standard

- Keep gameplay rules in C++.
- Keep tuning values exposed to editor.
- Use data assets for items, animals, quests, and region settings.
- Avoid hard-coded quest text in actor classes.
- Keep comments short and practical.
