# Wadi-e-Kashmir — Godot 4.3 Technical Reference

> **Purpose:** This file prevents hallucinations during AI-assisted development.
> Before generating any code, verify every node name, method, and property against this file.

---

## ✅ Correct Godot 4.3 Node Names

### Physics & Collision
```
CharacterBody3D        ← Player, NPCs, Animals  (NOT KinematicBody2D — Godot 3!)
RigidBody3D            ← Boulders, physics objects
StaticBody3D           ← Houses, trees, walls
Area3D                 ← Detection zones, item pickups, hitboxes
CollisionShape3D       ← Attach to all physics bodies
CollisionPolygon3D     ← For complex shapes
```

### Rendering & Sprites
```
Sprite3D               ← Static images
AnimatedSprite3D       ← Animated characters (4-directional movement)
GPUParticles3D         ← Snow, leaves, rain (NOT Particles2D!)
CanvasModulate         ← Full-screen color overlay (season ground tint)
PointLight3D           ← Glowing effects (crystals, wolf eyes)
Light3D                ← Ambient lighting
LightOccluder3D        ← Fog of war (Budgam forest)
```

### Tilemaps
```
TileMap                ← World tiles (Godot 4 uses single TileMap with layers)
TileMapLayer           ← Available in Godot 4.3+ as alternative
TileSet                ← Tile definitions resource
```

### UI Nodes
```
Control                ← Base UI node
CanvasLayer            ← HUD overlay (layer = 1 or higher)
Label                  ← Text display
RichTextLabel          ← BBCode text (for Urdu RTL)
Button                 ← Clickable button
TextureButton          ← Image button
ProgressBar            ← Health/hunger/cold bars
HBoxContainer          ← Horizontal layout
VBoxContainer          ← Vertical layout
GridContainer          ← Inventory grid
PanelContainer         ← Styled panel background
MarginContainer        ← Add padding
TouchScreenButton      ← Mobile virtual buttons
```

### Navigation & Movement
```
NavigationAgent2D      ← Enemy pathfinding (NOT NavigationServer — use the node)
NavigationRegion2D     ← Walkable area definition
```

### Audio
```
AudioStreamPlayer      ← Non-positional (music, global SFX)
AudioStreamPlayer3D    ← Positional audio (in-world sounds)
AudioBus               ← Configured in AudioBusLayout, NOT a node
```

### Camera
```
Camera3D               ← Player camera with smoothing
```

### Timers & Tweens
```
Timer                  ← Countdown timer node
Tween                  ← Animation tweening (created via create_tween())
```

---

## ✅ Correct Godot 4.3 GDScript API

### CharacterBody2D Movement
```gdscript
# CORRECT Godot 4 way:
func _physics_process(delta: float) -> void:
    velocity = direction * speed
    move_and_slide()
    # move_and_slide() takes NO arguments in Godot 4!
    # In Godot 3 it was: move_and_slide(velocity, Vector2.UP)
```

### Input (Mobile Touch)
```gdscript
# Touch input detection:
func _input(event: InputEvent) -> void:
    if event is InputEventScreenTouch:
        var touch_pos = event.position
        if event.pressed:
            pass  # finger down
        else:
            pass  # finger up
    
    if event is InputEventScreenDrag:
        var drag_pos = event.position

# Action-based input (works on mobile with TouchScreenButton):
if Input.is_action_pressed("move_right"):
    pass
if Input.is_action_just_pressed("attack"):
    pass
```

### Signals (Godot 4 syntax)
```gdscript
# Declare signal:
signal health_changed(new_health: float)

# Emit signal:
health_changed.emit(player_health)

# Connect signal (in _ready):
some_node.health_changed.connect(_on_health_changed)

# Connect with Callable:
timer.timeout.connect(func(): print("done"))
```

### Scene Loading
```gdscript
# Load scene:
var scene = load("res://scenes/world/Srinagar.tscn")
var instance = scene.instantiate()
get_tree().root.add_child(instance)

# Change scene (better for transitions):
get_tree().change_scene_to_file("res://scenes/world/Srinagar.tscn")

# With ResourceLoader for async:
ResourceLoader.load_threaded_request("res://scenes/world/Srinagar.tscn")
```

### Autoloads / Singletons
```gdscript
# Access autoload from any script:
GameManager.current_season
GameManager.player_health
QuestManager.complete_quest("QUEST_01")
AudioManager.play_music("combat")
InventoryManager.add_item("wool", 1)
SaveManager.save_game()
```

