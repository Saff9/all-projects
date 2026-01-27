extends Node
# =============================================================
# SeasonWeather.gd — 3D Season & Weather Visual Controller (W1-04 to 3D)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================
# Attach as child node "SeasonWeather" inside Gulmarg.tscn.
#
# Responsibilities:
#   - Receives GameManager.season_changed signal
#   - Tweens Sky dome colors (ProceduralSkyMaterial)
#   - Tweens Sun lighting color and energy (DirectionalLight3D)
#   - Tweens Ground albedo to simulate seasonal ground (green to white/snow)
#   - Tweens Volumetric Fog density and color
#   - Configures and enables 3D GPUParticles3D weather (snow/leaves/rain)
# =============================================================

# ── Node References ───────────────────────────────────────────
@onready var _world_env:  WorldEnvironment  = $"../WorldEnvironment"
@onready var _sun_light:  DirectionalLight3D = $"../SunLight"
@onready var _snow:       GPUParticles3D    = $"../SnowParticles"
@onready var _leaf:       GPUParticles3D    = $"../LeafParticles"
@onready var _rain:       GPUParticles3D    = $"../RainParticles"
@onready var _ground:     StaticBody3D      = $"../Ground"

# ── Season Sky Color Tables ───────────────────────────────────
const SKY_COLORS: Dictionary = {
	"spring": Color(0.53, 0.81, 0.92),
	"summer": Color(0.31, 0.76, 0.97),
	"autumn": Color(0.85, 0.54, 0.40),
	"winter": Color(0.69, 0.77, 0.78),
}

# ── Season Ground Albedo Colors ──────────────────────────────
const GROUND_COLORS: Dictionary = {
	"spring": Color(0.25, 0.49, 0.20),
	"summer": Color(0.32, 0.45, 0.15),
	"autumn": Color(0.48, 0.36, 0.12),
	"winter": Color(0.80, 0.85, 0.90), # Snow-covered look in winter!
}

# ── Blizzard overrides ────────────────────────────────────────
const BLIZZARD_SKY:    Color = Color(0.45, 0.47, 0.52)
const BLIZZARD_GROUND: Color = Color(0.70, 0.75, 0.80)

# ── Tween Duration ────────────────────────────────────────────
const SKY_TWEEN_DURATION: float = 3.0

var _sky_tween: Tween = null
var _ground_material: Material = null

# =============================================================
# LIFECYCLE
# =============================================================
func _ready() -> void:
	# Fetch ground material to allow color tweening
	_cache_ground_material()
	
	# Configure GPUParticles3D
	_setup_snow_particles()
	_setup_leaf_particles()
	_setup_rain_particles()

	# Connect GameManager signals
	GameManager.season_changed.connect(_on_season_changed)
	GameManager.blizzard_started.connect(_on_blizzard_started)
	GameManager.blizzard_ended.connect(_on_blizzard_ended)

	# Apply the current season immediately without tween
	_apply_season(GameManager.current_season, false)

	print("[SeasonWeather3D] Ready — season: %s" % GameManager.current_season)


func _cache_ground_material() -> void:
	if _ground == null:
		return
	var mesh_inst: MeshInstance3D = _ground.get_node_or_null("MeshInstance3D")
	if mesh_inst == null:
		return
	
	# Get material from mesh instance
	var active_mat: Material = mesh_inst.get_active_material(0)
	if active_mat is StandardMaterial3D or active_mat is ShaderMaterial:
		# Duplicate to avoid modifying the base resource file
		_ground_material = active_mat.duplicate()
		mesh_inst.set_surface_override_material(0, _ground_material)


# =============================================================
# SEASON CHANGED HANDLER
# =============================================================
func _on_season_changed(season: String, _day: int) -> void:
	_apply_season(season, true)


func _apply_season(season: String, animated: bool) -> void:
	# Stop all particles
	_snow.emitting = false
	_leaf.emitting = false
	_rain.emitting = false

	match season:
		"spring":
			_rain.emitting = true
		"summer":
			pass
		"autumn":
			_leaf.emitting = true
		"winter":
			_snow.emitting = true

	var sky_col:    Color = SKY_COLORS.get(season,    SKY_COLORS["spring"])
	var ground_col: Color = GROUND_COLORS.get(season, GROUND_COLORS["spring"])

	if animated:
		_tween_sky_and_ground(sky_col, ground_col)
	else:
		_apply_immediate(sky_col, ground_col)


