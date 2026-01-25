extends CanvasLayer
# =============================================================
# LoadingScreen.gd — Animated Loading Transition (W4-05)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

@onready var proverb_label: Label = $VBoxContainer/ProverbLabel
@onready var translation_label: Label = $VBoxContainer/TranslationLabel
@onready var progress_bar: ProgressBar = $VBoxContainer/ProgressBar

const PROVERBS: Array[Dictionary] = [
	{"kashmiri": "Wadi hamaari chhe", "english": "The valley is ours"},
	{"kashmiri": "Gadir khanis chhui wafadar", "english": "A shepherd never leaves his flock"},
	{"kashmiri": "Baraf aav chhe", "english": "The snow is coming"},
	{"kashmiri": "Bahar aayi chhe wapas", "english": "Spring will return"},
	{"kashmiri": "Khabardar reh", "english": "Be careful"},
]


func _ready() -> void:
	# Ignore pauses during transition
	process_mode = Node.PROCESS_MODE_ALWAYS


## Initialize the loading screen, pick a proverb, and animate the progress bar
func start_loading() -> void:
	# Select a random Kashmiri proverb
	var idx = randi() % PROVERBS.size()
	var proverb = PROVERBS[idx]
	
	proverb_label.text = proverb["kashmiri"]
	translation_label.text = proverb["english"]
	progress_bar.value = 0.0
	modulate.a = 1.0
	
	# Fake load progression from 0 to 100 over 1.5 seconds
	var tween = create_tween()
	tween.tween_property(progress_bar, "value", 100.0, 1.5).set_trans(Tween.TRANS_LINEAR)
	await tween.finished
	print("[LoadingScreen] Loading bar completed.")


## Fade out the loading screen before it gets queued for deletion
func finish_loading() -> void:
	var tween = create_tween()
	tween.tween_property(self, "modulate:a", 0.0, 0.35).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_IN_OUT)
	await tween.finished
	print("[LoadingScreen] Transition completed.")
