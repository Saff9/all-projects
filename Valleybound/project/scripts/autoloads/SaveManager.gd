extends Node
# =============================================================
# SaveManager.gd — Global Singleton (Autoload) (W4-05)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

const SAVE_PATH: String = "user://savegame.json"

# State variables for loading from save
var is_loading_saved_game: bool = false
var saved_scene_path: String = ""
var saved_entry_point: String = "default"
var saved_player_position: Vector3 = Vector3.ZERO


func _ready() -> void:
	print("[SaveManager] Initialized and ready.")


## Returns true if a save file exists on disk
func has_save() -> bool:
	return FileAccess.file_exists(SAVE_PATH)


## Save all game state to JSON file
func save_game() -> void:
	var player_node = get_tree().get_first_node_in_group("player")
	var pos_x: float = 0.0
	var pos_y: float = 0.1
	var pos_z: float = 0.0
	
	if player_node:
		pos_x = player_node.global_position.x
		pos_y = player_node.global_position.y
		pos_z = player_node.global_position.z
	
	var quest_dict: Dictionary = {}
	for q_id in QuestManager.QUEST_DATA:
		var q = QuestManager.QUEST_DATA[q_id]
		quest_dict[q_id] = {
			"active": q["is_active"],
			"complete": q["is_complete"],
			"objectives": q["objectives"]
		}
		
	var data: Dictionary = {
		"version": 1,
		"scene": SceneTransition.current_scene_path if SceneTransition.current_scene_path != "" else "res://scenes/world/Gulmarg.tscn",
		"entry": SceneTransition.pending_entry_point if SceneTransition.pending_entry_point != "" else "default",
		"player": {
			"pos_x": pos_x,
			"pos_y": pos_y,
			"pos_z": pos_z,
			"health": GameManager.player_health,
			"hunger": GameManager.player_hunger,
			"cold": GameManager.player_cold
		},
		"game": {
			"day": GameManager.current_day,
			"season": GameManager.current_season,
			"flock": GameManager.flock_count,
			"gold": GameManager.gold
		},
		"inventory": InventoryManager.inventory,
		"equipped": {
			"weapon": InventoryManager.equipped_weapon,
			"clothing": InventoryManager.equipped_clothing
		},
		"quests": quest_dict,
		"quest_01_start_day": QuestManager.quest_01_start_day,
		"quest_01_start_flock": QuestManager.quest_01_start_flock
	}
	
	var file = FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if file:
		file.store_string(JSON.stringify(data, "\t"))
		file.close()
		print("[SaveManager] Game saved successfully to: %s" % SAVE_PATH)
	else:
		push_error("[SaveManager] Failed to write save file to: %s" % SAVE_PATH)


## Load game state from JSON file
## Returns true on success, false if no save exists or parse error
func load_game() -> bool:
	if not has_save():
		print("[SaveManager] Load failed: no save file exists.")
		return false
		
	var file = FileAccess.open(SAVE_PATH, FileAccess.READ)
	if not file:
		print("[SaveManager] Load failed: could not open file.")
		return false
		
	var text = file.get_as_text()
	file.close()
	
	var data = JSON.parse_string(text)
	if data == null:
		print("[SaveManager] Load failed: JSON parsing error.")
		return false
		
	# Restore GameManager state
	GameManager.current_day = int(data["game"]["day"])
	GameManager.current_season = data["game"]["season"]
	GameManager.player_health = float(data["player"]["health"])
	GameManager.player_hunger = float(data["player"]["hunger"])
	GameManager.player_cold = float(data["player"]["cold"])
	GameManager.flock_count = int(data["game"]["flock"])
	GameManager.gold = int(data["game"]["gold"])
	
	# Emit GameManager signals to update HUD
	GameManager.health_changed.emit(GameManager.player_health)
	GameManager.hunger_changed.emit(GameManager.player_hunger)
	GameManager.cold_changed.emit(GameManager.player_cold)
	GameManager.flock_count_changed.emit(GameManager.flock_count)
	GameManager.day_changed.emit(GameManager.current_day)
	GameManager.season_changed.emit(GameManager.current_season, GameManager.current_day)
	
	# Restore InventoryManager state
	InventoryManager.inventory.clear()
	for slot in data["inventory"]:
		InventoryManager.inventory.append(slot)
	InventoryManager.equipped_weapon = data["equipped"]["weapon"]
	InventoryManager.equipped_clothing = data["equipped"]["clothing"]
	InventoryManager.equipped_changed.emit()
	
	# Sync weapon label on player if instanced
	var player = get_tree().get_first_node_in_group("player")
	if player and player.has_method("_update_weapon_label"):
		player._update_weapon_label()
		
	# Restore QuestManager state
	for q_id in data["quests"]:
		if QuestManager.QUEST_DATA.has(q_id):
			var saved_q = data["quests"][q_id]
			QuestManager.QUEST_DATA[q_id]["is_active"] = saved_q["active"]
			QuestManager.QUEST_DATA[q_id]["is_complete"] = saved_q["complete"]
			if saved_q.has("objectives"):
				QuestManager.QUEST_DATA[q_id]["objectives"] = saved_q["objectives"]
				
	# Restore QuestManager tracking variables
	QuestManager.quest_01_start_day = int(data.get("quest_01_start_day", -1))
	QuestManager.quest_01_start_flock = int(data.get("quest_01_start_flock", -1))
	
	# Store saved world state for GameWorld to load on start
	is_loading_saved_game = true
	saved_scene_path = data.get("scene", "res://scenes/world/Gulmarg.tscn")
	saved_entry_point = data.get("entry", "default")
	saved_player_position = Vector3(
		float(data["player"].get("pos_x", 0.0)),
		float(data["player"].get("pos_y", 0.1)),
		float(data["player"].get("pos_z", 0.0))
	)
	
	print("[SaveManager] Loaded game state successfully from: %s" % SAVE_PATH)
	return true


## Delete save file (used by New Game)
func delete_save() -> void:
	if has_save():
		DirAccess.remove_absolute(SAVE_PATH)
		print("[SaveManager] Save file deleted.")
