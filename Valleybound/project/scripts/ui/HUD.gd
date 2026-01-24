extends CanvasLayer
# =============================================================
# HUD.gd — Heads-Up Display (W1-05)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================
# Responsibilities:
#   - Display health / hunger / cold progress bars
#   - Show current season + day counter
#   - Animate bar values using Tween when GameManager signals fire
#   - Show Game Over overlay when game_over signal fires
#   - Apply bar colors via StyleBoxFlat overrides in code
# =============================================================

# ── Bar references ────────────────────────────────────────────
@onready var health_bar:   ProgressBar = $MarginContainer/VBoxContainer/TopRow/BarsGroup/HealthRow/HealthBar
@onready var hunger_bar:   ProgressBar = $MarginContainer/VBoxContainer/TopRow/BarsGroup/HungerRow/HungerBar
@onready var cold_bar:     ProgressBar = $MarginContainer/VBoxContainer/TopRow/BarsGroup/ColdRow/ColdBar
@onready var season_label: Label       = $MarginContainer/VBoxContainer/TopRow/SeasonLabel

# ── Game Over overlay references ─────────────────────────────
@onready var game_over_screen: ColorRect = $GameOverScreen
@onready var cause_label:      Label     = $GameOverScreen/CenterContainer/VBoxContainer/CauseLabel
@onready var restart_button:   Button    = $GameOverScreen/CenterContainer/VBoxContainer/RestartButton

# ── Per-bar Tweens (kill before starting a new one) ──────────
## Prevents creating 60 orphan Tweens/sec when bars drain continuously
var _health_tween: Tween = null
var _hunger_tween: Tween = null
var _cold_tween:   Tween = null


# =============================================================
# LIFECYCLE
# =============================================================
func _ready() -> void:
	# Apply StyleBoxFlat bar colours in code (no editor overrides needed)
	_apply_bar_styles()

	# Connect to all required GameManager signals
	GameManager.health_changed.connect(_on_health_changed)
	GameManager.hunger_changed.connect(_on_hunger_changed)
	GameManager.cold_changed.connect(_on_cold_changed)
	GameManager.season_changed.connect(_on_season_changed)
	GameManager.game_over.connect(_on_game_over)

	# Wire up the restart button
	restart_button.pressed.connect(_on_restart_pressed)

	# Hide game over screen until triggered
	game_over_screen.visible = false

	# Initialise display to current GameManager state
	# (in case game is resumed mid-state later in W4-05)
	health_bar.value   = GameManager.player_health
	hunger_bar.value   = GameManager.player_hunger
	cold_bar.value     = GameManager.player_cold
	season_label.text  = _format_season_text(
		GameManager.current_season, GameManager.current_day
	)

	print("[HUD] Ready.")


# =============================================================
# BAR COLORS — StyleBoxFlat applied at runtime
# =============================================================
# Using StyleBoxFlat avoids needing any Theme resource or editor setup.
# Each bar gets a colored "fill" style and a darker "background" style.

func _apply_bar_styles() -> void:
	_style_bar(
		health_bar,
		Color(0.90, 0.10, 0.10),   # Fill:  vivid red
		Color(0.18, 0.04, 0.04)    # BG:    dark maroon
	)
	_style_bar(
		hunger_bar,
		Color(1.00, 0.60, 0.00),   # Fill:  warm orange
		Color(0.20, 0.12, 0.00)    # BG:    dark brown
	)
	_style_bar(
		cold_bar,
		Color(0.20, 0.40, 1.00),   # Fill:  bright blue
		Color(0.04, 0.08, 0.20)    # BG:    dark navy
	)