### Tween (Godot 4 way)
```gdscript
# CORRECT Godot 4 tween:
var tween = create_tween()
tween.tween_property(health_bar, "value", new_value, 0.3)

# Chained:
var tween = create_tween()
tween.tween_property(label, "modulate:a", 0.0, 1.0)
tween.tween_callback(label.queue_free)
```

### GPUParticles2D
```gdscript
# Enable/disable particles:
$SnowParticles.emitting = true
$SnowParticles.emitting = false

# One-shot burst:
$LeafBurst.one_shot = true
$LeafBurst.restart()
```

### Timer
```gdscript
# In _ready():
var timer = Timer.new()
add_child(timer)
timer.wait_time = 3.0
timer.one_shot = true
timer.timeout.connect(_on_timer_done)
timer.start()

# Or use $Timer node in scene with autostart
```

### AnimatedSprite2D
```gdscript
$AnimatedSprite2D.play("walk_down")
$AnimatedSprite2D.play("idle")
$AnimatedSprite2D.flip_h = true   # Mirror horizontally
$AnimatedSprite2D.stop()

# Animation names for player (must match SpriteFrames resource):
# "idle", "walk_up", "walk_down", "walk_left", "walk_right"
# "attack_sling", "attack_staff", "dodge_roll", "hurt", "death"
```

### NavigationAgent2D
```gdscript
# Setup:
@onready var nav_agent = $NavigationAgent2D

func _ready() -> void:
    nav_agent.max_speed = 140.0
    nav_agent.path_desired_distance = 4.0
    nav_agent.target_desired_distance = 4.0

func set_target(target_pos: Vector2) -> void:
    nav_agent.target_position = target_pos

func _physics_process(delta: float) -> void:
    if nav_agent.is_navigation_finished():
        return
    var next_pos = nav_agent.get_next_path_position()
    var direction = (next_pos - global_position).normalized()
    velocity = direction * speed
    move_and_slide()
```

### File Save/Load (Godot 4)
```gdscript
# Save JSON:
func save_game() -> void:
    var data = {"health": 100.0, "day": 5}
    var file = FileAccess.open("user://savegame.json", FileAccess.WRITE)
    file.store_string(JSON.stringify(data))
    file.close()

# Load JSON:
func load_game() -> Dictionary:
    if not FileAccess.file_exists("user://savegame.json"):
        return {}
    var file = FileAccess.open("user://savegame.json", FileAccess.READ)
    var data = JSON.parse_string(file.get_as_text())
    file.close()
    return data
```

### Screen Shake (Camera2D)
```gdscript
func shake(duration: float, intensity: float) -> void:
    var tween = create_tween()
    var elapsed = 0.0
    while elapsed < duration:
        var offset = Vector2(
            randf_range(-intensity, intensity),
            randf_range(-intensity, intensity)
        )
        $Camera2D.offset = offset
        await get_tree().create_timer(0.05).timeout
        elapsed += 0.05
    $Camera2D.offset = Vector2.ZERO
```

### Object Pooling Pattern
```gdscript
# Pool manager example:
var wolf_pool: Array[Node] = []
var pool_size: int = 8

func _ready() -> void:
    for i in pool_size:
        var wolf = WOLF_SCENE.instantiate()
        wolf.visible = false
        wolf.set_process(false)
        wolf.set_physics_process(false)
        add_child(wolf)
        wolf_pool.append(wolf)

func get_wolf() -> Node:
    for wolf in wolf_pool:
        if not wolf.visible:
            wolf.visible = true
            wolf.set_process(true)
            wolf.set_physics_process(true)
            return wolf
    return null  # Pool exhausted

func return_wolf(wolf: Node) -> void:
    wolf.visible = false
    wolf.set_process(false)
    wolf.set_physics_process(false)
    wolf.global_position = Vector2(-9999, -9999)
```

---

## ❌ Common Godot 3 → 4 Mistakes to AVOID

