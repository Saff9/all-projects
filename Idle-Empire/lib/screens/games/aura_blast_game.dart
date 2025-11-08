import 'dart:async';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../providers/game_provider.dart';
import '../../theme/app_theme.dart';
import '../../core/ad_manager.dart';
import '../../core/audio_controller.dart';

enum AuraColor { red, blue, green, yellow, empty }

class AuraBlastGame extends StatefulWidget {
  const AuraBlastGame({super.key});

  @override
  State<AuraBlastGame> createState() => _AuraBlastGameState();
}

class _AuraBlastGameState extends State<AuraBlastGame> {
  static const int rows = 12;
  static const int cols = 7;

  late List<List<AuraColor>> grid;
  int _score = 0;
  bool _isPlaying = false;
  bool _isGameOver = false;

  bool _showCombo = false;
  int _latestComboPoints = 0;

  AuraColor _currentColor = AuraColor.empty;
  AuraColor _nextColor = AuraColor.empty;

  final Random _random = Random();
  Timer? _descentTimer;

  @override
  void initState() {
    super.initState();
    _initializeGrid();
  }

  void _initializeGrid() {
    grid = List.generate(rows, (_) => List.filled(cols, AuraColor.empty));
    // Fill top 4 rows
    for (int r = 0; r < 4; r++) {
      for (int c = 0; c < cols; c++) {
        grid[r][c] = _randomColor();
      }
    }
    _currentColor = _randomColor();
    _nextColor = _randomColor();
  }

  AuraColor _randomColor() {
    final values = [AuraColor.red, AuraColor.blue, AuraColor.green, AuraColor.yellow];
    return values[_random.nextInt(values.length)];
  }

  void _startGame() {
    setState(() {
      _initializeGrid();
      _score = 0;
      _isPlaying = true;
      _isGameOver = false;
      _showCombo = false;
    });

    // Bubbles descend every 15 seconds
    _descentTimer = Timer.periodic(const Duration(seconds: 15), (timer) {
      if (!mounted || !_isPlaying) return;
      _descendGrid();
    });
  }

  void _descendGrid() {
    setState(() {
      // Check game over
      for (int c = 0; c < cols; c++) {
        if (grid[rows - 1][c] != AuraColor.empty) {
          _endGame();
          return;
        }
      }
      
      // Shift down
      for (int r = rows - 1; r > 0; r--) {
        for (int c = 0; c < cols; c++) {
          grid[r][c] = grid[r - 1][c];
        }
      }
      // New top row
      for (int c = 0; c < cols; c++) {
        grid[0][c] = _randomColor();
      }
    });
  }

  void _shootBubble(int col) {
    if (!_isPlaying || _currentColor == AuraColor.empty) return;
    AudioController.playClick();

    // Find row to place (raycast up)
    int targetRow = -1;
    for (int r = rows - 1; r >= 0; r--) {
      // If the cell itself is full, we can't be here (we've hit a block placed below it)
      if (grid[r][col] != AuraColor.empty) {
        break; 
      }
      
      targetRow = r;

      // Check boundaries / adjacent cells for a connection
      bool hitNeighbor = false;
      if (col > 0 && grid[r][col - 1] != AuraColor.empty) hitNeighbor = true;
      if (col < cols - 1 && grid[r][col + 1] != AuraColor.empty) hitNeighbor = true;
      if (r > 0 && grid[r - 1][col] != AuraColor.empty) hitNeighbor = true;

      // Also stop if we hit the ceiling
      if (r == 0) hitNeighbor = true;
      
      if (hitNeighbor) {
        break; // Snap bullet to this row!
      }
    }

    if (targetRow == -1) {
      // Column is full! Game over
      AudioController.playError();
      _endGame();
      return;
    }

    setState(() {
      grid[targetRow][col] = _currentColor;
      _score += 1;
      
      // Check matches (BFS from targetRow, col) //
      final Set<String> matched = _findConnected(targetRow, col, _currentColor);
      
      if (matched.length >= 3) {
        AudioController.playPop();
        // Pop them!
        final points = matched.length * 10;
        _score += points;
        _latestComboPoints = points;
        _showCombo = true;

        for (final m in matched) {
          final parts = m.split(',');
          grid[int.parse(parts[0])][int.parse(parts[1])] = AuraColor.empty;
        }

        Future.delayed(const Duration(milliseconds: 1000), () {
          if (mounted && _isPlaying) {
            setState(() {
              _showCombo = false;
            });
          }
        });

        _removeFloating();
      } else {
        _showCombo = false;
      }

      // Next bullet
      _currentColor = _nextColor;
      _nextColor = _randomColor();
    });
  }

