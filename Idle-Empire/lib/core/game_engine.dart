import 'dart:async';
import 'package:flutter/foundation.dart';

/// Central game tick engine that drives all idle mechanics.
class GameEngine {
  Timer? _tickTimer;
  final VoidCallback onTick;
  final Duration tickInterval;
  bool _running = false;

  GameEngine({
    required this.onTick,
    this.tickInterval = const Duration(milliseconds: 100),
  });

  bool get isRunning => _running;

  void start() {
    if (_running) return;
    _running = true;
    _tickTimer = Timer.periodic(tickInterval, (_) => onTick());
  }

  void stop() {
    _running = false;
    _tickTimer?.cancel();
    _tickTimer = null;
  }

  void dispose() {
    stop();
  }
}
