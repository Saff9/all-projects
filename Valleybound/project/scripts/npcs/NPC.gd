extends CharacterBody3D
# =============================================================
# NPC.gd — 3D Base NPC AI Class (W2-04)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

@export var npc_id: String = ""
@export var npc_name: String = "NPC"
@export var dialogue_lines: Array[Dictionary] = []
var has_quest: bool = false

var player_in_range: bool = false

# Node references
@onready var interact_zone: Area3D = $InteractZone
@onready var quest_marker: Node3D = $QuestMarker
@onready var anim_player: AnimationPlayer = $AnimationPlayer
@onready var gravity: float = ProjectSettings.get_setting("physics/3d/default_gravity", 9.8)

# =============================================================
# LIFECYCLE
# =============================================================
func _ready() -> void:
	add_to_group("npc")
	
	# Start bobbing animation
	if anim_player and anim_player.has_animation("bob_quest"):
		anim_player.play("bob_quest")
		
	# Connect Area3D signals
	interact_zone.body_entered.connect(_on_interact_zone_body_entered)
	interact_zone.body_exited.connect(_on_interact_zone_body_exited)
	
	# Initial quest marker state
	_update_quest_marker()
	
	_ready_npc()


# Virtual ready setup for subclasses
func _ready_npc() -> void:
	pass


func _physics_process(delta: float) -> void:
	if not is_on_floor():
		velocity.y -= gravity * delta
	else:
		velocity.y = 0.0
		
	velocity.x = 0.0
	velocity.z = 0.0
	move_and_slide()


# =============================================================
# INTERACTION & DIALOGUE
# =============================================================
func _on_interact_zone_body_entered(body: Node3D) -> void:
	if body.is_in_group("player"):
		player_in_range = true
		print("[NPC] Player entered talk range of %s. Press E/Switch to interact." % npc_name)


func _on_interact_zone_body_exited(body: Node3D) -> void:
	if body.is_in_group("player"):
		player_in_range = false
		print("[NPC] Player left talk range of %s." % npc_name)


func _unhandled_input(event: InputEvent) -> void:
	if player_in_range and event.is_action_pressed("interact"):
		# Consume input to avoid other triggers
		get_viewport().set_input_as_handled()
		start_dialogue()


func start_dialogue() -> void:
	var dialogue_box = get_tree().get_first_node_in_group("dialogue_box")
	if dialogue_box == null:
		push_error("[NPC] Could not find DialogueBox instance in the scene!")
		return
		
	# Open dialogue box
	dialogue_box.show_dialogue(npc_name, dialogue_lines)
	
	# Connect finished callback (one shot)
	if not dialogue_box.dialogue_finished.is_connected(_on_dialogue_done):
		dialogue_box.dialogue_finished.connect(_on_dialogue_done, CONNECT_ONE_SHOT)


func _on_dialogue_done() -> void:
	# Trigger quest manager callbacks
	if QuestManager.has_method("npc_talked"):
		QuestManager.npc_talked(npc_id)
		
	# Refresh quest marker state
	_update_quest_marker()


func _update_quest_marker() -> void:
	if quest_marker == null:
		return
		
	var is_visible = false
	if QuestManager.has_method("npc_has_quest"):
		is_visible = QuestManager.npc_has_quest(npc_id)
	else:
		is_visible = has_quest
		
	quest_marker.visible = is_visible
