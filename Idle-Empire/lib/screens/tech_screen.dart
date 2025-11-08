import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../core/big_number.dart';
import '../providers/game_provider.dart';
import '../theme/app_theme.dart';
import '../core/audio_controller.dart';

// ── Tech Upgrade data model ──
class _TechUpgrade {
  final String id;
  final String title;
  final String description;
  final IconData icon;
  final Color color;
  final List<double> costs; // cost to go from level 0→1, 1→2, 2→3, 3→4 in Tech Points
  final List<String> bonusLabels;

  const _TechUpgrade({
    required this.id,
    required this.title,
    required this.description,
    required this.icon,
    required this.color,
    required this.costs,
    required this.bonusLabels,
  });
}

const _techUpgrades = [
  _TechUpgrade(
    id: 'neural',
    title: 'Neural Augments',
    description: 'Amplify cognitive processing loops to generate more income.',
    icon: Icons.psychology_alt_rounded,
    color: Color(0xFF818CF8),
    costs: [150, 500, 1500, 5000],
    bonusLabels: ['+5% income', '+15% income', '+50% income', '+200% income'],
  ),
  _TechUpgrade(
    id: 'warp',
    title: 'Warp Logistics',
    description: 'Bend space-time supply chains to reduce upgrade costs.',
    icon: Icons.speed_rounded,
    color: Color(0xFF34D399),
    costs: [200, 750, 2000, 7000],
    bonusLabels: ['-5% cost', '-15% cost', '-30% cost', '-50% cost'],
  ),
  _TechUpgrade(
    id: 'genetic',
    title: 'Genetic Boosts',
    description: 'Accelerate creature genome rewriting for faster evolution.',
    icon: Icons.biotech_rounded,
    color: Color(0xFFF472B6),
    costs: [180, 600, 1800, 6000],
    bonusLabels: ['+10% XP', '+30% XP', '+75% XP', '+200% XP'],
  ),
];

class TechScreen extends StatelessWidget {
  const TechScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<GameProvider>(
      builder: (context, game, _) {
        final techPts = game.playerData.techPoints;

        return CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Container(
                margin: const EdgeInsets.all(16),
                padding: const EdgeInsets.all(20),
                decoration: AppTheme.glowDecoration(
                    glowColor: const Color(0xFF818CF8), borderRadius: 20),
                child: Row(
                  children: [
                    const Icon(Icons.settings_suggest_rounded,
                        color: Color(0xFF818CF8), size: 36),
                    const SizedBox(width: 16),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('TECH COMMAND CENTER',
                            style: GoogleFonts.outfit(
                                color: Colors.white,
                                fontWeight: FontWeight.w900,
                                fontSize: 16,
                                letterSpacing: 1)),
                        Text(
                            '${BigNumber.formatCurrency(techPts)} ⚙️ Tech Points available',
                            style: GoogleFonts.inter(
                                color: const Color(0xFF818CF8),
                                fontSize: 13)),
                      ],
                    ),
                  ],
                ),
              )
                  .animate()
                  .fadeIn(duration: 400.ms)
                  .slideY(begin: -0.2, end: 0),
            ),

            SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, i) {
                    final upg = _techUpgrades[i];
                    final currentLevel =
                        game.playerData.techUpgradesPurchased[upg.id] ?? 0;
                    final maxLevel = upg.costs.length;
                    final isMaxed = currentLevel >= maxLevel;
                    final canAfford = !isMaxed &&
                        game.playerData.techPoints >= upg.costs[currentLevel];

                    return _TechCard(
                      upgrade: upg,
                      currentLevel: currentLevel,
                      maxLevel: maxLevel,
                      isMaxed: isMaxed,
                      canAfford: canAfford,
                      nextCost: isMaxed ? 0 : upg.costs[currentLevel],
                      onUpgrade: () {
                        final cost = upg.costs[currentLevel];
                        if (game.playerData.techPoints >= cost) {
                          game.playerData.techPoints -= cost;
                          game.playerData.techUpgradesPurchased[upg.id] =
                              currentLevel + 1;
                          AudioController.playCash();
                          game.notifyListeners();
                        }
                      },
                    ).animate().fadeIn(
                        delay: Duration(milliseconds: 100 * i),
                        duration: 350.ms);
                  },
                  childCount: _techUpgrades.length,
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}

class _TechCard extends StatelessWidget {
  final _TechUpgrade upgrade;
  final int currentLevel;
  final int maxLevel;
  final bool isMaxed;
  final bool canAfford;
  final double nextCost;
  final VoidCallback onUpgrade;

  const _TechCard({
    required this.upgrade,
    required this.currentLevel,
    required this.maxLevel,
    required this.isMaxed,
    required this.canAfford,
    required this.nextCost,
    required this.onUpgrade,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.04),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
            color: isMaxed
                ? const Color(0xFFFFD700).withValues(alpha: 0.5)
                : upgrade.color.withValues(alpha: 0.25)),
        boxShadow: [
          if (isMaxed)
            BoxShadow(
                color: const Color(0xFFFFD700).withValues(alpha: 0.15), blurRadius: 20)
          else if (canAfford)
            BoxShadow(
                color: upgrade.color.withValues(alpha: 0.2), blurRadius: 16),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: upgrade.color.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(upgrade.icon, color: upgrade.color, size: 28),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(upgrade.title,
                        style: GoogleFonts.outfit(
                            color: Colors.white,
                            fontWeight: FontWeight.w800,
                            fontSize: 16)),
                    Text(upgrade.description,
                        style: GoogleFonts.inter(
                            color: Colors.white54, fontSize: 12, height: 1.4)),
                  ],
                ),
              ),
              if (isMaxed)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFD700).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFFFFD700)),
                  ),
                  child: Text('MAXED',
                      style: GoogleFonts.outfit(
                          color: const Color(0xFFFFD700),
                          fontWeight: FontWeight.w800,
                          fontSize: 11)),
                ),
            ],
          ),
          const SizedBox(height: 16),

          // Level progress dots
          Row(
            children: List.generate(maxLevel, (i) {
              final filled = i < currentLevel;
              return Container(
                width: 28,
                height: 6,
                margin: const EdgeInsets.only(right: 6),
                decoration: BoxDecoration(
                  color: filled
                      ? upgrade.color
                      : upgrade.color.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(3),
                ),
              );
            }),
          ),
          const SizedBox(height: 6),

          // Current bonuses list
          if (currentLevel > 0) ...[
            ...List.generate(currentLevel, (i) => Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Row(
                children: [
                  Icon(Icons.check_circle_rounded,
                      color: upgrade.color, size: 14),
                  const SizedBox(width: 6),
                  Text('Tier ${i + 1}: ${upgrade.bonusLabels[i]}',
                      style: GoogleFonts.inter(
                          color: upgrade.color,
                          fontSize: 12,
                          fontWeight: FontWeight.w600)),
                ],
              ),
            )),
            const SizedBox(height: 8),
          ],

          if (!isMaxed)
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: canAfford ? onUpgrade : null,
                icon: const Icon(Icons.upload_rounded, size: 16),
                label: Text(
                    'Tier ${currentLevel + 1}: ${upgrade.bonusLabels[currentLevel]}  •  ⚙️ ${BigNumber.formatCurrency(nextCost)}',
                    style: GoogleFonts.outfit(
                        fontWeight: FontWeight.w700, fontSize: 13)),
                style: ElevatedButton.styleFrom(
                  backgroundColor:
                      canAfford ? upgrade.color : Colors.white10,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
