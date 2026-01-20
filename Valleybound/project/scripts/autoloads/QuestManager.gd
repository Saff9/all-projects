extends Node
# =============================================================
# QuestManager.gd — Global Singleton (Autoload) (W3-01)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

# Signals
signal quest_started(quest_id: String)
signal quest_updated(quest_id: String)
signal quest_completed(quest_id: String)

# Global Quest Database
var QUEST_DATA: Dictionary = {
	"QUEST_01": {
		"title": "First Watch",
		"description": "Protect your flock for one full in-game day. Do not let any sheep die.",
		"giver": "dadi_zoona",
		"objectives": [{"type": "survive_days", "count": 1, "current": 0}],
		"rewards": {"gold": 20, "items": [{"id": "pheran", "count": 1}]},
		"is_active": false, "is_complete": false
	},
	"QUEST_02": {
		"title": "Market Run",
		"description": "Collect 3 wool from your flock and bring it to Mushtaq Bhai in Srinagar.",
		"giver": "mushtaq",
		"objectives": [{"type": "collect_item", "item": "wool", "count": 3, "current": 0}],
		"rewards": {"gold": 50, "items": [{"id": "fire_torch", "count": 1}]},
		"is_active": false, "is_complete": false
	},
	"QUEST_03": {
		"title": "The Warning",
		"description": "Travel to Pahalgam and speak with Baba Noor at the mountain pass.",
		"giver": "baba_noor",
		"objectives": [{"type": "reach_location", "location": "pahalgam", "done": false},
					   {"type": "talk_to_npc", "npc": "baba_noor", "done": false}],
		"rewards": {"gold": 0, "items": [{"id": "iron_staff", "count": 1}]},
		"is_active": false, "is_complete": false
	},
	"QUEST_RESCUE": {
		"title": "Rescue Rukhsana",
		"description": "Rescue Rukhsana from the wolf ambush in Baramulla forest.",
		"giver": "rukhsana",
		"objectives": [{"type": "rescue_complete", "done": false}],
		"rewards": {"gold": 100, "items": [{"id": "iron_sword", "count": 1}]},
		"is_active": false, "is_complete": false
	}
}

# Tracking state for QUEST_01
var quest_01_start_day: int = -1
var quest_01_start_flock: int = -1


func _ready() -> void:
	# Connect to GameManager signals
	if GameManager.has_signal("day_changed"):
		GameManager.day_changed.connect(_on_day_changed)
	
	# Connect to InventoryManager signals
	if InventoryManager.has_signal("item_added"):
		InventoryManager.item_added.connect(_on_item_added)
		
	print("[QuestManager] Fully Initialized.")


# ── Start a quest by ID
func start_quest(quest_id: String) -> void:
	if not QUEST_DATA.has(quest_id):
		push_warning("[QuestManager] Cannot start unknown quest: %s" % quest_id)
		return
		
	var q = QUEST_DATA[quest_id]
	if q["is_active"] or q["is_complete"]:
		return
		
	q["is_active"] = true
	
	# Initialise specific tracking variables
	if quest_id == "QUEST_01":
		quest_01_start_day = GameManager.current_day
		quest_01_start_flock = GameManager.flock_count
		print("[QuestManager] Started QUEST_01: start_day=%d, start_flock=%d" % [quest_01_start_day, quest_01_start_flock])
	elif quest_id == "QUEST_02":
		# Read pre-existing wool in case they already have some
		var current_wool = InventoryManager.get_item_count("wool")
		update_objective("QUEST_02", 0, current_wool)
		
	quest_started.emit(quest_id)
	print("[QuestManager] Quest started: %s" % q["title"])


# ── NPC Interaction callback
func npc_talked(npc_id: String) -> void:
	print("[QuestManager] npc_talked: %s" % npc_id)
	
	# 1. Update talk_to_npc objectives for active quests FIRST
	for q_id in QUEST_DATA:
		var q = QUEST_DATA[q_id]
		if q["is_active"] and not q["is_complete"]:
			for i in q["objectives"].size():
				var obj = q["objectives"][i]
				if obj["type"] == "talk_to_npc" and obj["npc"] == npc_id:
					update_objective(q_id, i, true)
					
	# 2. Activate quest if giver matches and not active/complete
	for q_id in QUEST_DATA:
		var q = QUEST_DATA[q_id]
		if q["giver"] == npc_id and not q["is_active"] and not q["is_complete"]:
			start_quest(q_id)


