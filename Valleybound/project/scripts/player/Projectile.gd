extends Area3D
# =============================================================
# Projectile.gd — 3D Slingshot Projectile Script (W2-03)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

var velocity: Vector3 = Vector3.ZERO
var damage: float = 15.0
var max_range: float = 12.0  # meters in 3D (scaled from 300px)
var traveled: float = 0.0

func _ready() -> void:
	# Connect collision signals
	body_entered.connect(_on_body_entered)
	area_entered.connect(_on_area_entered)


func setup(dir: Vector3, dmg: float, spd: float) -> void:
	velocity = dir.normalized() * spd
	damage = dmg


func _physics_process(delta: float) -> void:
	global_position += velocity * delta
	traveled += velocity.length() * delta
	
	if traveled >= max_range:
		queue_free()


func _on_body_entered(body: Node) -> void:
	_deliver_damage(body)


func _on_area_entered(area: Area3D) -> void:
	_deliver_damage(area)


func _deliver_damage(node: Node) -> void:
	# Ignore if hitting the player
	if node.is_in_group("player") or node.get_parent().is_in_group("player"):
		return
		
	# Deliver damage
	var hit = false
	if node.has_method("take_damage"):
		node.take_damage(damage, "slingshot")
		hit = true
	elif node.get_parent().has_method("take_damage"):
		node.get_parent().take_damage(damage, "slingshot")
		hit = true
		
	if hit:
		AudioManager.play_sfx("stone_hit")
		
	# Delete projectile
	queue_free()
