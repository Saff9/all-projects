extends CharacterBody3D
# =============================================================
# Player.gd — 3D Player Controller (W1-02 / W2-03 Combat)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

# ── Weapon Setup ──────────────────────────────────────────────
enum Weapon { SLINGSHOT, STAFF }
var current_weapon: Weapon = Weapon.SLINGSHOT

const PROJECTILE_SCENE = preload("res://scenes/animals/Projectile.tscn")

# Cooldown timers
var attack_cooldown: float = 0.0
var dodge_cooldown: float  = 0.0

# Dodge states
var is_rolling: bool       = false
var is_invincible: bool    = false

# ── Movement ──────────────────────────────────────────────────
const NORMAL_SPEED: float   = 4.5
const SPRINT_SPEED: float   = 7.5
const ROTATION_SPEED: float = 10.0

# ── Stamina ───────────────────────────────────────────────────
const MAX_STAMINA: float    = 100.0
const STAMINA_DRAIN: float  = 20.0
const STAMINA_REGEN: float  = 10.0

# ── Joystick & Camera Zones ───────────────────────────────────
var joystick_zone_max_x: float    = 432.0
const JOYSTICK_DEADZONE: float    = 10.0
const JOYSTICK_MAX_RADIUS: float  = 70.0
const CAMERA_SENSITIVITY: float   = 0.005

# =============================================================
# RUNTIME STATE
# =============================================================
var joystick_vector: Vector2 = Vector2.ZERO
var last_direction: Vector2  = Vector2.DOWN
var current_speed: float     = NORMAL_SPEED
var stamina: float           = MAX_STAMINA
var is_sprinting: bool       = false
var ice_speed_mult: float    = 1.0
var footstep_timer: float    = 0.0

# Camera yaw/pitch
var yaw: float = 0.0
var pitch: float = deg_to_rad(-15.0)

# Touch tracking
var _joystick_touch_id: int   = -1
var _joystick_start: Vector2  = Vector2.ZERO

var _camera_touch_id: int     = -1
var _camera_last_pos: Vector2 = Vector2.ZERO

# =============================================================
# NODE REFERENCES
# =============================================================
@onready var placeholder_mesh: MeshInstance3D = $PlaceholderMesh
@onready var spring_arm: SpringArm3D = $SpringArm3D
@onready var camera_3d: Camera3D = $SpringArm3D/Camera3D
@onready var hurt_box: Area3D = $HurtBox
@onready var attack_hitbox: Area3D = $PlaceholderMesh/AttackHitbox
@onready var active_weapon_label: Label = $MobileControls/ActiveWeaponLabel
@onready var anim_player: AnimationPlayer = get_node_or_null("PlaceholderMesh/AryanModel/AnimationPlayer")

# Stub references for 2D compatibility
var anim_sprite = null
var _joystick_visual: Control = null

# Gravity
@onready var gravity: float = ProjectSettings.get_setting("physics/3d/default_gravity", 9.8)

# =============================================================
# LIFECYCLE
# =============================================================
func _ready() -> void:
	add_to_group("player")
	
	# Instantiate virtual joystick visual overlay
	var js_script = load("res://scripts/ui/JoystickVisual.gd")
	if js_script:
		_joystick_visual = Control.new()
		_joystick_visual.set_script(js_script)
		var mc = get_node_or_null("MobileControls")
		if mc:
			mc.add_child(_joystick_visual)
	
	# Setup mobile controls layout and register resize callback
	_setup_mobile_controls()
	get_viewport().size_changed.connect(_setup_mobile_controls)
	
	# HurtBox signals
	hurt_box.body_entered.connect(_on_hurt_box_body_entered)
	hurt_box.area_entered.connect(_on_hurt_box_area_entered)
	
	# Attack hitbox signals (connect body + area entered)
	if attack_hitbox:
		attack_hitbox.monitoring = false
		attack_hitbox.body_entered.connect(_on_attack_hitbox_body_entered)
		attack_hitbox.area_entered.connect(_on_attack_hitbox_area_entered)
	
	yaw = spring_arm.rotation.y
	pitch = spring_arm.rotation.x
	last_direction = Vector2.DOWN
	
	_update_weapon_label()
	print("[Player3D] Combat Systems and Virtual Joystick Initialized.")


