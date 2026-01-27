extends Area3D
# =============================================================
# WorldItem.gd — 3D World Item Pickup Script (W3-02)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

@export var item_id: String = "bread"

@onready var visual: CSGBox3D = $CSGBox3D


func _ready() -> void:
	body_entered.connect(_on_body_entered)
	_apply_material_color()
	print("[WorldItem3D] Ready: '%s'" % item_id)


func setup_item(new_id: String) -> void:
	item_id = new_id
	_apply_material_color()


func _apply_material_color() -> void:
	if visual == null:
		return
	# Set visual material color based on database settings
	if InventoryManager.ITEM_DB.has(item_id):
		var info = InventoryManager.ITEM_DB[item_id]
		if info.has("icon_color"):
			var mat = StandardMaterial3D.new()
			mat.albedo_color = info["icon_color"]
			mat.roughness = 0.4
			visual.material = mat


func _on_body_entered(body: Node3D) -> void:
	if body.is_in_group("player"):
		InventoryManager.add_item(item_id, 1)
		AudioManager.play_sfx("item_pickup")
		print("[WorldItem3D] Picked up item: %s" % item_id)
		queue_free()
