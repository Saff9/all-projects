extends Node3D
# =============================================================
# Gulmarg.gd — Gulmarg Village Scene Script (W1-03 to 3D)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================
# Manages:
#   - Player spawn position in 3D
#   - ToSrinagar transition zone detection
#   - Season-based music
# =============================================================

# Entry points: where the player spawns depending on which
# scene they came from (scaled matching scale 0.1).
const ENTRY_POINTS: Dictionary = {
	"default":       Vector3(0.0, 0.1, -18.0),
	"from_srinagar": Vector3(0.0, 0.1, 40.0),   # Near bottom (came from south)
}

# ── Node refs ─────────────────────────────────────────────────
@onready var _player:       CharacterBody3D = $Player
@onready var _to_srinagar:  Area3D          = $ToSrinagar
@onready var _flock:        Node3D          = $Flock

# =============================================================
# LIFECYCLE
# =============================================================
func _ready() -> void:
	# ── 1. Spawn player at correct entry point ────────────────
	var entry_key: String = SceneTransition.get_entry_point()
	if entry_key == "":
		entry_key = "default"
	_player.global_position = ENTRY_POINTS.get(entry_key, ENTRY_POINTS["default"])

	# ── 2. Connect transition zone ────────────────────────────
	_to_srinagar.body_entered.connect(_on_to_srinagar_body_entered)

	# ── 3. Season-appropriate music ───────────────────────────
	_play_seasonal_music()

	print("[Gulmarg3D] Ready | Day %d | Season: %s | Flock: %d sheep" % [
		GameManager.current_day,
		GameManager.current_season,
		_flock.get_child_count()
	])

	# ── 4. Avalanche disaster trigger in winter ───────────────
	if GameManager.current_day >= 22 and GameManager.current_season == "winter":
		if has_node("AvalancheEvent"):
			$AvalancheEvent.trigger()


# =============================================================
# SCENE TRANSITIONS
# =============================================================
func _on_to_srinagar_body_entered(body: Node) -> void:
	if not body.is_in_group("player"):
		return
	print("[Gulmarg3D] Transitioning to Srinagar...")
	SceneTransition.go_to("res://scenes/world/Srinagar.tscn", "from_gulmarg")


# =============================================================
# MUSIC
# =============================================================
func _play_seasonal_music() -> void:
	match GameManager.current_season:
		"spring", "summer":
			AudioManager.play_music("spring_village")
		"autumn":
			AudioManager.play_music("autumn_tension")
		"winter":
			AudioManager.play_music("winter_survival")
