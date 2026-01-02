# Wadi-e-Kashmir — AI Build Prompts (Copy-Paste Ready)

> **RULE:** Paste ONE section at a time. Test on phone. Then move to the next.
> Start every new AI session with:
> *"I am continuing Wadi-e-Kashmir, a Godot 4.3 Survival RPG for Android.
>  Here is the current state of [filename]: [paste file content]"*

---

## WEEK 1 — FOUNDATION

---

### W1-01 — Project Setup

```
I am building a mobile game called "Wadi-e-Kashmir" in Godot 4.3 using GDScript only.
It is a Survival + Action RPG for Android phones. Target: 60fps on mid-range Android.
Engine: Godot 4.3. No plugins. No C#. GDScript only.

IMPORTANT GODOT 4 RULES (not Godot 3):
- Use CharacterBody2D (NOT KinematicBody2D)
- move_and_slide() takes NO arguments
- Signals: signal_name.emit() and signal_name.connect(callable)
- Use @export and @onready (not export/onready)
- Use GPUParticles2D (NOT Particles2D)
- FileAccess.open() (NOT File.new())

Set up the Godot 4 project with:
1. Android project settings: renderer=Forward+ Mobile profile, display/window/size/viewport_width=1080, display/window/size/viewport_height=1920
2. Folder structure to create manually: /scenes/main, /scenes/world, /scenes/player, /scenes/enemies, /scenes/animals, /scenes/npcs, /scenes/ui, /scenes/effects, /scripts/autoloads, /scripts/player, /scripts/enemies, /scripts/animals, /scripts/npcs, /scripts/world, /scripts/ui, /assets/sprites, /assets/audio/music, /assets/audio/sfx, /assets/fonts
3. Main.tscn: A simple Node2D that immediately loads GameWorld.tscn
4. GameWorld.tscn: Node2D that contains the current world scene + HUD layer
5. GameManager.gd (autoload at path "GameManager"):
   Variables: current_season:String="spring", current_day:int=1, player_health:float=100.0, player_hunger:float=100.0, player_cold:float=100.0, flock_count:int=5, gold:int=0
   Signals: health_changed(v:float), hunger_changed(v:float), cold_changed(v:float), season_changed(season:String, day:int), game_over(cause:String)
6. Stub autoloads (empty scripts, just extends Node):
   QuestManager.gd, InventoryManager.gd, AudioManager.gd, SaveManager.gd
7. A ColorRect (blue 40x40) as a placeholder player in GameWorld for now

Give me: project.godot settings section, GameManager.gd full script, all stub autoload scripts, Main.tscn node structure text, GameWorld.tscn node structure text.
No placeholders in code. Every function complete.
```

---

### W1-02 — Player Movement (Mobile)

```
I am continuing Wadi-e-Kashmir, a Godot 4.3 Survival RPG for Android. GDScript only. No plugins.

GODOT 4 RULES:
- CharacterBody2D, move_and_slide() no args, @onready, @export
- TouchScreenButton for mobile buttons
- InputEventScreenTouch and InputEventScreenDrag for joystick

Create Player.tscn and Player.gd with:

SCENE STRUCTURE (Player.tscn):
Player (CharacterBody2D)
  CollisionShape2D [RectangleShape2D size=(20,28)]
  AnimatedSprite2D [named "AnimSprite"]
  Camera2D [position_smoothing_enabled=true, position_smoothing_speed=5.0]
  HurtBox (Area2D) [named "HurtBox"]
    CollisionShape2D [CircleShape2D radius=14]

PLAYER.GD REQUIREMENTS:
1. Virtual joystick (left 40% of screen): track touch with InputEventScreenTouch, drag direction with InputEventScreenDrag. Store joystick_vector:Vector2.
2. Movement: normal_speed=120.0, sprint_speed=200.0. velocity = joystick_vector.normalized() * current_speed. Call move_and_slide().
3. Sprint: a TouchScreenButton on left side labeled "RUN". While held, use sprint_speed.
4. Stamina: max_stamina=100.0. Sprint drains 20/sec. Regenerates 10/sec when not sprinting. When stamina=0, cannot sprint.
5. Screen bounds: clamp player position to Rect2(0,0,1080,1920) after move_and_slide().
6. Facing direction: set last_direction:Vector2 when joystick_vector is non-zero.
7. AnimatedSprite2D: play "walk_down/up/left/right" based on direction, "idle" when still. (Animations will be set up later with colored rect placeholder)
8. The player connects to HurtBox.body_entered to receive damage (stub: print damage).

Give me: Full Player.gd script. Player.tscn node structure with all property values.
```

---

### W1-03 — Gulmarg Village Scene

```
I am continuing Wadi-e-Kashmir (Godot 4.3, GDScript, Android). No plugins.

Existing: GameManager autoload, Player.tscn/Player.gd working.

Create Gulmarg.tscn and Gulmarg.gd with:

SCENE STRUCTURE:
Gulmarg (Node2D) [script=Gulmarg.gd]
  TileMap [named "Ground"] -- we use placeholder colored tiles
  Houses (Node2D) -- 5 children, each:
    House_N (StaticBody2D)
      CollisionShape2D [RectangleShape2D 48x48]
      ColorRect [size=48x48, color=Color(0.35,0.2,0.1)] -- dark brown placeholder
  Trees (Node2D) -- 3 children, each:
    Tree_N (StaticBody2D)
      CollisionShape2D [RectangleShape2D 32x48]
      ColorRect [size=32x48, color=Color(0.1,0.5,0.1)] -- green placeholder
  Flock (Node2D) -- 5 Sheep instances (create SimpleAnimal script below)
  Boundaries (Node2D) -- 4 StaticBody2D walls (top/bottom/left/right, invisible)
  ToSrinagar (Area2D) [at bottom edge of map, 100px tall strip]
    CollisionShape2D
  Player (instance of res://scenes/player/Player.tscn)
  WorldEnvironment -- with a simple Environment resource

GULMARG.GD:
- Map size: 1280x960 pixels
- In _ready(): position player at Vector2(640, 300). Set Camera2D limits to map size.
- On ToSrinagar area_entered(body): if body is Player, print("Transition to Srinagar - placeholder")
- House positions: spread across map (give specific Vector2 positions)
- Tree positions: near top/sides

SIMPLE SHEEP (for now, will be replaced in W2-01):
Create a simple SheepSimple.gd extending CharacterBody2D:
- Wanders to a random point within 100px every 3-5 seconds (use Timer)
- Speed: 40px/s
- Uses ColorRect 16x16 white as sprite

Give me: Gulmarg.tscn full node structure with exact positions. Gulmarg.gd full script. SheepSimple.gd full script.
```

---

### W1-04 — Season & Weather System

