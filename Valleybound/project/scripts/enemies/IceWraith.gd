extends CharacterBody3D
# =============================================================
# IceWraith.gd — 3D Ice Wraith enemy script (Act 3)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

var health: float = 40.0
var speed: float = 4.5
var is_half: bool = false
var can_take_damage_from: Array = ["fire_torch", "enchanted_blade"]

var attack_cooldown: float = 0.0
const ATTACK_INTERVAL: float = 1.5
const ATTACK_DAMAGE: float = 12.0
const ATTACK_RANGE: float = 1.6

func _ready() -> void:
	add_to_group("enemy")
	# If is_half, scale down visual mesh
	if is_half:
		scale = Vector3(0.5, 0.5, 0.5)

func _physics_process(delta: float) -> void:
	attack_cooldown = maxf(attack_cooldown - delta, 0.0)
	
	var player = get_tree().get_first_node_in_group("player")
	if player:
		# Fly directly toward player chest height (Aryan global_position is feet, chest is Y+0.9)
		var target_pos = player.global_position + Vector3(0.0, 0.9, 0.0)
		var to_target = target_pos - global_position
		
		# Rotate visual mesh to look at player on the horizontal plane
		var look_dir = Vector3(to_target.x, 0.0, to_target.z)
		if look_dir.length() > 0.1:
			var target_angle = atan2(-look_dir.x, -look_dir.z)
			rotation.y = target_angle
			
		if to_target.length() > ATTACK_RANGE:
			velocity = to_target.normalized() * speed
			move_and_slide()
		else:
			# Close enough to attack
			velocity = Vector3.ZERO
			if attack_cooldown <= 0.0:
				_attack_player(player)

func _attack_player(player: Node) -> void:
	attack_cooldown = ATTACK_INTERVAL
	if player.has_method("take_damage"):
		player.take_damage(ATTACK_DAMAGE, "Ice Wraith")
		print("[IceWraith] Bit player for %f damage!" % ATTACK_DAMAGE)

func take_damage(amount: float, source: String = "") -> void:
	if source not in can_take_damage_from:
		print("[IceWraith] Immune to damage from source: '%s'" % source)
		return
		
	health -= amount
	print("[IceWraith] Hit by '%s' for %f damage! HP left: %f" % [source, amount, health])
	
	# Spawn dynamic damage float numbers
	var path = "res://scenes/ui/DamageNumber.tscn"
	if ResourceLoader.exists(path):
		var label = load(path).instantiate()
		get_parent().add_child(label)
		label.show_damage(amount, global_position + Vector3(0.0, 1.0, 0.0))
			
	if health <= 0:
		if not is_half:
			spawn_half()
			spawn_half()
		queue_free()

func spawn_half() -> void:
	var wraith_scene = load("res://scenes/animals/IceWraith.tscn")
	var half = wraith_scene.instantiate()
	half.is_half = true
	half.health = 15.0
	half.speed = speed * 1.2 # halves move slightly faster
	get_parent().add_child(half)
	# Offset spawn point to prevent spawning inside each other
	half.global_position = global_position + Vector3(randf_range(-1.5, 1.5), randf_range(-0.5, 0.5), randf_range(-1.5, 1.5))
