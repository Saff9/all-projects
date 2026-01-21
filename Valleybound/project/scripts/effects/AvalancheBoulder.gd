extends RigidBody3D
# =============================================================
# AvalancheBoulder.gd — 3D Avalanche Boulder Script (W3-05)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

func _ready() -> void:
	add_to_group("boulders")
	contact_monitor = true
	max_contacts_reported = 4
	body_entered.connect(_on_body_entered)

func _on_body_entered(body: Node) -> void:
	if body.is_in_group("player"):
		if body.has_method("take_damage"):
			body.take_damage(30.0, "Avalanche Boulder")
			print("[AvalancheBoulder] Collided with player! Dealt 30 damage.")