```
I am continuing Wadi-e-Kashmir (Godot 4.3, GDScript, Android). No plugins.

Existing: GameManager.gd (has current_season, current_day, season_changed signal), Gulmarg.tscn.

MODIFY GameManager.gd to add:
1. Season timer: day_duration = 60.0 seconds (1 real minute = 1 in-game day, 7 days = 1 season).
   In _process(delta): day_timer += delta. When >= day_duration: day_timer=0, current_day+=1, check for season change.
   Season changes: day 1-7=spring, 8-14=summer, 15-21=autumn, 22-30=winter.
   On season change: emit season_changed(current_season, current_day).
2. Survival drain in _process(delta):
   player_hunger -= 0.5 * delta
   cold_rate based on season: spring=0.1, summer=0.05, autumn=0.3, winter=1.0
   player_cold -= cold_rate * delta
   if player_hunger <= 0: player_health -= 1.0 * delta
   if player_cold <= 0: player_health -= 2.0 * delta
   Clamp all values 0-100.
   if player_health <= 0: emit game_over("frozen" or "starved")
   Emit signals when values change.
3. is_blizzard:bool = false. When true: cold_rate *= 5.0, blizzard_active signal.
   blizzard_speed_mult:float = 1.0. Set to 0.5 during blizzard (Player reads this).

CREATE SeasonWeather.gd (attach to Gulmarg.tscn as child node SeasonWeather):
- @onready refs: $"../WorldEnvironment", $"../CanvasModulate", $"../SnowParticles", $"../LeafParticles", $"../RainParticles"
- Connect to GameManager.season_changed signal in _ready()
- On season change:
  spring: sky=Color(0.53,0.81,0.92), canvasmod=Color(1,1,1,1), rain ON, snow OFF, leaves OFF
  summer: sky=Color(0.31,0.76,0.97), canvasmod=Color(1.05,1.05,0.9,1), all particles OFF
  autumn: sky=Color(1.0,0.54,0.4), canvasmod=Color(1.1,0.9,0.7,1), leaves ON
  winter: sky=Color(0.69,0.77,0.78), canvasmod=Color(0.9,0.95,1.1,1), snow ON
- Use Tween to smoothly change WorldEnvironment background color over 3 seconds.

ADD to Gulmarg.tscn:
- CanvasModulate node
- WorldEnvironment node with Environment resource (background mode=COLOR)
- GPUParticles2D named "SnowParticles" (white dots, falling downward, emitting=false)
- GPUParticles2D named "LeafParticles" (orange dots, falling with slight side drift, emitting=false)
- GPUParticles2D named "RainParticles" (blue-grey streaks, falling fast, emitting=false)

Give me: Updated full GameManager.gd. Full SeasonWeather.gd. GPUParticles2D settings for each weather type (ProcessMaterial properties in GDScript).
```

---

### W1-05 — HUD & Survival Bars

```
I am continuing Wadi-e-Kashmir (Godot 4.3, GDScript, Android). No plugins.

Existing: GameManager.gd with signals: health_changed, hunger_changed, cold_changed, season_changed, game_over.

CREATE HUD.tscn (CanvasLayer, layer=1) and HUD.gd:

SCENE STRUCTURE:
HUD (CanvasLayer)
  MarginContainer [anchors: full rect, margin=20]
    VBoxContainer
      TopRow (HBoxContainer)
        BarsGroup (VBoxContainer) [size_flags_horizontal=SHRINK_BEGIN]
          HealthRow (HBoxContainer)
            HealthIcon (Label) [text="❤️"]
            HealthBar (ProgressBar) [min=0, max=100, value=100, custom_minimum_size=(150,18)]
          HungerRow (HBoxContainer)
            HungerIcon (Label) [text="🍖"]
            HungerBar (ProgressBar) [min=0, max=100, value=100, custom_minimum_size=(150,18)]
          ColdRow (HBoxContainer)
            ColdIcon (Label) [text="❄️"]
            ColdBar (ProgressBar) [min=0, max=100, value=100, custom_minimum_size=(150,18)]
        SeasonLabel (Label) [text="Spring — Day 1", horizontal_alignment=CENTER, size_flags_horizontal=EXPAND]
        MinimapPlaceholder (ColorRect) [size=(80,80), color=Color(0.3,0.3,0.3)]

HUD.GD:
- @onready all bar refs and season label
- In _ready(): connect to GameManager signals
- _on_health_changed(v): animate HealthBar to v using create_tween().tween_property(health_bar,"value",v,0.3)
- Same for hunger and cold bars
- _on_season_changed(season,day): season_label.text = season.capitalize() + " — Day " + str(day)
- _on_game_over(cause): show a full-screen ColorRect (semi-transparent black) + Label with cause text + restart button

BAR COLORS (use theme_override_styles):
- HealthBar fill: Color(0.9, 0.1, 0.1) red
- HungerBar fill: Color(1.0, 0.6, 0.0) orange
- ColdBar fill: Color(0.2, 0.4, 1.0) blue

Also add HUD.tscn as a child of GameWorld.tscn (or load it from Gulmarg).

Give me: Full HUD.gd. HUD.tscn node structure with all properties. Instructions to add custom StyleBoxFlat for bar colors in code (not editor).
```

---

## WEEK 2 — GAMEPLAY CORE

---

### W2-01 — Animal Flock AI

```
I am continuing Wadi-e-Kashmir (Godot 4.3, GDScript, Android). No plugins.

Existing: GameManager (has flock_count, gold, signals), Gulmarg.tscn (has Flock node with placeholder sheep).

CREATE Animal.tscn (base) and Animal.gd:
Animal (CharacterBody2D)
  CollisionShape2D [RectangleShape2D 14x14]
  AnimatedSprite2D
  HurtBox (Area2D)
    CollisionShape2D [CircleShape2D r=8]
  DetectionArea (Area2D) [for sensing player/enemies]
    CollisionShape2D [CircleShape2D r=200]

CREATE Sheep.gd (extends Animal base logic):
STATES: enum State {IDLE, WANDER, FOLLOW, FLEE, DEAD}
- IDLE: wait 3-5s (randomize()), then → WANDER
- WANDER: pick random point = global_position + Vector2(randf_range(-100,100), randf_range(-100,100))
  Move toward it at speed 50. On arrival → IDLE
- FOLLOW: if player enters DetectionArea (200px), state=FOLLOW. Move toward player at speed 70. Keep 60px min distance.
- FLEE: if enemy enters 150px flee_area (separate Area2D), state=FLEE. Move away from enemy at speed 130.
- DEAD: queue_free(), GameManager.flock_count -= 1, emit flock_count signal

sheep stats: max_health=30.0, health=30.0
Damage: HurtBox.area_entered → take_damage(amount). If health<=0 → DEAD.
Interact (shearing): player InteractArea overlaps → emit can_shear signal. Player presses interact → give wool to InventoryManager (stub: print "Got wool").

CREATE Goat.gd: same as Sheep but speed×1.3, health=25, no movement penalty on "rock" terrain (just ignore for now).

CREATE Cow.gd: State machine = IDLE only (stationary). Interact → give milk once per in-game day (track last_milk_day in Cow.gd, compare to GameManager.current_day).

CREATE Sheep.tscn, Goat.tscn, Cow.tscn inheriting Animal.tscn with different ColorRect colors:
- Sheep: white ColorRect 16x16
- Goat: light brown ColorRect 16x16
- Cow: brown/white ColorRect 24x18

UPDATE GameManager.gd: add flock_count_changed signal. When flock_count reaches 0: emit game_over("Your flock is lost").

REPLACE placeholder sheep in Gulmarg.tscn Flock node with 4 Sheep.tscn + 1 Goat.tscn instances.

Give me: Animal.gd base class. Sheep.gd. Goat.gd. Cow.gd. All .tscn structures. Updated GameManager.gd.
```

---

### W2-02 — Wolf Enemy AI

