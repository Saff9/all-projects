import 'package:flutter/services.dart';
import 'package:audioplayers/audioplayers.dart';

class AudioController {
  static final AudioPlayer _bgmPlayer = AudioPlayer();
  // Use a small pool of players to allow overlapping sounds
  static final List<AudioPlayer> _sfxPool = List.generate(4, (_) => AudioPlayer());
  static int _sfxIndex = 0;

  static bool isMuted = false;

  static bool _isInitialized = false;

  /// Initialize and preload if needed (call lazily on first interaction)
  static Future<void> init() async {
    if (_isInitialized) return;
    try {
      await _bgmPlayer.setReleaseMode(ReleaseMode.loop);
      for (var player in _sfxPool) {
        await player.setReleaseMode(ReleaseMode.stop);
      }
      _isInitialized = true;
    } catch (e) {
      // Ignore web audio context restrictions during initialization
    }
  }

  /// Internal playback method with web safety
  static Future<void> _playSound(String path, double volume) async {
    if (isMuted) return;
    if (!_isInitialized) await init();
    try {
      final player = _sfxPool[_sfxIndex];
      _sfxIndex = (_sfxIndex + 1) % _sfxPool.length;
      await player.play(AssetSource(path), volume: volume);
    } catch (e) {
      // Ignore: prevents browser autoplay policy exceptions from crashing app logic
    }
  }

  static void playClick() {
    if (isMuted) return;
    HapticFeedback.lightImpact();
    _playSound('audio/click.wav', 0.3);
  }

  static void playCash() {
    if (isMuted) return;
    HapticFeedback.heavyImpact();
    _playSound('audio/cash.wav', 0.6);
  }

  static void playLevelUp() {
    if (isMuted) return;
    HapticFeedback.vibrate();
    _playSound('audio/win.wav', 0.6);
  }

  static void playMatch() {
    if (isMuted) return;
    HapticFeedback.lightImpact();
    _playSound('audio/match.wav', 0.4);
  }

  static void playPop() {
    if (isMuted) return;
    HapticFeedback.lightImpact();
    _playSound('audio/pop.wav', 0.4);
  }

  static void playError() {
    if (isMuted) return;
    HapticFeedback.vibrate();
    _playSound('audio/error.wav', 0.5);
  }

  static void startBGM() {
    if (isMuted) return;
    // Keep silent if no bgm.mp3 exists, but ready
  }

  static void stopBGM() {
    _bgmPlayer.stop();
  }

  static void toggleMute() {
    isMuted = !isMuted;
    if (isMuted) {
      stopBGM();
    } else {
      startBGM();
    }
  }
}
