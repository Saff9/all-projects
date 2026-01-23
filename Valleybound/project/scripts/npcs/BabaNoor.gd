extends "res://scripts/npcs/NPC.gd"
# =============================================================
# BabaNoor.gd — 3D Baba Noor NPC Script (W2-04 / Act 3)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

func _ready_npc() -> void:
	npc_id = "baba_noor"
	npc_name = "Baba Noor"
	has_quest = false
	
	dialogue_lines = [
		{"text": "The shaman's curse freezes the valley, Aryan. The wolves are merely puppets of his malice."},
		{"text": "You have protected the flock and proved your courage across Kashmir. Now you must finish this."},
		{"text": "Take this Enchanted Blade, forged from the oldest mountain steel. Go to the cave and free our homeland!"}
	]
	
	# Override mesh color to warm gold/brown
	var mesh_inst: MeshInstance3D = get_node_or_null("PlaceholderMesh")
	if mesh_inst:
		var active_mat = mesh_inst.get_active_material(0)
		if active_mat is StandardMaterial3D:
			var override_mat = active_mat.duplicate()
			override_mat.albedo_color = Color(0.7, 0.5, 0.2) # Gold/Orange-brown
			mesh_inst.set_surface_override_material(0, override_mat)
			
	_update_quest_marker()

func _on_dialogue_done() -> void:
	# Invoke base class method (triggers QuestManager.npc_talked)
	super._on_dialogue_done()
	
	# Gift the Enchanted Blade if the player does not have it yet
	if not InventoryManager.has_item("enchanted_blade"):
		InventoryManager.add_item("enchanted_blade", 1)
		InventoryManager.equip("enchanted_blade")
		EventTitleCard.show_event("Enchanted Blade!", "Received Baba Noor's mythical sword (60 DMG).", 4.0)
