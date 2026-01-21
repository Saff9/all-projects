extends CharacterBody3D
# =============================================================
# Shaman.gd — 3D Shaman Boss Enemy Script (Act 3 Boss)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

enum Phase { ONE, TWO, THREE, DEAD }

var health: float = 300.0
var armor: float = 50.0  # Reduces damage by 50% until crystal destroyed
var current_phase: Phase = Phase.ONE

var summon_cooldown: float = 2.0  # Spawn first summon quickly
var attack_cooldown: float = 3.0
var teleport_cooldown: float = 4.0

var player: Node3D = null

func _ready() -> void:
	add_to_group("enemy")
	player = get_tree().get_first_node_in_group("player")
	print("[Shaman] Ready. Shaman boss initialized.")

func _physics_process(delta: float) -> void:
	if current_phase == Phase.DEAD:
		return
		
	# Constant gravity if not sitting on floor
	if not is_on_floor():
		velocity.y -= 9.8 * delta
	else:
		velocity.y = 0.0
	move_and_slide()

func _process(delta: float) -> void:
	if current_phase == Phase.DEAD:
		return
		
	summon_cooldown -= delta
	attack_cooldown -= delta
	teleport_cooldown -= delta
	
	if not player:
		player = get_tree().get_first_node_in_group("player")
		
	# Look at player on horizontal plane
	if player:
		var look_dir = player.global_position - global_position
		look_dir.y = 0.0
		if look_dir.length() > 0.1:
			rotation.y = atan2(-look_dir.x, -look_dir.z)
			
	match current_phase:
		Phase.ONE:
			_phase_one(delta)
		Phase.TWO:
			_phase_two(delta)
		Phase.THREE:
			_phase_three(delta)

func _phase_one(_d: float) -> void:
	if teleport_cooldown <= 0:
		teleport_cooldown = 4.0
		_teleport()
	if summon_cooldown <= 0:
		summon_cooldown = 8.0
		_summon_wolves(2)

func _phase_two(_d: float) -> void:
	# Add slight teleporting in Phase 2 for battle dynamic
	if teleport_cooldown <= 0:
		teleport_cooldown = 6.0
		_teleport()
	if summon_cooldown <= 0:
		summon_cooldown = 6.0
		_summon_wraiths(1)
	if attack_cooldown <= 0:
		attack_cooldown = 3.0
		_ice_spread_shot(3)

func _phase_three(_d: float) -> void:
	# Faster teleports in Phase 3
	if teleport_cooldown <= 0:
		teleport_cooldown = 5.0
		_teleport()
	if summon_cooldown <= 0:
		summon_cooldown = 5.0
		_summon_wolves(1)
		_summon_wraiths(1)
	if attack_cooldown <= 0:
		attack_cooldown = 1.2
		_fire_projectile()

func _teleport() -> void:
	# Teleport spots scaled from 2D coordinates: (200,200), (800,200), (500,500), (200,600), (800,600)
	var spots = [
		Vector3(-44.0, 0.1, -28.0),
		Vector3(16.0, 0.1, -28.0),
		Vector3(-14.0, 0.1, 2.0),
		Vector3(-44.0, 0.1, 12.0),
		Vector3(16.0, 0.1, 12.0)
	]
	var next_spot = spots[randi() % spots.size()]
	global_position = next_spot
	print("[Shaman] Teleported to: %s" % str(global_position))
	
	# Visual effect: spawn a flash or title card notification
	AudioManager.play_sfx("player_dodge")

func _summon_wolves(count: int) -> void:
	var wolf_scene = load("res://scenes/animals/Wolf.tscn")
	for i in count:
		var w = wolf_scene.instantiate()
		get_parent().add_child(w)
		w.global_position = global_position + Vector3(randf_range(-3.0, 3.0), 0.1, randf_range(-3.0, 3.0))
		print("[Shaman] Summoned Shadow Wolf at: %s" % str(w.global_position))