## Applies a fill color and background color to a ProgressBar using StyleBoxFlat.
## corner_radius gives the bars slightly rounded ends.
func _style_bar(bar: ProgressBar, fill_color: Color, bg_color: Color) -> void:
	# ── Fill (the coloured portion) ───────────────────────────
	var fill := StyleBoxFlat.new()
	fill.bg_color                  = fill_color
	fill.corner_radius_top_left    = 4
	fill.corner_radius_top_right   = 4
	fill.corner_radius_bottom_left = 4
	fill.corner_radius_bottom_right = 4
	bar.add_theme_stylebox_override("fill", fill)

	# ── Background (the unfilled track) ──────────────────────
	var bg := StyleBoxFlat.new()
	bg.bg_color                  = bg_color
	bg.corner_radius_top_left    = 4
	bg.corner_radius_top_right   = 4
	bg.corner_radius_bottom_left = 4
	bg.corner_radius_bottom_right = 4
	bar.add_theme_stylebox_override("background", bg)


# =============================================================
# SIGNAL HANDLERS — Bar updates
# =============================================================

## Animate HealthBar to the new value over 0.3 seconds.
## Kills any in-progress tween first so we don't fight ourselves.
func _on_health_changed(v: float) -> void:
	if _health_tween and _health_tween.is_valid():
		_health_tween.kill()
	_health_tween = create_tween()
	_health_tween.tween_property(health_bar, "value", v, 0.3)

	# Flash red at low health (≤ 25)
	if v <= 25.0 and health_bar.modulate.a >= 1.0:
		_flash_bar(health_bar)


func _on_hunger_changed(v: float) -> void:
	if _hunger_tween and _hunger_tween.is_valid():
		_hunger_tween.kill()
	_hunger_tween = create_tween()
	_hunger_tween.tween_property(hunger_bar, "value", v, 0.3)

	if v <= 20.0 and hunger_bar.modulate.a >= 1.0:
		_flash_bar(hunger_bar)


func _on_cold_changed(v: float) -> void:
	if _cold_tween and _cold_tween.is_valid():
		_cold_tween.kill()
	_cold_tween = create_tween()
	_cold_tween.tween_property(cold_bar, "value", v, 0.3)

	if v <= 20.0 and cold_bar.modulate.a >= 1.0:
		_flash_bar(cold_bar)


## Blink a bar's alpha to warn the player it's critically low.
func _flash_bar(bar: ProgressBar) -> void:
	var t := create_tween()
	t.set_loops(3)
	t.tween_property(bar, "modulate:a", 0.3, 0.15)
	t.tween_property(bar, "modulate:a", 1.0, 0.15)


# =============================================================
# SIGNAL HANDLERS — Season label
# =============================================================

func _on_season_changed(season: String, day: int) -> void:
	season_label.text = _format_season_text(season, day)


func _format_season_text(season: String, day: int) -> String:
	# Season emoji for quick visual scanning
	var emoji: String
	match season:
		"spring": emoji = "🌸"
		"summer": emoji = "☀"
		"autumn": emoji = "🍂"
		"winter": emoji = "❄"
		_:         emoji = "?"
	return "%s %s — Day %d" % [emoji, season.capitalize(), day]


# =============================================================
# GAME OVER OVERLAY
# =============================================================

func _on_game_over(cause: String) -> void:
	# Show the semi-transparent black overlay
	game_over_screen.visible = true

	# Set cause-specific message
	match cause:
		"starved":
			cause_label.text = "You starved in the mountains."
		"frozen":
			cause_label.text = "You froze in the Kashmiri winter."
		"Your flock is lost":
			cause_label.text = "Your flock was lost to the wolves."
		"dead":
			cause_label.text = "Wadi-e-Kashmir claimed you."
		_:
			cause_label.text = "The valley was not kind."

	# Animate overlay: fade in from transparent
	game_over_screen.modulate.a = 0.0
	var tween := create_tween()
	tween.tween_property(game_over_screen, "modulate:a", 1.0, 0.8)

	print("[HUD] Game Over displayed — cause: %s" % cause)


func _on_restart_pressed() -> void:
	print("[HUD] Restarting game...")
	game_over_screen.visible = false
	GameManager.reset()
	QuestManager.reset()
	InventoryManager.reset()
	# Reload the whole game world
	get_tree().reload_current_scene()
