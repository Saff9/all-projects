extends "res://scripts/enemies/Wolf.gd"
# =============================================================
# ShadowWolf.gd — 3D Shadow Wolf Script (W2-02)
# Inherits from Wolf.gd and boosts stats
# =============================================================

func _ready() -> void:
	super._ready()
	
	# Boost stats by modifiers
	speed *= 1.3
	patrol_speed *= 1.3
	flee_speed *= 1.3
	attack_damage *= 1.2
	
	# Change mesh color to blue tint
	if mesh_visual:
		var active_mat = mesh_visual.get_active_material(0)
		if active_mat is StandardMaterial3D:
			var shadow_mat = active_mat.duplicate()
			shadow_mat.albedo_color = Color(0.3, 0.5, 1.0) # Blue tint
			mesh_visual.set_surface_override_material(0, shadow_mat)
			
	print("[ShadowWolf] Spawned at %s with stats boosted (Speed: %.2f, Dmg: %.1f)" % [
		str(global_position), speed, attack_damage
	])
