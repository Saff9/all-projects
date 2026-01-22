extends CharacterBody3D
# =============================================================
# Wolf.gd — 3D Wolf Enemy AI Script (W2-02)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

enum State { PATROL, HUNT_SHEEP, HUNT_PLAYER, FLEE, DEAD }
var current_state: State = State.PATROL

# Stats
@export var max_health: float = 50.0
var health: float = 50.0

@export var speed: float = 5.6  # scaled from 140
@export var patrol_speed: float = 3.2 # scaled from 80
@export var flee_speed: float = 7.2 # scaled from 180

@export var attack_damage: float = 8.0
@export var attack_cooldown: float = 1.5

var attack_timer: float = 0.0
var patrol_points: Array[Vector3] = []
var patrol_index: int = 0
var target: Node3D = null
var _last_state: State = State.PATROL

# Navigation & Areas references
@onready var nav_agent: NavigationAgent3D = $NavigationAgent3D
@onready var detection_area: Area3D = $DetectionArea
@onready var player_detect: Area3D = $PlayerDetection
@onready var attack_area: Area3D = $AttackArea
@onready var state_debug: Label3D = $StateDebug
@onready var mesh_visual: MeshInstance3D = $VisualMesh
@onready var gravity: float = ProjectSettings.get_setting("physics/3d/default_gravity", 9.8)
@onready var anim_player: AnimationPlayer = get_node_or_null("VisualMesh/WolfModel/AnimationPlayer")

# =============================================================
# LIFECYCLE
# =============================================================
func _ready() -> void:
	add_to_group("enemy")
	health = max_health
	attack_timer = attack_cooldown # ready to bite immediately
	
	# Connect Area3D detection signals
	detection_area.body_entered.connect(_on_detection_body_entered)
	player_detect.body_entered.connect(_on_player_detect_body_entered)
	
	# Setup debug view if debug is active
	if OS.is_debug_build():
		state_debug.visible = true
		
	print("[%s] Spawned at %s" % [name, str(global_position)])


func _physics_process(delta: float) -> void:
	if current_state == State.DEAD:
		return
		
	# Apply gravity
	if not is_on_floor():
		velocity.y -= gravity * delta
	else:
		velocity.y = 0.0
		
	# Play wolf growl on aggro state change
	if current_state != _last_state:
		if (current_state == State.HUNT_PLAYER or current_state == State.HUNT_SHEEP) and _last_state == State.PATROL:
			AudioManager.play_sfx("wolf_growl")
		_last_state = current_state
		
	# State Actions & State Updates
	_update_debug_label()
	_physics_process_ai(delta)
	
	# Update animations
	_update_animations()


# =============================================================
# AI STATE MACHINE
# =============================================================
func _physics_process_ai(delta: float) -> void:
	match current_state:
		State.PATROL:
			if patrol_points.size() > 0:
				var patrol_pos = patrol_points[patrol_index]
				_move_toward_position(patrol_pos, patrol_speed, delta)
				
				# Check if arrived at patrol point
				var dist = global_position.distance_to(patrol_pos)
				dist = Vector2(dist, 0.0).length() # check flat distance
				if global_position.distance_to(patrol_pos) < 1.0:
					patrol_index = (patrol_index + 1) % patrol_points.size()
			else:
				velocity.x = 0.0
				velocity.z = 0.0
				
			# If we find sheep or player, we switch targets
			_scan_for_targets()
			
		State.HUNT_SHEEP:
			if not is_instance_valid(target) or target.is_dead:
				current_state = State.PATROL
				target = null
				return
				
			_move_toward_position(target.global_position, speed, delta)
			
			# Check continuous attack
			if _is_target_in_attack_area(target):
				target.take_damage(5.0 * delta)
				
		State.HUNT_PLAYER:
			if not is_instance_valid(target):
				current_state = State.PATROL
				target = null
				return
				
			_move_toward_position(target.global_position, speed, delta)
			
			# Check cooldown attack
			if _is_target_in_attack_area(target):
				attack_timer += delta
				if attack_timer >= attack_cooldown:
					attack_timer = 0.0
					target.take_damage(attack_damage, "wolf")
			else:
				# Keep attack timer charged when out of range
				attack_timer = attack_cooldown
				
		State.FLEE:
			var player = get_tree().get_first_node_in_group("player")
			if player:
				var flee_dir = (global_position - player.global_position).normalized()
				flee_dir.y = 0.0
				flee_dir = flee_dir.normalized()
				
				velocity.x = flee_dir.x * flee_speed
				velocity.z = flee_dir.z * flee_speed
				
				# Face away from player while fleeing
				if flee_dir.length() > 0.1:
					var target_angle = atan2(-flee_dir.x, -flee_dir.z)
					rotation.y = lerp_angle(rotation.y, target_angle, delta * 8.0)
					
				move_and_slide()
			else:
				current_state = State.PATROL