| ❌ Godot 3 (WRONG) | ✅ Godot 4 (CORRECT) |
|---------------------|----------------------|
| `KinematicBody2D` | `CharacterBody2D` |
| `move_and_slide(velocity)` | `velocity = v; move_and_slide()` |
| `connect("signal", self, "_on_signal")` | `signal_name.connect(_on_signal)` |
| `yield(timer, "timeout")` | `await timer.timeout` |
| `$Node.disconnect("signal", self, "_on")` | `signal_name.disconnect(_on)` |
| `.instance()` | `.instantiate()` |
| `OS.get_ticks_msec()` | `Time.get_ticks_msec()` |
| `Particles2D` | `GPUParticles2D` |
| `PoolStringArray` | `PackedStringArray` |
| `PoolVector2Array` | `PackedVector2Array` |
| `rand_range(a, b)` | `randf_range(a, b)` |
| `randomize()` needed | Auto-randomized in Godot 4 |
| `File.new()` | `FileAccess.open()` |
| `Directory.new()` | `DirAccess.open()` |
| `export var` | `@export var` |
| `onready var` | `@onready var` |
| `Spatial` | `Node3D` |
| `VisibilityNotifier2D` | `VisibleOnScreenNotifier2D` |
| `Navigation2D` | `NavigationRegion2D` |

---

## 📐 Scene Node Hierarchies (Reference)

### Player.tscn
```
Player (CharacterBody2D)
├── CollisionShape2D          ← CapsuleShape2D or RectangleShape2D
├── AnimatedSprite2D          ← All animations
├── Camera2D                  ← position_smoothing_enabled=true
├── InteractArea (Area2D)     ← For NPC/item interaction (80px radius)
│   └── CollisionShape2D
├── AttackHitbox (Area2D)     ← Melee weapon hitbox
│   └── CollisionShape2D
├── HurtBox (Area2D)          ← Takes damage from enemies
│   └── CollisionShape2D
└── AudioStreamPlayer2D       ← Footstep sounds
```

### Wolf.tscn
```
Wolf (CharacterBody2D)
├── CollisionShape2D
├── AnimatedSprite2D
├── NavigationAgent2D
├── DetectionArea (Area2D)    ← 300px radius — detects sheep
│   └── CollisionShape2D
├── AttackArea (Area2D)       ← 40px radius — deals damage
│   └── CollisionShape2D
├── HealthComponent           ← hp=50
├── StateLabel (Label)        ← Debug: shows current state (hide in release)
└── AudioStreamPlayer2D
```

### HUD.tscn
```
HUD (CanvasLayer)             ← layer=1
└── MarginContainer
    ├── TopBar (HBoxContainer)
    │   ├── BarsGroup (VBoxContainer)
    │   │   ├── HealthBar (ProgressBar)
    │   │   ├── HungerBar (ProgressBar)
    │   │   └── ColdBar (ProgressBar)
    │   ├── SeasonLabel (Label)       ← "Spring — Day 3"
    │   └── MiniMap (TextureRect)
    └── BottomBar (CanvasLayer)
        ├── Joystick (TextureRect)    ← Custom virtual joystick
        └── ActionButtons (HBoxContainer)
            ├── AttackButton (TouchScreenButton)
            ├── InteractButton (TouchScreenButton)
            ├── RollButton (TouchScreenButton)
            └── SpecialButton (TouchScreenButton)
```

### NPC.tscn
```
NPC (CharacterBody2D)
├── CollisionShape2D
├── Sprite2D                  ← or AnimatedSprite2D
├── InteractZone (Area2D)     ← 80px radius
│   └── CollisionShape2D
├── QuestMarker (Sprite2D)    ← "!" sprite, shown when has quest
│   └── AnimationPlayer       ← Float up/down animation
└── AudioStreamPlayer2D
```

### DialogueBox.tscn
```
DialogueBox (CanvasLayer)     ← layer=5 (above HUD)
└── Panel
    ├── Portrait (TextureRect)
    ├── NPCName (Label)
    ├── DialogueText (RichTextLabel)  ← bbcode_enabled=true
    └── TapPrompt (Label)            ← "Tap to continue..."
```

---

## 🔢 Game Constants Reference

### Survival Drain Rates (per second)
```
hunger_drain_normal     = 0.5
hunger_drain_running    = 0.8
cold_drain_spring       = 0.1
cold_drain_summer       = 0.05
cold_drain_autumn       = 0.3
cold_drain_winter       = 1.0
cold_drain_blizzard     = 5.0
cold_drain_pheran_mult  = 0.5    # 50% reduction with Pheran
cold_drain_wpheran_mult = 0.2    # 80% reduction with Warrior Pheran
health_drain_no_food    = 1.0    # When hunger=0
health_drain_no_warmth  = 2.0    # When cold=0
```