# ── Update objective progress
func update_objective(quest_id: String, obj_index: int, value) -> void:
	if not QUEST_DATA.has(quest_id):
		return
		
	var q = QUEST_DATA[quest_id]
	if not q["is_active"] or q["is_complete"]:
		return
		
	var obj = q["objectives"][obj_index]
	if obj.has("current"):
		obj["current"] = value
		if obj["current"] >= obj["count"]:
			obj["current"] = obj["count"]
	elif obj.has("done"):
		obj["done"] = value
		
	quest_updated.emit(quest_id)
	print("[QuestManager] %s objective %d progress -> %s" % [quest_id, obj_index, str(value)])
	
	# Check completion
	var all_met = true
	for o in q["objectives"]:
		if o.has("current"):
			if o["current"] < o["count"]:
				all_met = false
				break
		elif o.has("done"):
			if not o["done"]:
				all_met = false
				break
				
	if all_met:
		complete_quest(quest_id)


# ── Complete a quest
func complete_quest(quest_id: String) -> void:
	if not QUEST_DATA.has(quest_id):
		return
	var q = QUEST_DATA[quest_id]
	if q["is_complete"]:
		return
		
	q["is_active"] = false
	q["is_complete"] = true
	
	var rewards = q["rewards"]
	
	# Gold rewards
	if rewards.has("gold") and rewards["gold"] > 0:
		GameManager.add_gold(rewards["gold"])
		
	# Item rewards
	if rewards.has("items"):
		for item in rewards["items"]:
			InventoryManager.add_item(item["id"], item["count"])
			
	# Flash yellow complete popup
	_show_complete_popup(q["title"], rewards)
	
	AudioManager.play_sfx("quest_complete")
	
	quest_completed.emit(quest_id)
	print("[QuestManager] Quest Completed: %s!" % q["title"])


# ── Location trigger callback
func reach_location(location_name: String) -> void:
	print("[QuestManager] reach_location: %s" % location_name)
	
	# Handle QUEST_03 Pahalgam transition gate deadlock override
	if location_name == "pahalgam":
		if QUEST_DATA["QUEST_01"]["is_complete"] and QUEST_DATA["QUEST_02"]["is_complete"]:
			# Auto-activate QUEST_03 if not already active
			if not QUEST_DATA["QUEST_03"]["is_active"] and not QUEST_DATA["QUEST_03"]["is_complete"]:
				start_quest("QUEST_03")
			
			# Complete QUEST_03 objectives
			if QUEST_DATA["QUEST_03"]["is_active"] and not QUEST_DATA["QUEST_03"]["is_complete"]:
				update_objective("QUEST_03", 0, true) # reach_location -> done
				update_objective("QUEST_03", 1, true) # talk_to_npc -> done
				print("[QuestManager] Resolved QUEST_03 to unlock Pahalgam exit.")
				return
				
	# Standard location trigger check
	for q_id in QUEST_DATA:
		var q = QUEST_DATA[q_id]
		if q["is_active"] and not q["is_complete"]:
			for i in q["objectives"].size():
				var obj = q["objectives"][i]
				if obj["type"] == "reach_location" and obj["location"] == location_name:
					update_objective(q_id, i, true)


# ── Return true if all 3 main quests are complete
func all_main_quests_done() -> bool:
	return (
		QUEST_DATA["QUEST_01"]["is_complete"] and
		QUEST_DATA["QUEST_02"]["is_complete"] and
		QUEST_DATA["QUEST_03"]["is_complete"]
	)


# ── Return true if this NPC has a quest available to give
func npc_has_quest(npc_id: String) -> bool:
	for q_id in QUEST_DATA:
		var q = QUEST_DATA[q_id]
		if q["giver"] == npc_id and not q["is_active"] and not q["is_complete"]:
			return true
	return false


# ── GameManager day changed trigger (QUEST_01 survive check)
func _on_day_changed(new_day: int) -> void:
	if QUEST_DATA["QUEST_01"]["is_active"] and not QUEST_DATA["QUEST_01"]["is_complete"]:
		# Confirm no sheep died since starting
		if GameManager.flock_count < quest_01_start_flock:
			# A sheep died! Reset start day to today
			quest_01_start_day = new_day
			quest_01_start_flock = GameManager.flock_count
			print("[QuestManager] QUEST_01 progress reset: A sheep died! Survive 1 full day from Day %d." % new_day)
			
		var days_survived = new_day - quest_01_start_day
		update_objective("QUEST_01", 0, days_survived)


