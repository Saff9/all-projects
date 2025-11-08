import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../providers/game_provider.dart';
import '../theme/app_theme.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<GameProvider>(
      builder: (context, game, _) {
        final player = game.playerData;
        final prestigeCount = player.prestigeCount;
        
        String rankLabel;
        if (prestigeCount == 0) rankLabel = 'Rookie';
        else if (prestigeCount < 3) rankLabel = 'Tycoon';
        else if (prestigeCount < 7) rankLabel = 'Mogul';
        else rankLabel = 'Emperor';

        return SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
          child: Column(
            children: [
              // ─── Player Profile Hero ───
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(28),
                decoration: AppTheme.neonGlowDecoration(
                  glowColor: AppTheme.accentBlue,
                  glowIntensity: 0.15,
                  borderRadius: 24,
                ),
                child: Column(
                  children: [
                    Stack(
                      alignment: Alignment.center,
                      children: [
                        Container(
                          width: 88,
                          height: 88,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: AppTheme.tealGradient,
                            boxShadow: [
                              BoxShadow(color: AppTheme.accentTeal.withValues(alpha: 0.4), blurRadius: 20, spreadRadius: 2),
                            ],
                          ),
                        ),
                        Container(
                          width: 80,
                          height: 80,
                          decoration: const BoxDecoration(
                            shape: BoxShape.circle,
                            color: AppTheme.bgDark,
                          ),
                          child: const Center(child: Text('🏙️', style: TextStyle(fontSize: 44))),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'CITY $rankLabel'.toUpperCase(),
                      style: GoogleFonts.outfit(
                        color: AppTheme.accentTeal,
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 2,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Player Profile',
                      style: GoogleFonts.outfit(
                        color: AppTheme.textPrimary,
                        fontSize: 24,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ],
                ),
              ).animate().fadeIn(duration: 400.ms).slideY(begin: -0.1, end: 0),

              const SizedBox(height: 24),

              // ─── Quick Account Actions ───
              Row(
                children: [
                  Expanded(
                    child: _ActionPill(
                      icon: Icons.calendar_today_rounded,
                      label: 'Daily Check-In',
                      color: game.playerData.canClaimDaily ? AppTheme.accentGold : AppTheme.textMuted,
                      onTap: () {
                        if (!game.playerData.canClaimDaily) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Come back tomorrow!', style: GoogleFonts.inter())),
                          );
                        }
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _ActionPill(
                      icon: Icons.share_rounded,
                      label: 'Share Score',
                      color: AppTheme.accentPurple,
                      onTap: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Sharing coming soon! 🚀', style: GoogleFonts.inter())),
                        );
                      },
                    ),
                  ),
                ],
              ).animate().fadeIn(delay: 100.ms, duration: 400.ms),

              const SizedBox(height: 24),

              // ─── Detailed Statistics ───
              _SettingsSection(
                title: '📊 DATA INSIGHTS',
                delay: 200,
                children: [
                  _StatItem(label: 'Rebirths', value: '${player.prestigeCount}', color: AppTheme.accentGold),
                  _StatItem(label: 'Tech Points', value: '${player.techPoints.toStringAsFixed(0)}', color: AppTheme.accentGreen),
                  _StatItem(label: 'Evolution Shards', value: '${player.evolutionShards.toStringAsFixed(0)}', color: AppTheme.accentPurple),
                  _StatItem(label: 'Login Streak', value: '${player.loginStreak} Days', color: AppTheme.accentOrange),
                  _StatItem(label: 'Global Multiplier', value: '${player.totalMultiplier.toStringAsFixed(2)}x', color: AppTheme.accentPurple),
                  _StatItem(label: 'City Slots Used', value: '${game.businesses.where((b) => b.isUnlocked).length}/${game.businesses.length}', color: AppTheme.accentBlue),
                  _StatItem(label: 'Creature Codex', value: '${game.discoveredCreatureCount}/${game.creatures.length}', color: AppTheme.accentGreen, isLast: true),
                ],
              ),

              const SizedBox(height: 24),

              // ─── Tech Tree ───
              _SettingsSection(
                title: '⚙️ RESEARCH & DEVELOPMENT',
                delay: 250,
                children: [
                  _CommandTile(
                    icon: Icons.speed_rounded,
                    title: 'Quantum Networking',
                    subtitle: 'Decrease business cycle times by 10%\nCost: 5 Tech Points',
                    color: AppTheme.accentBlue,
                    onTap: () {
                      if (game.playerData.techPoints >= 5) {
                        game.playerData.techPoints -= 5;
                        game.notifyListeners(); // Normally handled by a structured Tech model
                      }
                    },
                  ),
                  _CommandTile(
                    icon: Icons.person_add_rounded,
                    title: 'Automated Hiring',
                    subtitle: 'Reduce manager hiring costs by 50%\nCost: 10 Tech Points',
                    color: AppTheme.accentGreen,
                    isLast: true,
                    onTap: () {
                      if (game.playerData.techPoints >= 10) {
                        game.playerData.techPoints -= 10;
                        game.notifyListeners();
                      }
                    },
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // ─── Data Controls ───
              _SettingsSection(
                title: '💻 SYSTEM COMMANDS',
                delay: 300,
                children: [
                  _CommandTile(
                    icon: Icons.cloud_upload_rounded,
                    title: 'Force Cloud Sync',
                    subtitle: 'Save your empire to local storage now',
                    color: AppTheme.accentBlue,
                    onTap: () {
                      game.saveGame();
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Empire synced successfully! ☁️', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
                          backgroundColor: AppTheme.accentBlue,
                          behavior: SnackBarBehavior.floating,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      );
                    },
                  ),
                  _CommandTile(
                    icon: Icons.auto_mode_rounded,
                    title: 'Wipe Core Data',
                    subtitle: 'Permanently reset all progress and cards',
                    color: AppTheme.accentRed,
                    isLast: true,
                    onTap: () => _confirmReset(context, game),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // ─── About Section ───
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: AppTheme.cardDecoration(),
                child: Column(
                  children: [
                    Text(
                      'IDLE EMPIRE v1.2.0\nPremium Edition',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.outfit(color: AppTheme.textPrimary, fontSize: 16, fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Built with Flutter 🐉',
                      style: GoogleFonts.inter(color: AppTheme.textMuted, fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '© 2026',
                      style: GoogleFonts.inter(color: AppTheme.textMuted, fontSize: 11),
                    ),
                  ],
                ),
              ).animate().fadeIn(delay: 400.ms, duration: 400.ms),
            ],
          ),
        );
      },
    );
  }

  void _confirmReset(BuildContext context, GameProvider game) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: AppTheme.bgDark,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
          border: Border.all(color: AppTheme.accentRed.withValues(alpha: 0.3), width: 1),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('⚠️', style: TextStyle(fontSize: 56)).animate().scale(curve: Curves.elasticOut),
            const SizedBox(height: 16),
            Text(
              'DELETE EVERYTHING?',
              style: GoogleFonts.outfit(color: AppTheme.accentRed, fontSize: 24, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 12),
            Text(
              'This action is IRREVERSIBLE. You will lose all businesses, creatures, and prestige progress.',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(color: AppTheme.textSecondary, fontSize: 14),
            ),
            const SizedBox(height: 32),
            Row(
              children: [
                Expanded(
                  child: TextButton(
                    onPressed: () => Navigator.pop(ctx),
                    child: Text('CANCEL', style: GoogleFonts.outfit(color: AppTheme.textMuted, fontWeight: FontWeight.w700, fontSize: 16)),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: GestureDetector(
                    onTap: () {
                      game.resetGame();
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('All data wiped. New empire initialized.', style: GoogleFonts.inter())),
                      );
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      decoration: AppTheme.cardDecoration(gradient: const LinearGradient(colors: [AppTheme.accentRed, Color(0xFFC62828)])),
                      child: Center(
                        child: Text('WIPE DATA', style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16)),
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

class _ActionPill extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _ActionPill({required this.icon, required this.label, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withValues(alpha: 0.3)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 18),
            const SizedBox(width: 8),
            Text(
              label,
              style: GoogleFonts.outfit(color: color, fontSize: 13, fontWeight: FontWeight.w700),
            ),
          ],
        ),
      ),
    );
  }
}

class _SettingsSection extends StatelessWidget {
  final String title;
  final List<Widget> children;
  final int delay;

  const _SettingsSection({required this.title, required this.children, required this.delay});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 12),
          child: Row(
            children: [
              Container(width: 4, height: 16, decoration: BoxDecoration(color: AppTheme.accentBlue, borderRadius: BorderRadius.circular(2))),
              const SizedBox(width: 8),
              Text(title, style: GoogleFonts.outfit(color: AppTheme.textMuted, fontSize: 13, fontWeight: FontWeight.w800, letterSpacing: 1)),
            ],
          ),
        ),
        Container(
          width: double.infinity,
          decoration: AppTheme.cardDecoration(),
          child: Column(children: children),
        ),
      ],
    ).animate().fadeIn(delay: Duration(milliseconds: delay), duration: 400.ms).slideY(begin: 0.1, end: 0);
  }
}

