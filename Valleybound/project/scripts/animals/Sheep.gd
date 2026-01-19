extends Animal
# =============================================================
# Sheep.gd — 3D Sheep AI Character Script (W2-01)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

enum State { IDLE, WANDER, FOLLOW, FLEE, DEAD }
var current_state: State = State.IDLE

# Speed constants scaled from 2D
const WANDER_SPEED: float = 2.0  # scaled from 50
const FOLLOW_SPEED: float = 2.8  # scaled from 70
const FLEE_SPEED: float   = 5.2  # scaled from 130

# Distance constants scaled from 2D (10:1 ratio)
const MIN_FOLLOW_DIST: float = 2.4 # scaled from 60px
const FLEE_RANGE: float      = 15.0 # scaled from 150px
const ARRIVAL_DIST: float    = 0.5

# Wander timing
const MIN_WAIT: float = 3.0
const MAX_WAIT: float = 5.0

# Wander Target on XZ plane
var _wander_target: Vector3 = Vector3.ZERO
var _home_position: Vector3 = Vector3.ZERO
var _is_sheared: bool = false
var baa_timer: float = 0.0
var next_baa_time: float = 0.0

@onready var _timer: Timer = Timer.new()
@onready var anim_player: AnimationPlayer = get_node_or_null("VisualMesh/SheepModel/AnimationPlayer")

signal can_shear(can: bool)

# =============================================================
# LIFECYCLE
# =============================================================
func _ready_animal() -> void:
	# Add the helper timer to the node tree
	add_child(_timer)
	_timer.timeout.connect(_on_wander_timer_timeout)
	
	_home_position = global_position
	_wander_target = global_position
	
	# Connect interaction signals
	can_interact.connect(func(can): can_shear.emit(can))
	
	_start_idle_timer()
	next_baa_time = randf_range(10.0, 30.0)


func _physics_process_animal(delta: float) -> void:
	if is_dead:
		return
		
	# Play periodic sheep baa
	baa_timer += delta
	if baa_timer >= next_baa_time:
		baa_timer = 0.0
		next_baa_time = randf_range(15.0, 45.0)
		AudioManager.play_sfx("sheep_baa")
		
	# 1. Update State Decisions
	_update_ai_state()
	
	# 2. Execute Movement based on State
	match current_state:
		State.IDLE:
			velocity.x = 0.0
			velocity.z = 0.0
		State.WANDER:
			_move_to_position(_wander_target, WANDER_SPEED, delta)
		State.FOLLOW:
			if player_body:
				# Move toward player target but stop at minimum distance
				var dir_to_player = (player_body.global_position - global_position).normalized()
				var target_pos = player_body.global_position - dir_to_player * MIN_FOLLOW_DIST
				_move_to_position(target_pos, FOLLOW_SPEED, delta)
		State.FLEE:
			# Find nearest enemy to flee from
			var nearest_enemy = _get_nearest_enemy()
			if nearest_enemy:
				var flee_dir = (global_position - nearest_enemy.global_position).normalized()
				# Pick a target point in the opposite direction
				var target_pos = global_position + flee_dir * 5.0
				_move_to_position(target_pos, FLEE_SPEED, delta)
				
	move_and_slide()
	_update_animations()


# =============================================================
# AI LOGIC
# =============================================================
func _update_ai_state() -> void:
	# Check for flee conditions (wolves/enemies nearby)
	var nearest_enemy = _get_nearest_enemy()
	if nearest_enemy != null:
		if current_state != State.FLEE:
			current_state = State.FLEE
			_timer.stop()
		return
		
	# If we were fleeing but enemies are gone, return to IDLE
	if current_state == State.FLEE:
		current_state = State.IDLE
		_start_idle_timer()
		return
		
	# Check for follow conditions (player nearby)
	if player_in_detection and player_body != null:
		var dist_to_player = global_position.distance_to(player_body.global_position)
		if dist_to_player > MIN_FOLLOW_DIST:
			if current_state != State.FOLLOW:
				current_state = State.FOLLOW
				_timer.stop()
			return
		else:
			# Player is close enough, just stay IDLE facing player
			if current_state == State.FOLLOW:
				current_state = State.IDLE
				_start_idle_timer()
				
	# Return to standard wander/idle if player moves away
	if current_state == State.FOLLOW:
		current_state = State.IDLE
		_start_idle_timer()


