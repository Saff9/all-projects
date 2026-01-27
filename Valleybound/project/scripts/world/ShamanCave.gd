extends Node3D
# =============================================================
# ShamanCave.gd — 3D Shaman Cave dungeon controller (Act 3)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

@onready var boulder_scene = preload("res://scenes/effects/AvalancheBoulder.tscn")
@onready var _exit_door: Area3D = $ExitDoor

var _escape_active: bool = false

# =============================================================
# LIFECYCLE
# =============================================================
func _ready() -> void:
	# Spawn player at starting position near bottom (Z = 40.0)
	var player = get_tree().get_first_node_in_group("player")
	if player:
		player.global_position = Vector3(0.0, 0.1, 40.0)
		
	# Connect ExitDoor signal
	_exit_door.body_entered.connect(_on_exit_door_entered)
	# Lock exit door initially until Shaman falls
	_exit_door.monitoring = false

	# Play combat tense music
	if AudioManager.has_method("play_music"):
		AudioManager.play_music("combat")

	print("[ShamanCave3D] Loaded. Ready for Shaman battle.")

# =============================================================
# ESCAPE SEQUENCE
# =============================================================
func _start_escape() -> void:
	if _escape_active:
		return
	_escape_active = true
	
	print("[ShamanCave3D] Shaman dead! Cave is collapsing! Escape sequence activated.")
	
	# Play panic / collapse wind noise
	if AudioManager.has_method("play_sfx"):
		AudioManager.play_sfx("avalanche_rumble")
		
	# Show announcement title card
	EventTitleCard.show_event("ESCAPE!", "Run! The cave is collapsing! — 20 seconds!", 4.0)
	
	# Open exit door
	_exit_door.monitoring = true
	
	# Spawn 5 boulders per second for 20 seconds
	for i in 20:
		if not _escape_active:
			break
		await get_tree().create_timer(1.0).timeout
		
		# Shake screen
		var player = get_tree().get_first_node_in_group("player")
		if player and player.has_method("camera_shake"):
			player.camera_shake()
			
		for j in 5:
			var b = boulder_scene.instantiate()
			add_child(b)
			# Spawn points on ceiling (Y = 10.0) along X in [-54, 26] and Z in [-40, 40]
			var spawn_x = randf_range(-54.0, 26.0)
			var spawn_z = randf_range(-40.0, 40.0)
			b.global_position = Vector3(spawn_x, 10.0, spawn_z)

# =============================================================
# EXIT TRIGGER
# =============================================================
func _on_exit_door_entered(body: Node) -> void:
	if body.is_in_group("player") and _escape_active:
		print("[ShamanCave3D] Aryan escaped! Transitioning to Credits...")
		_escape_active = false
		SceneTransition.go_to("res://scenes/ui/Credits.tscn", "")
