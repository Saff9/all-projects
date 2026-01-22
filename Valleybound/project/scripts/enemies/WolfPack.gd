extends Node3D
# =============================================================
# WolfPack.gd — 3D Wolf Pack Controller (W2-02)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

@export var wolf_count: int = 3
@export var wolf_scene: PackedScene

func _ready() -> void:
	# Fallback load if wolf_scene not assigned in editor
	if wolf_scene == null:
		wolf_scene = load("res://scenes/animals/Wolf.tscn")
		
	var center = global_position
	
	# Create a 12m x 12m square patrol route around pack center on XZ plane
	var patrol_points: Array[Vector3] = [
		center + Vector3(-6.0, 0.0, -6.0),
		center + Vector3(6.0, 0.0, -6.0),
		center + Vector3(6.0, 0.0, 6.0),
		center + Vector3(-6.0, 0.0, 6.0)
	]
	
	for i in wolf_count:
		if wolf_scene == null:
			break
			
		var wolf = wolf_scene.instantiate()
		# Add to tree
		add_child(wolf)
		
		# Offset spawn positions slightly
		var offset = Vector3(randf_range(-2.0, 2.0), 0.1, randf_range(-2.0, 2.0))
		wolf.global_position = center + offset
		
		# Assign patrol route
		wolf.patrol_points = patrol_points
		wolf.patrol_index = i % patrol_points.size() # stagger wolf starting targets
		
	print("[WolfPack] Spawns %d wolves around center %s." % [wolf_count, str(center)])