```
I am continuing Wadi-e-Kashmir (Godot 4.3, GDScript, Android). No plugins.

Existing: Animal.gd/Sheep.gd working. GameManager has current_season.

CREATE Wolf.tscn:
Wolf (CharacterBody2D)
  CollisionShape2D [RectangleShape2D 16x14]
  AnimatedSprite2D [ColorRect 16x16 grey]
  NavigationAgent2D [max_speed=140, path_desired_distance=4, target_desired_distance=4]
  DetectionArea (Area2D) [r=300] -- detects sheep
  PlayerDetection (Area2D) [r=150] -- detects player attacks or proximity
  AttackArea (Area2D) [r=40]
  HurtBox (Area2D) [r=12]
  StateDebug (Label) [visible in debug only]

CREATE Wolf.gd:
enum State {PATROL, HUNT_SHEEP, HUNT_PLAYER, FLEE, DEAD}
var health: float = 50.0
var speed: float = 140.0
var attack_damage: float = 8.0
var attack_cooldown: float = 1.5
var attack_timer: float = 0.0
var patrol_points: Array[Vector2] = []  -- set by WolfPack parent
var patrol_index: int = 0
var target: Node2D = null

State logic:
PATROL: walk toward patrol_points[patrol_index] at speed 80. On arrival, patrol_index = (patrol_index+1)%patrol_points.size().
  DetectionArea.body_entered: if body is Sheep → state=HUNT_SHEEP, target=body
  PlayerDetection.body_entered: if body is Player → state=HUNT_PLAYER, target=body
HUNT_SHEEP: nav_agent.target_position = target.global_position. Follow nav path.
  AttackArea overlaps target: target.take_damage(5 * delta) [per second]. 
  Target dies → state=PATROL.
HUNT_PLAYER: same but attack_damage=8 on hit (not per second).
FLEE: move away from player at speed 180. No navigation, just velocity = (global_position - player.global_position).normalized() * 180.
DEAD: drop WorldItem "wool", play brief fade, queue_free()

take_damage(amount): health -= amount. If health < 50*0.2: state=FLEE. If health<=0: state=DEAD.

CREATE ShadowWolf.gd (extends Wolf):
- Modulate = Color(0.3, 0.5, 1.0) blue tint
- speed *= 1.3
- attack_damage *= 1.2

CREATE WolfPack.gd (Node2D):
- @export var wolf_count: int = 3
- @export var wolf_scene: PackedScene
- In _ready(): spawn wolf_count wolves as children, assign patrol_points as a square around pack position.

CREATE WolfSpawner.gd (Node2D in world scenes):
- max_packs: int = 3
- var active_packs: Array = []
- Timer: wait_time = 90 if season in ["spring","summer"] else 45
- On timer: if active_packs.size() < max_packs AND total_wolves() < 12: spawn WolfPack at random map edge
- Total wolf count check: iterate all active_packs children

Give me: Full Wolf.gd. ShadowWolf.gd. WolfPack.gd. WolfSpawner.gd. Wolf.tscn structure.
```

---

### W2-03 — Combat System

```
I am continuing Wadi-e-Kashmir (Godot 4.3, GDScript, Android). No plugins.

Existing: Player.gd (movement, joystick, stamina), Wolf.gd (take_damage method).

CREATE Projectile.tscn:
Projectile (Area2D) -- NOT RigidBody2D (easier collision detection)
  CollisionShape2D [CircleShape2D r=4]
  Sprite2D [or ColorRect 8x8 grey]
  VisibleOnScreenNotifier2D

CREATE Projectile.gd:
var velocity: Vector2 = Vector2.ZERO
var damage: float = 15.0
var max_range: float = 300.0
var traveled: float = 0.0
func setup(dir: Vector2, dmg: float, spd: float):
    velocity = dir * spd
    damage = dmg
func _physics_process(delta):
    global_position += velocity * delta
    traveled += velocity.length() * delta
    if traveled >= max_range: queue_free()
func _on_body_entered(body):  -- connect in _ready
    if body.has_method("take_damage"): body.take_damage(damage)
    queue_free()

CREATE DamageNumber.gd (extends Label):
func show_damage(amount: float, pos: Vector2):
    text = str(int(amount))
    global_position = pos
    modulate = Color.RED
    var tween = create_tween()
    tween.parallel().tween_property(self, "position:y", position.y - 40, 0.8)
    tween.parallel().tween_property(self, "modulate:a", 0.0, 0.8)
    tween.tween_callback(queue_free)

MODIFY Player.gd to add:
1. Weapon enum: enum Weapon {SLINGSHOT, STAFF}. var current_weapon = Weapon.SLINGSHOT.
2. Attack button: TouchScreenButton bottom-right labeled "⚔". On press: _attack()
3. _attack():
   if attack_cooldown > 0: return
   match current_weapon:
     SLINGSHOT: fire_slingshot()
     STAFF: swing_staff()
4. fire_slingshot():
   cooldown = 0.8
   var proj = PROJECTILE_SCENE.instantiate()
   get_parent().add_child(proj)
   proj.global_position = global_position
   proj.setup(last_direction, 15.0, 400.0)
5. swing_staff():
   cooldown = 0.6
   $AttackHitbox.monitoring = true  -- enable for 0.2s
   await get_tree().create_timer(0.2).timeout
   $AttackHitbox.monitoring = false
   (AttackHitbox.area_entered → body.take_damage(25) + stun 0.5s)
6. Weapon switch button: small button top-right. Cycles SLINGSHOT→STAFF→SLINGSHOT.
7. Dodge roll button: "⟳" button. 
   _dodge(): if dodge_cooldown>0 or is_rolling: return
   is_rolling=true, is_invincible=true
   var tween = create_tween()
   tween.tween_property(self, "global_position", global_position + last_direction*80, 0.15)
   await tween.finished
   is_rolling=false
   await get_tree().create_timer(0.25).timeout -- invincibility frames
   is_invincible=false
   dodge_cooldown = 1.2
8. take_damage(amount): if is_invincible: return. GameManager.player_health -= amount. camera_shake(). spawn DamageNumber.
9. camera_shake(): $Camera2D offset random ±5px, tween back to 0 over 0.3s.
10. In _process: attack_cooldown -= delta. dodge_cooldown -= delta. Clamp >=0.
11. ADD to Player.tscn: AttackHitbox (Area2D) + CollisionShape2D [RectangleShape2D 30x20] positioned 25px in front.

Give me: Full updated Player.gd. Projectile.gd. DamageNumber.gd. Projectile.tscn structure.
```

---

### W2-04 — NPC & Dialogue System

```
I am continuing Wadi-e-Kashmir (Godot 4.3, GDScript, Android). No plugins.

Existing: Player.gd (has InteractArea, interacts on button press).

CREATE NPC.tscn base:
NPC (CharacterBody2D)
  CollisionShape2D [RectangleShape2D 20x32]
  Sprite2D [or ColorRect 20x32 — placeholder]
  InteractZone (Area2D) [r=80]
    CollisionShape2D
  QuestMarker (Node2D) [y offset = -40]
    QuestLabel (Label) [text="!", font_size=24, color=yellow]
    AnimationPlayer -- bobs QuestLabel up/down

CREATE NPC.gd:
@export var npc_id: String = ""
@export var npc_name: String = "NPC"
@export var dialogue_lines: Array[Dictionary] = []
var has_quest: bool = false

In _ready(): AnimationPlayer loop for quest marker bob. QuestMarker.visible = false (updated by QuestManager).
InteractZone.body_entered: if body is Player → show interact hint.
When Player presses interact button AND is in InteractZone: start_dialogue().
start_dialogue(): DialogueBox.show_dialogue(npc_name, dialogue_lines). Connect DialogueBox.dialogue_finished to _on_dialogue_done.
_on_dialogue_done(): call QuestManager.npc_talked(npc_id).

CREATE DialogueBox.tscn (CanvasLayer layer=5):
DialogueBox (CanvasLayer)
  Panel [anchors: bottom, size=(1080,200), position y=1720]
    HBoxContainer
      Portrait (ColorRect) [size=120x120, color=grey]
      VBoxContainer
        NPCNameLabel (Label) [text=""]
        DialogueText (RichTextLabel) [bbcode_enabled=true, fit_content=true]
    TapPrompt (Label) [text="Tap to continue ▶", align=right]

CREATE DialogueBox.gd:
var lines: Array[Dictionary] = []
var current_line: int = 0
var is_typing: bool = false
signal dialogue_finished

func show_dialogue(name: String, dialogue: Array[Dictionary]):
    npc_name_label.text = name
    lines = dialogue
    current_line = 0
    visible = true
    show_line()

func show_line():
    if current_line >= lines.size():
        visible = false
        dialogue_finished.emit()
        return
    is_typing = true
    tap_prompt.visible = false
    await type_text(lines[current_line]["text"])
    is_typing = false
    tap_prompt.visible = true

func type_text(full: String):
    dialogue_text.text = ""
    for ch in full:
        dialogue_text.text += ch
        await get_tree().create_timer(1.0/40.0).timeout

func _input(event):
    if not visible: return
    if event is InputEventScreenTouch and event.pressed:
        if is_typing:
            # Skip to end of current line
            dialogue_text.text = lines[current_line]["text"]
            is_typing = false
            tap_prompt.visible = true
        else:
            current_line += 1
            show_line()

CREATE DadiZoona.gd (extends NPC):
func _ready():
    npc_id = "dadi_zoona"
    npc_name = "Dadi Zoona"
    dialogue_lines = [
        {"text": "Khabardar reh, Aryan. The wolves come closer each night."},
        {"text": "Your grandfather protected this valley. Now it is your turn, bachcha."},
        {"text": "Go to Srinagar. Find the old man near Dal Lake. He knows what stirs in the Himalayan caves."}
    ]
    has_quest = true
    super._ready()

CREATE MushtaqBhai.gd stub (extends NPC): npc_id="mushtaq", 2 dialogue lines about trading.
CREATE BabaNoor.gd stub (extends NPC): npc_id="baba_noor", 2 lore lines.

ADD DialogueBox instance to HUD.tscn or GameWorld.tscn (one global instance).
ADD DadiZoona instance to Gulmarg.tscn.

Give me: NPC.gd. DialogueBox.gd. DadiZoona.gd. MushtaqBhai.gd. BabaNoor.gd. Both .tscn structures.
```

