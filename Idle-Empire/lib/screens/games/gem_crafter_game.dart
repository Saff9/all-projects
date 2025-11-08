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

enum GemType { ruby, sapphire, emerald, amethyst, topaz, empty }

class GemCrafterGame extends StatefulWidget {
  const GemCrafterGame({super.key});

  @override
  State<GemCrafterGame> createState() => _GemCrafterGameState();
}

class _GemCrafterGameState extends State<GemCrafterGame> {
  static const int rows = 8;
  static const int cols = 8;
  
  late List<List<GemType>> grid;
  int _score = 0;
  int _moves = 20;
  bool _isPlaying = false;
  bool _isGameOver = false;
  bool _isAnimating = false;

  bool _showCombo = false;
  int _latestComboPoints = 0;
  int _currentComboMultiplier = 1;

  int? selectedRow;
  int? selectedCol;

  final Random _random = Random();

  @override
  void initState() {
    super.initState();
    _initializeGrid();
  }

  void _initializeGrid() {
    grid = List.generate(rows, (_) => List.filled(cols, GemType.empty));
    for (int r = 0; r < rows; r++) {
      for (int c = 0; c < cols; c++) {
        // Simple generation avoiding initial matches
        do {
          grid[r][c] = _randomGem();
        } while (_checkMatchAt(r, c));
      }
    }
  }

  GemType _randomGem() {
    final values = [GemType.ruby, GemType.sapphire, GemType.emerald, GemType.amethyst, GemType.topaz];
    return values[_random.nextInt(values.length)];
  }

  bool _checkMatchAt(int r, int c) {
    if (r >= 2 && grid[r][c] == grid[r - 1][c] && grid[r][c] == grid[r - 2][c]) return true;
    if (c >= 2 && grid[r][c] == grid[r][c - 1] && grid[r][c] == grid[r][c - 2]) return true;
    return false;
  }

  void _startGame() {
    setState(() {
      _initializeGrid();
      _score = 0;
      _moves = 20;
      _isPlaying = true;
      _isGameOver = false;
      _showCombo = false;
      selectedRow = null;
      selectedCol = null;
    });
  }

  Future<void> _handleTap(int r, int c) async {
    if (_isAnimating || !_isPlaying) return;
    AudioController.playClick();

    setState(() {
      if (selectedRow == null || selectedCol == null) {
        selectedRow = r;
        selectedCol = c;
      } else {
        final r1 = selectedRow!;
        final c1 = selectedCol!;
        
        // Check adjacency
        if ((r == r1 && (c == c1 - 1 || c == c1 + 1)) || (c == c1 && (r == r1 - 1 || r == r1 + 1))) {
          _swapAndResolve(r1, c1, r, c);
        } else {
          // Select new instead
          selectedRow = r;
          selectedCol = c;
        }
      }
    });
  }

  Future<void> _swapAndResolve(int r1, int c1, int r2, int c2) async {
    _isAnimating = true;
    selectedRow = null;
    selectedCol = null;

    // Swap visually (state update)
    setState(() {
      final temp = grid[r1][c1];
      grid[r1][c1] = grid[r2][c2];
      grid[r2][c2] = temp;
    });

    await Future.delayed(const Duration(milliseconds: 300)); // wait for swap anim

    final matches = _findMatches();
    if (matches.isEmpty) {
      AudioController.playError();
      // Swap back if no match
      setState(() {
        final temp = grid[r1][c1];
        grid[r1][c1] = grid[r2][c2];
        grid[r2][c2] = temp;
      });
      _isAnimating = false;
      return;
    }

    setState(() {
      _moves--;
    });

    await _processMatches(matches);

    if (mounted) {
      if (_moves <= 0) {
        _endGame();
      } else {
        _isAnimating = false;
      }
    }
  }