func _move_to_position(target_pos: Vector3, movement_speed: float, delta: float) -> void:
	var to_target: Vector3 = target_pos - global_position
	to_target.y = 0.0 # clamp vertical
	
	if to_target.length() <= ARRIVAL_DIST:
		if current_state == State.WANDER:
			current_state = State.IDLE
			velocity.x = 0.0
			velocity.z = 0.0
			_start_idle_timer()
	else:
		var dir = to_target.normalized()
		velocity.x = dir.x * movement_speed
		velocity.z = dir.z * movement_speed
		
		# Rotate sheep to face movement direction
		var target_angle = atan2(-dir.x, -dir.z)
		rotation.y = lerp_angle(rotation.y, target_angle, delta * 6.0)


func _get_nearest_enemy() -> Node3D:
	var nearest_enemy: Node3D = null
	var min_dist: float = FLEE_RANGE
	
	for enemy in enemy_bodies:
		if is_instance_valid(enemy):
			var dist = global_position.distance_to(enemy.global_position)
			if dist < min_dist:
				min_dist = dist
				nearest_enemy = enemy
				
	return nearest_enemy


# =============================================================
# WANDER TIMING & TIMEOUTS
# =============================================================
func _start_idle_timer() -> void:
	if is_dead:
		return
	_timer.wait_time = randf_range(MIN_WAIT, MAX_WAIT)
	_timer.one_shot  = true
	_timer.start()


func _on_wander_timer_timeout() -> void:
	if current_state != State.IDLE or is_dead:
		return
		
	# Pick random target within 10 meters on the horizontal plane
	var angle: float = randf() * TAU
	var dist: float = randf_range(3.0, 10.0)
	
	# QUA is a typo placeholder for TAU. Let's make sure it's TAU!
	# (Self correction: Godot uses TAU for 2*PI)
	
	var target = _home_position + Vector3(
		cos(angle) * dist,
		0.0,
		sin(angle) * dist
	)
	
	# Clamp target within 3D boundaries
	target.x = clampf(target.x, -62.0, 62.0)
	target.z = clampf(target.z, -46.0, 46.0)
	target.y = _home_position.y
	
	_wander_target = target
	current_state = State.WANDER


# =============================================================
# INTERACTIONS & DEATH
# =============================================================
func _on_interact() -> void:
	if _is_sheared:
		print("[%s] Already sheared today." % name)
		return
		
	_is_sheared = true
	print("[%s] Shearing Sheep: Got wool!" % name)
	
	# Give wool to InventoryManager if active
	if InventoryManager.has_method("add_item"):
		InventoryManager.add_item("wool", 1)
		
	# Visual feed-back: change color to slightly darker grey when wool is removed
	var mesh_inst: MeshInstance3D = get_node_or_null("VisualMesh")
	if mesh_inst:
		var mat: Material = mesh_inst.get_active_material(0)
		if mat is StandardMaterial3D:
			var sheared_mat = mat.duplicate()
			sheared_mat.albedo_color = Color(0.75, 0.75, 0.75) # darker, less woolly look
			mesh_inst.set_surface_override_material(0, sheared_mat)


func _update_animations() -> void:
	if not anim_player:
		return
		
	if is_dead:
		_play_anim("dead")
	else:
		var speed_val = velocity.length()
		if speed_val > 0.2:
			if current_state == State.FLEE:
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


func _die_animal() -> void:
	print("[%s] has died." % name)
	GameManager.decrement_flock()
	set_physics_process(false)
	var col = get_node_or_null("CollisionShape3D")
	if col:
		col.disabled = true
	var t = create_tween()
	t.tween_property(self, "scale", Vector3.ZERO, 0.4).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_IN)
	t.tween_callback(queue_free)