  Set<String> _findConnected(int r, int c, AuraColor color) {
    Set<String> visited = {};
    List<List<int>> queue = [[r, c]];
    visited.add('$r,$c');

    while (queue.isNotEmpty) {
      final curr = queue.removeAt(0);
      final cr = curr[0];
      final cc = curr[1];

      // Neighbors
      final dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (final d in dirs) {
        final nr = cr + d[0];
        final nc = cc + d[1];
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          if (grid[nr][nc] == color && !visited.contains('$nr,$nc')) {
            visited.add('$nr,$nc');
            queue.add([nr, nc]);
          }
        }
      }
    }
    return visited;
  }

  void _removeFloating() {
    // Find all connected to top row
    Set<String> anchored = {};
    List<List<int>> queue = [];

    for (int c = 0; c < cols; c++) {
      if (grid[0][c] != AuraColor.empty) {
        anchored.add('0,$c');
        queue.add([0, c]);
      }
    }

    while (queue.isNotEmpty) {
      final curr = queue.removeAt(0);
      final cr = curr[0];
      final cc = curr[1];

      final dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (final d in dirs) {
        final nr = cr + d[0];
        final nc = cc + d[1];
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          if (grid[nr][nc] != AuraColor.empty && !anchored.contains('$nr,$nc')) {
            anchored.add('$nr,$nc');
            queue.add([nr, nc]);
          }
        }
      }
    }

    // Remove all non-anchored
    int dropped = 0;
    for (int r = 0; r < rows; r++) {
      for (int c = 0; c < cols; c++) {
        if (grid[r][c] != AuraColor.empty && !anchored.contains('$r,$c')) {
          grid[r][c] = AuraColor.empty;
          dropped++;
        }
      }
    }

    if (dropped > 0) {
      AudioController.playMatch();
      final dropPoints = dropped * 20;
      _score += dropPoints; // Bonus for drops!
      _latestComboPoints += dropPoints;
      _showCombo = true;
    }
  }

  void _endGame() {
    setState(() {
      _isPlaying = false;
      _isGameOver = true;
    });
    _descentTimer?.cancel();

    // Reward: Evolution Shards
    final game = context.read<GameProvider>();
    final shards = (_score / 20).floor().toDouble().clamp(0.0, double.infinity);
    final actualShards = game.claimAuraBlastReward(shards);

    AdManager.showInterstitialAd(() {
      _showGameOverDialog(actualShards);
    });
  }

  void _showGameOverDialog(double shards) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => Dialog(
        backgroundColor: Colors.transparent,
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: AppTheme.glowDecoration(glowColor: AppTheme.accentGreen, borderRadius: 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('DARK MATTER SECURED', style: GoogleFonts.outfit(color: AppTheme.accentGreen, fontWeight: FontWeight.w900, fontSize: 18, letterSpacing: 1), textAlign: TextAlign.center),
              const SizedBox(height: 16),
              Text('$_score Pts Defended', style: GoogleFonts.outfit(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w800)),
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.05), borderRadius: BorderRadius.circular(16)),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (shards > 0)
                      Column(
                        children: [
                          const Text('🧬', style: TextStyle(fontSize: 24)),
                          const SizedBox(height: 4),
                          Text('+${shards.toInt()} Shards', style: GoogleFonts.outfit(color: AppTheme.accentCyan, fontWeight: FontWeight.w700)),
                        ],
                      )
                    else
                      Text('Insufficient Matter Yield', style: GoogleFonts.inter(color: Colors.white54)),
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
                      style: ElevatedButton.styleFrom(backgroundColor: AppTheme.accentGreen, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                      child: Text('RETRY', style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.w800)),
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

  Color _getColor(AuraColor c) {
    switch (c) {
      case AuraColor.red: return AppTheme.accentRed;
      case AuraColor.blue: return AppTheme.accentBlue;
      case AuraColor.green: return AppTheme.accentGreen;
      case AuraColor.yellow: return AppTheme.accentGold;
      case AuraColor.empty: return Colors.transparent;
    }
  }

  @override
  void dispose() {
    _descentTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgDark,
      appBar: AppBar(
        title: Text('AURA BLAST', style: GoogleFonts.outfit(fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: 2)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: !_isPlaying ? _buildStartScreen() : _buildPlayArea(),
    );
  }

  Widget _buildStartScreen() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.bubble_chart_rounded, color: AppTheme.accentGreen, size: 80)
              .animate(onPlay: (c) => c.repeat(reverse: true))
              .moveY(begin: -10, end: 10, duration: 1.seconds),
          const SizedBox(height: 24),
          Text('AURA BLAST', style: GoogleFonts.outfit(color: Colors.white, fontSize: 36, fontWeight: FontWeight.w900, letterSpacing: 3)),
          const SizedBox(height: 8),
          Text('Shoot elemental auras to clear the grid.\nBeware the descending void!', textAlign: TextAlign.center, style: GoogleFonts.inter(color: Colors.white70, fontSize: 16, height: 1.5)),
          const SizedBox(height: 48),
          ElevatedButton(
            onPressed: _startGame,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.accentGreen,
              padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
            child: Text('ENGAGE', style: GoogleFonts.outfit(color: AppTheme.bgDark, fontSize: 18, fontWeight: FontWeight.w800)),
          ).animate().shimmer(duration: 2.seconds, delay: 1.seconds),
        ],
      ),
    );
  }

  Widget _buildPlayArea() {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('SCORE: $_score', style: GoogleFonts.outfit(color: AppTheme.accentGreen, fontSize: 24, fontWeight: FontWeight.w900)),
              Text('SURVIVE', style: GoogleFonts.outfit(color: Colors.white54, fontSize: 14, fontWeight: FontWeight.w800, letterSpacing: 2)),
            ],
          ),
        ),
        
        // Grid
        Expanded(
          child: Stack(
            children: [
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: Colors.black26,
                  border: Border.all(color: AppTheme.accentGreen.withValues(alpha: 0.3)),
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                ),
                child: Row(
                  children: List.generate(cols, (c) {
                    return Expanded(
                      child: GestureDetector(
                        behavior: HitTestBehavior.opaque,
                        onTapDown: (_) => _shootBubble(c),
                        child: Stack(
                          children: [
                            // Trajectory laser overlay
                            if (_isPlaying && _currentColor != AuraColor.empty)
                              Positioned.fill(
                                child: Container(
                                  margin: const EdgeInsets.symmetric(horizontal: 12),
                                  color: Colors.white.withValues(alpha: 0.03),
                                ),
                              ),
                            Column(
                              children: List.generate(rows, (r) {
                                final color = grid[r][c];
                                return Expanded(
                                  child: Container(
                                    margin: const EdgeInsets.all(2),
                                    decoration: BoxDecoration(
                                      color: _getColor(color),
                                      shape: BoxShape.circle,
                                      boxShadow: color != AuraColor.empty
                                          ? [BoxShadow(color: _getColor(color).withValues(alpha: 0.5), blurRadius: 8)]
                                          : null,
                                    ),
                                    child: color != AuraColor.empty
                                        ? const Icon(Icons.flare_rounded, color: Colors.white54, size: 16)
                                        : null,
                                  ),
                                );
                              }),
                            ),
                          ],
                        ),
                      ),
                    );
                  }),
                ),
              ),
              if (_showCombo)
                Center(
                  child: Text(
                    '+$_latestComboPoints',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.outfit(color: AppTheme.accentCyan, fontSize: 36, fontWeight: FontWeight.w900, shadows: [const Shadow(color: Colors.black54, blurRadius: 10)])
                  ).animate()
                   .moveY(begin: 0, end: -40, duration: 600.ms, curve: Curves.easeOut)
                   .fadeOut(delay: 500.ms, duration: 400.ms),
                ),
            ],
          ),
        ),

        // Shooter HUD
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: AppTheme.bgCard,
            border: const Border(top: BorderSide(color: Colors.white10)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Column(
                children: [
                  Text('NEXT', style: GoogleFonts.outfit(color: Colors.white54, fontSize: 10, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 4),
                  Container(
                    width: 30, height: 30,
                    decoration: BoxDecoration(
                      color: _getColor(_nextColor),
                      shape: BoxShape.circle,
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 32),
              Column(
                children: [
                  Text('READY', style: GoogleFonts.outfit(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 2)),
                  const SizedBox(height: 8),
                  Container(
                    width: 60, height: 60,
                    decoration: BoxDecoration(
                      color: _getColor(_currentColor),
                      shape: BoxShape.circle,
                      boxShadow: [BoxShadow(color: _getColor(_currentColor).withValues(alpha: 0.8), blurRadius: 20)],
                      border: Border.all(color: Colors.white, width: 3),
                    ),
                    child: const Icon(Icons.keyboard_double_arrow_up_rounded, color: Colors.white, size: 32),
                  ).animate(onPlay: (c) => c.repeat(reverse: true)).moveY(begin: 0, end: -4, duration: 400.ms),
                ],
              ),
              const SizedBox(width: 32),
              const SizedBox(width: 30), // symmetry
            ],
          ),
        ),
      ],
    );
  }
}
