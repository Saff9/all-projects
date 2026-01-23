extends Control
# =============================================================
# Credits.gd — Ending Credits Screen Script (Act 3 Ending)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

func _ready() -> void:
	# Begin black screen, fade in over 2.0 seconds
	modulate.a = 0.0
	var tween = create_tween()
	tween.tween_property(self, "modulate:a", 1.0, 2.0)
	
	# Play Kashmiri ending Santoor theme
	if AudioManager.has_method("play_music"):
		AudioManager.play_music("ending")
		
	print("[Credits] Ending credits started. Playing Kashmiri theme.")
	
	# Show ending credits overlay for 10 seconds
	await get_tree().create_timer(10.0).timeout
	
	# Return to Main Menu
	print("[Credits] Credits finished. Returning to main menu.")
	get_tree().change_scene_to_file("res://scenes/main/MainMenu.tscn")
