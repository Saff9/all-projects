extends StaticBody3D
# =============================================================
# CrystalStaff.gd — 3D Crystal Staff Shield Script (Act 3 Boss)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

var health: float = 100.0

func take_damage(amount: float, _src: String = "") -> void:
	health -= amount
	print("[CrystalStaff] Damaged by '%s'! HP left: %.1f" % [_src, health])
	
	# Spawn floating damage number
	var path = "res://scenes/ui/DamageNumber.tscn"
	if ResourceLoader.exists(path):
		var label = load(path).instantiate()
		get_parent().add_child(label)
		label.show_damage(amount, global_position + Vector3(0.0, 1.5, 0.0))
		
	if health <= 0:
		var shaman = get_parent().get_node_or_null("Shaman")
		if shaman:
			shaman.armor = 0.0
			print("[CrystalStaff] Destroyed! Shaman shield/armor removed.")
			EventTitleCard.show_event("Staff Shattered!", "The Shaman's defense has been weakened!", 3.0)
		queue_free()
