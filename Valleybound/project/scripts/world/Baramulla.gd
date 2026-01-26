extends Node3D
# =============================================================
# Baramulla.gd — 3D Baramulla Forest Level Script (W3-03 equivalent)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

# Entry points
const ENTRY_POINTS: Dictionary = {
	"default":       Vector3(0.0, 0.1, 40.0),  # Near Srinagar transition (South side)
	"from_srinagar": Vector3(0.0, 0.1, 40.0),  # Spawns at South side
}

@onready var _player: CharacterBody3D = $Player
@onready var _to_srinagar: Area3D = $Transitions/ToSrinagar
@onready var _bridge_ambush: Area3D = $BridgeAmbush
@onready var _rescue_wolves: Node3D = $RescueWolves
@onready var _rukhsana = $Rukhsana

var _ambush_triggered: bool = false


func _ready() -> void:
	# ── 1. Spawn player at correct entry point ────────────────
	var entry_key: String = SceneTransition.get_entry_point()
	var spawn_pos: Vector3 = ENTRY_POINTS.get(entry_key, ENTRY_POINTS["default"])
	_player.global_position = spawn_pos
	
	# ── 2. Auto-start Rescue Quest ────────────────────────────
	if QuestManager.QUEST_DATA.has("QUEST_RESCUE"):
		var q = QuestManager.QUEST_DATA["QUEST_RESCUE"]
		if not q["is_active"] and not q["is_complete"]:
			QuestManager.start_quest("QUEST_RESCUE")
			
	# ── 3. Connect signals ────────────────────────────────────
	_to_srinagar.body_entered.connect(_on_to_srinagar_body_entered)
	_bridge_ambush.body_entered.connect(_on_bridge_ambush_body_entered)
	
	# ── 4. Monitor Rescue Wolves count ────────────────────────
	for wolf in _rescue_wolves.get_children():
		wolf.tree_exited.connect(_on_rescue_wolf_killed)
		
	# Play ambient music
	AudioManager.play_music("spring_village")
	print("[Baramulla3D] Ready. Rescue quest active.")


func _on_to_srinagar_body_entered(body: Node) -> void:
	if not body.is_in_group("player"):
		return
	print("[Baramulla3D] Transitioning to Srinagar...")
	SceneTransition.go_to("res://scenes/world/Srinagar.tscn", "from_baramulla")


func _on_bridge_ambush_body_entered(body: Node) -> void:
	if _ambush_triggered or not body.is_in_group("player"):
		return
		
	_ambush_triggered = true
	print("[Baramulla3D] Bridge Ambush Triggered! Spawning 2 wolves.")
	
	# Spawn 2 wolves at both ends of the bridge (X = -8.0 and X = 8.0)
	var wolf_scene = load("res://scenes/animals/Wolf.tscn")
	if wolf_scene:
		# Wolf 1 (West side)
		var w1 = wolf_scene.instantiate()
		add_child(w1)
		w1.global_position = Vector3(-8.0, 0.1, 0.0)
		
		# Wolf 2 (East side)
		var w2 = wolf_scene.instantiate()
		add_child(w2)
		w2.global_position = Vector3(8.0, 0.1, 0.0)


func _on_rescue_wolf_killed() -> void:
	# Defer count check to next frame to allow the exiting node to be completely freed
	call_deferred("_check_remaining_rescue_wolves")


func _check_remaining_rescue_wolves() -> void:
	var count = 0
	for child in _rescue_wolves.get_children():
		if is_instance_valid(child) and not child.is_queued_for_deletion():
			count += 1
			
	print("[Baramulla3D] Rescue Wolves left: %d" % count)
	if count == 0:
		_rescue_complete()


func _rescue_complete() -> void:
	print("[Baramulla3D] Rukhsana has been rescued!")
	if is_instance_valid(_rukhsana) and _rukhsana.has_method("free_her"):
		_rukhsana.free_her()
		
	if QuestManager.QUEST_DATA.has("QUEST_RESCUE"):
		QuestManager.update_objective("QUEST_RESCUE", 0, true)
