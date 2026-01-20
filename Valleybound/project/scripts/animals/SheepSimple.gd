extends CharacterBody3D
# =============================================================
# SheepSimple.gd — 3D Placeholder Sheep AI (W1-03 to 3D)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================
# Behaviour:
#   - Idle for 3-5 seconds
#   - Picks a random point within WANDER_RADIUS of its home position
#   - Walks there at SPEED m/s
#   - Face movement direction
#   - Repeats forever
# =============================================================

const SPEED: float          = 2.0     # meters / second in 3D
const WANDER_RADIUS: float  = 10.0    # meters
const MIN_WAIT: float       = 3.0
const MAX_WAIT: float       = 5.0
const ARRIVAL_DIST: float   = 0.5     # distance considered arrived in 3D

# Map bounds in 3D meters (maps 1280x960 2D coordinates / 10)
const MAP_LIMIT_X: float    = 64.0
const MAP_LIMIT_Z: float    = 48.0
const MAP_MARGIN: float     = 2.0

# ── State ─────────────────────────────────────────────────────
var _home: Vector3          = Vector3.ZERO
var _target: Vector3        = Vector3.ZERO
var _is_wandering: bool     = false

# Get gravity from project settings
@onready var gravity: float = ProjectSettings.get_setting("physics/3d/default_gravity", 9.8)
@onready var _timer: Timer  = $WanderTimer

# =============================================================
# LIFECYCLE
# =============================================================
func _ready() -> void:
	add_to_group("flock")
	
	_home = global_position
	_target = global_position
	
	_timer.timeout.connect(_on_wander_timer_timeout)
	_start_idle_wait()
	
	# Adjust starting orientation randomly
	rotation.y = randf_range(0, TAU)
	print("[SheepSimple3D] Ready at %s" % str(global_position))


# =============================================================
# PHYSICS
# =============================================================
func _physics_process(delta: float) -> void:
	# Apply gravity
	if not is_on_floor():
		velocity.y -= gravity * delta
	else:
		velocity.y = 0.0
		
	if not _is_wandering:
		velocity.x = 0.0
		velocity.z = 0.0
		move_and_slide()
		return
		
	var to_target: Vector3 = _target - global_position
	to_target.y = 0.0 # flat movement
	
	if to_target.length() <= ARRIVAL_DIST:
		# Arrived
		_is_wandering = false
		velocity.x = 0.0
		velocity.z = 0.0
		_start_idle_wait()
	else:
		var dir = to_target.normalized()
		velocity.x = dir.x * SPEED
		velocity.z = dir.z * SPEED
		
		# Rotate sheep to face wander target direction
		var target_angle = atan2(-dir.x, -dir.z)
		rotation.y = lerp_angle(rotation.y, target_angle, delta * 5.0)
		
	move_and_slide()


# =============================================================
# TIMERS
# =============================================================
func _start_idle_wait() -> void:
	_timer.wait_time = randf_range(MIN_WAIT, MAX_WAIT)
	_timer.one_shot  = true
	_timer.start()


func _on_wander_timer_timeout() -> void:
	# Pick a random point within WANDER_RADIUS on the horizontal XZ plane
	var angle: float = randf() * TAU
	var dist: float = randf_range(2.0, WANDER_RADIUS)
	
	_target = _home + Vector3(
		cos(angle) * dist,
		0.0,
		sin(angle) * dist
	)
	
	# Clamp target within 3D map bounds
	_target.x = clampf(_target.x, -MAP_LIMIT_X + MAP_MARGIN, MAP_LIMIT_X - MAP_MARGIN)
	_target.z = clampf(_target.z, -MAP_LIMIT_Z + MAP_MARGIN, MAP_LIMIT_Z - MAP_MARGIN)
	# Target is flat relative to home base height
	_target.y = _home.y
	
	_is_wandering = true