# =============================================================
# INPUT
# =============================================================
func _input(event: InputEvent) -> void:
	# Check for Weapon Switch Q key or custom action
	if event.is_action_pressed("switch_weapon") or (event is InputEventKey and event.pressed and event.keycode == KEY_Q):
		_switch_weapon()
		
	# Check for Dodge Space/K key or custom action
	if event.is_action_pressed("dodge") or (event is InputEventKey and event.pressed and event.keycode == KEY_K):
		_dodge()
		
	# Check for Attack J key or custom action
	if event.is_action_pressed("attack") or (event is InputEventKey and event.pressed and event.keycode == KEY_J):
		_attack()

	# Mobile Touches
	if event is InputEventScreenTouch:
		if event.pressed:
			# Left side: Joystick
			if event.position.x < joystick_zone_max_x and _joystick_touch_id == -1:
				_joystick_touch_id = event.index
				_joystick_start    = event.position
				joystick_vector    = Vector2.ZERO
				if _joystick_visual:
					_joystick_visual.base_pos = event.position
					_joystick_visual.drag_pos = event.position
					_joystick_visual.active = true
					_joystick_visual.queue_redraw()
			# Right side: Camera drag
			elif event.position.x >= joystick_zone_max_x and _camera_touch_id == -1:
				# Skip button touch areas dynamically
				if not _is_touch_on_button(event.position):
					_camera_touch_id = event.index
					_camera_last_pos = event.position
		else:
			if event.index == _joystick_touch_id:
				_joystick_touch_id = -1
				joystick_vector    = Vector2.ZERO
				if _joystick_visual:
					# Snap back to default resting position
					var viewport_size = get_viewport().get_visible_rect().size
					var default_pos = Vector2(250, viewport_size.y - 250)
					_joystick_visual.base_pos = default_pos
					_joystick_visual.drag_pos = default_pos
					_joystick_visual.active = true
					_joystick_visual.queue_redraw()
			elif event.index == _camera_touch_id:
				_camera_touch_id = -1
				
	elif event is InputEventScreenDrag:
		if event.index == _joystick_touch_id:
			var delta_pos: Vector2 = event.position - _joystick_start
			var dist: float = delta_pos.length()
			
			if dist < JOYSTICK_DEADZONE:
				joystick_vector = Vector2.ZERO
				if _joystick_visual:
					_joystick_visual.drag_pos = _joystick_start
			elif dist >= JOYSTICK_MAX_RADIUS:
				joystick_vector = delta_pos.normalized()
				if _joystick_visual:
					_joystick_visual.drag_pos = _joystick_start + delta_pos.normalized() * JOYSTICK_MAX_RADIUS
			else:
				joystick_vector = delta_pos / JOYSTICK_MAX_RADIUS
				if _joystick_visual:
					_joystick_visual.drag_pos = event.position
			
			if _joystick_visual:
				_joystick_visual.queue_redraw()
				
		elif event.index == _camera_touch_id:
			var drag_delta: Vector2 = event.position - _camera_last_pos
			_camera_last_pos = event.position
			
			yaw -= drag_delta.x * CAMERA_SENSITIVITY
			pitch -= drag_delta.y * CAMERA_SENSITIVITY
			pitch = clampf(pitch, deg_to_rad(-60.0), deg_to_rad(30.0))


# =============================================================
# PHYSICS
# =============================================================
func _physics_process(delta: float) -> void:
	# Tick Cooldowns
	attack_cooldown = maxf(attack_cooldown - delta, 0.0)
	dodge_cooldown  = maxf(dodge_cooldown - delta, 0.0)
	
	is_sprinting = Input.is_action_pressed("sprint")
	
	_update_stamina(delta)
	_update_speed()
	
	# SpringArm rotation
	spring_arm.rotation.y = yaw
	spring_arm.rotation.x = pitch
	
	# Skip movement if currently rolling (position is handled by Tween)
	if not is_rolling:
		_apply_movement_3d(delta)
		
	# Check footsteps
	_check_footsteps(delta)
	
	# Update 3D character animations
	_update_animations()


# ── Stamina ───────────────────────────────────────────────────
func _update_stamina(delta: float) -> void:
	var is_moving: bool = joystick_vector.length() > 0.1 or _get_keyboard_move_vector().length() > 0.1
	
	if is_sprinting and is_moving and stamina > 0.0:
		stamina = maxf(stamina - STAMINA_DRAIN * delta, 0.0)
	else:
		stamina = minf(stamina + STAMINA_REGEN * delta, MAX_STAMINA)


# ── Speed ─────────────────────────────────────────────────────
func _update_speed() -> void:
	var can_sprint: bool = is_sprinting and stamina > 0.0
	current_speed = SPRINT_SPEED if can_sprint else NORMAL_SPEED
	current_speed *= GameManager.blizzard_speed_mult
	current_speed *= ice_speed_mult