---

### W2-05 — Srinagar Hub Scene

```
I am continuing Wadi-e-Kashmir (Godot 4.3, GDScript, Android). No plugins.

Existing: SceneTransition concept from W1-03 (ToSrinagar area). Player.gd. NPC system.

CREATE SceneTransition.gd (Autoload "SceneTransition"):
var pending_entry_point: String = ""

func go_to(scene_path: String, entry_point: String):
    pending_entry_point = entry_point
    # Fade to black using AnimationPlayer on a CanvasLayer in GameWorld
    get_tree().call_deferred("change_scene_to_file", scene_path)

func get_entry_point() -> String:
    return pending_entry_point

ADD SceneTransition to project.godot autoloads.

CREATE FadeLayer.tscn (CanvasLayer layer=10, always present in GameWorld):
FadeLayer (CanvasLayer)
  ColorRect [full screen, color=black, modulate.a=0]
  AnimationPlayer -- "fade_in" (a→1), "fade_out" (a→0)

In GameWorld._ready(): always add FadeLayer. SceneTransition.fade_layer = $FadeLayer.

CREATE Srinagar.tscn and Srinagar.gd:

SCENE:
Srinagar (Node2D)
  TileMap -- stone streets + blue Dal Lake tiles at bottom 300px
  DalLake (ColorRect) [size=1280x300, color=Color(0.2,0.6,0.9), y=660]
  ShikaraBoat (Sprite2D/ColorRect) [80x30, brown, on lake]
  Buildings (Node2D) -- 3 large buildings (StaticBody2D, 64x64 placeholder)
  MarketArea (Node2D)
    Stall1 (StaticBody2D) -- sell/buy bread
    Stall2 (StaticBody2D) -- sell/buy herbs
  MushtaqBhai (instance)
  Transitions (Node2D)
    ToGulmarg (Area2D) -- top edge
    ToBudgam (Area2D) -- left edge
    ToBaramulla (Area2D) -- top-left edge
    ToPahalgam (Area2D) -- bottom edge, DISABLED until all quests done
  MapBounds (Node2D) -- 4 invisible StaticBody2D walls
  Player -- spawned at entry_point

SRINAGAR.GD:
const ENTRY_POINTS = {
    "from_gulmarg": Vector2(640, 100),
    "from_budgam": Vector2(100, 480),
    "from_baramulla": Vector2(200, 100),
    "from_pahalgam": Vector2(640, 900),
}
In _ready():
  var ep = SceneTransition.get_entry_point()
  $Player.global_position = ENTRY_POINTS.get(ep, Vector2(640,480))
  if GameManager.current_season == "winter":
    $DalLake.color = Color(0.85,0.9,0.95) -- ice white
    # connect player footstep to play ice_crack sound stub

Transition zones: connect area_entered, call SceneTransition.go_to(path, entry_key).
ToGulmarg: go_to("res://scenes/world/Gulmarg.tscn", "from_srinagar")
ToBudgam: go_to("res://scenes/world/Budgam.tscn", "from_srinagar")
ToBaramulla: go_to("res://scenes/world/Baramulla.tscn", "from_srinagar")
ToPahalgam: only if QuestManager.all_main_quests_done(): go_to(...)

UPDATE Gulmarg.gd: ToSrinagar area → SceneTransition.go_to("res://scenes/world/Srinagar.tscn", "from_gulmarg")

Give me: SceneTransition.gd (autoload). Srinagar.gd. Srinagar.tscn structure with positions. Updated Gulmarg.gd transition code.
```

---

## WEEK 3 — CONTENT & STORY

---

### W3-01 — Quest System

```
I am continuing Wadi-e-Kashmir (Godot 4.3, GDScript, Android). No plugins.

Existing: GameManager (signals, day tracking), NPC system (npc_talked signal), InventoryManager (stub).

CREATE QuestManager.gd (full autoload):

const QUEST_DATA = {
    "QUEST_01": {
        "title": "First Watch",
        "description": "Protect your flock for one full in-game day. Do not let any sheep die.",
        "giver": "dadi_zoona",
        "objectives": [{"type": "survive_days", "count": 1, "current": 0}],
        "rewards": {"gold": 20, "items": [{"id": "wool_vest", "count": 1}]},
        "is_active": false, "is_complete": false
    },
    "QUEST_02": {
        "title": "Market Run",
        "description": "Collect 3 wool from your flock and bring it to Mushtaq Bhai in Srinagar.",
        "giver": "mushtaq",
        "objectives": [{"type": "collect_item", "item": "wool", "count": 3, "current": 0}],
        "rewards": {"gold": 50, "items": [{"id": "slingshot_upgrade", "count": 1}]},
        "is_active": false, "is_complete": false
    },
    "QUEST_03": {
        "title": "The Warning",
        "description": "Travel to Pahalgam and speak with Baba Noor at the mountain pass.",
        "giver": "baba_noor",
        "objectives": [{"type": "reach_location", "location": "pahalgam", "done": false},
                       {"type": "talk_to_npc", "npc": "baba_noor", "done": false}],
        "rewards": {"gold": 0, "items": [{"id": "iron_staff", "count": 1}]},
        "is_active": false, "is_complete": false
    }
}

signals: quest_started(id), quest_updated(id), quest_completed(id)

Functions:
- start_quest(id): set is_active=true, emit quest_started
- npc_talked(npc_id): activate relevant quest if giver matches and not active
- update_objective(quest_id, obj_index, value): update current, check if all objectives met → complete_quest
- complete_quest(id): set is_complete=true, give rewards (call InventoryManager, GameManager.gold +=)
- all_main_quests_done(): return all 3 quests is_complete
- on GameManager.current_day changed: check "survive_days" objectives
- on InventoryManager.item_added(id,count): update "collect_item" objectives

CREATE QuestLog.tscn (CanvasLayer layer=3, hidden by default):
QuestLog (CanvasLayer)
  Panel [full screen with 80% opacity]
    VBoxContainer
      Label [text="Quest Log", font_size=28]
      ScrollContainer
        QuestList (VBoxContainer) -- dynamically populated

CREATE QuestLog.gd:
- Swipe-up gesture opens (detect in _input: ScreenDrag upward velocity > 300)
- On open: clear QuestList, for each active quest add a QuestEntry (Label with title + progress)
- Close on swipe-down or tap outside

QUEST COMPLETE POPUP: full screen ColorRect flash (yellow, alpha 0→0.7→0 over 1.5s) + large Label "Quest Complete!" + reward text.

Give me: Full QuestManager.gd. QuestLog.gd. QuestLog.tscn structure. Quest complete popup code.
```

