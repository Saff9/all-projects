extends Node
# =============================================================
# GameManager.gd — Global Singleton (Autoload)  [UPDATED W1-04]
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================
# Changes in W1-04:
#   - season_changed now only emits on actual season change
#   - Added signal blizzard_active(is_active:bool)
#   - blizzard_active emitted by start_blizzard() / end_blizzard()
# =============================================================

# ── Game State ────────────────────────────────────────────────
var current_season: String  = "spring"
var current_day:    int     = 1
var player_health:  float   = 100.0
var player_hunger:  float   = 100.0
var player_cold:    float   = 100.0
var flock_count:    int     = 5
var gold:           int     = 0

# ── Signals ───────────────────────────────────────────────────
signal health_changed(v: float)
signal hunger_changed(v: float)
signal cold_changed(v: float)
signal season_changed(season: String, day: int)
signal day_changed(day: int)
signal flock_count_changed(count: int)
signal game_over(cause: String)
## Emitted when a blizzard begins or ends. is_active=true → blizzard on.
signal blizzard_active(is_active: bool)
signal blizzard_started()
signal blizzard_ended()

# ── Timer / Flow ──────────────────────────────────────────────
## 1 real second = 1 in-game day for testing. Change to 300.0 for 5-min days.
var day_duration: float         = 60.0
var _day_timer: float           = 0.0
var _game_over_triggered: bool  = false
var _processing_active: bool    = true

# ── Blizzard ──────────────────────────────────────────────────
## True while a blizzard is active in the current map
var is_blizzard: bool           = false
## Speed multiplier for Player while blizzard is on (0.5 = half speed)
var blizzard_speed_mult: float  = 1.0

# ── Cold Drain Rates (per second, by season) ─────────────────
# spring=0.1, summer=0.05, autumn=0.3, winter=1.0
const COLD_DRAIN_RATE: Dictionary = {
	"spring": 0.1,
	"summer": 0.05,
	"autumn": 0.3,
	"winter": 1.0,
}

# Season boundaries: day 1-7=spring, 8-14=summer, 15-21=autumn, 22+=winter
const SEASON_DAY_BOUNDARIES: Array = [
	["spring", 1,  7],
	["summer", 8,  14],
	["autumn", 15, 21],
	["winter", 22, 999],
]


# =============================================================
# LIFECYCLE
# =============================================================
func _ready() -> void:
	set_process(true)
	print("[GameManager] Ready — Season: %s, Day: %d" % [current_season, current_day])


func _process(delta: float) -> void:
	if not _processing_active or _game_over_triggered:
		return
	_advance_day(delta)
	_drain_survival(delta)


# =============================================================
# DAY / SEASON  — W1-04: only emits season_changed on real change
# =============================================================
func _advance_day(delta: float) -> void:
	_day_timer += delta
	if _day_timer >= day_duration:
		_day_timer -= day_duration
		current_day  += 1
		day_changed.emit(current_day)
		_update_season()
		if current_day % 3 == 0:
			SaveManager.save_game()


func _update_season() -> void:
	var new_season: String = current_season

	# Determine which season the current day falls in
	if current_day <= 7:
		new_season = "spring"
	elif current_day <= 14:
		new_season = "summer"
	elif current_day <= 21:
		new_season = "autumn"
	else:
		new_season = "winter"

	# ── Only emit signal when season actually changes ──────────
	if new_season != current_season:
		current_season = new_season
		print("[GameManager] Season → %s (day %d)" % [current_season, current_day])
		season_changed.emit(current_season, current_day)


# =============================================================
# SURVIVAL DRAIN  — runs every physics frame
# =============================================================
func _drain_survival(delta: float) -> void:
	# ── Hunger (constant drain) ───────────────────────────────
	player_hunger -= 0.5 * delta
	player_hunger  = clampf(player_hunger, 0.0, 100.0)
	hunger_changed.emit(player_hunger)

	# ── Cold (season-dependent, amplified during blizzard) ────
	var cold_rate: float = COLD_DRAIN_RATE.get(current_season, 0.1)
	if is_blizzard:
		cold_rate *= 5.0
	# Clothing modifier: InventoryManager.get_cold_mult() returns 0.2–1.0
	if InventoryManager.has_method("get_cold_mult"):
		cold_rate *= InventoryManager.get_cold_mult()

	player_cold -= cold_rate * delta
	player_cold  = clampf(player_cold, 0.0, 100.0)
	cold_changed.emit(player_cold)

	# ── Health drain when survival bars hit zero ───────────────
	if player_hunger <= 0.0:
		player_health -= 1.0 * delta    # Starving: slow bleed
	if player_cold <= 0.0:
		player_health -= 2.0 * delta    # Frozen: faster bleed

	player_health = clampf(player_health, 0.0, 100.0)
	health_changed.emit(player_health)

	# ── Game-over check ───────────────────────────────────────
	if player_health <= 0.0:
		_trigger_game_over_from_bars()


