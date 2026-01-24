extends CanvasLayer
# =============================================================
# GameOver.gd — Game Over Screen Overlay (W4-05)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

@onready var cause_label: Label = $VBoxContainer/CauseLabel
@onready var retry_button: Button = $VBoxContainer/RetryButton
@onready var menu_button: Button = $VBoxContainer/MenuButton


func _ready() -> void:
	# Keep this overlay running when the tree is paused
	process_mode = Node.PROCESS_MODE_ALWAYS
	
	visible = false
	
	retry_button.pressed.connect(_on_retry_pressed)
	menu_button.pressed.connect(_on_menu_pressed)
	
	# Hover animations
	for btn in [retry_button, menu_button]:
		btn.mouse_entered.connect(func(): _animate_button_scale(btn, Vector2(1.05, 1.05)))
		btn.mouse_exited.connect(func(): _animate_button_scale(btn, Vector2(1.0, 1.0)))


func _animate_button_scale(btn: Button, target_scale: Vector2) -> void:
	var tween = create_tween()
	tween.tween_property(btn, "scale", target_scale, 0.15).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)


## Display the game over overlay and set the cause message
func show_game_over(cause: String) -> void:
	visible = true
	Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
	
	# Determine descriptive cause of death
	match cause:
		"starved":
			cause_label.text = "You starved in the valley."
		"frozen":
			cause_label.text = "You froze in the blizzard."
		"Your flock is lost", "flock_lost":
			cause_label.text = "Your flock was lost."
		_:
			cause_label.text = "The valley has fallen."
			
	print("[GameOver] Game Over Screen Displayed. Cause: %s" % cause_label.text)
	
	# Smooth fade-in animation
	$ColorRect.modulate.a = 0.0
	$VBoxContainer.modulate.a = 0.0
	var tween = create_tween().set_parallel(true)
	tween.tween_property($ColorRect, "modulate:a", 1.0, 0.5).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	tween.tween_property($VBoxContainer, "modulate:a", 1.0, 0.5).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)


func _on_retry_pressed() -> void:
	# Unpause the engine first
	get_tree().paused = false
	visible = false
	
	if SaveManager.has_save():
		print("[GameOver] Retrying from Save Game...")
		if SaveManager.load_game():
			get_tree().change_scene_to_file("res://scenes/main/GameWorld.tscn")
		else:
			# Fallback if load fails
			_restart_fresh()
	else:
		_restart_fresh()


func _restart_fresh() -> void:
	print("[GameOver] No save file found or load failed. Restarting fresh...")
	GameManager.reset()
	QuestManager.reset()
	InventoryManager.reset()
	SaveManager.is_loading_saved_game = false
	
	SceneTransition.current_scene_path = "res://scenes/world/Gulmarg.tscn"
	SceneTransition.pending_entry_point = "default"
	
	get_tree().change_scene_to_file("res://scenes/main/GameWorld.tscn")


func _on_menu_pressed() -> void:
	# Unpause the engine
	get_tree().paused = false
	visible = false
	print("[GameOver] Exiting to Main Menu...")
	get_tree().change_scene_to_file("res://scenes/main/MainMenu.tscn")