---

### W3-02 — Inventory & Items

```
I am continuing Wadi-e-Kashmir (Godot 4.3, GDScript, Android). No plugins.

Existing: QuestManager checks inventory. Animal scripts give resources.

CREATE InventoryManager.gd (full autoload):

const ITEM_DB = {
    "bread": {"name":"Lavasa Bread","type":"CONSUMABLE","hunger":30,"health":0,"stack_max":10,"gold_value":5,"icon_color":Color(0.9,0.7,0.3)},
    "herbs": {"name":"Forest Herbs","type":"CONSUMABLE","hunger":0,"health":20,"stack_max":15,"gold_value":8,"icon_color":Color(0.2,0.8,0.2)},
    "wool":  {"name":"Wool","type":"MATERIAL","stack_max":20,"gold_value":12,"icon_color":Color(0.95,0.95,0.95)},
    "milk":  {"name":"Fresh Milk","type":"CONSUMABLE","hunger":15,"health":5,"stack_max":5,"gold_value":6,"icon_color":Color(0.95,0.9,0.8)},
    "saffron":{"name":"Kashmiri Saffron","type":"MATERIAL","stack_max":10,"gold_value":50,"icon_color":Color(0.95,0.7,0.0)},
    "apple": {"name":"Kashmiri Apple","type":"CONSUMABLE","hunger":20,"health":0,"stack_max":10,"gold_value":3,"icon_color":Color(0.9,0.2,0.1)},
    "pheran":{"name":"Warm Pheran","type":"CLOTHING","cold_mult":0.5,"gold_value":30,"icon_color":Color(0.4,0.3,0.6)},
    "warrior_pheran":{"name":"Warrior Pheran","type":"CLOTHING","cold_mult":0.2,"armor":10,"gold_value":80,"icon_color":Color(0.6,0.2,0.2)},
    "slingshot":{"name":"Slingshot","type":"WEAPON","damage":15,"weapon_type":"ranged","gold_value":0},
    "iron_staff":{"name":"Iron Staff","type":"WEAPON","damage":25,"weapon_type":"melee","gold_value":0},
    "iron_sword":{"name":"Iron Sword","type":"WEAPON","damage":40,"weapon_type":"melee","gold_value":60},
    "fire_torch":{"name":"Fire Torch","type":"WEAPON","damage":20,"weapon_type":"special","scares_wolves":true,"damages_wraiths":true,"gold_value":20},
    "enchanted_blade":{"name":"Enchanted Blade","type":"WEAPON","damage":60,"weapon_type":"melee","damages_wraiths":true,"gold_value":0}
}

var inventory: Array[Dictionary] = []  -- [{id, count}]
var equipped_weapon: String = "slingshot"
var equipped_clothing: String = ""

signals: item_added(id,count), item_removed(id,count), equipped_changed()

Functions:
- add_item(id, count): find slot with same id and space, or create new slot
- remove_item(id, count): reduce count, remove slot if 0
- has_item(id, count): bool check
- use_item(id): if CONSUMABLE → apply effects to GameManager. if CLOTHING/WEAPON → equip.
- equip(id): set equipped_weapon or equipped_clothing. Notify GameManager of stat changes.
- get_cold_mult(): check equipped_clothing, return its cold_mult or 1.0
- drop_item(id): create WorldItem at player position with 1 of that item

CREATE InventoryUI.tscn (CanvasLayer layer=3):
Panel [full screen, hidden by default]
  VBoxContainer
    Label ["Inventory", centered]
    GridContainer [columns=4] -- filled dynamically
    EquippedRow (HBoxContainer)
      Label ["Equipped:"]
      WeaponLabel (Label)
      ClothingLabel (Label)
    CloseButton (Button) [text="Close"]

CREATE InventoryUI.gd:
- Swipe-up opens, swipe-down or Close button closes
- On open: clear grid, for each inventory slot: create a PanelContainer with ColorRect (item color) + count Label
- Tap slot: call InventoryManager.use_item(id)
- Long press (touch held >0.5s): InventoryManager.drop_item(id)

CREATE WorldItem.tscn:
WorldItem (Area2D)
  CollisionShape2D [CircleShape2D r=10]
  ColorRect [size=12x12] -- item color from ITEM_DB

CREATE WorldItem.gd:
var item_id: String = ""
func _on_body_entered(body):  -- body_entered signal
    if body is Player:
        InventoryManager.add_item(item_id, 1)
        queue_free()

UPDATE GameManager._process: cold drain × InventoryManager.get_cold_mult()

Give me: Full InventoryManager.gd. InventoryUI.gd. WorldItem.gd. All .tscn structures.
```

---

### W3-03 — Budgam Forest & Baramulla

```
I am continuing Wadi-e-Kashmir (Godot 4.3, GDScript, Android). No plugins.

Existing: All Week 1-2 systems. SceneTransition working. QuestManager. Wolf AI.

CREATE Budgam.tscn and Budgam.gd:

SCENE:
Budgam (Node2D)
  TileMap -- forest floor tiles (dark green placeholder)
  CanvasModulate [color=Color(0.25,0.4,0.25,1)]
  Trees (Node2D) -- 10 StaticBody2D trees in dense formation creating corridors
  ShadowWolfSpawner (WolfSpawner) [spawn_interval override=40s, wolf_type=ShadowWolf]
  HerbPickups (Node2D) -- 5 WorldItem("herbs") scattered
  CaveEntrance (Area2D) -- hidden at map bottom
    DangerSign (Label) [text="⚠ Locked — Complete The Warning quest"]
  ToSrinagar (Area2D) -- top edge
  EntryWarning (CanvasLayer) [layer=8, hidden]
    Panel + Label "You are entering dangerous territory. Khabardar reh."
  Player

BUDGAM.GD:
- In _ready(): show EntryWarning for 3 seconds then hide.
- CaveEntrance area_entered: if QuestManager.all_main_quests_done(): SceneTransition.go_to(cave) else: show "Quest locked" popup.
- CanvasModulate creates dark atmosphere.
- All ShadowWolf: their Modulate = Color(0.5, 0.7, 1.0) blue tint.

CREATE Baramulla.tscn and Baramulla.gd:

SCENE:
Baramulla (Node2D)
  TileMap -- river water tiles through middle, land on both sides
  RiverBlocker (StaticBody2D) -- invisible wall blocking river crossing without bridge
  Bridge (StaticBody2D) [140x20 plank, positioned over river, passable]
  BridgeAmbush (Area2D) -- triggers wolf pack when player steps on bridge
  TrappedBuilding (StaticBody2D) -- Rukhsana is inside
  RescueWolves (Node2D) -- 3 Wolf instances surrounding building
  Rukhsana (instance -- see below)
  AppleOrchard (Node2D) -- 5 WorldItem("apple") in tree area
  ToSrinagar (Area2D) -- bottom edge

BARAMULLA.GD:
- Rescue quest auto-starts: in _ready() if not QuestManager.quests["QUEST_RESCUE"].is_active: activate it.
- BridgeAmbush.body_entered: spawn wolf ambush pack (2 wolves) once.
- Watch RescueWolves: connect each wolf's tree_exited (on queue_free) → check if all 3 dead → rescue_complete()
- rescue_complete(): Rukhsana.free_her(), QuestManager.complete_quest("QUEST_RESCUE")

CREATE Rukhsana.gd (companion, extends CharacterBody2D):
var player: Node2D = null
var follow_distance: float = 120.0
var attack_range: float = 200.0
var attack_cooldown: float = 2.0
var is_freed: bool = false

func free_her():
    is_freed = true
    player = get_tree().get_first_node_in_group("player")
    show_dialogue(["Shukriya! Thank you, Aryan. I will help you.", "I know these forests. Stay close."])

func _physics_process(delta):
    if not is_freed or player == null: return
    var dist = global_position.distance_to(player.global_position)
    if dist > follow_distance:
        var dir = (player.global_position - global_position).normalized()
        velocity = dir * 130.0
    else:
        velocity = Vector2.ZERO
    # Attack nearest enemy in range
    attack_cooldown -= delta
    if attack_cooldown <= 0:
        var enemies = get_tree().get_nodes_in_group("enemies")
        for enemy in enemies:
            if global_position.distance_to(enemy.global_position) < attack_range:
                # Spawn projectile toward enemy
                attack_cooldown = 2.0
                break
    move_and_slide()

Give me: Full Budgam.gd. Budgam.tscn structure. Baramulla.gd. Baramulla.tscn structure. Rukhsana.gd.
```

