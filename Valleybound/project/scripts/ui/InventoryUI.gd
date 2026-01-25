extends CanvasLayer
# =============================================================
# InventoryUI.gd — Inventory interface controller script (W3-02)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

@onready var panel: Panel = $Panel
@onready var grid: GridContainer = $Panel/MarginContainer/VBoxContainer/ScrollContainer/GridContainer
@onready var weapon_label: Label = $Panel/MarginContainer/VBoxContainer/EquippedRow/WeaponLabel
@onready var clothing_label: Label = $Panel/MarginContainer/VBoxContainer/EquippedRow/ClothingLabel
@onready var close_btn: Button = $Panel/MarginContainer/VBoxContainer/CloseButton

# Touch dragging state
var _drag_start_y: float = 0.0
var _is_dragging: bool = false

# Press & Hold (long press) state
var _is_pressing: bool = false
var _press_timer: float = 0.0
var _pressed_item_id: String = ""
var _long_press_triggered: bool = false


func _ready() -> void:
	visible = false
	close_btn.pressed.connect(close_inventory)
	
	# Connect to autoload signal if it changes
	if InventoryManager.has_signal("equipped_changed"):
		InventoryManager.equipped_changed.connect(_update_equipped_labels)
		
	set_process(true)
	print("[InventoryUI] Ready. Swipe up (mobile) or press Tab/I (PC) to view.")


func _process(delta: float) -> void:
	# Update long press timer
	if _is_pressing and not _long_press_triggered:
		_press_timer += delta
		if _press_timer >= 0.5:
			_long_press_triggered = true
			_is_pressing = false
			_on_slot_long_pressed(_pressed_item_id)


func _input(event: InputEvent) -> void:
	# ── PC Toggle Keyboard Fallback ───────────────────────────────
	if event is InputEventKey and event.pressed:
		if event.keycode == KEY_TAB or event.keycode == KEY_I:
			get_viewport().set_input_as_handled()
			if visible:
				close_inventory()
			else:
				open_inventory()
				
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
					close_inventory()
		else:
			_is_dragging = false
			
	elif event is InputEventScreenDrag and _is_dragging:
		var velocity_y = event.velocity.y
		# Swipe Up (negative Y speed) to open
		if not visible and velocity_y < -300:
			open_inventory()
			_is_dragging = false
		# Swipe Down (positive Y speed) to close
		elif visible and velocity_y > 300:
			close_inventory()
			_is_dragging = false


func open_inventory() -> void:
	visible = true
	_populate_grid()
	_update_equipped_labels()
	print("[InventoryUI] Inventory opened.")


func close_inventory() -> void:
	visible = false
	_is_pressing = false
	print("[InventoryUI] Inventory closed.")


