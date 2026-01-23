extends "res://scripts/npcs/NPC.gd"
# =============================================================
# DadiZoona.gd — 3D Dadi Zoona NPC Character Script (W2-04)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

func _ready_npc() -> void:
	npc_id = "dadi_zoona"
	npc_name = "Dadi Zoona"
	has_quest = true
	
	dialogue_lines = [
		{"text": "Khabardar reh, Aryan. The wolves come closer each night."},
		{"text": "Your grandfather protected this valley. Now it is your turn, bachcha."},
		{"text": "Go to Srinagar. Find the old man near Dal Lake. He knows what stirs in the Himalayan caves."}
	]
	
	# Override mesh color to soft pink/peach to differentiate Dadi Zoona
	var mesh_inst: MeshInstance3D = get_node_or_null("PlaceholderMesh")
	if mesh_inst:
		var active_mat = mesh_inst.get_active_material(0)
		if active_mat is StandardMaterial3D:
			var override_mat = active_mat.duplicate()
			override_mat.albedo_color = Color(0.85, 0.55, 0.5) # Soft pink
			mesh_inst.set_surface_override_material(0, override_mat)
			
	# Update marker visible after name is set
	_update_quest_marker()