---

### W3-04 — Avalanche & Blizzard Events

```
I am continuing Wadi-e-Kashmir (Godot 4.3, GDScript, Android). No plugins.

Existing: GameManager (season, day, cold drain, blizzard flag), Gulmarg.tscn.

CREATE EventTitleCard.tscn (CanvasLayer layer=9):
EventTitleCard (CanvasLayer)
  ColorRect [full screen, Color(0,0,0,0.7)]
  VBoxContainer [centered]
    TitleLabel (Label) [font_size=48, text=""]
    SubtitleLabel (Label) [font_size=24, color=yellow, text=""]

CREATE EventTitleCard.gd:
func show_event(title: String, subtitle: String, duration: float = 3.0):
    title_label.text = title
    subtitle_label.text = subtitle
    visible = true
    await get_tree().create_timer(duration).timeout
    var tween = create_tween()
    tween.tween_property(self, "modulate:a", 0.0, 0.5)
    await tween.finished
    visible = false
    modulate.a = 1.0

CREATE AvalancheEvent.gd (Node in Gulmarg.tscn):
@onready var boulder_scene = preload("res://scenes/effects/AvalancheBoulder.tscn")
var is_active: bool = false
var survive_timer: float = 15.0
var barn_area: Area2D  -- reference to barn safe zone

func trigger():
    if is_active: return
    is_active = true
    EventTitleCard.show_event("AVALANCHE!", "Baraf aav chhe! — The snow is coming!")
    await get_tree().create_timer(3.5).timeout
    camera_shake(2.0, 8.0)
    spawn_boulders()
    $BarnLight.visible = true  -- illuminate barn
    var timer = Timer.new()
    add_child(timer)
    timer.wait_time = 15.0
    timer.one_shot = true
    timer.timeout.connect(_on_time_up)
    timer.start()

func spawn_boulders():
    for i in 20:
        await get_tree().create_timer(0.3).timeout
        var b = boulder_scene.instantiate()
        get_parent().add_child(b)
        b.global_position = Vector2(randf_range(50, 1230), -50)
        b.apply_central_impulse(Vector2(randf_range(-50,50), randf_range(200,400)))

func _on_time_up():
    # Player failed to reach barn
    GameManager.player_health -= 30

func _on_barn_entered(body):
    if body.is_in_group("player") and is_active:
        is_active = false
        # Stop spawning, clear boulders
        for b in get_tree().get_nodes_in_group("boulders"): b.queue_free()
        EventTitleCard.show_event("Survived!", "The barn shelters you from the storm.")

CREATE AvalancheBoulder.tscn:
AvalancheBoulder (RigidBody2D) [add to group "boulders"]
  CollisionShape2D [CircleShape2D r=15]
  ColorRect [30x30, white]
-- On body_entered: if player → player.take_damage(30), don't queue_free (boulder continues)

CREATE BlizzardEvent.gd (Node in Gulmarg, Srinagar, etc.):
var is_active: bool = false

func start_blizzard():
    if GameManager.current_season != "winter": return
    is_active = true
    EventTitleCard.show_event("BLIZZARD!", "Baraf aav chhe wapas!", 2.0)
    GameManager.is_blizzard = true
    $BlizzardParticles.emitting = true
    $FogOverlay.visible = true  -- heavy white particle overlay
    $VisibilityMask.visible = true  -- circular light mask on player
    spawn_footprint_trail()
    # Duration 60-120s random
    await get_tree().create_timer(randf_range(60,120)).timeout
    end_blizzard()

func end_blizzard():
    is_active = false
    GameManager.is_blizzard = false
    $BlizzardParticles.emitting = false
    $FogOverlay.visible = false
    $VisibilityMask.visible = false

func spawn_footprint_trail():
    -- Every 0.5s, spawn a Footprint sprite at player position, fade out after 8s

-- Trigger: random Timer in _ready() during winter. Check GameManager.current_season.

UPDATE Gulmarg.gd: In _ready(), if GameManager.current_day >= 22 and season=="winter": $AvalancheEvent.trigger()

Give me: EventTitleCard.gd. AvalancheEvent.gd. AvalancheBoulder.tscn. BlizzardEvent.gd. All trigger code.
```

---

### W3-05 — Pahalgam & Boss Fight