  Set<String> _findMatches() {
    final Set<String> matched = {};

    // Horizontal check
    for (int r = 0; r < rows; r++) {
      for (int c = 0; c < cols - 2; c++) {
        final g = grid[r][c];
        if (g == GemType.empty) continue;
        if (grid[r][c + 1] == g && grid[r][c + 2] == g) {
          matched.add('$r,$c');
          matched.add('$r,${c + 1}');
          matched.add('$r,${c + 2}');
          // Look further right
          int k = c + 3;
          while (k < cols && grid[r][k] == g) {
            matched.add('$r,$k');
            k++;
          }
        }
      }
    }

    // Vertical check
    for (int c = 0; c < cols; c++) {
      for (int r = 0; r < rows - 2; r++) {
        final g = grid[r][c];
        if (g == GemType.empty) continue;
        if (grid[r + 1][c] == g && grid[r + 2][c] == g) {
          matched.add('$r,$c');
          matched.add('${r + 1},$c');
          matched.add('${r + 2},$c');
          // Look further down
          int k = r + 3;
          while (k < rows && grid[k][c] == g) {
            matched.add('$k,$c');
            k++;
          }
        }
      }
    }

    return matched;
  }

  Future<void> _processMatches(Set<String> matches, {int comboMultiplier = 1}) async {
    int comboScore = matches.length * 10 * comboMultiplier;
    AudioController.playMatch();
    
    // 1. Clear matched gems
    setState(() {
      _score += comboScore;
      _latestComboPoints = comboScore;
      _currentComboMultiplier = comboMultiplier;
      _showCombo = true;

      for (final m in matches) {
        final parts = m.split(',');
        final r = int.parse(parts[0]);
        final c = int.parse(parts[1]);
        grid[r][c] = GemType.empty;
      }
    });

    await Future.delayed(const Duration(milliseconds: 300)); // Dissolve time

    // 2. Apply gravity
    setState(() {
      for (int c = 0; c < cols; c++) {
        for (int r = rows - 1; r >= 0; r--) {
          if (grid[r][c] == GemType.empty) {
            // Find gem above to drop
            for (int k = r - 1; k >= 0; k--) {
              if (grid[k][c] != GemType.empty) {
                grid[r][c] = grid[k][c];
                grid[k][c] = GemType.empty;
                break; // handled drop for this cell, continue r loop
              }
            }
          }
        }
      }
    });

    await Future.delayed(const Duration(milliseconds: 300)); // Drop time

    // 3. Fill top with new
    setState(() {
      _showCombo = false;
      for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
          if (grid[r][c] == GemType.empty) {
            grid[r][c] = _randomGem();
          }
        }
      }
    });

    await Future.delayed(const Duration(milliseconds: 300)); // Fill time

    // 4. Chain reaction check
    final newMatches = _findMatches();
    if (newMatches.isNotEmpty) {
      await _processMatches(newMatches, comboMultiplier: comboMultiplier + 1); // recursive chain
    } else {
      // Clear visual combo when chain ends so next tap starts fresh
      if (mounted && comboMultiplier > 1) {
        Future.delayed(const Duration(milliseconds: 1000), () {
          if (mounted && _isPlaying) {
            setState(() {
              _showCombo = false;
            });
          }
        });
      }
    }
  }

  void _endGame() {
    _isPlaying = false;
    _isGameOver = true;

    // Reward: Massive Burst Capital
    final game = context.read<GameProvider>();
    final actualRewardCoins = game.claimGemCrafterReward(_score.toDouble());

    AdManager.showInterstitialAd(() {
      _showGameOverDialog(actualRewardCoins);
    });
  }

  void _showGameOverDialog(double coins) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => Dialog(
        backgroundColor: Colors.transparent,
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: AppTheme.glowDecoration(glowColor: AppTheme.accentCyan, borderRadius: 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('SYNTHESIS CLEARED', style: GoogleFonts.outfit(color: AppTheme.accentCyan, fontWeight: FontWeight.w900, fontSize: 18, letterSpacing: 1), textAlign: TextAlign.center),
              const SizedBox(height: 16),
              Text('$_score Aeon Yield', style: GoogleFonts.outfit(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w800)),
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.05), borderRadius: BorderRadius.circular(16)),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Column(
                      children: [
                        const Text('💵', style: TextStyle(fontSize: 24)),
                        const SizedBox(height: 4),
                        Text('+${BigNumber.formatCurrency(coins)}', style: GoogleFonts.outfit(color: AppTheme.accentGold, fontWeight: FontWeight.w700)),
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
                      style: ElevatedButton.styleFrom(backgroundColor: AppTheme.accentCyan, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
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

  Widget _buildGem(GemType type) {
    if (type == GemType.empty) return const SizedBox.shrink();

    Color color;
    IconData icon;
    switch (type) {
      case GemType.ruby: color = Colors.redAccent; icon = Icons.favorite_rounded; break;
      case GemType.sapphire: color = Colors.blueAccent; icon = Icons.water_drop_rounded; break;
      case GemType.emerald: color = Colors.greenAccent; icon = Icons.eco_rounded; break;
      case GemType.amethyst: color = Colors.purpleAccent; icon = Icons.diamond_rounded; break;
      case GemType.topaz: color = Colors.orangeAccent; icon = Icons.star_rounded; break;
      default: return const SizedBox.shrink();
    }

    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.2),
        shape: BoxShape.circle,
        border: Border.all(color: color.withValues(alpha: 0.5)),
        boxShadow: [BoxShadow(color: color.withValues(alpha: 0.3), blurRadius: 10)],
      ),
      child: Center(child: Icon(icon, color: color, size: 24)),
    ).animate().scale(begin: const Offset(0.5, 0.5));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgDark,
      appBar: AppBar(
        title: Text('GEM CRAFTER', style: GoogleFonts.outfit(fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: 2)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: _isPlaying ? _buildPlayArea() : _buildStartScreen(),
    );
  }

  Widget _buildStartScreen() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.diamond_rounded, color: AppTheme.accentCyan, size: 80)
              .animate(onPlay: (c) => c.repeat(reverse: true))
              .moveY(begin: -10, end: 10, duration: 1.seconds),
          const SizedBox(height: 24),
          Text('GEM CRAFTER', style: GoogleFonts.outfit(color: Colors.white, fontSize: 36, fontWeight: FontWeight.w900, letterSpacing: 3)),
          const SizedBox(height: 8),
          Text('Match 3 gems to synthesize\nAeon matter.', textAlign: TextAlign.center, style: GoogleFonts.inter(color: Colors.white70, fontSize: 16, height: 1.5)),
          const SizedBox(height: 48),
          ElevatedButton(
            onPressed: _startGame,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.accentCyan,
              padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
            child: Text('INITIALIZE', style: GoogleFonts.outfit(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800)),
          ).animate().shimmer(duration: 2.seconds, delay: 1.seconds),
        ],
      ),
    );
  }

  Widget _buildPlayArea() {
    return Column(
      children: [
        // HUD
        Padding(
          padding: const EdgeInsets.all(24),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _HudItem(label: 'MOVES', value: '$_moves', color: _moves <= 5 ? AppTheme.accentRed : Colors.white),
              _HudItem(label: 'SCORE', value: '$_score', color: AppTheme.accentCyan),
            ],
          ),
        ),

        // Grid Area
        Expanded(
          child: Center(
            child: AspectRatio(
              aspectRatio: 1,
              child: Stack(
                children: [
                  Container(
                    margin: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.black45,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppTheme.accentCyan.withValues(alpha: 0.3)),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: GridView.builder(
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: cols,
                      childAspectRatio: 1,
                      crossAxisSpacing: 2,
                      mainAxisSpacing: 2,
                    ),
                    itemCount: rows * cols,
                    itemBuilder: (context, index) {
                      final r = index ~/ cols;
                      final c = index % cols;
                      final isSelected = selectedRow == r && selectedCol == c;

                      return GestureDetector(
                        onTap: () => _handleTap(r, c),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          margin: EdgeInsets.all(isSelected ? 2 : 4),
                          decoration: isSelected
                              ? BoxDecoration(
                                  color: Colors.white24,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: Colors.white, width: 2),
                                )
                              : null,
                          child: _buildGem(grid[r][c]),
                        ),
                      );
                    },
                  ),
                ),
              ),
              if (_showCombo)
                Center(
                  child: Text(
                    '${_currentComboMultiplier}x COMBO!\n+$_latestComboPoints',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.outfit(color: AppTheme.accentCyan, fontSize: 36, fontWeight: FontWeight.w900, shadows: [const Shadow(color: Colors.black54, blurRadius: 10)])
                  ).animate()
                   .scale(begin: const Offset(0, 0), curve: Curves.elasticOut, duration: 600.ms)
                   .fadeOut(delay: 500.ms, duration: 400.ms),
                ),
            ],
          ),
        ),
      ),
    ),
  ],
);
  }
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
