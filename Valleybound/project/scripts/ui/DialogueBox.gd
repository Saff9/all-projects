extends CanvasLayer
# =============================================================
# DialogueBox.gd — UI Dialogue Box controller (W2-04)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

@onready var npc_name_label: Label = $Panel/MarginContainer/HBox/VBox/NPCNameLabel
@onready var dialogue_text: RichTextLabel = $Panel/MarginContainer/HBox/VBox/DialogueText
@onready var tap_prompt: Label = $Panel/TapPrompt

var lines: Array[Dictionary] = []
var current_line: int = 0
var is_typing: bool = false
var _skip_typing: bool = false

signal dialogue_finished

func _ready() -> void:
	add_to_group("dialogue_box")
	
	# Dialogue box starts hidden
	visible = false


func show_dialogue(npc_name: String, dialogue: Array[Dictionary]) -> void:
	npc_name_label.text = npc_name
	lines = dialogue
	current_line = 0
	visible = true
	
	# Block player movement while talking
	var player = get_tree().get_first_node_in_group("player")
	if player and player.has_method("set_physics_process"):
		player.set_physics_process(false)
		player.velocity = Vector3.ZERO
		
	show_line()


func show_line() -> void:
	if current_line >= lines.size():
		# Dialogue finished
		visible = false
		dialogue_finished.emit()
		
		# Restore player movement
		var player = get_tree().get_first_node_in_group("player")
		if player and player.has_method("set_physics_process"):
			player.set_physics_process(true)
		return
		
	is_typing = true
	tap_prompt.visible = false
	_skip_typing = false
	
	await type_text(lines[current_line].get("text", ""))
	
	is_typing = false
	tap_prompt.visible = true


func type_text(full: String) -> void:
	dialogue_text.text = ""
	for ch in full:
		if _skip_typing:
			dialogue_text.text = full
			break
		dialogue_text.text += ch
		await get_tree().create_timer(1.0 / 40.0).timeout


func _input(event: InputEvent) -> void:
	if not visible:
		return
		
	# Check touch, mouse left click, or interact keys
	var is_advancing = false
	if event is InputEventScreenTouch and event.pressed:
		is_advancing = true
	elif event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		is_advancing = true
	elif event.is_action_pressed("interact") or event.is_action_pressed("ui_accept"):
		is_advancing = true
		
	if is_advancing:
		# Consume input so player doesn't trigger roll/sprint/attack
		get_viewport().set_input_as_handled()
		
		if is_typing:
			# Skip to end of current line
			_skip_typing = true
		else:
			current_line += 1
			show_line()