# ── Move and Slide ────────────────────────────────────────────
func _apply_movement_3d(delta: float) -> void:
	var input_vec = joystick_vector
	if input_vec.length() <= 0.1:
		input_vec = _get_keyboard_move_vector()
		
	if not is_on_floor():
		velocity.y -= gravity * delta
	else:
		velocity.y = 0.0
		
	if input_vec.length() > 0.1:
		var camera_rotation_y: float = spring_arm.global_rotation.y
		var move_dir := Vector3(input_vec.x, 0.0, input_vec.y).rotated(Vector3.UP, camera_rotation_y).normalized()
		
		velocity.x = move_dir.x * current_speed
		velocity.z = move_dir.z * current_speed
		
		var target_angle = atan2(-move_dir.x, -move_dir.z)
		placeholder_mesh.rotation.y = lerp_angle(placeholder_mesh.rotation.y, target_angle, delta * ROTATION_SPEED)
		
		last_direction = Vector2(move_dir.x, move_dir.z).normalized()
	else:
		velocity.x = 0.0
		velocity.z = 0.0
		
	move_and_slide()


func _get_keyboard_move_vector() -> Vector2:
	return Input.get_vector("move_left", "move_right", "move_up", "move_down")


# =============================================================
# COMBAT IMPLEMENTATION (W2-03)
# =============================================================

# Touch buttons connections (wires up via engine or code)
func _attack() -> void:
	if attack_cooldown > 0.0 or is_rolling:
		return
		
	match current_weapon:
		Weapon.SLINGSHOT:
			_fire_slingshot()
		Weapon.STAFF:
			_swing_staff()


func _fire_slingshot() -> void:
	attack_cooldown = 0.8
	
	var proj = PROJECTILE_SCENE.instantiate()
	get_parent().add_child(proj)
	
	# Spawn at player chest height
	proj.global_position = global_position + Vector3(0.0, 0.9, 0.0)
	
	# Forward direction vector
	var facing_dir = Vector3(last_direction.x, 0.0, last_direction.y).normalized()
	var dmg = 15.0
	if InventoryManager.ITEM_DB.has("slingshot"):
		dmg = InventoryManager.ITEM_DB["slingshot"].get("damage", 15.0)
	proj.setup(facing_dir, dmg, 16.0) # speed 16.0m/s (scaled)
	
	AudioManager.play_sfx("slingshot_shoot")
	print("[Combat] Fired slingshot projectile.")


func _swing_staff() -> void:
	attack_cooldown = 0.6
	
	# Enable staff attack overlap monitoring for 0.2s
	attack_hitbox.monitoring = true
	
	var weapon = InventoryManager.equipped_weapon
	if weapon.contains("sword") or weapon.contains("blade"):
		AudioManager.play_sfx("sword_swing")
		print("[Combat] Swinging sword...")
	else:
		AudioManager.play_sfx("staff_swing")
		print("[Combat] Swinging staff...")
	
	await get_tree().create_timer(0.2).timeout
	attack_hitbox.monitoring = false


func _switch_weapon() -> void:
	current_weapon = Weapon.STAFF if current_weapon == Weapon.SLINGSHOT else Weapon.SLINGSHOT
	_update_weapon_label()
	print("[Combat] Switched Weapon to: %s" % ("STAFF" if current_weapon == Weapon.STAFF else "SLINGSHOT"))


func _update_weapon_label() -> void:
	if active_weapon_label:
		active_weapon_label.text = "Weapon: %s" % ("Staff" if current_weapon == Weapon.STAFF else "Slingshot")


func _dodge() -> void:
	if dodge_cooldown > 0.0 or is_rolling:
		return
		
	is_rolling = true
	is_invincible = true
	
	# Roll direction
	var roll_dir = Vector3(last_direction.x, 0.0, last_direction.y).normalized()
	var target_pos = global_position + roll_dir * 3.2 # 3.2m roll length (scaled from 80px)
	
	# Collision check: restrict movement if rolling into boundaries
	target_pos.x = clampf(target_pos.x, -63.0, 63.0)
	target_pos.z = clampf(target_pos.z, -47.0, 47.0)
	
	var tween = create_tween()
	tween.tween_property(self, "global_position", target_pos, 0.15)
	
	AudioManager.play_sfx("player_dodge")
	
	await tween.finished
	is_rolling = false
	
	# Cooldown and lingering invincibility frames
	await get_tree().create_timer(0.25).timeout
	is_invincible = false
	dodge_cooldown = 1.2