### Movement Speeds (pixels/sec)
```
player_walk_speed       = 120.0
player_sprint_speed     = 200.0
player_blizzard_speed   = 60.0   # 50% of walk
player_ice_speed        = 80.0   # On ice tiles in Pahalgam
wolf_patrol_speed       = 80.0
wolf_hunt_speed         = 140.0
wolf_flee_speed         = 180.0
shadow_wolf_speed_mult  = 1.3    # 30% faster than normal wolf
sheep_wander_speed      = 50.0
sheep_flee_speed        = 130.0
sheep_follow_speed      = 70.0
horse_speed             = 280.0
```

### Combat Values
```
slingshot_damage        = 15.0
slingshot_range         = 300.0
slingshot_speed         = 400.0
slingshot_cooldown      = 0.8
staff_damage            = 25.0
staff_stun_duration     = 0.5
staff_cooldown          = 0.6
sword_damage            = 40.0
sword_cooldown          = 0.5
enchanted_blade_dmg     = 60.0
dodge_roll_distance     = 80.0
dodge_invincibility     = 0.4
dodge_cooldown          = 1.2
wolf_damage_per_hit     = 8.0
wolf_damage_sheep_sec   = 5.0    # Damage/sec to sheep
wolf_health             = 50.0
wolf_attack_range       = 40.0
wolf_flee_hp_pct        = 0.2    # Flee at 20% health
shaman_health           = 300.0
shaman_phase2_hp        = 200.0
shaman_phase3_hp        = 100.0
```

### Spawn Timers
```
wolf_spawn_spring_summer = 90.0  # seconds
wolf_spawn_autumn_winter = 45.0  # seconds
wolf_pack_size_min       = 2
wolf_pack_size_max       = 4
wolf_max_active_packs    = 3
wolf_max_active_total    = 12    # Performance cap
```

### Detection Radii (pixels)
```
sheep_follow_radius      = 200.0
sheep_flee_radius        = 150.0
wolf_sheep_detection     = 300.0
wolf_player_detection    = 150.0
npc_interact_radius      = 80.0
item_pickup_radius       = 30.0  # Auto-collect
blizzard_visibility      = 200.0 # Circular mask radius
```

### Season / Day Timer
```
day_duration_seconds     = 60.0  # 1 real minute = 1 in-game day (for testing)
                                  # Adjust to 600.0 (10min) for production
season_duration_days     = 7     # 7 days per season
autosave_interval_days   = 3     # Auto-save every 3 in-game days
```

---

## 🎬 Events & Triggers Reference

### Avalanche (Gulmarg, Day 22+, Winter)
```
Trigger:    Player enters Gulmarg scene AND current_day >= 22 AND season == "winter"
Duration:   15 seconds survive timer
Boulders:   20 RigidBody2D objects, spawn at y=-50, random x
Boulder dmg: 30 per hit
Safe zone:  Barn Area2D at map center-right
On escape:  Show cutscene text, continue game
```

### Blizzard (Random, Winter only)
```
Trigger:    Random timer 120-300s during winter
Duration:   60-120 seconds
Effects:    particles (80% screen), movement×0.5, cold×5, visibility=200px
Navigation: Footprints appear every 0.5s, fade after 8s
```

### Rescue Quest — Rukhsana (Baramulla)
```
Trigger:    Auto-trigger on entering Baramulla
Wolves:     3 wolves surrounding building, do NOT target player until attacked
Success:    Kill all 3 wolves → Rukhsana joins as companion
Companion:  Follows at 120px offset, auto-attacks enemies within 200px
```

### Boss Fight Phases
```
Phase 1 (300–201 HP):  Teleports every 4s, summons 2 shadow wolves
Phase 2 (200–101 HP):  Stops teleporting, summons ice wraiths, 3-way ice shot every 3s
Phase 3 (100–0 HP):    Stationary, summons enemies every 5s, rapid single shots every 1s
Weak point:            Crystal staff (100hp) — breaking it removes 50% armor
Death:                 5s death anim → crystal shatters → cave collapse begins
Escape:                20s timer, 5 boulders/sec, run to exit
```

---

## 📦 Item Data Reference

