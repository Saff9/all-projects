extends "res://scripts/npcs/NPC.gd"
# =============================================================
# Rukhsana.gd — 3D Companion NPC Script (W3-04 equivalent)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

const PROJECTILE_SCENE = preload("res://scenes/animals/Projectile.tscn")

var player: CharacterBody3D = null
var follow_distance: float = 3.5
var attack_range: float = 12.0
var attack_cooldown: float = 2.0
var is_freed: bool = false
var anim_player: AnimationPlayer = null

# Speed parameter
const RUN_SPEED: float = 5.5
const ROTATION_SPEED: float = 8.0


func _ready_npc() -> void:
	npc_id = "rukhsana"
	npc_name = "Rukhsana"
	has_quest = false
	
	dialogue_lines = [
		{"text": "Stay close, Aryan. These forests are filled with dark beasts."},
		{"text": "The bridge ahead leads to Srinagar, but wolves roam nearby."}
	]
	
	# Override placeholder mesh color to a distinct orange-red
	var mesh_inst: MeshInstance3D = get_node_or_null("PlaceholderMesh")
	if mesh_inst:
		var active_mat = mesh_inst.get_active_material(0)
		if active_mat is StandardMaterial3D:
			var companion_mat = active_mat.duplicate()
			companion_mat.albedo_color = Color(0.9, 0.4, 0.2) # Orange-red
			mesh_inst.set_surface_override_material(0, companion_mat)
			
	_update_quest_marker()
	anim_player = get_node_or_null("PlaceholderMesh/RukhsanaModel/AnimationPlayer")
	if anim_player:
		print("[Rukhsana] Initialized with animation set: ", anim_player.get_animation_list())


func free_her() -> void:
	is_freed = true
	player = get_tree().get_first_node_in_group("player") as CharacterBody3D
	
	# Show dialogue
	var dialogue_box = get_tree().get_first_node_in_group("dialogue_box")
	if dialogue_box:
		dialogue_box.show_dialogue("Rukhsana", [
			{"text": "Shukriya! Thank you, Aryan. I will help you."},
			{"text": "I know these forests. Stay close."}
		])
		
	# Disable interaction zone and quest marker
	if quest_marker:
		quest_marker.visible = false
	if interact_zone:
		interact_zone.monitoring = false
		
	print("[Rukhsana] Companion has been freed and is now following player.")


func _physics_process(delta: float) -> void:
	if not is_freed or player == null:
		# Standard NPC physics (standing, gravity)
		if not is_on_floor():
			velocity.y -= gravity * delta
		else:
			velocity.y = 0.0
		velocity.x = 0.0
		velocity.z = 0.0
		move_and_slide()
		_play_anim("idle")
		return
		
	# ── 1. Follow Player logic ───────────────────────────────────
	var to_player = player.global_position - global_position
	var dist = to_player.length()
	
	if not is_on_floor():
		velocity.y -= gravity * delta
	else:
		velocity.y = 0.0
		
	if dist > follow_distance:
		var dir = to_player.normalized()
		# Face direction of movement
		var target_angle = atan2(-dir.x, -dir.z)
		var mesh_inst = get_node_or_null("PlaceholderMesh")
		if mesh_inst:
			mesh_inst.rotation.y = lerp_angle(mesh_inst.rotation.y, target_angle, delta * ROTATION_SPEED)
			
		velocity.x = dir.x * RUN_SPEED
		velocity.z = dir.z * RUN_SPEED
		_play_anim("run")
	else:
		velocity.x = 0.0
		velocity.z = 0.0
		# Play idle if we aren't performing a custom action like shooting
		if attack_cooldown < 1.6:
			_play_anim("idle")
		
	move_and_slide()
	
	# ── 2. Combat projectile logic ───────────────────────────────
	attack_cooldown -= delta
	if attack_cooldown <= 0.0:
		var nearest_enemy = _find_nearest_enemy()
		if nearest_enemy:
			var enemy_dist = global_position.distance_to(nearest_enemy.global_position)
			if enemy_dist < attack_range:
				_shoot_projectile(nearest_enemy)
				attack_cooldown = 2.0


func _find_nearest_enemy() -> Node3D:
	var enemies = get_tree().get_nodes_in_group("enemy")
	var nearest: Node3D = null
	var min_dist: float = 999.0
	
	for enemy in enemies:
		if is_instance_valid(enemy) and enemy is CharacterBody3D:
			# Skip dead wolves
			if enemy.has_method("is_dead") and enemy.is_dead():
				continue
			var d = global_position.distance_to(enemy.global_position)
			if d < min_dist:
				min_dist = d
				nearest = enemy
				
	return nearest


func _shoot_projectile(target_node: Node3D) -> void:
	if PROJECTILE_SCENE == null:
		return
		
	var proj = PROJECTILE_SCENE.instantiate()
	get_parent().add_child(proj)
	
	# Spawn at chest height
	proj.global_position = global_position + Vector3(0.0, 0.9, 0.0)
	
	var dir = (target_node.global_position - global_position).normalized()
	dir.y = 0.0 # restrict shoot vector to XZ plane
	dir = dir.normalized()
	
	proj.setup(dir, 12.0, 15.0) # dmg: 12.0, speed: 15m/s
	AudioManager.play_sfx("slingshot_shoot")
	_play_anim("attack")
	print("[Rukhsana] Shot projectile toward enemy: %s" % target_node.name)


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
