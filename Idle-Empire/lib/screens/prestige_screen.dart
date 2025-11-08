import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../core/big_number.dart';
import '../providers/game_provider.dart';
import '../theme/app_theme.dart';

class PrestigeScreen extends StatelessWidget {
  const PrestigeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<GameProvider>(
      builder: (context, game, _) {
        final player = game.playerData;
        final potentialPoints = player.potentialPrestigePoints;

        return SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
          child: Column(
            children: [
              // ─── Prestige Hero Card ───
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
                decoration: BoxDecoration(
                  gradient: AppTheme.cosmicGradient,
                  borderRadius: BorderRadius.circular(32),
                  border: Border.all(color: AppTheme.accentCyan.withValues(alpha: 0.3)),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.accentCyan.withValues(alpha: 0.15),
                      blurRadius: 40,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    const Text('⚡', style: TextStyle(fontSize: 72))
                        .animate(onPlay: (c) => c.repeat())
                        .shimmer(duration: 1500.ms, color: Colors.white, size: 2)
                        .scale(begin: const Offset(0.95, 0.95), end: const Offset(1.05, 1.05), duration: 1500.ms, curve: Curves.easeInOut)
                        .then()
                        .scale(begin: const Offset(1.05, 1.05), end: const Offset(0.95, 0.95), duration: 1500.ms, curve: Curves.easeInOut),
                    const SizedBox(height: 16),
                    Text(
                      'PRESTIGE',
                      style: GoogleFonts.outfit(
                        color: Colors.white,
                        fontSize: 34,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 6,
                        shadows: [
                          Shadow(color: AppTheme.accentCyan.withValues(alpha: 0.5), blurRadius: 20),
                        ],
                      ),
                    ).animate().fadeIn(duration: 500.ms).slideY(begin: 0.2, end: 0),
                    const SizedBox(height: 8),
                    Text(
                      'Rebirth to gain permanent power',
                      style: GoogleFonts.inter(color: Colors.white70, fontSize: 14),
                    ).animate().fadeIn(delay: 200.ms),
                    const SizedBox(height: 32),
                    
                    // Main Multiplier Display
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.3),
                        borderRadius: BorderRadius.circular(30),
                        border: Border.all(color: AppTheme.accentCyan.withValues(alpha: 0.4)),
                        boxShadow: [
                          BoxShadow(color: AppTheme.accentCyan.withValues(alpha: 0.2), blurRadius: 20),
                        ],
                      ),
                      child: Text(
                        'CURRENT BOOST: ${player.prestigeMultiplier.toStringAsFixed(2)}x',
                        style: GoogleFonts.outfit(
                          color: AppTheme.accentCyan,
                          fontWeight: FontWeight.w800,
                          fontSize: 16,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ).animate().fadeIn(delay: 400.ms).scale(begin: const Offset(0.9, 0.9)),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // ─── Stats Row ───
              Row(
                children: [
                  Expanded(
                    child: _PrestigeStatTile(
                      label: 'Points Earned',
                      value: BigNumber.format(player.prestigePoints),
                      icon: Icons.auto_awesome_rounded,
                      color: AppTheme.accentGold,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _PrestigeStatTile(
                      label: 'Rebirths Done',
                      value: '${player.prestigeCount}',
                      icon: Icons.history_rounded,
                      color: AppTheme.accentBlue,
                    ),
                  ),
                ],
              ).animate().fadeIn(delay: 200.ms, duration: 400.ms).slideY(begin: 0.1, end: 0),

              const SizedBox(height: 12),

              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: AppTheme.cardDecoration(),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppTheme.accentGreen.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.show_chart_rounded, color: AppTheme.accentGreen, size: 24),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Lifetime Wealth', style: GoogleFonts.inter(color: AppTheme.textMuted, fontSize: 12)),
                          Text(
                            BigNumber.formatCurrency(player.lifetimeEarnings), 
                            style: GoogleFonts.outfit(color: AppTheme.textPrimary, fontWeight: FontWeight.w700, fontSize: 18),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ).animate().fadeIn(delay: 300.ms, duration: 400.ms).slideY(begin: 0.1, end: 0),

              const SizedBox(height: 24),

              // ─── Potential Points ───
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(28),
                decoration: AppTheme.neonGlowDecoration(
                  glowColor: potentialPoints > 0 ? AppTheme.accentGold : Colors.transparent,
                  glowIntensity: 0.15,
                  borderRadius: 24,
                ),
                child: Column(
                  children: [
                    Text(
                      'POTENTIAL GAIN',
                      style: GoogleFonts.outfit(color: AppTheme.textMuted, fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 1.5),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      '+${BigNumber.format(potentialPoints)}',
                      style: GoogleFonts.outfit(
                        color: potentialPoints > 0 ? AppTheme.accentGold : AppTheme.textMuted,
                        fontSize: 48,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -1,
                      ),
                    ),
                    const SizedBox(height: 12),
                    if (potentialPoints > 0)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: AppTheme.accentGreen.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppTheme.accentGreen.withValues(alpha: 0.3)),
                        ),
                        child: Text(
                          'New Multiplier: ${(1.0 + (player.prestigePoints + potentialPoints) * 0.01).toStringAsFixed(2)}x',
                          style: GoogleFonts.outfit(color: AppTheme.accentGreen, fontSize: 14, fontWeight: FontWeight.w700),
                        ),
                      )
                    else
                      Text(
                        'Unlock at \$10k lifetime earnings',
                        style: GoogleFonts.inter(color: AppTheme.textMuted, fontSize: 13),
                      ),
                    
                    const SizedBox(height: 32),

                    // PRESTIGE BUTTON
                    GestureDetector(
                      onTap: potentialPoints > 0 ? () => _confirmPrestige(context, game, potentialPoints) : null,
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(vertical: 20),
                        decoration: potentialPoints > 0 
                          ? AppTheme.shimmerDecoration(color1: AppTheme.accentGold, color2: AppTheme.accentOrange)
                          : BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.03),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
                            ),
                        child: Center(
                          child: Text(
                            potentialPoints > 0 ? '⚡ REBIRTH NOW' : 'NOT READY',
                            style: GoogleFonts.outfit(
                              color: potentialPoints > 0 ? AppTheme.bgDark : AppTheme.textMuted,
                              fontWeight: FontWeight.w900,
                              fontSize: 18,
                              letterSpacing: 2,
                            ),
                          ),
                        ),
                      ).animate(target: potentialPoints > 0 ? 1 : 0).shimmer(duration: 2000.ms, color: Colors.white70),
                    ),
                  ],
                ),
              ).animate().fadeIn(delay: 400.ms, duration: 400.ms).slideY(begin: 0.1, end: 0),

              const SizedBox(height: 32),

              // ─── How it works List ───
              Align(
                alignment: Alignment.centerLeft,
                child: Text('ℹ️ PRESTIGE GUIDE', style: GoogleFonts.outfit(color: AppTheme.textMuted, fontSize: 14, fontWeight: FontWeight.w800, letterSpacing: 1)),
              ),
              const SizedBox(height: 16),
              _GuideTile(
                icon: Icons.layers_clear_rounded,
                title: 'Reset City',
                desc: 'All businesses and upgrades go back to level 0.',
                color: AppTheme.accentRed,
                delay: 500,
              ),
              _GuideTile(
                icon: Icons.trending_up_rounded,
                title: 'Permanent Power',
                desc: 'Gain 1% income boost per Prestige Point forever.',
                color: AppTheme.accentGreen,
                delay: 550,
              ),
              _GuideTile(
                icon: Icons.pets_rounded,
                title: 'Keep Creatures',
                desc: 'All your evolved creatures and shards are 100% safe.',
                color: AppTheme.accentPurple,
                delay: 600,
              ),
              _GuideTile(
                icon: Icons.speed_rounded,
                title: 'Go Faster',
                desc: 'Each rebirth makes your next run significantly faster.',
                color: AppTheme.accentBlue,
                delay: 650,
              ),
            ],
          ),
        );
      },
    );
  }

  void _confirmPrestige(BuildContext context, GameProvider game, double points) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: AppTheme.bgDark,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
          border: Border.all(color: AppTheme.accentGold.withValues(alpha: 0.3), width: 1),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('⚡', style: TextStyle(fontSize: 56)).animate().scale(curve: Curves.elasticOut),
            const SizedBox(height: 20),
            Text(
              'READY TO REBIRTH?',
              style: GoogleFonts.outfit(color: AppTheme.textPrimary, fontSize: 24, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 12),
            Text(
              'You will gain +${BigNumber.format(points)} points and reset your city. Your creatures will stay!',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(color: AppTheme.textSecondary, fontSize: 14),
            ),
            const SizedBox(height: 32),
            Row(
              children: [
                Expanded(
                  child: TextButton(
                    onPressed: () => Navigator.pop(ctx),
                    child: Text('NOT YET', style: GoogleFonts.outfit(color: AppTheme.textMuted, fontWeight: FontWeight.w700, fontSize: 16)),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: GestureDetector(
                    onTap: () {
                      game.prestige();
                      Navigator.pop(ctx);
                      Navigator.pop(context); // Go back home config, this assumes parent has nav context correctly.
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      decoration: AppTheme.shimmerDecoration(color1: AppTheme.accentGold, color2: AppTheme.accentOrange),
                      child: Center(
                        child: Text('REBIRTH!', style: GoogleFonts.outfit(color: AppTheme.bgDark, fontWeight: FontWeight.w900, fontSize: 16)),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _PrestigeStatTile extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _PrestigeStatTile({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: AppTheme.cardDecoration(
        borderColor: color.withValues(alpha: 0.15),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(height: 12),
          Text(value, style: GoogleFonts.outfit(color: color, fontWeight: FontWeight.w900, fontSize: 24)),
          const SizedBox(height: 4),
          Text(label, style: GoogleFonts.inter(color: AppTheme.textMuted, fontSize: 11)),
        ],
      ),
    );
  }
}

class _GuideTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String desc;
  final Color color;
  final int delay;

  const _GuideTile({
    required this.icon,
    required this.title,
    required this.desc,
    required this.color,
    required this.delay,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: AppTheme.cardDecoration(),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: color.withValues(alpha: 0.2)),
            ),
            child: Icon(icon, color: color, size: 22),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: GoogleFonts.outfit(color: AppTheme.textPrimary, fontSize: 16, fontWeight: FontWeight.w700)),
                Text(desc, style: GoogleFonts.inter(color: AppTheme.textMuted, fontSize: 12)),
              ],
            ),
          ),
        ],
      ),
    ).animate().fadeIn(delay: Duration(milliseconds: delay), duration: 400.ms).slideX(begin: -0.05, end: 0);
  }
}