# =============================================================
# TRANSITIONS
# =============================================================
func _tween_sky_and_ground(sky_target: Color, ground_target: Color) -> void:
	if _sky_tween and _sky_tween.is_valid():
		_sky_tween.kill()

	_sky_tween = create_tween()
	_sky_tween.set_parallel(true)
	_sky_tween.set_ease(Tween.EASE_IN_OUT)
	_sky_tween.set_trans(Tween.TRANS_SINE)

	# 1. Procedural sky dome colors
	var env = _world_env.environment
	if env and env.sky and env.sky.sky_material is ProceduralSkyMaterial:
		var sky_mat = env.sky.sky_material
		_sky_tween.tween_property(sky_mat, "sky_top_color", sky_target, SKY_TWEEN_DURATION)
		_sky_tween.tween_property(sky_mat, "sky_horizon_color", sky_target.lightened(0.25), SKY_TWEEN_DURATION)
		_sky_tween.tween_property(sky_mat, "ground_horizon_color", sky_target.lightened(0.25), SKY_TWEEN_DURATION)

	# 2. Ambient and Fog colors
	if env:
		_sky_tween.tween_property(env, "fog_light_color", sky_target.lightened(0.1), SKY_TWEEN_DURATION)
		
		var fog_density = 0.005
		if GameManager.current_season == "winter":
			fog_density = 0.015
		elif GameManager.current_season == "spring":
			fog_density = 0.008
		_sky_tween.tween_property(env, "fog_density", fog_density, SKY_TWEEN_DURATION)

	# 3. Sun lighting
	if _sun_light:
		_sky_tween.tween_property(_sun_light, "light_color", sky_target.lightened(0.3), SKY_TWEEN_DURATION)
		
		var sun_energy = 1.0
		if GameManager.current_season == "winter":
			sun_energy = 0.6
		elif GameManager.current_season == "summer":
			sun_energy = 1.2
		_sky_tween.tween_property(_sun_light, "light_energy", sun_energy, SKY_TWEEN_DURATION)

	# 4. Ground color
	if _ground_material:
		if _ground_material is StandardMaterial3D:
			_sky_tween.tween_property(_ground_material, "albedo_color", ground_target, SKY_TWEEN_DURATION)
		elif _ground_material is ShaderMaterial:
			_sky_tween.tween_property(_ground_material, "shader_parameter/albedo_color", ground_target, SKY_TWEEN_DURATION)


func _apply_immediate(sky_col: Color, ground_col: Color) -> void:
	var env = _world_env.environment
	if env and env.sky and env.sky.sky_material is ProceduralSkyMaterial:
		var sky_mat = env.sky.sky_material
		sky_mat.sky_top_color = sky_col
		sky_mat.sky_horizon_color = sky_col.lightened(0.25)
		sky_mat.ground_horizon_color = sky_col.lightened(0.25)

	if env:
		env.fog_light_color = sky_col.lightened(0.1)
		env.fog_density = 0.015 if GameManager.current_season == "winter" else 0.005

	if _sun_light:
		_sun_light.light_color = sky_col.lightened(0.3)
		_sun_light.light_energy = 0.6 if GameManager.current_season == "winter" else 1.0

	if _ground_material:
		if _ground_material is StandardMaterial3D:
			_ground_material.albedo_color = ground_col
		elif _ground_material is ShaderMaterial:
			_ground_material.set_shader_parameter("albedo_color", ground_col)


# =============================================================
# PARTICLE SETUP — GPUParticles3D
# =============================================================

