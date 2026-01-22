extends Node
# =============================================================
# GameWorld.gd — persistent root scene script (3D Transition)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================
# PERSISTENT ROOT.
# Contains:
#   - WorldContainer: Node3D where the current level is instanced
#   - HUD: CanvasLayer overlay (2D survivor bars)
#   - FadeLayer: scene transition overlay (CanvasLayer)
#   - PauseMenu: pause UI overlay
#   - GameOver: death UI overlay
# =============================================================

const STARTING_SCENE: String = "res://scenes/world/Gulmarg.tscn"

@onready var world_container: Node3D = $WorldContainer
@onready var fade_layer: CanvasLayer = $FadeLayer

# Active level instance
var _current_world: Node = null


func _ready() -> void:
	add_to_group("game_world")
	print("[GameWorld3D] Persistent Manager Ready.")
	
	# Connect to GameManager signals safely
	if GameManager.is_connected("game_over", _on_game_over):
		GameManager.game_over.disconnect(_on_game_over)
	GameManager.game_over.connect(_on_game_over)
	
	# Register fade_layer with SceneTransition Autoload
	SceneTransition.fade_layer = fade_layer
	
	_fade_in()
	
	# Check if we should load a saved scene instead of starting fresh
	var target_scene: String = STARTING_SCENE
	var target_entry: String = "default"
	if SaveManager.is_loading_saved_game and SaveManager.saved_scene_path != "":
		target_scene = SaveManager.saved_scene_path
		target_entry = SaveManager.saved_entry_point
		
	_do_load_world(target_scene, target_entry)


func _fade_in() -> void:
	if fade_layer and fade_layer.has_node("AnimationPlayer"):
		var anim: AnimationPlayer = fade_layer.get_node("AnimationPlayer")
		anim.play("fade_out")


func fade_out(on_done: Callable) -> void:
	if fade_layer and fade_layer.has_node("AnimationPlayer"):
		var anim: AnimationPlayer = fade_layer.get_node("AnimationPlayer")
		anim.play("fade_in")
		
		var finished_conn: Callable
		finished_conn = func(anim_name: StringName):
			if anim_name == &"fade_in":
				anim.animation_finished.disconnect(finished_conn)
				on_done.call()
		anim.animation_finished.connect(finished_conn)
	else:
		on_done.call()


func load_world(scene_path: String, entry_point: String = "default") -> void:
	fade_out(func():
		_do_load_world(scene_path, entry_point)
	)


func _do_load_world(scene_path: String, entry_point: String) -> void:
	if _current_world != null:
		_current_world.queue_free()
		_current_world = null
		
	var packed: PackedScene = load(scene_path)
	if packed == null:
		push_error("[GameWorld3D] Could not load level scene: %s" % scene_path)
		return
		
	_current_world = packed.instantiate()
	world_container.add_child(_current_world)
	
	# Replace placeholder environment trees with the 3D Chinar model
	_replace_placeholder_trees(_current_world)
	
	if _current_world.has_method("set_entry_point"):
		_current_world.set_entry_point(entry_point)
		
	# Overwrite position if we loaded from save
	if SaveManager.is_loading_saved_game:
		var player = _current_world.get_node_or_null("Player")
		if player:
			player.global_position = SaveManager.saved_player_position
			print("[GameWorld3D] Player position overwritten from save: %s" % str(player.global_position))
		SaveManager.is_loading_saved_game = false
		
	_fade_in()
	print("[GameWorld3D] Level Loaded: %s (entry: %s)" % [scene_path, entry_point])


func _on_game_over(cause: String) -> void:
	print("[GameWorld3D] Game Over received — cause: %s" % cause)
	# Freeze gameplay nodes
	get_tree().paused = true
	
	# Show GameOver overlay screen
	var game_over_screen = get_node_or_null("GameOver")
	if game_over_screen and game_over_screen.has_method("show_game_over"):
		game_over_screen.show_game_over(cause)
	else:
		push_warning("[GameWorld3D] GameOver overlay screen not found.")


func _replace_placeholder_trees(node: Node) -> void:
	if node == null:
		return
		
	# Search for static body trees
	if node.name.to_lower().contains("tree_") and node is StaticBody3D:
		# Hide original placeholder trunk and canopy
		var trunk = node.get_node_or_null("Trunk")
		if not trunk: trunk = node.get_node_or_null("TrunkMesh")
		var canopy = node.get_node_or_null("Canopy")
		if not canopy: canopy = node.get_node_or_null("CanopyMesh")
		
		if trunk:
			trunk.visible = false
		if canopy:
			canopy.visible = false
			
		# Load and instance the 3D Chinar Tree model
		var chinar_path = "res://scenes/world/chinar.glb"
		if ResourceLoader.exists(chinar_path):
			var chinar_scene = load(chinar_path)
			if chinar_scene:
				var chinar = chinar_scene.instantiate()
				node.add_child(chinar)
				chinar.position = Vector3.ZERO
				# Add a random rotation for aesthetic variance
				chinar.rotation.y = randf_range(0.0, TAU)
		else:
			push_warning("[GameWorld3D] chinar.glb not found at: %s" % chinar_path)
			
	# Process children recursively
	for child in node.get_children():
		_replace_placeholder_trees(child)
