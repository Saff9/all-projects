extends Node
# =============================================================
# Main.gd — Entry point script for Main.tscn
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================
# Main.tscn is the run/main_scene. On _ready() it immediately
# hands off to MainMenu.tscn.
# =============================================================

const MAIN_MENU_SCENE: String = "res://scenes/main/MainMenu.tscn"


func _ready() -> void:
	# Defer so the engine has fully initialised before changing scene
	call_deferred("_load_main_menu")


func _load_main_menu() -> void:
	var err: int = get_tree().change_scene_to_file(MAIN_MENU_SCENE)
	if err != OK:
		push_error("[Main] Failed to load MainMenu.tscn — error code: %d" % err)
