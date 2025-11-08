import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../core/big_number.dart';
import '../providers/game_provider.dart';
import '../theme/app_theme.dart';
import '../models/creature.dart';
import '../models/business.dart';
import '../models/quest.dart';
import '../widgets/achievement_toast.dart';

/// Premium dashboard home with stats, achievements, and overview.
class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<GameProvider>(
      builder: (context, game, _) {
        final player = game.playerData;
        final ownedBusinesses = game.businesses.where((b) => b.level > 0).length;
        final totalBusinesses = game.businesses.length;
        final discoveredCreaturesCount = game.discoveredCreatureCount;
        final totalCreatures = game.creatures.length;

        return SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ─── Onboarding Hints ───
              ..._buildOnboardingHints(game, player),

              // ─── Hero Earnings Card ───
              _HeroCard(game: game, player: player),

              const SizedBox(height: 16),

              // ─── Quest Tracker ───
              _QuestTrackerCard(game: game),

              const SizedBox(height: 20),

              // ─── Quick Stats Grid ───
              Row(
                children: [
                  Expanded(
                    child: _QuickStatCard(
                      icon: Icons.location_city_rounded,
                      iconColor: AppTheme.accentBlue,
                      label: 'Businesses',
                      value: '$ownedBusinesses/$totalBusinesses',
                      progress: ownedBusinesses / totalBusinesses,
                      progressColor: AppTheme.accentBlue,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _QuickStatCard(
                      icon: Icons.hub_rounded,
                      iconColor: AppTheme.accentPurple,
                      label: 'Creatures',
                      value: '$discoveredCreaturesCount/$totalCreatures',
                      progress: discoveredCreaturesCount / totalCreatures,
                      progressColor: AppTheme.accentPurple,
                    ),
                  ),
                ],
              )
                  .animate()
                  .fadeIn(delay: 100.ms, duration: 400.ms)
                  .slideY(begin: 0.2, end: 0),

              const SizedBox(height: 12),

              Row(
                children: [
                  Expanded(
                    child: _QuickStatCard(
                      icon: Icons.rocket_launch_rounded,
                      iconColor: AppTheme.accentGold,
                      label: 'Prestige',
                      value: '${player.prestigeCount}x',
                      progress: (player.prestigeMultiplier - 1.0).clamp(0, 1),
                      progressColor: AppTheme.accentGold,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _QuickStatCard(
                      icon: Icons.local_fire_department_rounded,
                      iconColor: AppTheme.accentOrange,
                      label: 'Login Streak',
                      value: '${player.loginStreak} days',
                      progress: (player.loginStreak / 7).clamp(0.0, 1.0),
                      progressColor: AppTheme.accentOrange,
                    ),
                  ),
                ],
              )
                  .animate()
                  .fadeIn(delay: 200.ms, duration: 400.ms)
                  .slideY(begin: 0.2, end: 0),

              const SizedBox(height: 24),

              // ─── Achievement Strip ───
              _sectionHeader('🏅 Achievements'),
              const SizedBox(height: 12),
              _AchievementStrip(game: game),

              const SizedBox(height: 20),

              // ─── Empire Analytics ───
              _sectionHeader('📊 Empire Analytics'),
              const SizedBox(height: 12),
              _EmpireAnalyticsCard(game: game)
                  .animate()
                  .fadeIn(delay: 150.ms, duration: 400.ms),

              const SizedBox(height: 24),

              // ─── Quick Actions ───
              _sectionHeader('⚡ Quick Actions'),
              const SizedBox(height: 12),

              _QuickActionCard(
                icon: Icons.play_circle_filled_rounded,
                title: '2x Income Boost',
                subtitle: 'Double your earnings for 2 minutes!',
                gradient: AppTheme.greenGradient,
                buttonLabel: '▶ Activate',
                buttonColor: AppTheme.accentGreen,
                onTap: () {
                  game.activateAdBoost();
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        '🔥 2x Boost Activated for 2 minutes!',
                        style: GoogleFonts.outfit(fontWeight: FontWeight.w700),
                      ),
                      backgroundColor: AppTheme.accentGreen,
                      behavior: SnackBarBehavior.floating,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                  );
                },
              ).animate().fadeIn(delay: 300.ms, duration: 400.ms),

              const SizedBox(height: 12),

              _QuickActionCard(
                icon: Icons.rocket_launch_rounded,
                title: 'Prestige Available!',
                subtitle: player.potentialPrestigePoints > 0
                    ? 'Reset for +${BigNumber.format(player.potentialPrestigePoints)} prestige points'
                    : 'Earn \$10K+ lifetime to unlock prestige',
                gradient: AppTheme.goldGradient,
                buttonLabel: player.potentialPrestigePoints > 0 ? '⚡ Go!' : '🔒 Locked',
                buttonColor: player.potentialPrestigePoints > 0 ? AppTheme.accentGold : AppTheme.textMuted,
                onTap: null,
              ).animate().fadeIn(delay: 400.ms, duration: 400.ms),

              const SizedBox(height: 24),

              // ─── Top Businesses ───
              _sectionHeader('🏆 Top Earners'),
              const SizedBox(height: 12),

              ...game.businesses
                  .where((b) => b.level > 0 && b.hasManager)
                  .toList()
                  .take(3)
                  .map((biz) => _TopEarnerRow(biz: biz, game: game)),

              if (!game.businesses.any((b) => b.level > 0 && b.hasManager))
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: AppTheme.cardDecoration(),
                  child: Column(
                    children: [
                      const Text('🤖', style: TextStyle(fontSize: 32)),
                      const SizedBox(height: 8),
                      Text(
                        'Hire managers to see your top earners here!',
                        style: GoogleFonts.inter(color: AppTheme.textMuted, fontSize: 13),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),

              const SizedBox(height: 24),

              // ─── Creature Highlights ───
              _sectionHeader('🐲 Latest Creatures'),
              const SizedBox(height: 12),

              SizedBox(
                height: 128,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: [
                    ...game.creatures
                        .where((c) => c.discovered)
                        .toList()
                        .reversed
                        .take(6)
                        .map((creature) => Container(
                              width: 104,
                              margin: const EdgeInsets.only(right: 10),
                              decoration: AppTheme.glowDecoration(
                                glowColor: creature.rarity.color,
                                borderRadius: 18,
                                glowIntensity: 0.18,
                              ),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(creature.emoji, style: const TextStyle(fontSize: 34)),
                                  const SizedBox(height: 4),
                                  Text(
                                    creature.name,
                                    style: GoogleFonts.outfit(
                                      color: creature.rarity.color,
                                      fontSize: 11,
                                      fontWeight: FontWeight.w700,
                                    ),
                                    textAlign: TextAlign.center,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 3),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: List.generate(
                                      creature.rarity.stars,
                                      (_) => Icon(Icons.star_rounded, size: 10, color: creature.rarity.color),
                                    ),
                                  ),
                                ],
                              ),
                            )),
                    Container(
                      width: 104,
                      margin: const EdgeInsets.only(right: 10),
                      decoration: AppTheme.cardDecoration(borderRadius: 18),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Text('❓', style: TextStyle(fontSize: 32)),
                          const SizedBox(height: 4),
                          Text('More...', style: GoogleFonts.inter(color: AppTheme.textMuted, fontSize: 12)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  List<Widget> _buildOnboardingHints(GameProvider game, dynamic player) {
    final hints = [
      {'id': 'tap_businesses', 'text': 'Tap businesses to earn coins!', 'condition': () => player.coins < 1000},
      {'id': 'hire_managers', 'text': 'Hire managers to automate income', 'condition': () => !game.businesses.any((b) => b.hasManager)},
      {'id': 'collect_creatures', 'text': 'Collect creatures for bonuses', 'condition': () => game.discoveredCreatureCount < game.creatures.length},
      {'id': 'complete_quests', 'text': 'Complete quests for rewards', 'condition': () => game.currentQuest != null},
    ];

    final activeHints = hints.where((h) => (h['condition'] as bool Function())() && !player.dismissedHints.contains(h['id'])).toList();

    if (activeHints.isEmpty) return [];

    return [
      Column(
        children: activeHints.map((h) => _OnboardingHint(
          text: h['text'] as String,
          hintId: h['id'] as String,
          game: game,
        )).toList(),
      ),
      const SizedBox(height: 16),
    ];
  }

  Widget _sectionHeader(String title) {
    return Row(
      children: [
        Container(
          width: 4,
          height: 18,
          decoration: BoxDecoration(
            gradient: AppTheme.blueGradient,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(width: 10),
        Text(
          title,
          style: GoogleFonts.outfit(
            color: AppTheme.textPrimary,
            fontSize: 18,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }
}

// ─────────────────────────────────────────────
// HERO CARD
// ─────────────────────────────────────────────

class _HeroCard extends StatelessWidget {
  final GameProvider game;
  final dynamic player;
  const _HeroCard({required this.game, required this.player});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: AppTheme.heroGradient,
        borderRadius: BorderRadius.circular(26),
        border: Border.all(color: AppTheme.accentBlue.withValues(alpha: 0.2)),
        boxShadow: [
          BoxShadow(
            color: AppTheme.accentBlue.withValues(alpha: 0.18),
            blurRadius: 36,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Column(
        children: [
          // Floating city silhouette
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: ['🏗️', '🏢', '🏙️', '🏦', '🌆']
                .asMap()
                .entries
                .map((e) => Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 3),
                      child: Text(e.value, style: const TextStyle(fontSize: 18))
                          .animate(onPlay: (c) => c.repeat())
                          .moveY(
                            begin: 0,
                            end: -4,
                            duration: Duration(milliseconds: 1800 + e.key * 200),
                            curve: Curves.easeInOut,
                          )
                          .then()
                          .moveY(
                            begin: -4,
                            end: 0,
                            duration: Duration(milliseconds: 1800 + e.key * 200),
                            curve: Curves.easeInOut,
                          ),
                    ))
                .toList(),
          ),

          const SizedBox(height: 12),

          Text(
            '💰 Total Balance',
            style: GoogleFonts.inter(color: AppTheme.textSecondary, fontSize: 13),
          ),
          const SizedBox(height: 6),

          TweenAnimationBuilder<double>(
            tween: Tween(begin: 0, end: player.coins),
            duration: const Duration(milliseconds: 800),
            builder: (ctx, val, _) => Text(
              BigNumber.formatCurrency(val),
              style: GoogleFonts.outfit(
                color: AppTheme.accentGold,
                fontSize: 40,
                fontWeight: FontWeight.w900,
                letterSpacing: -1,
              ),
            ),
          ),

          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.trending_up_rounded, color: AppTheme.accentGreen, size: 16),
              const SizedBox(width: 4),
              Text(
                '${BigNumber.formatCurrency(game.totalIncomePerSecond)}/sec income',
                style: GoogleFonts.outfit(
                  color: AppTheme.accentGreen,
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          if (player.totalMultiplier > 1.0) ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              decoration: BoxDecoration(
                color: AppTheme.accentPurple.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.accentPurple.withValues(alpha: 0.35)),
              ),
              child: Text(
                '⚡ ${player.totalMultiplier.toStringAsFixed(2)}x Multiplier Active',
                style: GoogleFonts.outfit(
                  color: AppTheme.accentPurple,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ],
        ],
      ),
    )
        .animate()
        .fadeIn(duration: 500.ms)
        .slideY(begin: -0.1, end: 0, curve: Curves.easeOut);
  }
}

// ─────────────────────────────────────────────
// ACHIEVEMENT STRIP
// ─────────────────────────────────────────────

class _AchievementStrip extends StatelessWidget {
  final GameProvider game;
  const _AchievementStrip({required this.game});

  @override
  Widget build(BuildContext context) {
    final ownedCount = game.businesses.where((b) => b.level > 0).length;
    final discovered = game.discoveredCreatureCount;
    final prestiges = game.playerData.prestigeCount;
    final streak = game.playerData.loginStreak;

    final achievements = [
      _AchievementData('🥇', 'First Biz', ownedCount >= 1),
      _AchievementData('🔥', '7-Day\nStreak', streak >= 7),
      _AchievementData('🐲', 'Creature\nUnlocked', discovered >= 1),
      _AchievementData('⚡', 'Prestige\nMaster', prestiges >= 1),
      _AchievementData('💀', 'Warlord\n10 Biz', ownedCount >= 10),
      _AchievementData('🌟', 'Legend\n3 Prestige', prestiges >= 3),
    ];

    return SizedBox(
      height: 84,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: achievements.length,
        itemBuilder: (ctx, i) {
          final a = achievements[i];
          return Container(
            width: 80,
            margin: const EdgeInsets.only(right: 10),
            decoration: a.unlocked
                ? AppTheme.glowDecoration(
                    glowColor: AppTheme.accentGold,
                    borderRadius: 16,
                    glowIntensity: 0.2,
                  )
                : AppTheme.cardDecoration(borderRadius: 16),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  a.emoji,
                  style: TextStyle(
                    fontSize: 24,
                    color: a.unlocked ? null : null,
                  ),
                )
                    .animate(target: a.unlocked ? 1 : 0)
                    .saturate(),
                const SizedBox(height: 4),
                Text(
                  a.label,
                  style: GoogleFonts.inter(
                    color: a.unlocked ? AppTheme.accentGold : AppTheme.textMuted,
                    fontSize: 9,
                    fontWeight: FontWeight.w700,
                    height: 1.2,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ).animate(delay: Duration(milliseconds: 50 * i)).fadeIn(duration: 300.ms).scale(begin: const Offset(0.8, 0.8));
        },
      ),
    );
  }
}

class _AchievementData {
  final String emoji;
  final String label;
  final bool unlocked;
  const _AchievementData(this.emoji, this.label, this.unlocked);
}

// ─────────────────────────────────────────────
// QUICK STAT CARD
// ─────────────────────────────────────────────

class _QuickStatCard extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String label;
  final String value;
  final double progress;
  final Color progressColor;

  const _QuickStatCard({
    required this.icon,
    required this.iconColor,
    required this.label,
    required this.value,
    required this.progress,
    required this.progressColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: AppTheme.cardDecoration(borderColor: iconColor.withValues(alpha: 0.1)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [iconColor.withValues(alpha: 0.2), iconColor.withValues(alpha: 0.05)],
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: iconColor, size: 20),
              ),
              const Spacer(),
              Text(
                value,
                style: GoogleFonts.outfit(
                  color: iconColor,
                  fontWeight: FontWeight.w800,
                  fontSize: 16,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            label,
            style: GoogleFonts.inter(color: AppTheme.textMuted, fontSize: 12),
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progress,
              backgroundColor: Colors.white.withValues(alpha: 0.04),
              color: progressColor,
              minHeight: 5,
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────
// QUICK ACTION CARD
// ─────────────────────────────────────────────

class _QuickActionCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Gradient gradient;
  final String buttonLabel;
  final Color buttonColor;
  final VoidCallback? onTap;

  const _QuickActionCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.gradient,
    required this.buttonLabel,
    required this.buttonColor,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: AppTheme.cardDecoration(borderColor: buttonColor.withValues(alpha: 0.18)),
        child: Row(
          children: [
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                gradient: gradient,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [BoxShadow(color: buttonColor.withValues(alpha: 0.3), blurRadius: 12)],
              ),
              child: Icon(icon, color: Colors.white, size: 26),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.outfit(color: AppTheme.textPrimary, fontSize: 15, fontWeight: FontWeight.w700),
                  ),
                  Text(
                    subtitle,
                    style: GoogleFonts.inter(color: AppTheme.textMuted, fontSize: 11),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: [buttonColor.withValues(alpha: 0.2), buttonColor.withValues(alpha: 0.08)]),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: buttonColor.withValues(alpha: 0.35)),
              ),
              child: Text(
                buttonLabel,
                style: GoogleFonts.outfit(
                  color: buttonColor,
                  fontWeight: FontWeight.w800,
                  fontSize: 12,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────
// TOP EARNER ROW
// ─────────────────────────────────────────────

class _TopEarnerRow extends StatelessWidget {
  final Business biz;
  final GameProvider game;
  const _TopEarnerRow({required this.biz, required this.game});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: AppTheme.cardDecoration(borderColor: biz.color.withValues(alpha: 0.18)),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: [biz.color.withValues(alpha: 0.25), biz.color.withValues(alpha: 0.05)]),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: biz.color.withValues(alpha: 0.3)),
            ),
            child: Icon(biz.icon, color: biz.color, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  biz.name,
                  style: GoogleFonts.outfit(color: AppTheme.textPrimary, fontSize: 14, fontWeight: FontWeight.w700),
                ),
                Text(
                  'Level ${biz.level}',
                  style: GoogleFonts.inter(color: AppTheme.textMuted, fontSize: 11),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: AppTheme.accentGreen.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppTheme.accentGreen.withValues(alpha: 0.25)),
            ),
            child: Text(
              '${BigNumber.formatCurrency(biz.incomePerSecond * game.playerData.totalMultiplier)}/s',
              style: GoogleFonts.outfit(color: AppTheme.accentGreen, fontWeight: FontWeight.w700, fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────
// QUEST TRACKER CARD & STORY DIALOG
// ─────────────────────────────────────────────

class _QuestTrackerCard extends StatelessWidget {
  final GameProvider game;
  const _QuestTrackerCard({required this.game});

  @override
  Widget build(BuildContext context) {
    final quest = game.currentQuest;
    if (quest == null) return const SizedBox.shrink(); // All quests done!

    final bool canClaim = quest.isCompleted && !quest.isClaimed;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: AppTheme.glowDecoration(
        glowColor: canClaim ? AppTheme.accentGreen : AppTheme.accentPurple,
        glowIntensity: canClaim ? 0.3 : 0.1,
        borderRadius: 20,
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: canClaim ? AppTheme.accentGreen.withValues(alpha: 0.2) : AppTheme.accentPurple.withValues(alpha: 0.2),
              border: Border.all(color: canClaim ? AppTheme.accentGreen : AppTheme.accentPurple.withValues(alpha: 0.5)),
            ),
            child: Icon(
              canClaim ? Icons.check_rounded : Icons.radar_rounded,
              color: canClaim ? AppTheme.accentGreen : AppTheme.accentPurple,
              size: 20,
            ),
          )
          .animate(target: canClaim ? 1 : 0)
          .scale(end: const Offset(1.1, 1.1)),
          
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'CURRENT DIRECTIVE',
                  style: GoogleFonts.outfit(
                    color: canClaim ? AppTheme.accentGreen : AppTheme.accentPurple,
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1.5,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  quest.title,
                  style: GoogleFonts.outfit(
                    color: AppTheme.textPrimary,
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                if (!canClaim)
                  Text(
                    'In Progress...',
                    style: GoogleFonts.inter(
                      color: AppTheme.textMuted,
                      fontSize: 12,
                    ),
                  ),
              ],
            ),
          ),
          if (canClaim)
            ElevatedButton(
              onPressed: () {
                _showStoryDialog(context, game, quest);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.accentGreen,
                foregroundColor: AppTheme.bgDark,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: Text(
                'CLAIM',
                style: GoogleFonts.outfit(fontWeight: FontWeight.w800),
              ),
            )
            .animate(onPlay: (c) => c.repeat())
            .shimmer(duration: 1500.ms, color: Colors.white54)
        ],
      ),
    );
  }

  void _showStoryDialog(BuildContext context, GameProvider game, Quest quest) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => _StoryDialogWidget(
        quest: quest,
        onClaim: () {
          game.claimQuest(quest);
          Navigator.of(ctx).pop();
        },
      ),
    );
  }
}

class _StoryDialogWidget extends StatelessWidget {
  final Quest quest;
  final VoidCallback onClaim;

  const _StoryDialogWidget({
    required this.quest,
    required this.onClaim,
  });

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      elevation: 0,
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: AppTheme.neonGlowDecoration(
          glowColor: AppTheme.accentPurple,
          borderRadius: 24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // E.C.H.O Avatar
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: const LinearGradient(
                  colors: [AppTheme.accentPurple, AppTheme.accentBlue],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.accentPurple.withValues(alpha: 0.5),
                    blurRadius: 20,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: const Icon(Icons.memory_rounded, size: 40, color: Colors.white),
            )
            .animate(onPlay: (c) => c.repeat(reverse: true))
            .scale(begin: const Offset(0.95, 0.95), end: const Offset(1.05, 1.05), duration: 1.seconds),
            
            const SizedBox(height: 20),
            
            Text(
              'E.C.H.O. SYSTEM',
              style: GoogleFonts.outfit(
                color: AppTheme.accentPurple,
                fontSize: 12,
                fontWeight: FontWeight.w800,
                letterSpacing: 2,
              ),
            ),
            
            const SizedBox(height: 8),
            
            Text(
              '"${quest.echoMessage}"',
              style: GoogleFonts.inter(
                color: AppTheme.textSecondary,
                fontSize: 14,
                height: 1.5,
                fontStyle: FontStyle.italic,
              ),
              textAlign: TextAlign.center,
            ),
            
            const SizedBox(height: 24),
            
            const Divider(color: Colors.white12),
            
            const SizedBox(height: 16),
            
            Text(
              'REWARDS SECURED',
              style: GoogleFonts.outfit(
                color: AppTheme.textMuted,
                fontSize: 11,
                fontWeight: FontWeight.w800,
              ),
            ),
            
            const SizedBox(height: 12),
            
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (quest.gemsReward > 0)
                  _RewardPill(icon: '💎', label: '+${quest.gemsReward} Gems', color: AppTheme.accentBlue),
                if (quest.shardsReward > 0) ...[
                  const SizedBox(width: 8),
                  _RewardPill(icon: '🧬', label: '+${quest.shardsReward} Shards', color: AppTheme.accentPurple),
                ]
              ],
            ),
            
            const SizedBox(height: 24),
            
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: onClaim,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.accentPurple,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: Text('ACKNOWLEDGE', style: GoogleFonts.outfit(fontWeight: FontWeight.w800, fontSize: 15)),
              ),
            ),
          ],
        ),
      ).animate().scale(duration: 400.ms, curve: Curves.easeOutBack).fadeIn(),
    );
  }
}