func _trigger_game_over_from_bars() -> void:
	# Determine most likely cause
	var cause: String = "dead"
	if player_hunger <= 0.0 and player_cold > 0.0:
		cause = "starved"
	elif player_cold <= 0.0 and player_hunger > 0.0:
		cause = "frozen"
	elif player_cold <= 0.0 and player_hunger <= 0.0:
		cause = "starved"   # Hunger kills slower — if both zero, hunger was first
	trigger_game_over(cause)


# =============================================================
# PUBLIC API — Health / Hunger / Cold
# =============================================================

## Positive = heal, negative = damage.
func modify_health(amount: float) -> void:
	player_health = clampf(player_health + amount, 0.0, 100.0)
	health_changed.emit(player_health)
	if player_health <= 0.0:
		trigger_game_over("dead")


## Positive = eat food, negative = additional drain.
func modify_hunger(amount: float) -> void:
	player_hunger = clampf(player_hunger + amount, 0.0, 100.0)
	hunger_changed.emit(player_hunger)


## Positive = warming up (fire, clothing), negative = extra cold.
func modify_cold(amount: float) -> void:
	player_cold = clampf(player_cold + amount, 0.0, 100.0)
	cold_changed.emit(player_cold)


# =============================================================
# PUBLIC API — Gold
# =============================================================

func add_gold(amount: int) -> void:
	gold += amount


func can_spend_gold(amount: int) -> bool:
	return gold >= amount


func spend_gold(amount: int) -> bool:
	if gold < amount:
		return false
	gold -= amount
	return true


# =============================================================
# PUBLIC API — Flock
# =============================================================

func set_flock_count(new_count: int) -> void:
	flock_count = maxi(0, new_count)
	flock_count_changed.emit(flock_count)
	if flock_count <= 0:
		trigger_game_over("Your flock is lost")


func decrement_flock() -> void:
	set_flock_count(flock_count - 1)


# =============================================================
# PUBLIC API — Blizzard  [W1-04: added blizzard_active signal]
# =============================================================

## Begin a blizzard: cold drain ×5, player speed ×0.5.
## Emits: blizzard_started(), blizzard_active(true)
func start_blizzard() -> void:
	if is_blizzard:
		return
	is_blizzard         = true
	blizzard_speed_mult = 0.5
	blizzard_started.emit()
	blizzard_active.emit(true)
	print("[GameManager] Blizzard started — cold drain ×5, speed ×0.5")


## End the blizzard: restore normal drain and player speed.
## Emits: blizzard_ended(), blizzard_active(false)
func end_blizzard() -> void:
	if not is_blizzard:
		return
	is_blizzard         = false
	blizzard_speed_mult = 1.0
	blizzard_ended.emit()
	blizzard_active.emit(false)
	print("[GameManager] Blizzard ended.")


# =============================================================
# PUBLIC API — Game Over
# =============================================================

## Call this from any system to end the game.
## Emits game_over(cause) once. Freezes all processing.
func trigger_game_over(cause: String) -> void:
	if _game_over_triggered:
		return
	_game_over_triggered = true
	_processing_active   = false
	print("[GameManager] ═══ GAME OVER — cause: %s ═══" % cause)
	game_over.emit(cause)


# =============================================================
# PUBLIC API — Full Reset
# =============================================================

func reset() -> void:
	current_season       = "spring"
	current_day          = 1
	player_health        = 100.0
	player_hunger        = 100.0
	player_cold          = 100.0
	flock_count          = 5
	gold                 = 0
	_day_timer           = 0.0
	_game_over_triggered = false
	_processing_active   = true
	is_blizzard          = false
	blizzard_speed_mult  = 1.0
	print("[GameManager] State reset.")