func _setup_snow_particles() -> void:
	# Setup draw mesh
	var quad_mesh = QuadMesh.new()
	quad_mesh.size = Vector2(0.08, 0.08)
	var mat = StandardMaterial3D.new()
	mat.albedo_color = Color(0.95, 0.97, 1.0, 0.9)
	mat.billboard_mode = StandardMaterial3D.BILLBOARD_PARTICLES
	mat.shading_mode = StandardMaterial3D.SHADING_MODE_UNSHADED
	quad_mesh.material = mat
	_snow.draw_pass_1 = quad_mesh

	# Setup process material
	var proc_mat = ParticleProcessMaterial.new()
	proc_mat.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_BOX
	proc_mat.emission_box_extents = Vector3(64.0, 1.0, 48.0)
	proc_mat.direction = Vector3(0.1, -1.0, 0.0)
	proc_mat.spread = 15.0
	proc_mat.initial_velocity_min = 2.0
	proc_mat.initial_velocity_max = 5.0
	proc_mat.scale_min = 0.8
	proc_mat.scale_max = 1.5
	
	_snow.process_material = proc_mat


func _setup_leaf_particles() -> void:
	var quad_mesh = QuadMesh.new()
	quad_mesh.size = Vector2(0.18, 0.18)
	var mat = StandardMaterial3D.new()
	mat.albedo_color = Color(0.85, 0.45, 0.1, 0.9)
	mat.billboard_mode = StandardMaterial3D.BILLBOARD_PARTICLES
	mat.shading_mode = StandardMaterial3D.SHADING_MODE_UNSHADED
	quad_mesh.material = mat
	_leaf.draw_pass_1 = quad_mesh

	var proc_mat = ParticleProcessMaterial.new()
	proc_mat.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_BOX
	proc_mat.emission_box_extents = Vector3(64.0, 1.0, 48.0)
	proc_mat.direction = Vector3(0.5, -1.0, 0.2)
	proc_mat.spread = 45.0
	proc_mat.initial_velocity_min = 1.0
	proc_mat.initial_velocity_max = 3.0
	proc_mat.angular_velocity_min = -60.0
	proc_mat.angular_velocity_max = 60.0
	proc_mat.scale_min = 0.6
	proc_mat.scale_max = 1.2
	
	_leaf.process_material = proc_mat


func _setup_rain_particles() -> void:
	var quad_mesh = QuadMesh.new()
	quad_mesh.size = Vector2(0.02, 0.4)
	var mat = StandardMaterial3D.new()
	mat.albedo_color = Color(0.6, 0.7, 0.85, 0.5)
	# Y-billboard keeps rain lines facing vertical camera orientation
	mat.billboard_mode = StandardMaterial3D.BILLBOARD_PARTICLES
	mat.shading_mode = StandardMaterial3D.SHADING_MODE_UNSHADED
	mat.transparency = StandardMaterial3D.TRANSPARENCY_ALPHA
	quad_mesh.material = mat
	_rain.draw_pass_1 = quad_mesh

	var proc_mat = ParticleProcessMaterial.new()
	proc_mat.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_BOX
	proc_mat.emission_box_extents = Vector3(64.0, 1.0, 48.0)
	proc_mat.direction = Vector3(0.02, -1.0, 0.0)
	proc_mat.spread = 2.0
	proc_mat.initial_velocity_min = 15.0
	proc_mat.initial_velocity_max = 22.0
	proc_mat.scale_min = 0.9
	proc_mat.scale_max = 1.1
	
	_rain.process_material = proc_mat


# =============================================================
# BLIZZARD
# =============================================================

func _on_blizzard_started() -> void:
	print("[SeasonWeather3D] Blizzard started — intensifying snow & fog.")

	_snow.amount = 1200
	_snow.emitting = true

	var proc_mat = _snow.process_material
	if proc_mat is ParticleProcessMaterial:
		# Diagonal strong wind
		proc_mat.direction = Vector3(1.2, -1.0, 0.3)
		proc_mat.spread = 25.0
		proc_mat.initial_velocity_min = 12.0
		proc_mat.initial_velocity_max = 20.0

	_tween_sky_and_ground(BLIZZARD_SKY, BLIZZARD_GROUND)
	
	# Double fog thickness during blizzard
	var env = _world_env.environment
	if env:
		var t := create_tween()
		t.tween_property(env, "fog_density", 0.05, SKY_TWEEN_DURATION)


func _on_blizzard_ended() -> void:
	print("[SeasonWeather3D] Blizzard ended — restoring normal winter weather.")

	_snow.amount = 400
	_setup_snow_particles() # restores normal process material direction & velocities
	_snow.emitting = (GameManager.current_season == "winter")

	_apply_season(GameManager.current_season, true)
