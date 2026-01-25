extends CanvasLayer
# =============================================================
# QuestLog.gd — Swipeable Quest Log interface script (W3-01)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

@onready var panel: Panel = $Panel
@onready var quest_list: VBoxContainer = $Panel/MarginContainer/VBoxContainer/ScrollContainer/QuestList

var _drag_start_y: float = 0.0
var _is_dragging: bool = false


func _ready() -> void:
	visible = false
	print("[QuestLog] Initialized. Swipe up (mobile) or press Tab/L (PC) to view.")


func _input(event: InputEvent) -> void:
	# ── PC Toggle Keyboard Fallback ───────────────────────────────
	if event is InputEventKey and event.pressed:
		if event.keycode == KEY_TAB or event.keycode == KEY_L:
			get_viewport().set_input_as_handled()
			if visible:
				close_log()
			else:
				open_log()
				
	# ── Touch Swipe & Tap Outside Detection ────────────────────────
	if event is InputEventScreenTouch:
		if event.pressed:
			_drag_start_y = event.position.y
			_is_dragging = true
			
			# Tap outside panel to close
			if visible:
				var rect = panel.get_global_rect()
				if not rect.has_point(event.position):
					get_viewport().set_input_as_handled()
					close_log()
		else:
			_is_dragging = false
			
	elif event is InputEventScreenDrag and _is_dragging:
		var velocity_y = event.velocity.y
		# Swipe Up (negative Y speed) to open
		if not visible and velocity_y < -300:
			open_log()
			_is_dragging = false
		# Swipe Down (positive Y speed) to close
		elif visible and velocity_y > 300:
			close_log()
			_is_dragging = false


func open_log() -> void:
	visible = true
	_populate_quest_list()
	print("[QuestLog] Log opened.")


func close_log() -> void:
	visible = false
	print("[QuestLog] Log closed.")


func _populate_quest_list() -> void:
	# Clear previous entries
	for child in quest_list.get_children():
		child.queue_free()
		
	var active_count = 0
	
	for q_id in QuestManager.QUEST_DATA:
		var q = QuestManager.QUEST_DATA[q_id]
		# Show active quests
		if q["is_active"] and not q["is_complete"]:
			active_count += 1
			_create_quest_entry(q)
			
	if active_count == 0:
		var empty_lbl = Label.new()
		empty_lbl.text = "No active quests.\nTalk to NPCs in villages to start tasks."
		empty_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		empty_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		empty_lbl.add_theme_font_size_override("font_size", 22)
		empty_lbl.add_theme_color_override("font_color", Color(0.5, 0.5, 0.5))
		quest_list.add_child(empty_lbl)


func _create_quest_entry(quest: Dictionary) -> void:
	var entry_vbox = VBoxContainer.new()
	entry_vbox.theme_override_constants_separation = 6
	
	# Quest Title
	var title_lbl = Label.new()
	title_lbl.text = quest["title"]
	title_lbl.add_theme_font_size_override("font_size", 24)
	title_lbl.add_theme_color_override("font_color", Color(1.0, 0.85, 0.2)) # Warm Gold
	entry_vbox.add_child(title_lbl)
	
	# Quest Description
	var desc_lbl = Label.new()
	desc_lbl.text = quest["description"]
	desc_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	desc_lbl.add_theme_font_size_override("font_size", 18)
	desc_lbl.add_theme_color_override("font_color", Color(0.8, 0.8, 0.8))
	entry_vbox.add_child(desc_lbl)
	
	# Objectives header / progress list
	for obj in quest["objectives"]:
		var obj_lbl = Label.new()
		var obj_text = ""
		var completed = false
		
		match obj["type"]:
			"survive_days":
				obj_text = " - Survive in-game days: %d/%d" % [obj["current"], obj["count"]]
				completed = obj["current"] >= obj["count"]
			"collect_item":
				var name = obj["item"].capitalize()
				obj_text = " - Collect %s: %d/%d" % [name, obj["current"], obj["count"]]
				completed = obj["current"] >= obj["count"]
			"reach_location":
				var loc = obj["location"].capitalize()
				obj_text = " - Travel to %s: %s" % [loc, "Done" if obj["done"] else "In progress"]
				completed = obj["done"]
			"talk_to_npc":
				var npc = obj["npc"].replace("_", " ").capitalize()
				obj_text = " - Speak to %s: %s" % [npc, "Done" if obj["done"] else "In progress"]
				completed = obj["done"]
				
		obj_lbl.text = obj_text
		obj_lbl.add_theme_font_size_override("font_size", 18)
		if completed:
			obj_lbl.add_theme_color_override("font_color", Color(0.3, 0.85, 0.3)) # Green
		else:
			obj_lbl.add_theme_color_override("font_color", Color(0.9, 0.7, 0.3)) # Orange-yellow
			
		entry_vbox.add_child(obj_lbl)
		
	# HSeparator between entries
	var sep = HSeparator.new()
	entry_vbox.add_child(sep)
	
	quest_list.add_child(entry_vbox)