# =============================================================
# DAMAGE & EFFECTS
# =============================================================
func take_damage(amount: float, source: String = "unknown") -> void:
	if is_invincible or amount <= 0.0:
		return
		
	GameManager.modify_health(-amount)
	AudioManager.play_sfx("player_hurt")
	print("[Player3D] %.1f damage from '%s' | HP left: %.1f" % [
		amount, source, GameManager.player_health
	])
	
	# Trigger visual indicators
	camera_shake()
	_spawn_damage_number(amount)


func camera_shake() -> void:
	if camera_3d == null:
		return
	var tween = create_tween()
	# Random vertical/horizontal offsets shaking effect in 3D over 0.3s
	tween.tween_property(camera_3d, "h_offset", randf_range(-0.25, 0.25), 0.05)
	tween.tween_property(camera_3d, "v_offset", randf_range(-0.25, 0.25), 0.05)
	tween.tween_property(camera_3d, "h_offset", randf_range(-0.15, 0.15), 0.05)
	tween.tween_property(camera_3d, "v_offset", randf_range(-0.15, 0.15), 0.05)
	tween.tween_property(camera_3d, "h_offset", 0.0, 0.1)
	tween.tween_property(camera_3d, "v_offset", 0.0, 0.1)


func _spawn_damage_number(amount: float) -> void:
	var path = "res://scenes/ui/DamageNumber.tscn"
	if ResourceLoader.exists(path):
		var label = load(path).instantiate()
		get_parent().add_child(label)
		label.show_damage(amount, global_position + Vector3(0.0, 1.2, 0.0))


func _on_hurt_box_body_entered(body: Node) -> void:
	if body.has_method("get_attack_damage") and body.is_in_group("enemy"):
		take_damage(body.get_attack_damage(), body.name)


func _on_hurt_box_area_entered(area: Area3D) -> void:
	if area.has_method("get_attack_damage") and area.get_parent().is_in_group("enemy"):
		take_damage(area.get_attack_damage(), area.get_parent().name)


# ── Staff Attack Hitbox callbacks ──────────────────────────────
func _on_attack_hitbox_body_entered(body: Node) -> void:
	if body.is_in_group("enemy") and body.has_method("take_damage"):
		var damage = 25.0
		var weapon = InventoryManager.equipped_weapon
		if InventoryManager.ITEM_DB.has(weapon):
			damage = InventoryManager.ITEM_DB[weapon].get("damage", 25.0)
		body.take_damage(damage, weapon)
		if body.has_method("stun"):
			body.stun(0.5)


func _on_attack_hitbox_area_entered(area: Area3D) -> void:
	var parent = area.get_parent()
	if parent.is_in_group("enemy") and parent.has_method("take_damage"):
		var damage = 25.0
		var weapon = InventoryManager.equipped_weapon
		if InventoryManager.ITEM_DB.has(weapon):
			damage = InventoryManager.ITEM_DB[weapon].get("damage", 25.0)
		parent.take_damage(damage, weapon)
		if parent.has_method("stun"):
			parent.stun(0.5)


# ── Staff Attack Attributes (for hitbox connection details) ───
func get_attack_damage() -> float:
	return 25.0

func get_stun_duration() -> float:
	return 0.5


# =============================================================
# GETTERS
# =============================================================
func get_stamina_percent() -> float:
	return stamina / MAX_STAMINA

func get_facing_direction() -> Vector2:
	return last_direction

func get_current_speed() -> float:
	return current_speed

func is_moving() -> bool:
	return velocity.length() > 0.1

func _check_footsteps(delta: float) -> void:
	if is_moving() and is_on_floor() and not is_rolling:
		footstep_timer += delta
		var interval = 0.45
		if is_sprinting:
			interval = 0.3
			
		if footstep_timer >= interval:
			footstep_timer = 0.0
			_play_footstep_sound()
	else:
		footstep_timer = 0.0

func _play_footstep_sound() -> void:
	var scene = get_tree().current_scene
	if not scene:
		return
	var scene_name = scene.name.to_lower()
	var sound = "footstep_grass"
	
	if scene_name.contains("srinagar") or scene_name.contains("cave"):
		sound = "footstep_stone"
	elif scene_name.contains("pahalgam"):
		sound = "footstep_snow"
	elif scene_name.contains("gulmarg"):
		if GameManager.current_season == "winter":
			sound = "footstep_snow"
		else:
			sound = "footstep_grass"
	elif scene_name.contains("budgam"):
		sound = "footstep_grass"
		
	AudioManager.play_sfx(sound)


func _update_animations() -> void:
	if not anim_player:
		return
		
	if is_rolling:
		_play_anim("roll")
	elif attack_cooldown > 0.4:
		_play_anim("attack")
	else:
		var horizontal_velocity = Vector3(velocity.x, 0.0, velocity.z)
		if horizontal_velocity.length() > 0.2:
			var can_sprint = is_sprinting and stamina > 0.0
			if can_sprint:
				_play_anim("run")
			else:
				_play_anim("walk")
		else:
			_play_anim("idle")


