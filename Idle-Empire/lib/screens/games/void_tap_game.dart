import 'dart:async';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../core/big_number.dart';
import '../../providers/game_provider.dart';
import '../../theme/app_theme.dart';
import '../../core/ad_manager.dart';
import '../../core/audio_controller.dart';

class VoidTapGame extends StatefulWidget {
  const VoidTapGame({super.key});

  @override
  State<VoidTapGame> createState() => _VoidTapGameState();
}

class _VoidTapGameState extends State<VoidTapGame> {
  final Random _random = Random();
  int _score = 0;
  int _combo = 0;
  int _timeLeft = 30;
  bool _isPlaying = false;
  bool _isGameOver = false;

  Timer? _gameTimer;
  Timer? _spawnTimer;

  final List<_Anomaly> _anomalies = [];
  final List<_FloatingPoint> _floatingPoints = [];

  void _startGame() {
    setState(() {
      _score = 0;
      _combo = 0;
      _timeLeft = 30;
      _isPlaying = true;
      _isGameOver = false;
      _anomalies.clear();
      _floatingPoints.clear();
    });

    _gameTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      setState(() {
        if (_timeLeft > 0) {
          _timeLeft--;
        } else {
          _endGame();
        }
      });
    });

    _spawnTimer = Timer.periodic(const Duration(milliseconds: 700), (timer) {
      if (!mounted || !_isPlaying) return;
      _spawnAnomaly();
    });
  }

  void _endGame() {
    _isPlaying = false;
    _isGameOver = true;
    _gameTimer?.cancel();
    _spawnTimer?.cancel();
    _anomalies.clear();

    // Reward: Tech Points
    final game = context.read<GameProvider>();
    final techPts = _score * 2.5; // 2.5 Tech Points per anomaly score
    final actualReward = game.claimVoidTapReward(techPts);

    AdManager.showInterstitialAd(() {
      _showGameOverDialog(actualReward);
    });
  }

  void _spawnAnomaly() {
    final id = DateTime.now().millisecondsSinceEpoch.toString();
    final x = _random.nextDouble() * 0.8 + 0.1; // 10% to 90% of width
    final y = _random.nextDouble() * 0.7 + 0.15; // 15% to 85% of height
    
    setState(() {
      _anomalies.add(_Anomaly(id: id, x: x, y: y));
    });

    // Despawn after 1.2s
    Future.delayed(const Duration(milliseconds: 1200), () {
      if (mounted && _isPlaying) {
        setState(() {
          _anomalies.removeWhere((a) => a.id == id);
        });
      }
    });
  }

  void _missTap() {
    if (!_isPlaying) return;
    AudioController.playError();
    setState(() {
      _combo = 0;
    });
  }

  void _tapAnomaly(String id, double x, double y) {
    if (!_isPlaying) return;
    AudioController.playPop();
    setState(() {
      _anomalies.removeWhere((a) => a.id == id);
      _combo++;
      final points = 1 * _combo;
      _score += points;
      _floatingPoints.add(_FloatingPoint(id: id, x: x, y: y, points: points));
    });

    Future.delayed(const Duration(milliseconds: 800), () {
      if (mounted && _isPlaying) {
        setState(() {
          _floatingPoints.removeWhere((f) => f.id == id);
        });
      }
    });
  }

  @override
  void dispose() {
    _gameTimer?.cancel();
    _spawnTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('VOID TAP', style: GoogleFonts.outfit(fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: 2)),
        centerTitle: true,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Stack(
        children: [
          // Background Grid
          Positioned.fill(
            child: GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTapDown: (_) => _missTap(),
              child: Container(
                color: Colors.transparent,
                child: Opacity(
                  opacity: 0.1,
                  child: CustomPaint(painter: _GridPainter()),
                ),
              ),
            ),
          ),
          
          // HUD
          Positioned(
            top: 16, left: 24, right: 24,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _HudItem(label: 'TIME', value: '0:$_timeLeft', color: _timeLeft <= 10 ? AppTheme.accentRed : Colors.white),
                _HudItem(label: 'COMBO', value: 'x$_combo', color: _combo > 5 ? AppTheme.accentPurple : AppTheme.accentCyan),
                _HudItem(label: 'SCORE', value: '$_score', color: AppTheme.accentOrange),
              ],
            ),
          ),

          // Anomalies Layer
          if (_isPlaying)
            ..._anomalies.map((a) => Positioned(
              left: MediaQuery.of(context).size.width * a.x - 30, // center offset
              top: MediaQuery.of(context).size.height * a.y - 30,
              child: GestureDetector(
                onTapDown: (_) => _tapAnomaly(a.id, a.x, a.y),
                child: Container(
                  width: 60, height: 60,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: AppTheme.purpleGradient,
                    boxShadow: [
                      BoxShadow(color: AppTheme.accentPurple.withValues(alpha: 0.6), blurRadius: 20),
                    ],
                  ),
                  child: const Icon(Icons.flare_rounded, color: Colors.white, size: 32),
                )
                .animate()
                .scale(begin: const Offset(0, 0), curve: Curves.elasticOut, duration: 400.ms)
                .then(delay: 400.ms)
                .scale(end: const Offset(0, 0), duration: 200.ms),
              ),
            )),

          // Floating points
          if (_isPlaying)
            ..._floatingPoints.map((f) => Positioned(
              left: MediaQuery.of(context).size.width * f.x - 20,
              top: MediaQuery.of(context).size.height * f.y - 40,
              child: Text('+${f.points}', style: GoogleFonts.outfit(color: AppTheme.accentCyan, fontSize: 32, fontWeight: FontWeight.w900))
                .animate()
                .moveY(begin: 0, end: -80, duration: 800.ms, curve: Curves.easeOutCubic)
                .fadeOut(duration: 800.ms),
            )),

          // Start Screen overlay
          if (!_isPlaying && !_isGameOver)
            Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.touch_app_rounded, color: AppTheme.accentOrange, size: 80)
                      .animate(onPlay: (c) => c.repeat(reverse: true))
                      .moveY(begin: -10, end: 10, duration: 1.seconds),
                  const SizedBox(height: 24),
                  Text('VOID TAP', style: GoogleFonts.outfit(color: Colors.white, fontSize: 36, fontWeight: FontWeight.w900, letterSpacing: 3)),
                  const SizedBox(height: 8),
                  Text('Tap the dimensional anomalies\nbefore they collapse.', textAlign: TextAlign.center, style: GoogleFonts.inter(color: Colors.white70, fontSize: 16, height: 1.5)),
                  const SizedBox(height: 48),
                  ElevatedButton(
                    onPressed: _startGame,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.accentOrange,
                      padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: Text('START CALIBRATION', style: GoogleFonts.outfit(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800)),
                  ).animate().shimmer(duration: 2.seconds, delay: 1.seconds),
                ],
              ),
            ),
        ],
      ),
    );
  }

  void _showGameOverDialog(double techPoints) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => Dialog(
        backgroundColor: Colors.transparent,
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: AppTheme.glowDecoration(glowColor: AppTheme.accentOrange, borderRadius: 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('AETHER HARVEST COMPLETE', style: GoogleFonts.outfit(color: AppTheme.accentOrange, fontWeight: FontWeight.w900, fontSize: 18, letterSpacing: 1), textAlign: TextAlign.center),
              const SizedBox(height: 16),
              Text('$_score Anomalies Cleared', style: GoogleFonts.outfit(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w800)),
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.05), borderRadius: BorderRadius.circular(16)),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Column(
                      children: [
                        const Text('⚙️', style: TextStyle(fontSize: 24)),
                        const SizedBox(height: 4),
                        Text('+${BigNumber.formatCurrency(techPoints)} Tech Pts', style: GoogleFonts.outfit(color: AppTheme.accentCyan, fontWeight: FontWeight.w700)),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              Row(
                children: [
                  Expanded(
                    child: TextButton(
                      onPressed: () {
                        Navigator.pop(ctx);
                        Navigator.pop(context);
                      },
                      child: Text('EXIT', style: GoogleFonts.outfit(color: Colors.white70, fontWeight: FontWeight.w700)),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pop(ctx);
                        _startGame();
                      },
                      style: ElevatedButton.styleFrom(backgroundColor: AppTheme.accentOrange, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                      child: Text('PLAY AGAIN', style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.w800)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Anomaly {
  final String id;
  final double x;
  final double y;
  _Anomaly({required this.id, required this.x, required this.y});
}

class _FloatingPoint {
  final String id;
  final double x;
  final double y;
  final int points;
  _FloatingPoint({required this.id, required this.x, required this.y, required this.points});
}

class _HudItem extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  const _HudItem({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(label, style: GoogleFonts.outfit(color: Colors.white54, fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 1)),
        Text(value, style: GoogleFonts.outfit(color: color, fontSize: 28, fontWeight: FontWeight.w900)),
      ],
    );
  }
}

class _GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = Colors.white..strokeWidth = 1;
    for (double i = 0; i < size.width; i += 40) canvas.drawLine(Offset(i, 0), Offset(i, size.height), paint);
    for (double i = 0; i < size.height; i += 40) canvas.drawLine(Offset(0, i), Offset(size.width, i), paint);
  }
  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
