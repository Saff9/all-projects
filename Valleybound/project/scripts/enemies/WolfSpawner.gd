extends Node3D
# =============================================================
# WolfSpawner.gd — 3D Wolf Pack Spawner (W2-02)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

@export var max_packs: int = 3
@export var wolf_pack_scene: PackedScene
@export var spawn_interval_override: float = 0.0

var active_packs: Array[Node3D] = []

@onready var timer: Timer = Timer.new()

# =============================================================
# LIFECYCLE
# =============================================================
func _ready() -> void:
	# Fallback load if wolf_pack_scene not assigned
	if wolf_pack_scene == null:
		wolf_pack_scene = load("res://scenes/animals/WolfPack.tscn")
		
	# Setup timer child
	add_child(timer)
	timer.timeout.connect(_on_spawner_timer_timeout)
	
	# Connect to season change
	GameManager.season_changed.connect(_on_season_changed)
	
	# Start initial timer based on current season
	_update_timer_wait_time()
	timer.start()
	
	print("[WolfSpawner3D] Ready. Season: %s | Next spawn in %.1f seconds." % [GameManager.current_season, timer.wait_time])


# =============================================================
# SEASON MANAGEMENT
# =============================================================
func _on_season_changed(_season: String, _day: int) -> void:
	_update_timer_wait_time()
	# Restart with new duration
	timer.start()
	print("[WolfSpawner3D] Season changed. Next spawn in %.1f seconds." % timer.wait_time)


func _update_timer_wait_time() -> void:
	if spawn_interval_override > 0.0:
		timer.wait_time = spawn_interval_override
	elif GameManager.current_season in ["spring", "summer"]:
		timer.wait_time = 90.0
	else:
		timer.wait_time = 45.0


# =============================================================
# SPAWN TIMEOUT
# =============================================================
func _on_spawner_timer_timeout() -> void:
	# 1. Clean up invalid/freed packs from list
	_clean_active_packs()
	
	# 2. Check limits
	var total_wolves = _get_total_wolves()
	if active_packs.size() < max_packs and total_wolves < 12:
		_spawn_pack()
	else:
		print("[WolfSpawner3D] Spawn skipped. Active Packs: %d/%d, Wolves: %d/12" % [
			active_packs.size(), max_packs, total_wolves
		])


func _clean_active_packs() -> void:
	var clean: Array[Node3D] = []
	for pack in active_packs:
		if is_instance_valid(pack):
			clean.append(pack)
	active_packs = clean


func _get_total_wolves() -> int:
	var count = 0
	for pack in active_packs:
		if is_instance_valid(pack):
			count += pack.get_child_count()
	return count


func _spawn_pack() -> void:
	if wolf_pack_scene == null:
		push_error("[WolfSpawner3D] Pack scene not loaded!")
		return
		
	# Select a random edge of the 3D XZ map limits (X: [-64, 64], Z: [-48, 48])
	var edge = randi() % 4
	var spawn_pos = Vector3.ZERO
	
	match edge:
		0: # Top Edge
			spawn_pos = Vector3(randf_range(-55.0, 55.0), 0.1, -42.0)
		1: # Bottom Edge
			spawn_pos = Vector3(randf_range(-55.0, 55.0), 0.1, 42.0)
		2: # Left Edge
			spawn_pos = Vector3(-58.0, 0.1, randf_range(-40.0, 40.0))
		3: # Right Edge
			spawn_pos = Vector3(58.0, 0.1, randf_range(-40.0, 40.0))
			
	var pack_inst = wolf_pack_scene.instantiate()
	get_parent().add_child(pack_inst) # spawn in same parent node as spawner (level ground)
	pack_inst.global_position = spawn_pos
	active_packs.append(pack_inst)
	
	print("[WolfSpawner3D] Spawned new WolfPack at %s." % str(spawn_pos))
