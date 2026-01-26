extends Node
# =============================================================
# BlizzardEvent.gd — Winter Blizzard Event Controller (W3-05)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

var is_active: bool = false

# Check timer for triggering blizzards periodically during winter
var _check_timer: Timer = null

# Dynamic 3D spotlight pointing at player to act as the visibility mask in the fog
var _visibility_light: SpotLight3D = null

func _ready() -> void:
	# Periodically check to trigger a random blizzard
	_check_timer = Timer.new()
	add_child(_check_timer)
	_check_timer.wait_time = 15.0 # Check weather conditions every 15s
	_check_timer.timeout.connect(_on_weather_check)
	_check_timer.start()
	
	print("[BlizzardEvent] Weather check timer started.")

func _on_weather_check() -> void:
	if GameManager.current_season == "winter" and not is_active:
		# 25% chance of starting a blizzard on check
		if randf() < 0.25:
			start_blizzard()

func start_blizzard() -> void:
	if GameManager.current_season != "winter":
		return
	if is_active:
		return
	is_active = true
	
	print("[BlizzardEvent] Blizzard starting!")
	
	# Show warning card
	EventTitleCard.show_event("BLIZZARD!", "Baraf aav chhe wapas! — The blizzard is returning!", 3.0)
	
	# Activate blizzard global state in GameManager (multiplies cold drain x5, halves player speed)
	GameManager.start_blizzard()
	
	# Handle optional particle/visual overrides if they exist as child nodes (compatibility with 2D/3D layouts)
	var particles = get_node_or_null("BlizzardParticles")
	if particles and "emitting" in particles:
		particles.emitting = true
		
	var fog = get_node_or_null("FogOverlay")
	if fog:
		fog.visible = true
		
	# In 3D, simulate the circular light mask by spawning a SpotLight3D attached above the player pointing down
	var player = get_tree().get_first_node_in_group("player")
	if player:
		_visibility_light = SpotLight3D.new()
		player.add_child(_visibility_light)
		_visibility_light.position = Vector3(0.0, 5.0, 0.0) # 5 meters above player
		_visibility_light.rotation.x = deg_to_rad(-90.0) # Pointing straight down
		_visibility_light.light_color = Color(0.9, 0.95, 1.0)
		_visibility_light.light_energy = 12.0
		_visibility_light.spot_range = 12.0
		_visibility_light.spot_angle = 45.0
		print("[BlizzardEvent] Spawned player spotlight visibility mask.")
		
	var mask = get_node_or_null("VisibilityMask")
	if mask:
		mask.visible = true
		
	# Start footprints trail loop
	spawn_footprint_trail()
	
	# Duration 60-120s random
	var duration = randf_range(60.0, 120.0)
	await get_tree().create_timer(duration).timeout
	
	end_blizzard()

func end_blizzard() -> void:
	if not is_active:
		return
	is_active = false
	
	print("[BlizzardEvent] Blizzard ending.")
	
	# Restore normal weather state
	GameManager.end_blizzard()
	
	var particles = get_node_or_null("BlizzardParticles")
	if particles and "emitting" in particles:
		particles.emitting = false
		
	var fog = get_node_or_null("FogOverlay")
	if fog:
		fog.visible = false
		
	if _visibility_light and is_instance_valid(_visibility_light):
		_visibility_light.queue_free()
		_visibility_light = null
		
	var mask = get_node_or_null("VisibilityMask")
	if mask:
		mask.visible = false

## Spawns flat footprint sprites at the player's feet that fade out over 8 seconds.
func spawn_footprint_trail() -> void:
	var step_count = 0
	while is_active:
		# Spawn footprints every 0.5 seconds
		await get_tree().create_timer(0.5).timeout
		if not is_active:
			break
			
		var player = get_tree().get_first_node_in_group("player")
		if player and player.is_moving():
			# Alternating left/right foot offset for realism
			step_count += 1
			var offset_side = 0.2 if (step_count % 2 == 0) else -0.2
			var player_facing = player.get_facing_direction() # Vector2 direction on floor
			
			# Orthogonal vector for side offset
			var side_dir = Vector2(-player_facing.y, player_facing.x).normalized()
			var spawn_offset = Vector3(side_dir.x * offset_side, 0.05, side_dir.y * offset_side)
			
			# Create Sprite3D for footprint
			var footprint = Sprite3D.new()
			
			# Create a simple pixel texture dynamically to avoid loading physical texture files
			var img = Image.create(8, 12, false, Image.FORMAT_RGBA8)
			# Fill dark grey translucent footprint color
			img.fill(Color(0.18, 0.22, 0.3, 0.4))
			var tex = ImageTexture.create_from_image(img)
			footprint.texture = tex
			
			# Place slightly above snow height (Y=0.05) to avoid mesh clip Z-fighting
			footprint.global_position = player.global_position + spawn_offset
			
			# Make it flat on the ground plane (rotation.x = -90 deg)
			footprint.billboard = BaseMaterial3D.BILLBOARD_DISABLED
			footprint.rotation.x = deg_to_rad(-90.0)
			# Align footprint rotation with player facing angle
			footprint.rotation.y = -atan2(player_facing.x, player_facing.y)
			
			get_parent().add_child(footprint)
			
			# Fade out and free after 8 seconds
			var tween = create_tween()
			tween.tween_property(footprint, "modulate:a", 0.0, 8.0)
			tween.finished.connect(func(): footprint.queue_free())