# ── Inventory item added trigger (QUEST_02 collect check)
func _on_item_added(item_id: String, _count: int) -> void:
	if QUEST_DATA["QUEST_02"]["is_active"] and not QUEST_DATA["QUEST_02"]["is_complete"]:
		if item_id == "wool":
			var current_wool = InventoryManager.get_item_count("wool")
			update_objective("QUEST_02", 0, current_wool)


# ── Programmatic Premium Complete Popup UI
func _show_complete_popup(quest_title: String, rewards: Dictionary) -> void:
	var current_scene = Engine.get_main_loop().current_scene
	if not current_scene:
		return
		
	var canvas = CanvasLayer.new()
	canvas.layer = 15
	
	# Modulatable yellow-gold flash screen
	var rect = ColorRect.new()
	rect.color = Color(1.0, 0.85, 0.1, 1.0)
	rect.modulate.a = 0.0
	rect.set_anchors_preset(Control.PRESET_FULL_RECT)
	canvas.add_child(rect)
	
	# Centered info container
	var center = CenterContainer.new()
	center.set_anchors_preset(Control.PRESET_FULL_RECT)
	canvas.add_child(center)
	
	var vbox = VBoxContainer.new()
	center.add_child(vbox)
	
	# Quest Complete Title
	var main_lbl = Label.new()
	main_lbl.text = "QUEST COMPLETE!"
	main_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	main_lbl.add_theme_font_size_override("font_size", 54)
	main_lbl.add_theme_color_override("font_color", Color(1.0, 0.9, 0.2))
	vbox.add_child(main_lbl)
	
	# Specific Quest Title
	var title_lbl = Label.new()
	title_lbl.text = quest_title
	title_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title_lbl.add_theme_font_size_override("font_size", 34)
	title_lbl.add_theme_color_override("font_color", Color.WHITE)
	vbox.add_child(title_lbl)
	
	# Margin Spacer
	var spacer = Control.new()
	spacer.custom_minimum_size = Vector2(0, 16)
	vbox.add_child(spacer)
	
	# Rewards list
	var reward_lbl = Label.new()
	var r_text = "REWARDS RECEIVED\n"
	if rewards.has("gold") and rewards["gold"] > 0:
		r_text += "+ %d Gold\n" % rewards["gold"]
	if rewards.has("items"):
		for item in rewards["items"]:
			var name = item["id"].replace("_", " ").capitalize()
			r_text += "+ %s x%d\n" % [name, item["count"]]
	reward_lbl.text = r_text
	reward_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	reward_lbl.add_theme_font_size_override("font_size", 22)
	reward_lbl.add_theme_color_override("font_color", Color(0.8, 1.0, 0.8))
	vbox.add_child(reward_lbl)
	
	current_scene.add_child(canvas)
	
	# Animate the popup elements
	var tween = canvas.create_tween()
	tween.set_parallel(true)
	# Fade and flash screen modulate
	tween.tween_property(rect, "modulate:a", 0.6, 0.4).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	vbox.modulate.a = 0.0
	tween.tween_property(vbox, "modulate:a", 1.0, 0.3)
	
	var fade_tween = canvas.create_tween()
	fade_tween.tween_interval(1.1)
	fade_tween.tween_property(rect, "modulate:a", 0.0, 0.4).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_IN)
	fade_tween.tween_property(vbox, "modulate:a", 0.0, 0.4)
	fade_tween.tween_callback(canvas.queue_free)


func reset() -> void:
	for q_id in QUEST_DATA:
		QUEST_DATA[q_id]["is_active"] = false
		QUEST_DATA[q_id]["is_complete"] = false
		
		# Reset objective values
		for obj in QUEST_DATA[q_id]["objectives"]:
			if obj.has("current"):
				obj["current"] = 0
			elif obj.has("done"):
				obj["done"] = false
				
	quest_01_start_day = -1
	quest_01_start_flock = -1
	print("[QuestManager] Reset all quest states.")
