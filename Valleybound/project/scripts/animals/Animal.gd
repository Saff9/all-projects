class_name Animal
extends CharacterBody3D
# =============================================================
# Animal.gd — 3D Base Animal AI Class (W2-01 / W2-03 Stun)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

@export var max_health: float = 30.0
@export var base_speed: float = 2.0

var health: float = 30.0
var is_dead: bool = false
var _stun_timer: float = 0.0

# Player tracking
var player_body: CharacterBody3D = null
var player_in_detection: bool = false
var player_in_interaction: bool = false

# Enemy/Wolf tracking
var enemy_bodies: Array[Node3D] = []

# Node references
@onready var collision_shape: CollisionShape3D = $CollisionShape3D
@onready var hurt_box: Area3D = $HurtBox
@onready var detection_area: Area3D = $DetectionArea
@onready var interaction_area: Area3D = $InteractionArea
@onready var gravity: float = ProjectSettings.get_setting("physics/3d/default_gravity", 9.8)

signal health_changed(new_health: float)
signal can_interact(can: bool)

func _ready() -> void:
	health = max_health
	
	# Connect Area3D signals
	if detection_area:
		detection_area.body_entered.connect(_on_detection_body_entered)
		detection_area.body_exited.connect(_on_detection_body_exited)
	if hurt_box:
		hurt_box.area_entered.connect(_on_hurt_box_area_entered)
		hurt_box.body_entered.connect(_on_hurt_box_body_entered)
	if interaction_area:
		interaction_area.body_entered.connect(_on_interaction_body_entered)
		interaction_area.body_exited.connect(_on_interaction_body_exited)
		
	_ready_animal()


# Virtual ready method for subclass-specific setup
func _ready_animal() -> void:
	pass


func _physics_process(delta: float) -> void:
	if is_dead:
		return
		
	# Apply gravity
	if not is_on_floor():
		velocity.y -= gravity * delta
	else:
		velocity.y = 0.0
		
	# Stun handling
	if _stun_timer > 0.0:
		_stun_timer -= delta
		velocity.x = 0.0
		velocity.z = 0.0
		move_and_slide()
		return
		
	_physics_process_animal(delta)


# Virtual process method for subclass AI behavior
func _physics_process_animal(_delta: float) -> void:
	move_and_slide()


# Public stun method (W2-03)
func stun(duration: float) -> void:
	_stun_timer = duration
	velocity.x = 0.0
	velocity.z = 0.0
	print("[%s] Stunned for %.2fs" % [name, duration])


# Public take damage function
func take_damage(amount: float) -> void:
	if is_dead:
		return
	health = clampf(health - amount, 0.0, max_health)
	health_changed.emit(health)
	print("[%s] took %.1f damage. HP: %.1f/%.1f" % [name, amount, health, max_health])
	
	# Spawn dynamic Damage Number in 3D space
	_spawn_damage_number(amount)
	
	if health <= 0.0:
		die()


func die() -> void:
	if is_dead:
		return
	is_dead = true
	_die_animal()


# Virtual death behavior for subclasses
func _die_animal() -> void:
	queue_free()


func _on_hurt_box_area_entered(area: Area3D) -> void:
	if area.is_in_group("player_attack") and area.has_method("get_attack_damage"):
		take_damage(area.get_attack_damage())
		if area.has_method("get_stun_duration"):
			stun(area.get_stun_duration())


func _on_hurt_box_body_entered(body: Node) -> void:
	if body.is_in_group("player_attack") and body.has_method("get_attack_damage"):
		take_damage(body.get_attack_damage())
		if body.has_method("get_stun_duration"):
			stun(body.get_stun_duration())


func _on_detection_body_entered(body: Node3D) -> void:
	if body.is_in_group("player"):
		player_body = body
		player_in_detection = true
	elif body.is_in_group("enemy"):
		if not enemy_bodies.has(body):
			enemy_bodies.append(body)


func _on_detection_body_exited(body: Node3D) -> void:
	if body.is_in_group("player"):
		player_body = null
		player_in_detection = false
	elif body.is_in_group("enemy"):
		enemy_bodies.erase(body)


func _on_interaction_body_entered(body: Node3D) -> void:
	if body.is_in_group("player"):
		player_in_interaction = true
		can_interact.emit(true)


func _on_interaction_body_exited(body: Node3D) -> void:
	if body.is_in_group("player"):
		player_in_interaction = false
		can_interact.emit(false)


func _unhandled_input(event: InputEvent) -> void:
	if is_dead:
		return
	if player_in_interaction and event.is_action_pressed("interact"):
		_on_interact()


# Virtual interaction behavior
func _on_interact() -> void:
	pass


# Spawn floating damage number
func _spawn_damage_number(amount: float) -> void:
	var path = "res://scenes/ui/DamageNumber.tscn"
	if ResourceLoader.exists(path):
		var packed = load(path)
		var label = packed.instantiate()
		get_parent().add_child(label)
		label.show_damage(amount, global_position + Vector3(0.0, 1.0, 0.0))
	else:
		print("[DamageNumber Stub] Floating Label %d at %s" % [int(amount), str(global_position)])