```
I am continuing Wadi-e-Kashmir (Godot 4.3, GDScript, Android). No plugins.

Existing: All combat systems. All quests. SceneTransition working.

CREATE Pahalgam.tscn:
Pahalgam (Node2D)
  TileMap -- grey-white mountain tiles
  IcePatches (Node2D) -- Area2D patches that set player speed to 0.67× while inside
  Trees (Node2D) -- pine/deodar trees (tall thin dark green ColorRect)
  Cliffs (Node2D) -- StaticBody2D dark walls forming mountain pass corridor
  CaveEntrance (Area2D) -- at top of scene
    CaveDoor (ColorRect) [40x60, dark] -- locked visual
  BabaNoor (instance)
  Player

PAHALGAM.GD:
const ENTRY_POINTS = {"from_srinagar": Vector2(640, 900)}
BabaNoor final dialogue: 3 lines of lore ending with gift of "enchanted_blade" to InventoryManager.
CaveEntrance: unlocked if all quests done. go_to("ShamanCave.tscn", "cave_entrance")

CREATE ShamanCave.tscn:
ShamanCave (Node2D)
  TileMap -- dark cave tiles, purple crystal lights (PointLight2D purple-white)
  PathSection1 (Node2D) -- linear corridor with EnemyGroup1 (1 ShadowWolf + 1 IceWraith)
  PathSection2 (Node2D) -- EnemyGroup2 (2 ShadowWolf)
  PathSection3 (Node2D) -- EnemyGroup3 (1 IceWraith + 1 CaveTroll)
  BossArena (Node2D) -- large circular room at top
    Shaman (instance)
    CrystalStaff (StaticBody2D, health=100)
    ArenaWalls (StaticBody2D ring)
  ExitDoor (Area2D) [locked until Shaman dead]
  Player

CREATE IceWraith.gd (extends CharacterBody2D, but no gravity — flying):
var health: float = 40.0
var speed: float = 90.0
var is_half: bool = false  -- spawned as weakened half
var can_take_damage_from: Array = ["fire_torch", "enchanted_blade"]

func take_damage(amount: float, source: String = ""):
    if source not in can_take_damage_from: return  -- immune to normal attacks
    health -= amount
    if health <= 0:
        if not is_half:
            # Spawn 2 halves
            spawn_half()
            spawn_half()
        queue_free()

func spawn_half():
    var half = IceWraithHalf.instantiate()
    half.is_half = true
    half.health = 15.0
    half.global_position = global_position + Vector2(randf_range(-20,20), randf_range(-20,20))
    get_parent().add_child(half)

-- Movement: always move toward player, no pathfinding (flying over walls)

CREATE Shaman.gd:
enum Phase { ONE, TWO, THREE, DEAD }
var health: float = 300.0
var armor: float = 50.0  -- reduces damage by 50% until crystal destroyed
var current_phase: Phase = Phase.ONE
var summon_cooldown: float = 0.0
var attack_cooldown: float = 0.0
var teleport_cooldown: float = 4.0
var player: Node2D

func take_damage(amount: float, _source: String = ""):
    var actual = amount * (1.0 - armor/100.0)
    health -= actual
    if health <= 200 and current_phase == Phase.ONE: current_phase = Phase.TWO
    if health <= 100 and current_phase == Phase.TWO: current_phase = Phase.THREE
    if health <= 0: _die()

func _process(delta):
    summon_cooldown -= delta
    attack_cooldown -= delta
    teleport_cooldown -= delta
    match current_phase:
        Phase.ONE: _phase_one(delta)
        Phase.TWO: _phase_two(delta)
        Phase.THREE: _phase_three(delta)

func _phase_one(_d):
    if teleport_cooldown <= 0:
        teleport_cooldown = 4.0
        _teleport()
    if summon_cooldown <= 0:
        summon_cooldown = 8.0
        _summon_wolves(2)

func _phase_two(_d):
    if summon_cooldown <= 0:
        summon_cooldown = 6.0
        _summon_wraiths(1)
    if attack_cooldown <= 0:
        attack_cooldown = 3.0
        _ice_spread_shot(3)

func _phase_three(_d):
    if summon_cooldown <= 0:
        summon_cooldown = 5.0
        _summon_wolves(1)
        _summon_wraiths(1)
    if attack_cooldown <= 0:
        attack_cooldown = 1.0
        _fire_projectile()

func _teleport():
    var spots = [Vector2(200,200), Vector2(800,200), Vector2(500,500), Vector2(200,600), Vector2(800,600)]
    global_position = spots[randi() % spots.size()]

func _die():
    current_phase = Phase.DEAD
    # Play death animation 5s
    await get_tree().create_timer(5.0).timeout
    EventTitleCard.show_event("The Shaman Falls!", "Bahar aayi chhe wapas — Spring will return.")
    # Start escape sequence
    get_parent()._start_escape()

CRYSTAL STAFF (CrystalStaff.gd):
var health: float = 100.0
func take_damage(amount, _src=""):
    health -= amount
    if health <= 0:
        get_parent().get_node("Shaman").armor = 0  -- remove shaman's armor
        queue_free()

ESCAPE SEQUENCE in ShamanCave.gd:
func _start_escape():
    EventTitleCard.show_event("ESCAPE!", "Run! The cave is collapsing! — 20 seconds!")
    $ExitDoor.monitoring = true  -- open exit
    var escape_timer = 20.0
    # Spawn 5 boulders per second for 20 seconds
    for i in 20:
        await get_tree().create_timer(1.0).timeout
        for j in 5:
            var b = BOULDER.instantiate()
            add_child(b)
            b.global_position = Vector2(randf_range(100,900), -50)

ExitDoor.body_entered: if player → go_to credits/ending.

ENDING (Credits.tscn):
- Full screen fade in from black
- Label: "The valley is free. Spring will return."
- Label: "Bahar aayi chhe wapas — وادئ کشمیر"
- Kashmiri music plays
- After 10s: return to MainMenu

Give me: Pahalgam.gd. IceWraith.gd. Shaman.gd. ShamanCave.gd with escape. CrystalStaff.gd. All .tscn structures.
```

---

## WEEK 4 — POLISH & SHIP

### W4-02 — Audio Manager

```
I am continuing Wadi-e-Kashmir (Godot 4.3, GDScript, Android). No plugins.

CREATE AudioManager.gd (full autoload):

@onready var music_player: AudioStreamPlayer = AudioStreamPlayer.new()
@onready var sfx_player: AudioStreamPlayer = AudioStreamPlayer.new()

const MUSIC_PATH = "res://assets/audio/music/"
const SFX_PATH = "res://assets/audio/sfx/"

var music_volume: float = 0.0    # in dB, 0 = full
var sfx_volume: float = 0.0
var current_track: String = ""

func _ready():
    add_child(music_player)
    add_child(sfx_player)
    music_player.bus = "Music"
    sfx_player.bus = "SFX"

func play_music(track: String) -> void:
    if track == current_track: return
    current_track = track
    var path = MUSIC_PATH + track + ".ogg"
    if not ResourceLoader.exists(path):
        push_warning("Music not found: " + path)
        return
    var tween = create_tween()
    tween.tween_property(music_player, "volume_db", -80.0, 1.0)
    await tween.finished
    music_player.stream = load(path)
    music_player.play()
    tween = create_tween()
    tween.tween_property(music_player, "volume_db", music_volume, 1.0)

func play_sfx(sound: String) -> void:
    var path = SFX_PATH + sound + ".ogg"
    if not ResourceLoader.exists(path):
        return  # Silent fail — audio files added later
    var sfx = AudioStreamPlayer.new()
    add_child(sfx)
    sfx.bus = "SFX"
    sfx.volume_db = sfx_volume
    sfx.stream = load(path)
    sfx.play()
    sfx.finished.connect(sfx.queue_free)

func stop_music() -> void:
    var tween = create_tween()
    tween.tween_property(music_player, "volume_db", -80.0, 1.0)
    await tween.finished
    music_player.stop()
    current_track = ""

func set_music_volume(value: float) -> void:  # 0.0 to 1.0
    music_volume = linear_to_db(value)
    music_player.volume_db = music_volume

func set_sfx_volume(value: float) -> void:
    sfx_volume = linear_to_db(value)

SCENE MUSIC MAPPING (call these in each scene's _ready()):
Gulmarg spring/summer: AudioManager.play_music("spring_village")
Gulmarg autumn: AudioManager.play_music("autumn_tension")  
Gulmarg winter: AudioManager.play_music("winter_survival")
Srinagar: AudioManager.play_music("summer_srinagar")
Budgam: AudioManager.play_music("autumn_tension")
ShamanCave: AudioManager.play_music("boss_fight")
Credits: AudioManager.play_music("ending")
Any combat (wolf attack): AudioManager.play_music("combat") -- restore on combat end

SFX CALLS TO ADD throughout codebase:
Player footstep: AudioManager.play_sfx("footstep_grass/snow/stone") based on TileMap tile
Player hurt: AudioManager.play_sfx("player_hurt")  
Player dodge: AudioManager.play_sfx("player_dodge")
Sword swing: AudioManager.play_sfx("sword_swing")
Stone hit: AudioManager.play_sfx("stone_hit")
Item pickup: AudioManager.play_sfx("item_pickup")
Quest complete: AudioManager.play_sfx("quest_complete")
Sheep baa: AudioManager.play_sfx("sheep_baa") [random interval on each sheep]
Wolf growl: AudioManager.play_sfx("wolf_growl") [on wolf aggro]
Avalanche: AudioManager.play_sfx("avalanche_rumble")

Give me: Full AudioManager.gd. List of every place in existing scripts to add sfx calls.
```

---

### W4-04 — GitHub Actions APK Build

