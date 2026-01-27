extends Node3D
# =============================================================
# Srinagar.gd — 3D Srinagar Hub Scene Script (W2-05)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

# Entry points mapped to 3D XZ coordinates (scaled 0.1)
const ENTRY_POINTS: Dictionary = {
	"from_gulmarg":   Vector3(0.0, 0.1, -40.0),   # North side
	"from_budgam":    Vector3(-58.0, 0.1, 0.0),   # Left/West side
	"from_baramulla": Vector3(-48.0, 0.1, -38.0), # Top-Left/North-West side
	"from_pahalgam":  Vector3(0.0, 0.1, 40.0),    # South side (Pahalgam exit)
}

# ── Node refs ─────────────────────────────────────────────────
@onready var _player:        CharacterBody3D = $Player
@onready var _to_gulmarg:    Area3D          = $Transitions/ToGulmarg
@onready var _to_budgam:     Area3D          = $Transitions/ToBudgam
@onready var _to_baramulla:  Area3D          = $Transitions/ToBaramulla
@onready var _to_pahalgam:   Area3D          = $Transitions/ToPahalgam
@onready var _dal_lake_mesh: MeshInstance3D  = $DalLake/MeshInstance3D

# =============================================================
# LIFECYCLE
# =============================================================
func _ready() -> void:
	# ── 1. Spawns player at correct entry point ────────────────
	var entry_key: String = SceneTransition.get_entry_point()
	var spawn_pos: Vector3 = ENTRY_POINTS.get(entry_key, Vector3(0.0, 0.1, 0.0))
	_player.global_position = spawn_pos

	# ── 2. Connect transition zone signals ────────────────────
	_to_gulmarg.body_entered.connect(_on_to_gulmarg_body_entered)
	_to_budgam.body_entered.connect(_on_to_budgam_body_entered)
	_to_baramulla.body_entered.connect(_on_to_baramulla_body_entered)
	_to_pahalgam.body_entered.connect(_on_to_pahalgam_body_entered)

	# ── 3. Winter ice-water modification ──────────────────────
	_setup_seasonal_lake()

	# ── 4. Play season music ──────────────────────────────────
	_play_seasonal_music()

	print("[Srinagar3D] Loaded at entry: '%s' | Position: %s | Season: %s" % [
		entry_key, str(spawn_pos), GameManager.current_season
	])


func _setup_seasonal_lake() -> void:
	if _dal_lake_mesh == null:
		return
		
	# Check if winter
	if GameManager.current_season == "winter":
		# Change water to white-ice albedo color
		var mat: Material = _dal_lake_mesh.get_active_material(0)
		if mat:
			var ice_mat = mat.duplicate()
			if ice_mat is StandardMaterial3D:
				ice_mat.albedo_color = Color(0.85, 0.9, 0.95) # Ice white-blue
				ice_mat.roughness = 0.2
			elif ice_mat is ShaderMaterial:
				ice_mat.set_shader_parameter("albedo", Color(0.85, 0.9, 0.95))
				ice_mat.set_shader_parameter("albedo_deep", Color(0.75, 0.8, 0.85))
			_dal_lake_mesh.set_surface_override_material(0, ice_mat)
			
		print("[Srinagar3D] Dal Lake has frozen over! Steps will crack the ice.")
		
		# Footstep checking will run in _physics_process
		pass


var _ice_crack_timer: float = 0.0

func _physics_process(delta: float) -> void:
	if GameManager.current_season == "winter":
		_check_ice_cracking(delta)


func _check_ice_cracking(delta: float) -> void:
	if _player == null:
		return
	# If player moves over the lake coordinates (z > 18.0)
	if _player.global_position.z > 18.0 and _player.velocity.length() > 0.5:
		_ice_crack_timer += delta
		if _ice_crack_timer >= 0.5:
			_ice_crack_timer = 0.0
			if randf() < 0.2:
				print("[Audio Stub] Playing ice_crack sound under Aryan's feet...")
				AudioManager.play_sfx("ice_crack")


# =============================================================
# SCENE TRANSITIONS
# =============================================================

func _on_to_gulmarg_body_entered(body: Node) -> void:
	if not body.is_in_group("player"):
		return
	print("[Srinagar3D] Transitioning north to Gulmarg...")
	SceneTransition.go_to("res://scenes/world/Gulmarg.tscn", "from_srinagar")


func _on_to_budgam_body_entered(body: Node) -> void:
	if not body.is_in_group("player"):
		return
	print("[Srinagar3D] Transitioning west to Budgam forest...")
	SceneTransition.go_to("res://scenes/world/Budgam.tscn", "from_srinagar")


func _on_to_baramulla_body_entered(body: Node) -> void:
	if not body.is_in_group("player"):
		return
	print("[Srinagar3D] Transitioning north-west to Baramulla...")
	SceneTransition.go_to("res://scenes/world/Baramulla.tscn", "from_srinagar")


func _on_to_pahalgam_body_entered(body: Node) -> void:
	if not body.is_in_group("player"):
		return
		
	# Update location objective first (resolves QUEST_03 gate deadlock)
	if QuestManager.has_method("reach_location"):
		QuestManager.reach_location("pahalgam")
		
	# Check if all main quests completed
	var can_exit = false
	if QuestManager.has_method("all_main_quests_done"):
		can_exit = QuestManager.all_main_quests_done()
	else:
		can_exit = false # Lock by default in stubs
		
	if can_exit:
		print("[Srinagar3D] All quests complete! Transitioning south to Pahalgam boss arena...")
		SceneTransition.go_to("res://scenes/world/Pahalgam.tscn", "from_srinagar")
	else:
		print("[Srinagar3D] Pahalgam is locked! Complete all of Dadi Zoona's quests first.")
		# Show visual text warning on player damage label/log
		if _player.has_method("_spawn_damage_number"):
			_player._spawn_damage_number(0.0) # displays a prompt warning or check print


func _play_seasonal_music() -> void:
	match GameManager.current_season:
		"spring", "summer":
			AudioManager.play_music("spring_village")
		"autumn":
			AudioManager.play_music("autumn_tension")
		"winter":
			AudioManager.play_music("winter_survival")