class _RewardPill extends StatelessWidget {
  final String icon;
  final String label;
  final Color color;
  
  const _RewardPill({required this.icon, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(icon, style: const TextStyle(fontSize: 14)),
          const SizedBox(width: 6),
          Text(
            label,
            style: GoogleFonts.outfit(
              color: color,
              fontWeight: FontWeight.w700,
              fontSize: 13,
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────
// EMPIRE ANALYTICS CARD
// ─────────────────────────────────────────────
class _EmpireAnalyticsCard extends StatelessWidget {
  final GameProvider game;
  const _EmpireAnalyticsCard({required this.game});

  @override
  Widget build(BuildContext context) {
    final ips = game.totalIncomePerSecond;
    final netWorth = game.playerData.lifetimeEarnings;
    final techPts = game.playerData.techPoints;
    final shards = game.playerData.evolutionShards;
    final neural = game.playerData.techUpgradesPurchased['neural'] ?? 0;

    // Check and fire achievement toasts
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (netWorth > 1000000 &&
          !game.playerData.claimedAchievements.contains('first_billion_goal')) {
        game.playerData.claimedAchievements.add('first_billion_goal');
        AchievementToastController.show(
          title: 'First Million!',
          subtitle: 'Your empire is growing.',
          icon: Icons.monetization_on_rounded,
          color: const Color(0xFFFFD700),
        );
      }
      if (game.playerData.prestigeCount >= 1 &&
          !game.playerData.claimedAchievements.contains('first_prestige')) {
        game.playerData.claimedAchievements.add('first_prestige');
        AchievementToastController.show(
          title: 'Warp Speed!',
          subtitle: 'First Prestige achieved.',
          icon: Icons.rocket_launch_rounded,
          color: const Color(0xFFF59E0B),
        );
      }
      if (game.discoveredCreatureCount >= 5 &&
          !game.playerData.claimedAchievements.contains('beast_tamer')) {
        game.playerData.claimedAchievements.add('beast_tamer');
        AchievementToastController.show(
          title: 'Beast Tamer!',
          subtitle: '5 Creatures discovered.',
          icon: Icons.hub_rounded,
          color: const Color(0xFFA78BFA),
        );
      }
    });

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: AppTheme.glowDecoration(
          glowColor: AppTheme.accentCyan, borderRadius: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('EMPIRE STATUS',
              style: GoogleFonts.outfit(
                  color: AppTheme.accentCyan,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1.5,
                  fontSize: 12)),
          const SizedBox(height: 16),

          // Income per second meter
          _AnalyticRow(
            icon: Icons.bolt_rounded,
            label: 'Income / sec',
            value: '${BigNumber.formatCurrency(ips)}/s',
            color: const Color(0xFF34D399),
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: ips > 0 ? (ips / (ips + 10000)).clamp(0.0, 1.0) : 0,
              backgroundColor: Colors.white10,
              valueColor: const AlwaysStoppedAnimation(Color(0xFF34D399)),
              minHeight: 6,
            ),
          ),
          const SizedBox(height: 14),

          // Net Worth
          _AnalyticRow(
            icon: Icons.account_balance_rounded,
            label: 'Net Worth',
            value: BigNumber.formatCurrency(netWorth),
            color: AppTheme.accentGold,
          ),
          const SizedBox(height: 10),

          // Tech Points
          _AnalyticRow(
            icon: Icons.settings_suggest_rounded,
            label: 'Tech Points',
            value: BigNumber.formatCurrency(techPts),
            color: const Color(0xFF818CF8),
          ),
          const SizedBox(height: 10),

          // Evolution Shards
          _AnalyticRow(
            icon: Icons.biotech_rounded,
            label: 'Evolution Shards',
            value: BigNumber.formatCurrency(shards),
            color: const Color(0xFFF472B6),
          ),
          const SizedBox(height: 10),

          // Neural Augment level
          _AnalyticRow(
            icon: Icons.psychology_alt_rounded,
            label: 'Neural Augments',
            value: 'Tier $neural / 4',
            color: const Color(0xFF818CF8),
          ),
        ],
      ),
    );
  }
}

class _AnalyticRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;
  const _AnalyticRow(
      {required this.icon,
      required this.label,
      required this.value,
      required this.color});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, color: color, size: 18),
        const SizedBox(width: 10),
        Text(label,
            style:
                GoogleFonts.inter(color: Colors.white54, fontSize: 13)),
        const Spacer(),
        Text(value,
            style: GoogleFonts.outfit(
                color: color,
                fontWeight: FontWeight.w700,
                fontSize: 13)),
      ],
    );
  }
}

// ─────────────────────────────────────────────
// ONBOARDING HINT
// ─────────────────────────────────────────────

class _OnboardingHint extends StatelessWidget {
  final String text;
  final String hintId;
  final GameProvider game;

  const _OnboardingHint({
    required this.text,
    required this.hintId,
    required this.game,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(16),
      decoration: AppTheme.cardDecoration().copyWith(
        border: Border.all(color: AppTheme.accentBlue.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(
              text,
              style: GoogleFonts.inter(
                color: AppTheme.textPrimary,
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          IconButton(
            icon: Icon(Icons.close, color: AppTheme.textMuted, size: 20),
            onPressed: () => game.dismissHint(hintId),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
          ),
        ],
      ),
    );
  }
}