func _play_anim(anim_name: String) -> void:
	if not anim_player:
		return
		
	var anim_list = anim_player.get_animation_list()
	var target_anim = ""
	for anim in anim_list:
		if anim.to_lower().contains(anim_name.to_lower()):
			target_anim = anim
			break
			
	if target_anim != "":
		if anim_player.current_animation != target_anim:
			anim_player.play(target_anim)


# Setup mobile control nodes dynamically based on orientation
func _setup_mobile_controls() -> void:
	var mc = get_node_or_null("MobileControls")
	if not mc:
		return
		
	var viewport_size = get_viewport().get_visible_rect().size
	var w = viewport_size.x
	var h = viewport_size.y
	
	# Determine orientation
	var is_landscape = w > h
	joystick_zone_max_x = w * 0.4
	
	var sprint_btn = mc.get_node_or_null("SprintButton")
	var sprint_lbl = mc.get_node_or_null("SprintLabel")
	var attack_btn = mc.get_node_or_null("AttackButton")
	var attack_lbl = mc.get_node_or_null("AttackLabel")
	var dodge_btn  = mc.get_node_or_null("DodgeButton")
	var dodge_lbl  = mc.get_node_or_null("DodgeLabel")
	var switch_btn = mc.get_node_or_null("SwitchButton")
	var switch_lbl = mc.get_node_or_null("SwitchLabel")
	
	# Reset anchors to prevent warnings when manually setting size and position
	for lbl in [sprint_lbl, attack_lbl, dodge_lbl, switch_lbl]:
		if lbl:
			lbl.set_anchors_preset(Control.PRESET_TOP_LEFT)
	
	# Position joystick base permanently
	var js_center = Vector2(250, h - 250)
	if _joystick_visual:
		_joystick_visual.base_pos = js_center
		_joystick_visual.drag_pos = js_center
		_joystick_visual.active = true
		_joystick_visual.queue_redraw()
		
	if is_landscape:
		# Landscape layout placement
		if attack_btn:
			attack_btn.position = Vector2(w - 240, h - 180)
			if attack_lbl:
				attack_lbl.position = attack_btn.position
				attack_lbl.size = Vector2(140, 60)
				
		if sprint_btn:
			sprint_btn.position = Vector2(w - 240, h - 320)
			if sprint_lbl:
				sprint_lbl.position = sprint_btn.position
				sprint_lbl.size = Vector2(140, 60)
				
		if dodge_btn:
			dodge_btn.position = Vector2(w - 440, h - 180)
			if dodge_lbl:
				dodge_lbl.position = dodge_btn.position
				dodge_lbl.size = Vector2(140, 60)
				
		if switch_btn:
			switch_btn.position = Vector2(w - 240, 100)
			if switch_lbl:
				switch_lbl.position = switch_btn.position
				switch_lbl.size = Vector2(140, 60)
	else:
		# Portrait layout placement (1080x1920 reference)
		if attack_btn:
			attack_btn.position = Vector2(w - 240, h - 240)
			if attack_lbl:
				attack_lbl.position = attack_btn.position
				attack_lbl.size = Vector2(140, 60)
				
		if sprint_btn:
			sprint_btn.position = Vector2(w - 240, h - 580)
			if sprint_lbl:
				sprint_lbl.position = sprint_btn.position
				sprint_lbl.size = Vector2(140, 60)
				
		if dodge_btn:
			dodge_btn.position = Vector2(w - 440, h - 240)
			if dodge_lbl:
				dodge_lbl.position = dodge_btn.position
				dodge_lbl.size = Vector2(140, 60)
				
		if switch_btn:
			switch_btn.position = Vector2(w - 240, 262)
			if switch_lbl:
				switch_lbl.position = switch_btn.position
				switch_lbl.size = Vector2(140, 60)


# Check if screen coordinate falls inside any active touch button rect
func _is_touch_on_button(pos: Vector2) -> bool:
	var mc = get_node_or_null("MobileControls")
	if not mc:
		return false
		
	var buttons = ["SprintButton", "AttackButton", "DodgeButton", "SwitchButton"]
	for btn_name in buttons:
		var btn = mc.get_node_or_null(btn_name)
		if btn and btn.visible:
			# TouchScreenButton bounds (140 width, 60 height)
			var rect = Rect2(btn.position, Vector2(140, 60))
			if rect.has_point(pos):
				return true
	return false

