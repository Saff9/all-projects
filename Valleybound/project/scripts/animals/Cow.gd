extends Animal
# =============================================================
# Cow.gd — 3D Cow AI Character Script (W2-01)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

# Milking tracking day
var last_milk_day: int = -1
@onready var anim_player: AnimationPlayer = get_node_or_null("VisualMesh/CowModel/AnimationPlayer")

signal can_milk(can: bool)

# =============================================================
# LIFECYCLE
# =============================================================
func _ready_animal() -> void:
	# Cows are sturdy and stationary
	max_health = 50.0
	health = 50.0
	
	# Connect interaction signals
	can_interact.connect(func(can): can_milk.emit(can))
	
	if anim_player:
		# Search and play idle animation safely
		var anim_list = anim_player.get_animation_list()
		for anim in anim_list:
			if anim.to_lower().contains("idle"):
				anim_player.play(anim)
				break
	print("[%s] Stationary Cow ready." % name)


func _physics_process_animal(_delta: float) -> void:
	# Cow stands still, only slides on floor to settle under gravity
	velocity.x = 0.0
	velocity.z = 0.0
	move_and_slide()


# =============================================================
# INTERACTIONS & DEATH
# =============================================================
func _on_interact() -> void:
	if GameManager.current_day <= last_milk_day:
		print("[%s] Already milked today. Come back tomorrow!" % name)
		return
		
	last_milk_day = GameManager.current_day
	print("[%s] Milking Cow: Got fresh milk!" % name)
	
	# Give milk to InventoryManager if active
	if InventoryManager.has_method("add_item"):
		InventoryManager.add_item("milk", 1)


func _die_animal() -> void:
	print("[%s] has died." % name)
	GameManager.decrement_flock()
	set_physics_process(false)
	var col = get_node_or_null("CollisionShape3D")
	if col:
		col.disabled = true
	var t = create_tween()
	t.tween_property(self, "scale", Vector3.ZERO, 0.4).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_IN)
	t.tween_callback(queue_free)
