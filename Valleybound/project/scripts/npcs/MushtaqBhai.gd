extends "res://scripts/npcs/NPC.gd"
# =============================================================
# MushtaqBhai.gd — 3D Mushtaq Bhai NPC Script (W2-04)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

func _ready_npc() -> void:
	npc_id = "mushtaq"
	npc_name = "Mushtaq Bhai"
	has_quest = false
	
	dialogue_lines = [
		{"text": "Aalam! Looking for trade, Aryan? I have the best blankets in Gulmarg."},
		{"text": "Once Srinagar opens, we will have fresh wheat and apples again. Keep your flock safe until then!"}
	]
	
	# Override mesh color to soft teal
	var mesh_inst: MeshInstance3D = get_node_or_null("PlaceholderMesh")
	if mesh_inst:
		var active_mat = mesh_inst.get_active_material(0)
		if active_mat is StandardMaterial3D:
			var override_mat = active_mat.duplicate()
			override_mat.albedo_color = Color(0.2, 0.6, 0.6) # Teal
			mesh_inst.set_surface_override_material(0, override_mat)
			
	_update_quest_marker()
