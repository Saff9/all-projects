extends Control
# =============================================================
# JoystickVisual.gd — Procedural Virtual Joystick Overlay
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

var base_pos: Vector2 = Vector2.ZERO
var drag_pos: Vector2 = Vector2.ZERO
var active: bool = false

func _ready() -> void:
	# Ignore input events on this visual overlay so they pass through to Player.gd
	mouse_filter = Control.MOUSE_FILTER_IGNORE

func _draw() -> void:
	if not active:
		return
	
	# Draw semi-transparent background base circle
	draw_circle(base_pos, 70.0, Color(0.12, 0.15, 0.19, 0.45))
	# Draw smooth border arc for the base
	draw_arc(base_pos, 70.0, 0, TAU, 48, Color(1.0, 1.0, 1.0, 0.35), 2.5, true)
	# Draw visual guide center dot
	draw_circle(base_pos, 10.0, Color(1.0, 1.0, 1.0, 0.15))
	
	# Draw active drag knob (styled in golden-yellow)
	draw_circle(drag_pos, 32.0, Color(1.0, 0.85, 0.1, 0.65))
	# Draw bright border arc for the knob
	draw_arc(drag_pos, 32.0, 0, TAU, 32, Color(1.0, 1.0, 1.0, 0.75), 2.0, true)