# ── Flat direct or Nav movement ────────────────────────────────
func _move_toward_position(target_pos: Vector3, movement_speed: float, delta: float) -> void:
	var next_pos: Vector3 = target_pos
	
	# Try pathfinding
	if nav_agent:
		nav_agent.target_position = target_pos
		if not nav_agent.is_navigation_finished():
			next_pos = nav_agent.get_next_path_position()
			
	var dir = (next_pos - global_position).normalized()
	dir.y = 0.0
	dir = dir.normalized()
	
	velocity.x = dir.x * movement_speed
	velocity.z = dir.z * movement_speed
	
	# Face movement direction
	if dir.length() > 0.1:
		var target_angle = atan2(-dir.x, -dir.z)
		rotation.y = lerp_angle(rotation.y, target_angle, delta * 8.0)
		
	move_and_slide()


func _scan_for_targets() -> void:
	# Check for player first (priority)
	var players = get_tree().get_nodes_in_group("player")
	for p in players:
		if global_position.distance_to(p.global_position) < 15.0:
			current_state = State.HUNT_PLAYER
			target = p
			return
			
	# Check for sheep (flock group)
	var flock = get_tree().get_nodes_in_group("flock")
	var nearest_sheep: Node3D = null
	var min_dist: float = 30.0 # detect range
	
	for s in flock:
		if is_instance_valid(s) and not s.is_dead:
			var dist = global_position.distance_to(s.global_position)
			if dist < min_dist:
				min_dist = dist
				nearest_sheep = s
				
	if nearest_sheep != null:
		current_state = State.HUNT_SHEEP
		target = nearest_sheep


func _is_target_in_attack_area(attack_target: Node3D) -> bool:
	var overlapping = attack_area.get_overlapping_bodies()
	return attack_target in overlapping


# =============================================================
# DETECTIONS
# =============================================================
func _on_detection_body_entered(body: Node3D) -> void:
	if current_state != State.PATROL:
		return
	if body.is_in_group("flock") and not body.is_dead:
		current_state = State.HUNT_SHEEP
		target = body


func _on_player_detect_body_entered(body: Node3D) -> void:
	if current_state != State.PATROL and current_state != State.HUNT_SHEEP:
		return
	if body.is_in_group("player"):
		current_state = State.HUNT_PLAYER
		target = body


# =============================================================
# COMBAT & DAMAGE
# =============================================================
func take_damage(amount: float) -> void:
	if current_state == State.DEAD:
		return
		
	health = clampf(health - amount, 0.0, max_health)
	print("[%s] took %.1f damage. HP: %.1f/%.1f" % [name, amount, health, max_health])
	
	# If HP goes below 20% -> Flee
	if health < max_health * 0.2 and health > 0.0:
		current_state = State.FLEE
	elif health <= 0.0:
		die()


func die() -> void:
	current_state = State.DEAD
	velocity = Vector3.ZERO
	print("[%s] Died. Dropping fur." % name)
	
	# Spawn Drop Item
	_drop_item()
	
	# Fade out mesh albedo alpha
	var active_mat = null
	if mesh_visual.mesh != null:
		active_mat = mesh_visual.get_active_material(0)
		
	if active_mat is StandardMaterial3D:
		var fade_mat = active_mat.duplicate()
		fade_mat.transparency = StandardMaterial3D.TRANSPARENCY_ALPHA
		mesh_visual.set_surface_override_material(0, fade_mat)
		
		var t = create_tween()
		t.tween_property(fade_mat, "albedo_color:a", 0.0, 0.5)
		t.tween_callback(queue_free)
	else:
		# Shrink model scale to represent disappearing
		var t = create_tween()
		t.tween_property(self, "scale", Vector3.ZERO, 0.4).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_IN)
		t.tween_callback(queue_free)


func _drop_item() -> void:
	var item_scene_path = "res://scenes/world/WorldItem.tscn"
	if ResourceLoader.exists(item_scene_path):
		var packed: PackedScene = load(item_scene_path)
		var item_inst = packed.instantiate()
		if item_inst.has_method("setup_item"):
			item_inst.setup_item("wool") # Drop wolf fur (wool placeholder)
		get_parent().add_child(item_inst)
		item_inst.global_position = global_position
		print("[Wolf] Spawned dropped wool item.")
	else:
		# Fallback: give item directly to inventory or print
		print("[Wolf] Stub Drop: Spawning drop item 'wool' at %s" % str(global_position))


func _update_debug_label() -> void:
	if not state_debug.visible:
		return
	var text_state = "PATROL"
	match current_state:
		State.PATROL: text_state = "PATROL"
		State.HUNT_SHEEP: text_state = "HUNT_SHEEP"
		State.HUNT_PLAYER: text_state = "HUNT_PLAYER"
		State.FLEE: text_state = "FLEE"
		State.DEAD: text_state = "DEAD"
	state_debug.text = text_state


func _update_animations() -> void:
	if not anim_player:
		return
		
	if current_state == State.DEAD:
		_play_anim("dead")
	elif attack_timer < 0.3: # Attacking state
		_play_anim("attack")
	else:
		var speed_val = velocity.length()
		if speed_val > 0.2:
			if current_state == State.HUNT_PLAYER or current_state == State.HUNT_SHEEP or current_state == State.FLEE:
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
