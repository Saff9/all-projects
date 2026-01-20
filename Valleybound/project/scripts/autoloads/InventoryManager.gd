extends Node
# =============================================================
# InventoryManager.gd — Global Singleton (Autoload) (W3-02)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

# Item Database Definition
const ITEM_DB = {
	"bread": {
		"name": "Lavasa Bread", "type": "CONSUMABLE", 
		"hunger": 30, "health": 0, "stack_max": 10, "gold_value": 5, 
		"icon_color": Color(0.9, 0.7, 0.3)
	},
	"herbs": {
		"name": "Forest Herbs", "type": "CONSUMABLE", 
		"hunger": 0, "health": 20, "stack_max": 15, "gold_value": 8, 
		"icon_color": Color(0.2, 0.8, 0.2)
	},
	"wool": {
		"name": "Wool", "type": "MATERIAL", 
		"stack_max": 20, "gold_value": 12, 
		"icon_color": Color(0.95, 0.95, 0.95)
	},
	"milk": {
		"name": "Fresh Milk", "type": "CONSUMABLE", 
		"hunger": 15, "health": 5, "stack_max": 5, "gold_value": 6, 
		"icon_color": Color(0.95, 0.9, 0.8)
	},
	"saffron": {
		"name": "Kashmiri Saffron", "type": "MATERIAL", 
		"stack_max": 10, "gold_value": 50, 
		"icon_color": Color(0.95, 0.7, 0.0)
	},
	"apple": {
		"name": "Kashmiri Apple", "type": "CONSUMABLE", 
		"hunger": 20, "health": 0, "stack_max": 10, "gold_value": 3, 
		"icon_color": Color(0.9, 0.2, 0.1)
	},
	"pheran": {
		"name": "Warm Pheran", "type": "CLOTHING", 
		"cold_mult": 0.5, "gold_value": 30, 
		"icon_color": Color(0.4, 0.3, 0.6)
	},
	"warrior_pheran": {
		"name": "Warrior Pheran", "type": "CLOTHING", 
		"cold_mult": 0.2, "armor": 10, "gold_value": 80, 
		"icon_color": Color(0.6, 0.2, 0.2)
	},
	"slingshot": {
		"name": "Slingshot", "type": "WEAPON", 
		"damage": 15, "weapon_type": "ranged", "gold_value": 0,
		"icon_color": Color(0.65, 0.5, 0.3)
	},
	"iron_staff": {
		"name": "Iron Staff", "type": "WEAPON", 
		"damage": 25, "weapon_type": "melee", "gold_value": 0,
		"icon_color": Color(0.5, 0.5, 0.55)
	},
	"iron_sword": {
		"name": "Iron Sword", "type": "WEAPON", 
		"damage": 40, "weapon_type": "melee", "gold_value": 60,
		"icon_color": Color(0.7, 0.7, 0.85)
	},
	"fire_torch": {
		"name": "Fire Torch", "type": "WEAPON", 
		"damage": 20, "weapon_type": "special", "scares_wolves": true, "damages_wraiths": true, "gold_value": 20,
		"icon_color": Color(1.0, 0.45, 0.1)
	},
	"enchanted_blade": {
		"name": "Enchanted Blade", "type": "WEAPON", 
		"damage": 60, "weapon_type": "melee", "damages_wraiths": true, "gold_value": 0,
		"icon_color": Color(0.1, 0.7, 0.9)
	}
}

# Runtime Inventory lists
var inventory: Array[Dictionary] = []
var equipped_weapon: String = "slingshot"
var equipped_clothing: String = ""

# Signals
signal item_added(item_id: String, count: int)
signal item_removed(item_id: String, count: int)
signal equipped_changed()


func _ready() -> void:
	# Add starting weapon
	add_item("slingshot", 1)
	print("[InventoryManager] Initialized with slingshot.")


# ── Add item with stack calculation
func add_item(item_id: String, count: int = 1) -> void:
	if not ITEM_DB.has(item_id):
		push_warning("[Inventory] Cannot add unknown item_id: %s" % item_id)
		return
		
	var info = ITEM_DB[item_id]
	var stack_max = info.get("stack_max", 99) # Default high limit if not set (e.g. weapons)
	var remaining = count
	
	# 1. Fill existing stacks
	for slot in inventory:
		if slot["id"] == item_id and slot["count"] < stack_max:
			var space = stack_max - slot["count"]
			var added = mini(space, remaining)
			slot["count"] += added
			remaining -= added
			item_added.emit(item_id, added)
			if remaining <= 0:
				break
				
	# 2. Append new slots
	while remaining > 0:
		var added = mini(stack_max, remaining)
		inventory.append({"id": item_id, "count": added})
		remaining -= added
		item_added.emit(item_id, added)
		
	print("[Inventory] Added %d %s. Inventory slots: %d" % [count, item_id, inventory.size()])