class _StatItem extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  final bool isLast;

  const _StatItem({required this.label, required this.value, required this.color, this.isLast = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      decoration: BoxDecoration(
        border: isLast ? null : Border(bottom: BorderSide(color: Colors.white.withValues(alpha: 0.03), width: 1)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: GoogleFonts.inter(color: AppTheme.textSecondary, fontSize: 14, fontWeight: FontWeight.w500)),
          Text(value, style: GoogleFonts.outfit(color: color, fontWeight: FontWeight.w800, fontSize: 16)),
        ],
      ),
    );
  }
}

class _CommandTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;
  final VoidCallback onTap;
  final bool isLast;

  const _CommandTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.color,
    required this.onTap,
    this.isLast = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          border: isLast ? null : Border(bottom: BorderSide(color: Colors.white.withValues(alpha: 0.03), width: 1)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: color.withValues(alpha: 0.25)),
              ),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: GoogleFonts.outfit(color: AppTheme.textPrimary, fontSize: 16, fontWeight: FontWeight.w700)),
                  Text(subtitle, style: GoogleFonts.inter(color: AppTheme.textMuted, fontSize: 12)),
                ],
              ),
            ),
            Icon(Icons.chevron_right_rounded, color: Colors.white.withValues(alpha: 0.15), size: 24),
          ],
        ),
      ),
    );
  }
}
