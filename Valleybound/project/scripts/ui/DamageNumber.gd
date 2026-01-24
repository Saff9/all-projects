extends Label3D
# =============================================================
# DamageNumber.gd — 3D Floating Damage Text (W2-03)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

func show_damage(amount: float, spawn_pos: Vector3) -> void:
	text = str(int(amount))
	global_position = spawn_pos
	modulate = Color.RED
	billboard = PointMesh.SHADOW_TO_OPACITY # BILLBOARD_ENABLED - faces camera
	
	# Godot 4.3 billboard setting is:
	# 1 = BILLBOARD_ENABLED (Standard billboard facing camera)
	# Let's set it programmatically:
	billboard = 1 
	
	font_size = 48
	outline_size = 12
	outline_modulate = Color.BLACK
	
	# Tween movement upwards and fade out
	var tween = create_tween()
	tween.set_parallel(true)
	tween.tween_property(self, "global_position:y", global_position.y + 1.5, 0.8)
	tween.tween_property(self, "modulate:a", 0.0, 0.8)
	
	# Queue free after fade complete
	tween.set_parallel(false)
	tween.tween_callback(queue_free)
