extends CanvasLayer
# =============================================================
# PauseMenu.gd — Game Pause Overlay (W4-05)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

@onready var resume_button: Button = $VBoxContainer/ResumeButton
@onready var save_button: Button = $VBoxContainer/SaveButton
@onready var settings_button: Button = $VBoxContainer/SettingsButton
@onready var main_menu_button: Button = $VBoxContainer/MainMenuButton
@onready var status_label: Label = $VBoxContainer/StatusLabel

# Touch gesture tracking variables
var swipe_start: Vector2 = Vector2.ZERO
var is_swiping: bool = false
const SWIPE_THRESHOLD: float = 120.0


func _ready() -> void:
	# Keep this overlay running when the tree is paused
	process_mode = Node.PROCESS_MODE_ALWAYS
	
	visible = false
	status_label.text = ""
	
	resume_button.pressed.connect(resume_game)
	save_button.pressed.connect(_on_save_pressed)
	settings_button.pressed.connect(_on_settings_pressed)
	main_menu_button.pressed.connect(_on_main_menu_pressed)
	
	# Hover animations
	for btn in [resume_button, save_button, settings_button, main_menu_button]:
		btn.mouse_entered.connect(func(): _animate_button_scale(btn, Vector2(1.05, 1.05)))
		btn.mouse_exited.connect(func(): _animate_button_scale(btn, Vector2(1.0, 1.0)))


func _animate_button_scale(btn: Button, target_scale: Vector2) -> void:
	var tween = create_tween()
	tween.tween_property(btn, "scale", target_scale, 0.15).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)


func _input(event: InputEvent) -> void:
	# ── Escape / Back Button Toggle ───────────────────────────
	if event.is_action_just_pressed("ui_cancel"):
		# Don't trigger if GameOver screen is currently visible
		var game_over = get_parent().get_node_or_null("GameOver")
		if game_over and game_over.visible:
			return
			
		if visible:
			resume_game()
		else:
			open_pause_menu()
		get_viewport().set_input_as_handled()
		
	# ── Touch Swipe Gestures ──────────────────────────────────
	elif event is InputEventScreenTouch:
		if event.pressed:
			swipe_start = event.position
			is_swiping = true
		else:
			is_swiping = false
			
	elif event is InputEventScreenDrag and is_swiping:
		var diff = event.position - swipe_start
		# Don't trigger if GameOver screen is currently visible
		var game_over = get_parent().get_node_or_null("GameOver")
		if game_over and game_over.visible:
			return
			
		# Swipe Down to Pause (drag down y > threshold)
		if not visible and diff.y > SWIPE_THRESHOLD and abs(diff.x) < 100.0:
			is_swiping = false
			open_pause_menu()
			get_viewport().set_input_as_handled()
		# Swipe Up to Resume (drag up y < -threshold)
		elif visible and diff.y < -SWIPE_THRESHOLD and abs(diff.x) < 100.0:
			is_swiping = false
			resume_game()
			get_viewport().set_input_as_handled()


func open_pause_menu() -> void:
	visible = true
	get_tree().paused = true
	status_label.text = ""
	Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
	print("[PauseMenu] Game paused.")
	
	# Smooth fade-in overlay animation
	$ColorRect.modulate.a = 0.0
	$VBoxContainer.modulate.a = 0.0
	var tween = create_tween().set_parallel(true)
	tween.tween_property($ColorRect, "modulate:a", 1.0, 0.2).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	tween.tween_property($VBoxContainer, "modulate:a", 1.0, 0.2).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)


func resume_game() -> void:
	var tween = create_tween().set_parallel(true)
	tween.tween_property($ColorRect, "modulate:a", 0.0, 0.15)
	tween.tween_property($VBoxContainer, "modulate:a", 0.0, 0.15)
	await tween.finished
	
	visible = false
	get_tree().paused = false
	# Re-lock mouse if player is active
	Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
	print("[PauseMenu] Game resumed.")


func _on_save_pressed() -> void:
	SaveManager.save_game()
	status_label.text = "Game Saved!"
	AudioManager.play_sfx("use_consumable") # play simple confirmation chime
	
	# Clear label after 2 seconds
	var tween = create_tween()
	tween.tween_interval(2.0)
	tween.tween_callback(func(): status_label.text = "")


func _on_settings_pressed() -> void:
	status_label.text = "Settings: Audio set to normal."
	var tween = create_tween()
	tween.tween_interval(2.0)
	tween.tween_callback(func(): status_label.text = "")


func _on_main_menu_pressed() -> void:
	get_tree().paused = false
	print("[PauseMenu] Exiting to Main Menu...")
	get_tree().change_scene_to_file("res://scenes/main/MainMenu.tscn")