```gdscript
const ITEMS = {
    "bread": {
        "name": "Lavasa Bread",
        "type": "CONSUMABLE",
        "icon": "res://assets/sprites/ui/item_bread.png",
        "hunger_restore": 30,
        "health_restore": 0,
        "stack_max": 10,
        "gold_value": 5
    },
    "herbs": {
        "name": "Forest Herbs",
        "type": "CONSUMABLE",
        "icon": "res://assets/sprites/ui/item_herbs.png",
        "hunger_restore": 0,
        "health_restore": 20,
        "stack_max": 15,
        "gold_value": 8
    },
    "wool": {
        "name": "Wool",
        "type": "MATERIAL",
        "icon": "res://assets/sprites/ui/item_wool.png",
        "stack_max": 20,
        "gold_value": 12
    },
    "milk": {
        "name": "Fresh Milk",
        "type": "CONSUMABLE",
        "hunger_restore": 15,
        "health_restore": 5,
        "stack_max": 5,
        "gold_value": 6
    },
    "saffron": {
        "name": "Kashmiri Saffron",
        "type": "MATERIAL",
        "stack_max": 10,
        "gold_value": 50
    },
    "apple": {
        "name": "Kashmiri Apple",
        "type": "CONSUMABLE",
        "hunger_restore": 20,
        "stack_max": 10,
        "gold_value": 3
    },
    "pheran": {
        "name": "Warm Pheran",
        "type": "CLOTHING",
        "cold_drain_mult": 0.5,
        "gold_value": 30
    },
    "warrior_pheran": {
        "name": "Warrior Pheran",
        "type": "CLOTHING",
        "cold_drain_mult": 0.2,
        "armor": 10,
        "gold_value": 80
    },
    "slingshot": {
        "name": "Slingshot",
        "type": "WEAPON",
        "damage": 15,
        "weapon_type": "ranged"
    },
    "iron_staff": {
        "name": "Iron Staff",
        "type": "WEAPON",
        "damage": 25,
        "weapon_type": "melee"
    },
    "iron_sword": {
        "name": "Iron Sword",
        "type": "WEAPON",
        "damage": 40,
        "weapon_type": "melee"
    },
    "fire_torch": {
        "name": "Fire Torch",
        "type": "WEAPON",
        "damage": 20,
        "weapon_type": "special",
        "scares_wolves": true,
        "damages_wraiths": true
    },
    "enchanted_blade": {
        "name": "Enchanted Blade",
        "type": "WEAPON",
        "damage": 60,
        "weapon_type": "melee",
        "damages_wraiths": true
    }
}
```

---

## 🗺️ Scene Transition Entry Points

When player transitions between scenes, they spawn at a specific entry point.
Each scene must have a `Dictionary` of entry positions:

```gdscript
# In each world scene script:
const ENTRY_POINTS = {
    "from_gulmarg":   Vector2(100, 400),
    "from_srinagar":  Vector2(800, 200),
    "from_budgam":    Vector2(200, 600),
    "from_baramulla": Vector2(500, 100),
}
```

### Transition Map
```
Gulmarg   ←→  Srinagar  (south exit of Gulmarg / north exit of Srinagar)
Srinagar  ←→  Budgam    (west exit)
Srinagar  ←→  Baramulla (north-west exit)
Srinagar  ←→  Pahalgam  (south exit, unlocks after Quest 03)
Pahalgam  →   ShamanCave (cave entrance, unlocks after all 3 quests)
```

---

## 📱 Android Export Settings (export_presets.cfg)

```ini
[preset.0]
name="Android"
platform="Android"
runnable=true
dedicated_server=false
custom_features=""
export_filter="all_resources"
include_filter=""
exclude_filter=""
export_path="build/wadi-e-kashmir.apk"

[preset.0.options]
custom_template/debug=""
custom_template/release=""
gradle_build/use_gradle_build=false
gradle_build/gradle_build_directory=""
architectures/armeabi-v7a=true
architectures/arm64-v8a=true
architectures/x86=false
architectures/x86_64=false
keystore/debug="res://keystore/debug.keystore"
keystore/debug_user="androiddebugkey"
keystore/debug_password="android"
keystore/release=""
keystore/release_user=""
keystore/release_password=""
package/unique_name="com.wadiekashmir.game"
package/name="Wadi-e-Kashmir"
package/signed=true
package/icon_512x512=""
package/min_sdk=21
package/target_sdk=33
permissions/access_network_state=false
permissions/internet=false
screen/immersive_mode=true
screen/orientation=6
display/command_line_args=""
apk_expansion/enable=false
```

---

*This file is your Godot 4.3 truth document. Always verify against it.*
