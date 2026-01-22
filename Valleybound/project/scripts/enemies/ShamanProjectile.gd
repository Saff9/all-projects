extends Area3D
# =============================================================
# ShamanProjectile.gd — 3D Shaman Boss Projectile Script (Act 3)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

var velocity: Vector3 = Vector3.ZERO
var damage: float = 12.0
var max_range: float = 24.0
var traveled: float = 0.0

func setup(dir: Vector3, dmg: float, spd: float) -> void:
	velocity = dir.normalized() * spd
	damage = dmg

func _ready() -> void:
	body_entered.connect(_on_body_entered)
	area_entered.connect(_on_area_entered)

func _physics_process(delta: float) -> void:
	global_position += velocity * delta
	traveled += velocity.length() * delta
	if traveled >= max_range:
		queue_free()

func _on_body_entered(body: Node) -> void:
	if body.is_in_group("player"):
		if body.has_method("take_damage"):
			body.take_damage(damage, "Shaman Shard")
		queue_free()
	elif body.is_in_group("enemy") or body.is_in_group("npc") or body.is_in_group("boulders"):
		# Ignore other enemies, friendly sheep, or falling boulders
		return
	else:
		# Hit wall/ground
		queue_free()

func _on_area_entered(area: Area3D) -> void:
	var parent = area.get_parent()
	if parent.is_in_group("player"):
		if parent.has_method("take_damage"):
			parent.take_damage(damage, "Shaman Shard")
		queue_free()
