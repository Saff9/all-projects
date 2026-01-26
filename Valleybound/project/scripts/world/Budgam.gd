extends Node3D
# =============================================================
# Budgam.gd — 3D Budgam Forest Level Scene Script (W3-03 equivalent)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

# Entry points
const ENTRY_POINTS: Dictionary = {
	"default":       Vector3(0.0, 0.1, -40.0), # Near Srinagar transition
	"from_srinagar": Vector3(0.0, 0.1, -40.0), # Spawns at North side
}

@onready var _player: CharacterBody3D = $Player
@onready var _to_srinagar: Area3D = $Transitions/ToSrinagar
@onready var _cave_entrance: Area3D = $CaveEntrance
@onready var _entry_warning: CanvasLayer = $EntryWarning


func _ready() -> void:
	# ── 1. Spawn player at correct entry point ────────────────
	var entry_key: String = SceneTransition.get_entry_point()
	var spawn_pos: Vector3 = ENTRY_POINTS.get(entry_key, ENTRY_POINTS["default"])
	_player.global_position = spawn_pos
	
	# ── 2. Show Entry Warning CanvasLayer for 3 seconds ──────
	if _entry_warning:
		_entry_warning.visible = true
		get_tree().create_timer(3.0).timeout.connect(func():
			_entry_warning.visible = false
		)
		
	# ── 3. Connect transitions ────────────────────────────────
	_to_srinagar.body_entered.connect(_on_to_srinagar_body_entered)
	_cave_entrance.body_entered.connect(_on_cave_entrance_body_entered)
	
	# Play dark ambient forest music
	AudioManager.play_music("autumn_tension")
	print("[Budgam3D] Loaded. Forest environment active.")


func _on_to_srinagar_body_entered(body: Node) -> void:
	if not body.is_in_group("player"):
		return
	print("[Budgam3D] Transitioning to Srinagar...")
	SceneTransition.go_to("res://scenes/world/Srinagar.tscn", "from_budgam")


func _on_cave_entrance_body_entered(body: Node) -> void:
	if not body.is_in_group("player"):
		return
		
	if QuestManager.all_main_quests_done():
		print("[Budgam3D] Transitioning to Pahalgam Cave...")
		SceneTransition.go_to("res://scenes/world/Pahalgam.tscn", "from_budgam")
	else:
		print("[Budgam3D] Cave entrance is locked! Finish all 3 main quests first.")
		if _player.has_method("_spawn_damage_number"):
			_player._spawn_damage_number(0.0)
