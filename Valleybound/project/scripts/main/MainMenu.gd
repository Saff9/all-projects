extends Control
# =============================================================
# MainMenu.gd — Main Menu Screen Logic (W4-05)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

@onready var new_game_button: Button = $ButtonContainer/NewGameButton
@onready var continue_button: Button = $ButtonContainer/ContinueButton
@onready var settings_button: Button = $ButtonContainer/SettingsButton
@onready var credits_button: Button = $ButtonContainer/CreditsButton
@onready var leaf_particles: GPUParticles2D = $LeafParticles


func _ready() -> void:
	# Hide mouse cursor in game, but make sure it's visible in menu if testing on desktop
	Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
	
	# Configure Continue button based on save existence
	continue_button.disabled = not SaveManager.has_save()
	
	# Connect buttons to their actions
	new_game_button.pressed.connect(_on_new_game_pressed)
	continue_button.pressed.connect(_on_continue_pressed)
	credits_button.pressed.connect(_on_credits_pressed)
	settings_button.pressed.connect(_on_settings_pressed)
	
	# Micro-interactions: scale buttons up slightly on hover (if using mouse)
	for btn in [new_game_button, continue_button, settings_button, credits_button]:
		btn.mouse_entered.connect(func(): _animate_button_scale(btn, Vector2(1.05, 1.05)))
		btn.mouse_exited.connect(func(): _animate_button_scale(btn, Vector2(1.0, 1.0)))
	
	# Play serene Kashmiri music on startup
	AudioManager.play_music("spring_village")
	
	print("[MainMenu] Loaded. Save Game Found: %s" % str(SaveManager.has_save()))


func _animate_button_scale(btn: Button, target_scale: Vector2) -> void:
	var tween = create_tween()
	tween.tween_property(btn, "scale", target_scale, 0.15).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)


func _on_new_game_pressed() -> void:
	# Fresh reset of all systems
	SaveManager.delete_save()
	GameManager.reset()
	QuestManager.reset()
	InventoryManager.reset()
	SaveManager.is_loading_saved_game = false
	
	# Standardize scene entry points
	SceneTransition.current_scene_path = "res://scenes/world/Gulmarg.tscn"
	SceneTransition.pending_entry_point = "default"
	
	print("[MainMenu] Starting New Game. Loading GameWorld...")
	get_tree().change_scene_to_file("res://scenes/main/GameWorld.tscn")


func _on_continue_pressed() -> void:
	if continue_button.disabled:
		return
		
	print("[MainMenu] Loading Save Game...")
	if SaveManager.load_game():
		get_tree().change_scene_to_file("res://scenes/main/GameWorld.tscn")
	else:
		push_error("[MainMenu] Save failed to load.")


func _on_credits_pressed() -> void:
	print("[MainMenu] Loading Credits...")
	get_tree().change_scene_to_file("res://scenes/ui/Credits.tscn")


func _on_settings_pressed() -> void:
	# Visual toast overlay to show settings toggle
	print("[MainMenu] Settings Button Pressed (Stub).")
	var label = Label.new()
	label.text = "Settings: Default values configured."
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.add_theme_font_size_override("font_size", 20)
	label.add_theme_color_override("font_color", Color(1.0, 0.85, 0.1))
	label.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
	label.position.y -= 100
	add_child(label)
	
	var tween = create_tween()
	tween.tween_property(label, "modulate:a", 0.0, 2.0).set_delay(1.0)
	tween.tween_callback(label.queue_free)
