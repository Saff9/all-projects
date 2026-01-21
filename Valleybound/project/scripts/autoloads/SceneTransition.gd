extends Node
# =============================================================
# SceneTransition.gd — 3D Scene Transition Manager (W2-05 / W4-05)
# Autoloaded as "SceneTransition"
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

var pending_entry_point: String = ""
var fade_layer: CanvasLayer = null
var current_scene_path: String = "res://scenes/world/Gulmarg.tscn"

func go_to(scene_path: String, entry_point: String) -> void:
	pending_entry_point = entry_point
	current_scene_path = scene_path
	
	# Instantiate and show loading screen
	var loading_screen_scene = load("res://scenes/ui/LoadingScreen.tscn")
	var loading_screen = null
	if loading_screen_scene:
		loading_screen = loading_screen_scene.instantiate()
		get_tree().root.add_child(loading_screen)
		# Start loading (runs proverb selection and 1.5s progress bar tween)
		await loading_screen.start_loading()
	
	# Find persistent GameWorld manager (registered in group "game_world")
	var game_world = get_tree().get_first_node_in_group("game_world")
	if game_world:
		# Use direct load since loading screen covers everything
		game_world._do_load_world(scene_path, entry_point)
	else:
		# Fallback if level is run directly in editor without GameWorld.tscn
		print("[SceneTransition] GameWorld not found, loading scene directly: %s" % scene_path)
		get_tree().change_scene_to_file(scene_path)
		
	if loading_screen:
		# Fade out and clean up
		await loading_screen.finish_loading()
		loading_screen.queue_free()


func get_entry_point() -> String:
	return pending_entry_point
