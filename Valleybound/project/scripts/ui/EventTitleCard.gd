extends CanvasLayer
# =============================================================
# EventTitleCard.gd — Event Announcement UI Overlay (W3-05)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

@onready var color_rect: ColorRect = $ColorRect
@onready var title_label: Label = $ColorRect/VBoxContainer/TitleLabel
@onready var subtitle_label: Label = $ColorRect/VBoxContainer/SubtitleLabel

var _current_tween: Tween = null

func _ready() -> void:
	visible = false
	if color_rect:
		color_rect.modulate.a = 1.0

## Displays the title and subtitle banners, holds for duration, then fades out.
func show_event(title: String, subtitle: String, duration: float = 3.0) -> void:
	# Kill active tween if any to prevent overlaps
	if _current_tween and _current_tween.is_valid():
		_current_tween.kill()
	
	title_label.text = title
	subtitle_label.text = subtitle
	visible = true
	if color_rect:
		color_rect.modulate.a = 1.0
	
	# Wait for the specified banner show duration
	await get_tree().create_timer(duration).timeout
	
	# Fade out over 0.5s
	if color_rect:
		_current_tween = create_tween()
		_current_tween.tween_property(color_rect, "modulate:a", 0.0, 0.5)
		await _current_tween.finished
	
	visible = false
	if color_rect:
		color_rect.modulate.a = 1.0