```
I am setting up GitHub Actions to build Wadi-e-Kashmir as a signed Android APK using Godot 4.3.
No Google Play Console. APK downloaded from GitHub Actions artifacts tab.

Give me the COMPLETE, EXACT content of these files:

1. .github/workflows/build-apk.yml
Requirements:
- Trigger: push to main branch AND workflow_dispatch (manual trigger)
- OS: ubuntu-latest
- Steps in order:
  a) actions/checkout@v4
  b) actions/setup-java@v4 with java-version='17', distribution='temurin'
  c) android-actions/setup-android@v3
  d) Download Godot 4.3 stable headless Linux: https://github.com/godotengine/godot/releases/download/4.3-stable/Godot_v4.3-stable_linux.x86_64.zip
  e) Unzip and chmod +x Godot binary
  f) Download export templates: https://github.com/godotengine/godot/releases/download/4.3-stable/Godot_v4.3-stable_export_templates.tpz
  g) Install templates to: ~/.local/share/godot/export_templates/4.3.stable/
  h) Decode keystore from GitHub secret KEYSTORE_BASE64 to /tmp/release.keystore
  i) Run: ./Godot_v4.3-stable_linux.x86_64 --headless --export-release "Android" ./build/wadi-e-kashmir.apk
     working-directory: project/
  j) Upload artifact named "wadi-e-kashmir-apk" from ./build/wadi-e-kashmir.apk
- Env vars for Godot export:
  GODOT_ANDROID_KEYSTORE_RELEASE_PATH: /tmp/release.keystore
  GODOT_ANDROID_KEYSTORE_RELEASE_USER: ${{ secrets.KEY_ALIAS }}
  GODOT_ANDROID_KEYSTORE_RELEASE_PASSWORD: ${{ secrets.KEY_PASSWORD }}
  Also need STORE_PASSWORD for the keystore: ${{ secrets.STORE_PASSWORD }}
- Create build/ directory before export step

2. project/export_presets.cfg
Full content for Android export with:
- preset name = "Android"
- export_path = "../build/wadi-e-kashmir.apk"
- package name = com.wadiekashmir.game
- app name = Wadi-e-Kashmir  
- min_sdk = 21
- target_sdk = 33
- architectures: armeabi-v7a=true, arm64-v8a=true
- orientation = 6 (sensor - auto)
- signed = true
- keystore fields left empty (filled by env vars at build time)

3. Exact keytool command to generate the keystore locally on Windows:
keytool command with all flags, alias=wadi-kashmir, validity=10000 days

4. PowerShell command to convert keystore to base64 for GitHub Secret

5. Step-by-step GitHub Secret setup (exact secret names: KEYSTORE_BASE64, KEY_ALIAS, KEY_PASSWORD, STORE_PASSWORD)

6. How to download the built APK from GitHub Actions tab

7. How to install APK on Android phone (enable unknown sources on Android 8+ and Android 12+)

Give me every file completely. No placeholders.
```

---

### W4-05 — Final Polish

```
I am finishing Wadi-e-Kashmir (Godot 4.3, GDScript, Android). No plugins.

Existing: All game systems complete.

CREATE MainMenu.tscn and MainMenu.gd:
MainMenu (Node2D)
  Background (ColorRect) [full screen gradient: top=Color(0.05,0.1,0.25) bottom=Color(0.53,0.81,0.92)]
  MountainSilhouette (ColorRect) [full width, h=300, color=Color(0.05,0.05,0.1), y=bottom]
  LeafParticles (GPUParticles2D) [orange leaf particles falling, always emitting]
  TitleLabel (Label) [text="وادئ کشمیر", font_size=52, centered top]
  SubtitleLabel (Label) [text="Wadi-e-Kashmir", font_size=28]
  TaglineLabel (Label) [text="Born in the valley. Tested by the mountain.", font_size=16, italic]
  ButtonContainer (VBoxContainer)
    NewGameButton (Button) [text="New Game"]
    ContinueButton (Button) [text="Continue"] [disabled if no save]
    SettingsButton (Button) [text="Settings"]
    CreditsButton (Button) [text="Credits"]

MAINMENU.GD:
- NewGameButton: reset all GameManager/QuestManager/InventoryManager state, load Gulmarg
- ContinueButton: SaveManager.load_game(), restore state, load saved scene
- Check save exists: ContinueButton.disabled = not SaveManager.has_save()
- Leaf particles always running (orange, autumn feel)

CREATE SaveManager.gd (full autoload):
const SAVE_PATH = "user://savegame.json"

func has_save() -> bool:
    return FileAccess.file_exists(SAVE_PATH)

func save_game() -> void:
    var data = {
        "version": 1,
        "scene": SceneTransition.current_scene_path,  -- track this string
        "entry": "default",
        "player": {
            "pos_x": player_node.global_position.x,
            "pos_y": player_node.global_position.y,
            "health": GameManager.player_health,
            "hunger": GameManager.player_hunger,
            "cold": GameManager.player_cold
        },
        "game": {
            "day": GameManager.current_day,
            "season": GameManager.current_season,
            "flock": GameManager.flock_count,
            "gold": GameManager.gold
        },
        "inventory": InventoryManager.inventory,
        "equipped": {
            "weapon": InventoryManager.equipped_weapon,
            "clothing": InventoryManager.equipped_clothing
        },
        "quests": {}  -- serialize QuestManager.quests
    }
    for q_id in QuestManager.quests:
        data["quests"][q_id] = {
            "active": QuestManager.quests[q_id]["is_active"],
            "complete": QuestManager.quests[q_id]["is_complete"]
        }
    var file = FileAccess.open(SAVE_PATH, FileAccess.WRITE)
    file.store_string(JSON.stringify(data))
    file.close()

func load_game() -> bool:
    if not has_save(): return false
    var file = FileAccess.open(SAVE_PATH, FileAccess.READ)
    var data = JSON.parse_string(file.get_as_text())
    file.close()
    if data == null: return false
    -- Restore all state from data dict
    GameManager.current_day = data["game"]["day"]
    GameManager.current_season = data["game"]["season"]
    -- etc.
    return true

Auto-save: in GameManager, when current_day changes and current_day % 3 == 0: SaveManager.save_game()

CREATE PauseMenu.tscn (CanvasLayer layer=8):
PauseMenu (CanvasLayer) [hidden by default]
  ColorRect [full screen, Color(0,0,0,0.5)] -- blur effect not available easily, use dark overlay
  VBoxContainer [centered]
    Label [text="Paused"]
    ResumeButton
    SaveButton
    SettingsButton
    MainMenuButton

PAUSEMENU.GD:
- Open: on back button press (Input.is_action_just_pressed("ui_cancel")) or swipe-down
- ResumeButton: hide pause menu, get_tree().paused = false
- SaveButton: SaveManager.save_game()
- MainMenuButton: get_tree().paused = false, go to MainMenu

CREATE GameOver.tscn (CanvasLayer layer=9):
GameOver (CanvasLayer)
  ColorRect [full screen dark]
  VBoxContainer
    Label [text="Game Over"]
    CauseLabel (Label) [text=""]  -- filled by script
    RetryButton [text="Try Again"]
    MenuButton [text="Main Menu"]

GAMEOVER.GD:
func show(cause: String):
    visible = true
    match cause:
        "starved": cause_label.text = "You starved in the valley."
        "frozen": cause_label.text = "You froze in the blizzard."
        "flock_lost": cause_label.text = "Your flock was lost."
        _: cause_label.text = "The valley has fallen."
    RetryButton.pressed.connect(func(): SaveManager.load_game())
    MenuButton.pressed.connect(func(): get_tree().change_scene_to_file("res://scenes/main/MainMenu.tscn"))

Connect to GameManager.game_over signal from GameWorld.

CREATE LoadingScreen.tscn:
LoadingScreen (CanvasLayer layer=10) [shown during scene transitions]
  ColorRect [full screen black]
  VBoxContainer
    ProverbLabel (Label) [centered, italic]
    TranslationLabel (Label) [centered, smaller]
    ProgressBar [at bottom, 0-100]

const PROVERBS = [
    {"kashmiri": "Wadi hamaari chhe", "english": "The valley is ours"},
    {"kashmiri": "Gadir khanis chhui wafadar", "english": "A shepherd never leaves his flock"},
    {"kashmiri": "Baraf aav chhe", "english": "The snow is coming"},
    {"kashmiri": "Bahar aayi chhe wapas", "english": "Spring will return"},
    {"kashmiri": "Khabardar reh", "english": "Be careful"},
]

Show random proverb on each load. Fake progress bar (tween 0→100 over 1.5s).

Give me: MainMenu.gd. SaveManager.gd (full). PauseMenu.gd. GameOver.gd. LoadingScreen.gd. All .tscn structures.
```

---

*Wadi-e-Kashmir — Built with love for the valley. وادئ کشمیر*