# ── Remove item from inventory
func remove_item(item_id: String, count: int = 1) -> bool:
	if not has_item(item_id, count):
		return false
		
	var remaining = count
	var i = inventory.size() - 1
	while i >= 0:
		var slot = inventory[i]
		if slot["id"] == item_id:
			var removed = mini(slot["count"], remaining)
			slot["count"] -= removed
			remaining -= removed
			item_removed.emit(item_id, removed)
			
			if slot["count"] <= 0:
				inventory.remove_at(i)
				
			if remaining <= 0:
				break
		i -= 1
		
	print("[Inventory] Removed %d %s." % [count, item_id])
	return true


# ── Boolean item check
func has_item(item_id: String, count: int = 1) -> bool:
	var total = 0
	for slot in inventory:
		if slot["id"] == item_id:
			total += slot["count"]
	return total >= count


# ── Get total count of an item
func get_item_count(item_id: String) -> int:
	var total = 0
	for slot in inventory:
		if slot["id"] == item_id:
			total += slot["count"]
	return total


# ── Consume/Equip item
func use_item(item_id: String) -> void:
	if not has_item(item_id, 1):
		return
		
	var info = ITEM_DB[item_id]
	var type = info.get("type", "")
	
	if type == "CONSUMABLE":
		if remove_item(item_id, 1):
			if info.has("hunger") and info["hunger"] > 0:
				GameManager.modify_hunger(info["hunger"])
			if info.has("health") and info["health"] > 0:
				GameManager.modify_health(info["health"])
			AudioManager.play_sfx("use_consumable")
			print("[Inventory] Consumed consumable: %s" % info["name"])
	elif type == "CLOTHING" or type == "WEAPON":
		equip(item_id)


# ── Equip item to slots
func equip(item_id: String) -> void:
	if not ITEM_DB.has(item_id):
		return
		
	var info = ITEM_DB[item_id]
	var type = info.get("type", "")
	
	if type == "WEAPON":
		equipped_weapon = item_id
		equipped_changed.emit()
		# Sync Player weapon label or variables if active
		var player = get_tree().get_first_node_in_group("player")
		if player and player.has_method("_update_weapon_label"):
			player._update_weapon_label()
		print("[Inventory] Equipped weapon: %s" % info["name"])
	elif type == "CLOTHING":
		equipped_clothing = item_id
		equipped_changed.emit()
		print("[Inventory] Equipped clothing: %s" % info["name"])


# ── Get cold drain multiplier
func get_cold_mult() -> float:
	if equipped_clothing == "" or not ITEM_DB.has(equipped_clothing):
		return 1.0
	return ITEM_DB[equipped_clothing].get("cold_mult", 1.0)


# ── Drop item to 3D world
func drop_item(item_id: String) -> void:
	if not has_item(item_id, 1):
		return
		
	# Weapons must be unequipped if dropping the last one
	var count = get_item_count(item_id)
	if count == 1:
		if equipped_weapon == item_id:
			equipped_weapon = ""
			equipped_changed.emit()
		elif equipped_clothing == item_id:
			equipped_clothing = ""
			equipped_changed.emit()
			
	if remove_item(item_id, 1):
		var player = get_tree().get_first_node_in_group("player")
		if player:
			var world_item_scene = load("res://scenes/world/WorldItem.tscn")
			if world_item_scene:
				var instance = world_item_scene.instantiate()
				instance.item_id = item_id
				
				# Spawn slightly in front of player
				var offset = Vector3(0, 0.5, -1.5) # Default north offset
				if player.has_method("get_facing_direction"):
					var dir = player.get_facing_direction()
					if dir.length() > 0.1:
						offset = Vector3(dir.x, 0.0, dir.y).normalized() * 1.5 + Vector3(0, 0.5, 0)
				instance.global_position = player.global_position + offset
				player.get_parent().add_child(instance)
				print("[Inventory] Dropped 1 %s at position: %s" % [item_id, str(instance.global_position)])


# ── Reset all states
func reset() -> void:
	inventory.clear()
	equipped_weapon = "slingshot"
	equipped_clothing = ""
	add_item("slingshot", 1)
	equipped_changed.emit()
	print("[Inventory] State reset.")
