extends Node
# =============================================================
# AvalancheEvent.gd — Gulmarg Avalanche Event Script (W3-05)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

@onready var boulder_scene = preload("res://scenes/effects/AvalancheBoulder.tscn")

@export var barn_area: Area3D
@export var barn_light: SpotLight3D

var is_active: bool = false
var survive_timer: float = 15.0

func _ready() -> void:
	# Fallback Node Lookups if not set in editor
	if barn_area == null:
		barn_area = get_node_or_null("../BarnArea")
	if barn_light == null:
		barn_light = get_node_or_null("../BarnLight")
	
	if barn_area:
		barn_area.body_entered.connect(_on_barn_entered)
	
	if barn_light:
		barn_light.visible = false # start turned off

func trigger() -> void:
	if is_active: 
		return
	is_active = true
	
	# Play avalanche rumble SFX
	AudioManager.play_sfx("avalanche_rumble")
	
	# Show warning card
	EventTitleCard.show_event("AVALANCHE!", "Baraf aav chhe! — The snow is coming!", 3.5)
	
	# Wait for initial banner warning before the avalanche impacts
	await get_tree().create_timer(3.5).timeout
	
	if not is_active:
		return
		
	# Trigger camera shake (amplitude/strength = 4.0, duration = 2.0s)
	camera_shake(2.0, 8.0)
	
	# Start spawning boulders
	spawn_boulders()
	
	# Illuminate the barn safe zone
	if barn_light:
		barn_light.visible = true
	
	# Create survival timer
	var timer = Timer.new()
	add_child(timer)
	timer.wait_time = survive_timer
	timer.one_shot = true
	timer.timeout.connect(_on_time_up)
	timer.start()

func spawn_boulders() -> void:
	for i in 20:
		if not is_active:
			break
		await get_tree().create_timer(0.3).timeout
		if not is_active:
			break
			
		var b = boulder_scene.instantiate()
		get_parent().add_child(b)
		
		# Translate 2D (50, 1230) to 3D X in [-59.0, 59.0]
		# Spawn high on Y-axis (hills at Y=10) and Z=-45 (North boundary)
		b.global_position = Vector3(randf_range(-59.0, 59.0), 10.0, -45.0)
		
		# Roll South with impulse on Z axis (impulse 20 to 40 matches 200-400 in 2D)
		var impulse_x = randf_range(-5.0, 5.0)
		var impulse_z = randf_range(20.0, 40.0)
		b.apply_central_impulse(Vector3(impulse_x, 0.0, impulse_z))

func _on_time_up() -> void:
	if is_active:
		is_active = false
		# Player failed to reach the barn
		GameManager.modify_health(-30.0)
		EventTitleCard.show_event("Failed!", "You were crushed by the avalanche.")
		
		# Turn off barn light
		if barn_light:
			barn_light.visible = false

func _on_barn_entered(body: Node) -> void:
	if body.is_in_group("player") and is_active:
		is_active = false
		
		# Stop spawning and clear existing boulders
		for b in get_tree().get_nodes_in_group("boulders"):
			b.queue_free()
			
		EventTitleCard.show_event("Survived!", "The barn shelters you from the storm.")
		
		# Turn off barn light after success
		if barn_light:
			barn_light.visible = false

func camera_shake(duration: float, strength: float) -> void:
	# Attempt to find the active camera from player node
	var player = get_tree().get_first_node_in_group("player")
	if player and player.has_method("camera_shake"):
		player.camera_shake()
	else:
		# Fallback to direct active viewport camera tween
		var camera = get_viewport().get_camera_3d()
		if camera:
			var tween = create_tween()
			var steps = int(duration / 0.05)
			for i in steps:
				var offset_h = randf_range(-strength, strength) * 0.02
				var offset_v = randf_range(-strength, strength) * 0.02
				tween.tween_property(camera, "h_offset", offset_h, 0.05)
				tween.tween_property(camera, "v_offset", offset_v, 0.05)
			tween.tween_property(camera, "h_offset", 0.0, 0.05)
			tween.tween_property(camera, "v_offset", 0.0, 0.05)