func _summon_wraiths(count: int) -> void:
	var wraith_scene = load("res://scenes/animals/IceWraith.tscn")
	for i in count:
		var wr = wraith_scene.instantiate()
		get_parent().add_child(wr)
		wr.global_position = global_position + Vector3(randf_range(-3.0, 3.0), 1.5, randf_range(-3.0, 3.0))
		print("[Shaman] Summoned Ice Wraith at: %s" % str(wr.global_position))

func _ice_spread_shot(count: int) -> void:
	if not player:
		return
	var base_dir = (player.global_position - global_position).normalized()
	var base_angle = atan2(base_dir.x, base_dir.z)
	var spread = deg_to_rad(20.0) # 20 degrees difference
	
	var proj_scene = load("res://scenes/enemies/ShamanProjectile.tscn")
	for i in count:
		var angle_offset = (i - (count - 1) / 2.0) * spread
		var spawn_angle = base_angle + angle_offset
		var shoot_dir = Vector3(sin(spawn_angle), 0.0, cos(spawn_angle)).normalized()
		
		var p = proj_scene.instantiate()
		get_parent().add_child(p)
		p.global_position = global_position + Vector3(0.0, 1.2, 0.0) + shoot_dir * 1.5
		p.setup(shoot_dir, 12.0, 10.0) # 12 DMG, 10m/s speed
	print("[Shaman] Spread shot fired.")

func _fire_projectile() -> void:
	if not player:
		return
	var shoot_dir = (player.global_position - global_position).normalized()
	shoot_dir.y = 0.0 # Lock to XZ plane
	shoot_dir = shoot_dir.normalized()
	
	var proj_scene = load("res://scenes/enemies/ShamanProjectile.tscn")
	var p = proj_scene.instantiate()
	get_parent().add_child(p)
	p.global_position = global_position + Vector3(0.0, 1.2, 0.0) + shoot_dir * 1.5
	p.setup(shoot_dir, 15.0, 15.0) # 15 DMG, 15m/s speed (faster single shot)
	print("[Shaman] Fire single fast projectile.")

func take_damage(amount: float, _source: String = "") -> void:
	var actual = amount * (1.0 - armor / 100.0)
	health -= actual
	print("[Shaman] Took %.1f damage (Armor mult: %.2f) | HP left: %.1f" % [actual, (1.0 - armor / 100.0), health])
	
	# Spawn floating damage number
	var path = "res://scenes/ui/DamageNumber.tscn"
	if ResourceLoader.exists(path):
		var label = load(path).instantiate()
		get_parent().add_child(label)
		label.show_damage(actual, global_position + Vector3(0.0, 2.0, 0.0))
		
	if health <= 200.0 and current_phase == Phase.ONE:
		current_phase = Phase.TWO
		EventTitleCard.show_event("Phase 2!", "The Shaman summons freezing storms!", 3.0)
		print("[Shaman] Phase transition -> Phase TWO")
		
	if health <= 100.0 and current_phase == Phase.TWO:
		current_phase = Phase.THREE
		EventTitleCard.show_event("Phase 3!", "The Shaman attacks with high speed magical shards!", 3.0)
		print("[Shaman] Phase transition -> Phase THREE")
		
	if health <= 0.0 and current_phase != Phase.DEAD:
		_die()

func _die() -> void:
	current_phase = Phase.DEAD
	velocity = Vector3.ZERO
	print("[Shaman] Defeated! Starting death freeze...")
	
	# Visual/Audio death cue
	AudioManager.play_sfx("wolf_howl")
	
	# Play death animation delay
	await get_tree().create_timer(5.0).timeout
	
	EventTitleCard.show_event("The Shaman Falls!", "Bahar aayi chhe wapas — Spring will return.")
	
	# Trigger the cave collapse / escape sequence in ShamanCave
	var parent_cave = get_parent()
	if parent_cave and parent_cave.has_method("_start_escape"):
		parent_cave._start_escape()
		
	queue_free()
