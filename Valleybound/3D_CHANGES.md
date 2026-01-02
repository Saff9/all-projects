# Wadi-e-Kashmir — 3D Architecture & Transition Log

This document records the exact changes made to transition the game from a 2D top-down perspective to a **3D third-person Action RPG** (resembling the style of *Free Fire* or *PUBG*). 

---

## 📐 Coordinate Scaling & Math Mapping

To preserve the layout and design of the original 2D levels without breaking future level prompts, we applied a **$0.1\times$ scale conversion factor** mapping pixels directly to 3D meters:

$$\text{3D Coordinate} = (\text{2D Coordinate} - \text{2D Center Offset}) \times 0.1$$

* **Level Size Conversion**: The 2D map size of $1280 \times 960$ pixels was mapped directly to a 3D ground plane of $128.0\text{m} \times 96.0\text{m}$ centered at $(0.0, 0.0, 0.0)$.
* **Coordinate Range**: 3D boundaries clamp position movements on the XZ-plane:
  * $X \in [-64.0\text{m}, 64.0\text{m}]$
  * $Z \in [-48.0\text{m}, 48.0\text{m}]$
* **Height Scale**: Standard gravity acts on the Y-axis. The floor level is set at $Y = 0.0$.

---

## 🗂️ Modified File & Node Structure Traces