# ── Dynamically build slot panels
func _populate_grid() -> void:
	# Clear previous grid slots
	for child in grid.get_children():
		child.queue_free()
		
	var slots = InventoryManager.inventory
	
	for slot in slots:
		var item_id = slot["id"]
		var count = slot["count"]
		
		if not InventoryManager.ITEM_DB.has(item_id):
			continue
			
		var info = InventoryManager.ITEM_DB[item_id]
		var is_equipped = (InventoryManager.equipped_weapon == item_id or InventoryManager.equipped_clothing == item_id)
		
		# Create PanelContainer slot
		var container = PanelContainer.new()
		container.custom_minimum_size = Vector2(130, 130)
		
		# Apply premium box styling
		var style = StyleBoxFlat.new()
		style.bg_color = Color(0.12, 0.13, 0.17, 0.9)
		style.corner_radius_top_left = 12
		style.corner_radius_top_right = 12
		style.corner_radius_bottom_right = 12
		style.corner_radius_bottom_left = 12
		style.border_width_left = 2
		style.border_width_top = 2
		style.border_width_right = 2
		style.border_width_bottom = 2
		# Gold highlight if equipped, otherwise grey
		if is_equipped:
			style.border_color = Color(1.0, 0.85, 0.1) # Gold
			style.bg_color = Color(0.2, 0.18, 0.15, 0.9)
		else:
			style.border_color = Color(0.25, 0.27, 0.33)
		container.add_theme_stylebox_override("panel", style)
		
		# 1. ColorRect placeholder for item albedo color
		var rect = ColorRect.new()
		rect.color = info.get("icon_color", Color(0.5, 0.5, 0.5))
		rect.custom_minimum_size = Vector2(110, 110)
		rect.mouse_filter = Control.MOUSE_FILTER_PASS
		container.add_child(rect)
		
		# 2. VBox Container inside a Margin for text details
		var margin = MarginContainer.new()
		margin.add_theme_constant_override("margin_left", 6)
		margin.add_theme_constant_override("margin_right", 6)
		margin.add_theme_constant_override("margin_top", 6)
		margin.add_theme_constant_override("margin_bottom", 6)
		margin.mouse_filter = Control.MOUSE_FILTER_PASS
		container.add_child(margin)
		
		var vbox = VBoxContainer.new()
		vbox.alignment = BoxContainer.ALIGNMENT_CENTER
		vbox.mouse_filter = Control.MOUSE_FILTER_PASS
		margin.add_child(vbox)
		
		# Item Name (shortened if too long)
		var name_lbl = Label.new()
		name_lbl.text = info["name"]
		name_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		name_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		name_lbl.add_theme_font_size_override("font_size", 14)
		name_lbl.add_theme_color_override("font_color", Color.WHITE)
		name_lbl.add_theme_color_override("font_outline_color", Color.BLACK)
		name_lbl.add_theme_constant_override("outline_size", 4)
		vbox.add_child(name_lbl)
		
		# Stack Count Label
		var count_lbl = Label.new()
		count_lbl.text = "x%d" % count
		count_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		count_lbl.add_theme_font_size_override("font_size", 16)
		count_lbl.add_theme_color_override("font_color", Color(0.9, 0.9, 0.9))
		count_lbl.add_theme_color_override("font_outline_color", Color.BLACK)
		count_lbl.add_theme_constant_override("outline_size", 4)
		vbox.add_child(count_lbl)
		
		# Highlight "[Equipped]" label
		if is_equipped:
			var eq_lbl = Label.new()
			eq_lbl.text = "[Active]"
			eq_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
			eq_lbl.add_theme_font_size_override("font_size", 12)
			eq_lbl.add_theme_color_override("font_color", Color(1.0, 0.85, 0.1))
			eq_lbl.add_theme_color_override("font_outline_color", Color.BLACK)
			eq_lbl.add_theme_constant_override("outline_size", 4)
			vbox.add_child(eq_lbl)
			
		# Wire inputs for Tap and Long Press
		container.gui_input.connect(func(event: InputEvent):
			_on_slot_gui_input(event, item_id)
		)
		
		grid.add_child(container)
		
	# Empty slot warning
	if slots.size() == 0:
		var empty_lbl = Label.new()
		empty_lbl.text = "Inventory is empty."
		empty_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		empty_lbl.add_theme_font_size_override("font_size", 20)
		empty_lbl.add_theme_color_override("font_color", Color(0.5, 0.5, 0.5))
		grid.add_child(empty_lbl)


# ── Input listener on each slot
func _on_slot_gui_input(event: InputEvent, item_id: String) -> void:
	if event is InputEventMouseButton or event is InputEventScreenTouch:
		if event.pressed:
			_is_pressing = true
			_press_timer = 0.0
			_pressed_item_id = item_id
			_long_press_triggered = false
		else:
			if _is_pressing:
				_is_pressing = false
				if not _long_press_triggered and _press_timer < 0.5:
					_on_slot_tapped(item_id)


# ── Tap: consume or equip item
func _on_slot_tapped(item_id: String) -> void:
	InventoryManager.use_item(item_id)
	_populate_grid()
	_update_equipped_labels()


# ── Press and Hold (>0.5s): drop item
func _on_slot_long_pressed(item_id: String) -> void:
	InventoryManager.drop_item(item_id)
	_populate_grid()
	_update_equipped_labels()


# ── Update equipped labels row
func _update_equipped_labels() -> void:
	if weapon_label == null or clothing_label == null:
		return
		
	# Update weapon label
	var wep_id = InventoryManager.equipped_weapon
	if wep_id != "" and InventoryManager.ITEM_DB.has(wep_id):
		weapon_label.text = "Weapon: %s" % InventoryManager.ITEM_DB[wep_id]["name"]
	else:
		weapon_label.text = "Weapon: Unarmed"
		
	# Update clothing label
	var cl_id = InventoryManager.equipped_clothing
	if cl_id != "" and InventoryManager.ITEM_DB.has(cl_id):
		clothing_label.text = "Clothing: %s" % InventoryManager.ITEM_DB[cl_id]["name"]
	else:
		clothing_label.text = "Clothing: None"
