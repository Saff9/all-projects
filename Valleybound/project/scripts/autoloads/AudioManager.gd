extends Node
# =============================================================
# AudioManager.gd — Global Singleton (Autoload) (W4-02 / Audio)
# Wadi-e-Kashmir | Godot 4.3 | GDScript
# =============================================================

@onready var music_player: AudioStreamPlayer = AudioStreamPlayer.new()
@onready var sfx_player: AudioStreamPlayer = AudioStreamPlayer.new()

const MUSIC_PATH = "res://assets/audio/music/"
const SFX_PATH = "res://assets/audio/sfx/"

var music_volume: float = 0.0    # in dB, 0 = full (default)
var sfx_volume: float = 0.0      # in dB
var current_track: String = ""

func _ready() -> void:
	add_child(music_player)
	add_child(sfx_player)
	music_player.bus = "Music"
	sfx_player.bus = "SFX"
	print("[AudioManager] Real Audio Engine Initialized.")

## Plays background music with a smooth 1-second crossfade transition.
func play_music(track: String) -> void:
	if track == current_track:
		return
	current_track = track
	var path = MUSIC_PATH + track + ".wav"
	
	if not ResourceLoader.exists(path):
		push_warning("[AudioManager] Music not found: " + path)
		return
		
	# 1. Fade out current music over 1s if playing
	if music_player.playing:
		var fade_out = create_tween()
		fade_out.tween_property(music_player, "volume_db", -80.0, 1.0)
		await fade_out.finished
		
	# 2. Swap stream and play
	music_player.stream = load(path)
	music_player.volume_db = -80.0 # start silent
	music_player.play()
	
	# 3. Fade in new music to the target volume level
	var fade_in = create_tween()
	fade_in.tween_property(music_player, "volume_db", music_volume, 1.0)
	print("[AudioManager] Playing music: %s (Volume: %.1f dB)" % [track, music_volume])

## Plays a polyphonic one-shot sound effect.
func play_sfx(sound: String) -> void:
	var path = SFX_PATH + sound + ".wav"
	if not ResourceLoader.exists(path):
		# Silent fail as audio files are added progressively
		return
		
	var sfx = AudioStreamPlayer.new()
	add_child(sfx)
	sfx.bus = "SFX"
	sfx.volume_db = sfx_volume
	sfx.stream = load(path)
	sfx.play()
	sfx.finished.connect(sfx.queue_free)

## Stops playing music with a smooth fade-out over 1s.
func stop_music() -> void:
	if not music_player.playing:
		current_track = ""
		return
		
	var fade_out = create_tween()
	fade_out.tween_property(music_player, "volume_db", -80.0, 1.0)
	await fade_out.finished
	
	music_player.stop()
	current_track = ""
	print("[AudioManager] Music stopped.")

## Set music volume using a linear slider value (0.0 to 1.0).
func set_music_volume(value: float) -> void:
	music_volume = linear_to_db(clampf(value, 0.0001, 1.0))
	music_player.volume_db = music_volume
	print("[AudioManager] Music volume set to: %.2f dB" % music_volume)

## Set sound effects volume using a linear slider value (0.0 to 1.0).
func set_sfx_volume(value: float) -> void:
	sfx_volume = linear_to_db(clampf(value, 0.0001, 1.0))
	print("[AudioManager] SFX volume set to: %.2f dB" % sfx_volume)