### 1. Persistent Root Scene
* **Scene Path**: [GameWorld.tscn](file:///C:/Projects/OneDrive/Desktop/game/project/scenes/main/GameWorld.tscn)
* **Script Path**: [GameWorld.gd](file:///C:/Projects/OneDrive/Desktop/game/project/scripts/main/GameWorld.gd)
* **Hierarchy**:
  ```
  GameWorld (Node)
  ├── WorldContainer (Node3D)  <-- Holds 3D levels dynamically
  ├── HUD (HUD.tscn instanced child)
  └── FadeLayer (CanvasLayer)
      └── FadeRect (ColorRect)
  ```

### 2. Player Controller
* **Scene Path**: [Player.tscn](file:///C:/Projects/OneDrive/Desktop/game/project/scenes/player/Player.tscn)
* **Script Path**: [Player.gd](file:///C:/Projects/OneDrive/Desktop/game/project/scripts/player/Player.gd)
* **Hierarchy**:
  ```
  Player (CharacterBody3D) [Collision Mask: 1, Layer: 1]
  ├── CollisionShape3D (CapsuleShape3D, Radius=0.4m, Height=1.8m, feet sitting on Y=0)
  ├── PlaceholderMesh (MeshInstance3D, CapsuleMesh)
  ├── SpringArm3D (Camera pivot, y=1.5m, spring_length=3.5m)
  │   └── Camera3D (Camera3D, current=true, FOV=75.0)
  ├── HurtBox (Area3D, Layer: 4, Mask: 2)
  │   └── CollisionShape3D (CapsuleShape3D, slightly wider target)
  └── MobileControls (CanvasLayer, Layer: 2)
      ├── SprintButton (TouchScreenButton) <-- Action: "sprint"
      └── SprintLabel (Label)
  ```
* **Inputs**:
  * **Movement**: Left $40\%$ of screen controls horizontal velocity projected onto camera yaw. WASD keyboard fallback for PC testing.
  * **Camera Drag**: Right $60\%$ of screen drags adjust camera yaw/pitch (clamped pitch between $-60^\circ$ and $+30^\circ$). Keyboard arrows fallback for PC testing.

### 3. Sheep Simple Placeholder AI
* **Scene Path**: [SheepSimple.tscn](file:///C:/Projects/OneDrive/Desktop/game/project/scenes/animals/SheepSimple.tscn)
* **Script Path**: [SheepSimple.gd](file:///C:/Projects/OneDrive/Desktop/game/project/scripts/animals/SheepSimple.gd)
* **Hierarchy**:
  ```
  SheepSimple (CharacterBody3D)
  ├── CollisionShape3D (BoxShape3D, size 0.8m x 0.6m x 1.0m)
  ├── VisualMesh (MeshInstance3D, BoxMesh)
  └── WanderTimer (Timer)
  ```
* **Movement**: Wanders randomly within $10.0\text{m}$ of starting position on the 3D XZ-plane. Smoothly interpolates facing rotation.

### 4. Gulmarg Level Scene
* **Scene Path**: [Gulmarg.tscn](file:///C:/Projects/OneDrive/Desktop/game/project/scenes/world/Gulmarg.tscn)
* **Script Path**: [Gulmarg.gd](file:///C:/Projects/OneDrive/Desktop/game/project/scripts/world/Gulmarg.gd)
* **Layout Mapping Tables**:
  
  | Node | Node Type | 2D Coordinates | Scaled 3D Coordinates | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | **Ground** | `StaticBody3D` | Center: (640, 480) | `(0.0, -1.0, 0.0)` | Ground collider, size $128\times2\times96$ |
  | **Player** | `CharacterBody3D` | Spawn: (640, 300) | `(0.0, 0.1, -18.0)` | Player spawning origin |
  | **House 1** | `StaticBody3D` | (120, 180) | `(-52.0, 0.0, -30.0)` | Wooden BoxMesh obstacle |
  | **House 2** | `StaticBody3D` | (450, 140) | `(-19.0, 0.0, -34.0)` | Wooden BoxMesh obstacle |
  | **House 3** | `StaticBody3D` | (850, 160) | `(21.0, 0.0, -32.0)` | Wooden BoxMesh obstacle |
  | **House 4** | `StaticBody3D` | (1100, 250) | `(46.0, 0.0, -23.0)` | Wooden BoxMesh obstacle |
  | **House 5** | `StaticBody3D` | (180, 680) | `(-46.0, 0.0, 20.0)` | Wooden BoxMesh obstacle |
  | **Tree 1** | `StaticBody3D` | (280, 75) | `(-36.0, 0.0, -40.0)` | Trunk cylinder + sphere canopy |
  | **Tree 2** | `StaticBody3D` | (650, 65) | `(1.0, 0.0, -41.0)` | Trunk cylinder + sphere canopy |
  | **Tree 3** | `StaticBody3D` | (1000, 80) | `(36.0, 0.0, -40.0)` | Trunk cylinder + sphere canopy |
  | **Sheep 1** | `CharacterBody3D` | (560, 520) | `(-8.0, 0.0, 4.0)` | Wandering flock simple sheep |
  | **Sheep 2** | `CharacterBody3D` | (660, 490) | `(2.0, 0.0, 1.0)` | Wandering flock simple sheep |
  | **Sheep 3** | `CharacterBody3D` | (730, 555) | `(9.0, 0.0, 7.5)` | Wandering flock simple sheep |
  | **Sheep 4** | `CharacterBody3D` | (590, 610) | `(-5.0, 0.0, 13.0)` | Wandering flock simple sheep |
  | **Sheep 5** | `CharacterBody3D` | (710, 630) | `(7.0, 0.0, 15.0)` | Wandering flock simple sheep |
  | **ToSrinagar**| `Area3D` | (640, 910) | `(0.0, 1.5, 45.0)` | Exit transition Area3D |

### 5. Weather Visual Controller
* **Script Path**: [SeasonWeather.gd](file:///C:/Projects/OneDrive/Desktop/game/project/scripts/world/SeasonWeather.gd)
* **3D Adjustments**:
  * Configures `WorldEnvironment`'s `ProceduralSkyMaterial` dome colors on season changes.
  * Tweens `DirectionalLight3D` sun light color and energy level (e.g. 0.6 winter, 1.2 summer).
  * Automatically modifies the ground mesh material color (Grass turns to snow-white during winter and blizzards!).
  * Generates flat particle QuadMeshes with `BILLBOARD_PARTICLES` set on their `StandardMaterial3D` dynamically in code, allowing Rain, Leaves, and Snow to always face the camera correctly in 3D.
  * Adjusts volumetric fog density and color.

### 6. Animal AI (W2-01)
* **Base Animal Scene**: [Animal.tscn](file:///C:/Projects/OneDrive/Desktop/game/project/scenes/animals/Animal.tscn)
* **Base Animal Script**: [Animal.gd](file:///C:/Projects/OneDrive/Desktop/game/project/scripts/animals/Animal.gd)
* **Subclasses & Scenes**:
  * **Sheep**: [Sheep.gd](file:///C:/Projects/OneDrive/Desktop/game/project/scripts/animals/Sheep.gd) & [Sheep.tscn](file:///C:/Projects/OneDrive/Desktop/game/project/scenes/animals/Sheep.tscn). States: IDLE, WANDER, FOLLOW, FLEE. Interactive shearing gives wool. Max HP=30.
  * **Goat**: [Goat.gd](file:///C:/Projects/OneDrive/Desktop/game/project/scripts/animals/Goat.gd) & [Goat.tscn](file:///C:/Projects/OneDrive/Desktop/game/project/scenes/animals/Goat.tscn). Same states as Sheep but speed x 1.3, Max HP=25. Shearing gives cashmere.
  * **Cow**: [Cow.gd](file:///C:/Projects/OneDrive/Desktop/game/project/scripts/animals/Cow.gd) & [Cow.tscn](file:///C:/Projects/OneDrive/Desktop/game/project/scenes/animals/Cow.tscn). State: IDLE (stationary). Interactive milking gives milk once per day. Max HP=50.
* **Math Scales for AI states**:
  * **Wander Speed**: $2.0\text{m/s}$ (Goat: $2.6\text{m/s}$). Range: $10.0\text{m}$.
  * **Follow Speed**: $2.8\text{m/s}$ (Goat: $3.64\text{m/s}$). Min distance: $2.4\text{m}$.
  * **Flee Speed**: $5.2\text{m/s}$ (Goat: $6.76\text{m/s}$). Flee trigger range: $15.0\text{m}$ to wolves.
* **GameManager Integration**:
  * If a sheep/goat/cow dies, `decrement_flock()` is triggered, lowering `flock_count`.
  * If `flock_count` hits 0, `GameManager` emits `game_over("Your flock is lost")`, which displays a game over overlay on the HUD.
* **Gulmarg Layout Updates**:
  * The placeholder simple sheep instances in the level were replaced by $4$ active `Sheep` and $1$ active `Goat` (at spawn location `Goat_1` $(7.0, 0.0, 15.0)$).

### 7. Wolf Enemy AI (W2-02)
* **Base Wolf Scene**: [Wolf.tscn](file:///C:/Projects/OneDrive/Desktop/game/project/scenes/animals/Wolf.tscn)
* **Base Wolf Script**: [Wolf.gd](file:///C:/Projects/OneDrive/Desktop/game/project/scripts/enemies/Wolf.gd)
* **Shadow Wolf Script & Scene**: [ShadowWolf.gd](file:///C:/Projects/OneDrive/Desktop/game/project/scripts/enemies/ShadowWolf.gd) & [ShadowWolf.tscn](file:///C:/Projects/OneDrive/Desktop/game/project/scenes/animals/ShadowWolf.tscn). Boosted stats (Speed $\times 1.3$, attack dmg $\times 1.2$) and a modulated blue tint.
* **Wolf Pack Script & Scene**: [WolfPack.gd](file:///C:/Projects/OneDrive/Desktop/game/project/scripts/enemies/WolfPack.gd) & [WolfPack.tscn](file:///C:/Projects/OneDrive/Desktop/game/project/scenes/animals/WolfPack.tscn). Spawns 3 wolves as children, assigning them patrol routes forming a $12\text{m} \times 12\text{m}$ square.
* **Wolf Spawner Script & Scene**: [WolfSpawner.gd](file:///C:/Projects/OneDrive/Desktop/game/project/scripts/enemies/WolfSpawner.gd) & [WolfSpawner.tscn](file:///C:/Projects/OneDrive/Desktop/game/project/scenes/animals/WolfSpawner.tscn).
* **Math Scales & State Rules**:
  * **Patrol Speed**: $3.2\text{m/s}$. Runs patrol routes between square vertices.
  * **Hunt Speed**: $5.6\text{m/s}$ (Shadow Wolf: $7.28\text{m/s}$). Follows 3D navigation paths. If target in AttackArea ($1.6\text{m}$):
    * **Sheep Target**: Deals continuous damage ($5 \times \text{delta}$ per second).
    * **Player Target**: Deals discrete bite damage ($8.0$ HP, Shadow Wolf: $9.6$ HP) on a $1.5\text{s}$ cooldown.
  * **Flee Speed**: $7.2\text{m/s}$ (Shadow Wolf: $9.36\text{m/s}$). Moves directly away from the player (no navigation calculation) when HP falls below $20\%$ ($10.0$ HP).
* **Seasonal Spawn Timing**:
  * Spring/Summer: Spawns a new pack every $90.0\text{s}$ at a random map edge.
  * Autumn/Winter: Spawns every $45.0\text{s}$ (wolves are more active in the cold!).
  * Spawner limits: Cap at 3 active packs or 12 active wolves total in the scene.
* **Level Integration**:
  * Added `WolfSpawner` instance to `Gulmarg.tscn` to drive dynamic spawner behaviors.

### 8. Combat & Weapon System (W2-03)
* **Projectile Scene**: [Projectile.tscn](file:///C:/Projects/OneDrive/Desktop/game/project/scenes/animals/Projectile.tscn)
* **Projectile Script**: [Projectile.gd](file:///C:/Projects/OneDrive/Desktop/game/project/scripts/player/Projectile.gd)
* **Damage Number Scene**: [DamageNumber.tscn](file:///C:/Projects/OneDrive/Desktop/game/project/scenes/ui/DamageNumber.tscn)
* **Damage Number Script**: [DamageNumber.gd](file:///C:/Projects/OneDrive/Desktop/game/project/scripts/ui/DamageNumber.gd)
* **Weapons & Cooldowns**:
  * **SLINGSHOT**: Ranges up to $12.0\text{m}$ (scaled from 300px). Fires rock projectile at $16.0\text{m/s}$ (scaled from 400px/s) in facing direction. Cooldown: $0.8\text{s}$. Damage: $15.0$ HP.
  * **STAFF**: Melee sweep. Enables `AttackHitbox` (`Area3D`) for $0.2\text{s}$ (shape box $1.2\text{m} \times 0.8\text{m} \times 1.0\text{m}$, centered $1.0\text{m}$ in front of player). Cooldown: $0.6\text{s}$. Damage: $25.0$ HP + Stun $0.5\text{s}$.
  * **Weapon Switch**: Small button top-right (Q key on PC) cycles between Slingshot and Staff.
* **Dodge Roll Mechanism**:
  * Rolls player $3.2\text{m}$ (scaled from 80px) in facing direction over $0.15\text{s}$ using a position Tween.
  * Makes player invincible. Lingering invincibility lasts $0.25\text{s}$ post-roll.
  * Cooldown: $1.2\text{s}$.
* **Entity Stun Handling**:
  * Base class `Animal.gd` now supports a `stun(duration)` function. Halts velocity and processes during the stun window.
* **Visual Effects**:
  * **3D Damage Numbers**: floating `Label3D` instances rise $1.5\text{m}$ and fade out over $0.8\text{s}$ upon hit.
  * **3D Camera Shake**: Shakes the 3D viewport camera by tweening `camera_3d.h_offset` and `camera_3d.v_offset` offsets randomly between $\pm 0.25\text{m}$ upon player damage.
* **Player UI Nodes added**:
  * `AttackHitbox` added to `Player.tscn` as a child of the `PlaceholderMesh` to rotate automatically.
  * Mobile control buttons for Attack ("⚔ ATK"), Switch ("🔄 SW"), and Roll ("⟳ ROLL") added to `MobileControls` CanvasLayer.

### 9. NPC & Dialogue System (W2-04)
* **Base NPC Scene**: [NPC.tscn](file:///C:/Projects/OneDrive/Desktop/game/project/scenes/animals/NPC.tscn)
* **Base NPC Script**: [NPC.gd](file:///C:/Projects/OneDrive/Desktop/game/project/scripts/npcs/NPC.gd)
* **Dialogue Box Scene**: [DialogueBox.tscn](file:///C:/Projects/OneDrive/Desktop/game/project/scenes/ui/DialogueBox.tscn)
* **Dialogue Box Script**: [DialogueBox.gd](file:///C:/Projects/OneDrive/Desktop/game/project/scripts/ui/DialogueBox.gd)
* **NPC Subclasses**:
  * **Dadi Zoona**: [DadiZoona.gd](file:///C:/Projects/OneDrive/Desktop/game/project/scripts/npcs/DadiZoona.gd) & [DadiZoona.tscn](file:///C:/Projects/OneDrive/Desktop/game/project/scenes/animals/DadiZoona.tscn). Modulated soft pink. Sets up quest dialogues.
  * **Mushtaq Bhai**: [MushtaqBhai.gd](file:///C:/Projects/OneDrive/Desktop/game/project/scripts/npcs/MushtaqBhai.gd) & [MushtaqBhai.tscn](file:///C:/Projects/OneDrive/Desktop/game/project/scenes/animals/MushtaqBhai.tscn). Modulated teal. Stub dialogues about trade.
  * **Baba Noor**: [BabaNoor.gd](file:///C:/Projects/OneDrive/Desktop/game/project/scripts/npcs/BabaNoor.gd) & [BabaNoor.tscn](file:///C:/Projects/OneDrive/Desktop/game/project/scenes/animals/BabaNoor.tscn). Modulated orange-brown. Stub lore dialogues.
* **3D Visual Indicators**:
  * **3D Quest Marker**: Uses a `Label3D` exclamation mark ("!") above the NPC's head ($y = 2.0\text{m}$) billboarded to face the camera.
  * **AnimationPlayer**: Drives a vertical bobbing translation loop ($y \in [0.0\text{m}, 0.3\text{m}]$) to catch the player's eye.
  * **Auto Visibility**: Dynamically toggles quest marker visibility based on whether the NPC has an active quest from `QuestManager` or its base `has_quest` boolean.
* **Interaction Mechanic**:
  * NPC detects player entering the `InteractZone` (`Area3D` sphere of radius $3.2\text{m}$, scaled from 80px).
  * If in range, pressing the **Interact** key (`E` on PC or programmatically) halts player physics processing and transitions the camera focus into dialogue mode.
* **Dialogue Interface**:
  * Persistent global instance of `DialogueBox` added as a child of the `HUD.tscn` overlay.
  * Emits typewriter bbcode lines (at $40\text{ characters/s}$). Tap to skip typing, tap again to advance lines.
  * Automatically pauses player inputs during conversation and restores physics processing on dialogue completion.
* **Level Integration**:
  * Placed `DadiZoona` instance near her house in `Gulmarg.tscn` at scaled coordinates `(-43.0, 0.1, 23.0)`.




