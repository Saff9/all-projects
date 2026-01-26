extends Node3D
# =============================================================
# Pahalgam.gd — 3D Pahalgam mountain pass scene script (Act 3)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

# Entry points mapped to 3D XZ coordinates (scaled 0.1)
const ENTRY_POINTS: Dictionary = {
	"from_srinagar": Vector3(0.0, 0.1, 42.0),
}

# ── Node refs ─────────────────────────────────────────────────
@onready var _player: CharacterBody3D = $Player
@onready var _to_srinagar: Area3D = $ToSrinagar
@onready var _cave_entrance: Area3D = $CaveEntrance

# =============================================================
# LIFECYCLE
# =============================================================
func _ready() -> void:
	# 1. Spawn player at correct entry point
	var entry_key: String = SceneTransition.get_entry_point()
	if entry_key == "":
		entry_key = "from_srinagar"
	_player.global_position = ENTRY_POINTS.get(entry_key, ENTRY_POINTS["from_srinagar"])

	# 2. Connect transition zone signals
	_to_srinagar.body_entered.connect(_on_to_srinagar_body_entered)
	_cave_entrance.body_entered.connect(_on_cave_entrance_body_entered)

	# 3. Connect ice patches signals if they exist
	_connect_ice_patches()

	# 4. Play winter survive music
	if AudioManager.has_method("play_music"):
		AudioManager.play_music("winter_survival")

	# 5. Tell QuestManager we arrived (completes reach_location for QUEST_03 if active)
	if QuestManager.has_method("reach_location"):
		QuestManager.reach_location("pahalgam")

	print("[Pahalgam3D] Loaded at entry: '%s' | Position: %s" % [entry_key, str(_player.global_position)])

# =============================================================
# SCENE TRANSITIONS
# =============================================================
func _on_to_srinagar_body_entered(body: Node) -> void:
	if not body.is_in_group("player"):
		return
	print("[Pahalgam3D] Transitioning north back to Srinagar...")
	SceneTransition.go_to("res://scenes/world/Srinagar.tscn", "from_pahalgam")

func _on_cave_entrance_body_entered(body: Node) -> void:
	if not body.is_in_group("player"):
		return
	
	# Check if all quests (1, 2, 3 and Rescue) are completed
	var all_complete = false
	if QuestManager.has_method("all_main_quests_done"):
		var main_done = QuestManager.all_main_quests_done()
		var rescue_done = QuestManager.QUEST_DATA.get("QUEST_RESCUE", {}).get("is_complete", false)
		all_complete = main_done and rescue_done
	
	if all_complete:
		print("[Pahalgam3D] All quests complete! Transitioning into Shaman Cave...")
		SceneTransition.go_to("res://scenes/world/ShamanCave.tscn", "cave_entrance")
	else:
		print("[Pahalgam3D] Cave is locked. Shaman's barrier requires completing all quests first.")
		EventTitleCard.show_event("Cave Locked!", "The shaman's barrier is active. Finish all quests first.", 4.0)

# =============================================================
# ICE PATCHES SPEED SYSTEM
# =============================================================
func _connect_ice_patches() -> void:
	var ice_patches_node = get_node_or_null("IcePatches")
	if ice_patches_node:
		for patch in ice_patches_node.get_children():
			if patch is Area3D:
				patch.body_entered.connect(_on_ice_patch_entered)
				patch.body_exited.connect(_on_ice_patch_exited)

func _on_ice_patch_entered(body: Node) -> void:
	if body.is_in_group("player"):
		body.ice_speed_mult = 0.67
		print("[Pahalgam3D] Player entered ice patch. Speed reduced.")

func _on_ice_patch_exited(body: Node) -> void:
	if body.is_in_group("player"):
		body.ice_speed_mult = 1.0
		print("[Pahalgam3D] Player exited ice patch. Speed restored.")
