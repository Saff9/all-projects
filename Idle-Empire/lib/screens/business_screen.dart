import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../core/big_number.dart';
import '../providers/game_provider.dart';
import '../models/business.dart';
import '../theme/app_theme.dart';
import '../core/audio_controller.dart';

class BusinessScreen extends StatelessWidget {
  const BusinessScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<GameProvider>(
      builder: (context, game, _) {
        final totalIncome = game.totalIncomePerSecond;
        final ownedCount = game.businesses.where((b) => b.level > 0).length;

        return CustomScrollView(
          slivers: [
            // ─── Sticky City Income Header ───
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                  decoration: AppTheme.glowDecoration(
                    glowColor: AppTheme.accentBlue,
                    borderRadius: 18,
                    glowIntensity: 0.15,
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          gradient: AppTheme.blueGradient,
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: const Icon(Icons.location_city_rounded, color: Colors.white, size: 22),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'City Income',
                              style: GoogleFonts.inter(color: AppTheme.textMuted, fontSize: 11),
                            ),
                            Text(
                              '${BigNumber.formatCurrency(totalIncome)}/sec',
                              style: GoogleFonts.outfit(
                                color: AppTheme.accentGreen,
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppTheme.accentBlue.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppTheme.accentBlue.withValues(alpha: 0.3)),
                        ),
                        child: Text(
                          '$ownedCount/${game.businesses.length} Slots',
                          style: GoogleFonts.outfit(
                            color: AppTheme.accentBlue,
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                  ),
                ).animate().fadeIn(duration: 400.ms).slideY(begin: -0.1, end: 0),
              ),
            ),

            // ─── Gem Shop / Time Warp ───
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 12),
                child: _GemShopHeader(game: game, player: game.playerData),
              ),
            ),

            // ─── Business Cards ───
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final biz = game.businesses[index];
                    return _BusinessCard(biz: biz, index: index)
                        .animate(delay: Duration(milliseconds: 40 * index))
                        .fadeIn(duration: 350.ms)
                        .slideX(begin: 0.05, end: 0);
                  },
                  childCount: game.businesses.length,
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}

class _BusinessCard extends StatefulWidget {
  final Business biz;
  final int index;
  const _BusinessCard({required this.biz, required this.index});

  @override
  State<_BusinessCard> createState() => _BusinessCardState();
}

class _BusinessCardState extends State<_BusinessCard>
    with TickerProviderStateMixin {
  late AnimationController _tapController;
  late Animation<double> _tapScale;
  late AnimationController _glowController;
  late Animation<double> _glowAnim;
  bool _showUpgrades = false;

  @override
  void initState() {
    super.initState();
    _tapController = AnimationController(
      duration: const Duration(milliseconds: 100),
      vsync: this,
    );
    _tapScale = Tween<double>(begin: 1.0, end: 0.96).animate(
      CurvedAnimation(parent: _tapController, curve: Curves.easeOutCubic),
    );
    _glowController = AnimationController(
      duration: const Duration(milliseconds: 2200),
      vsync: this,
    )..repeat(reverse: true);
    _glowAnim = Tween<double>(begin: 0.15, end: 0.38).animate(
      CurvedAnimation(parent: _glowController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _tapController.dispose();
    _glowController.dispose();
    super.dispose();
  }

  void _onTap() {
    final game = context.read<GameProvider>();
    game.tapBusiness(widget.biz);
    HapticFeedback.lightImpact();
    _tapController.forward().then((_) => _tapController.reverse());
  }

  @override
  Widget build(BuildContext context) {
    final biz = widget.biz;
    return Consumer<GameProvider>(
      builder: (context, game, _) {
        final canBuy = game.playerData.coins >= biz.currentCost;
        final isUnlocked = biz.isUnlocked;
        final isNew = canBuy && !isUnlocked;

        return AnimatedBuilder(
          animation: Listenable.merge([_tapScale, _glowAnim]),
          builder: (context, child) {
            return Transform.scale(
              scale: _tapScale.value,
              child: child,
            );
          },
          child: GestureDetector(
            onTap: isUnlocked ? _onTap : (canBuy ? () => game.buyBusiness(biz) : null),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 400),
              margin: const EdgeInsets.only(bottom: 14),
              child: AnimatedBuilder(
                animation: _glowAnim,
                builder: (context, child) {
                  return Container(
                    decoration: isUnlocked
                        ? AppTheme.glowDecoration(
                            glowColor: biz.color,
                            glowIntensity: _glowAnim.value,
                          )
                        : AppTheme.cardDecoration(
                            borderColor: canBuy ? biz.color.withValues(alpha: 0.25) : null,
                          ),
                    child: child,
                  );
                },
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      // ─── Header Row ───
                      Row(
                        children: [
                          _BusinessIcon(biz: biz, isUnlocked: isUnlocked),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Flexible(
                                      child: Text(
                                        biz.name,
                                        style: GoogleFonts.outfit(
                                          color: isUnlocked ? AppTheme.textPrimary : AppTheme.textMuted,
                                          fontWeight: FontWeight.w700,
                                          fontSize: 16,
                                        ),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    if (biz.hasManager) ...[
                                      const SizedBox(width: 6),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                                        decoration: BoxDecoration(
                                          gradient: AppTheme.purpleGradient,
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: Text(
                                          '🤖 AUTO',
                                          style: GoogleFonts.outfit(
                                            fontSize: 9,
                                            color: Colors.white,
                                            fontWeight: FontWeight.w800,
                                          ),
                                        ),
                                      ),
                                    ],
                                    if (isNew) ...[
                                      const SizedBox(width: 6),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                                        decoration: BoxDecoration(
                                          gradient: AppTheme.greenGradient,
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: Text(
                                          'NEW',
                                          style: GoogleFonts.outfit(
                                            fontSize: 9,
                                            color: Colors.white,
                                            fontWeight: FontWeight.w800,
                                          ),
                                        ),
                                      )
                                          .animate(onPlay: (c) => c.repeat())
                                          .shimmer(duration: 1200.ms, color: Colors.white54),
                                    ],
                                  ],
                                ),
                                const SizedBox(height: 3),
                                if (isUnlocked)
                                  Text(
                                    'Lvl ${biz.level}  •  ${BigNumber.formatCurrency(biz.currentIncome)}/cycle',
                                    style: GoogleFonts.inter(color: AppTheme.textSecondary, fontSize: 12),
                                  )
                                else
                                  Text(
                                    canBuy ? '🔓 Tap to unlock!' : '🔒 ${BigNumber.formatCurrency(biz.currentCost)} to unlock',
                                    style: GoogleFonts.inter(
                                      color: canBuy ? biz.color : AppTheme.textMuted,
                                      fontSize: 12,
                                      fontWeight: canBuy ? FontWeight.w600 : FontWeight.normal,
                                    ),
                                  ),
                              ],
                            ),
                          ),
                          if (isUnlocked && biz.hasManager)
                            _IncomeBadge(income: biz.incomePerSecond * game.playerData.totalMultiplier),
                        ],
                      ),

                      // ─── Progress Bar ───
                      if (isUnlocked) ...[
                        const SizedBox(height: 14),
                        Stack(
                          children: [
                            Container(
                              height: 10,
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.04),
                                borderRadius: BorderRadius.circular(5),
                              ),
                            ),
                            AnimatedContainer(
                              duration: const Duration(milliseconds: 80),
                              height: 10,
                              width: (MediaQuery.of(context).size.width - 64) * biz.progress,
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: [biz.color, biz.color.withValues(alpha: 0.6)],
                                ),
                                borderRadius: BorderRadius.circular(5),
                                boxShadow: [
                                  BoxShadow(color: biz.color.withValues(alpha: 0.6), blurRadius: 8),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],

                      const SizedBox(height: 14),

                      // ─── Action Row ───
                      Row(
                        children: [
                          Expanded(
                            flex: 2,
                            child: _GradientButton(
                              label: isUnlocked ? 'BUY x1' : 'UNLOCK',
                              sublabel: BigNumber.formatCurrency(biz.currentCost),
                              gradient: canBuy
                                  ? LinearGradient(colors: [biz.color, biz.color.withValues(alpha: 0.7)])
                                  : null,
                              enabled: canBuy,
                              onPressed: () => game.buyBusiness(biz),
                            ),
                          ),
                          if (isUnlocked) ...[
                            const SizedBox(width: 8),
                            Expanded(
                              child: _GradientButton(
                                label: 'MAX',
                                sublabel: '🔥',
                                gradient: canBuy ? AppTheme.goldGradient : null,
                                enabled: canBuy,
                                onPressed: () => game.buyBusinessMax(biz),
                              ),
                            ),
                          ],
                          if (isUnlocked && !biz.hasManager) ...[
                            const SizedBox(width: 8),
                            Expanded(
                              flex: 2,
                              child: _GradientButton(
                                label: '🤖 MANAGER',
                                sublabel: BigNumber.formatCurrency(biz.managerCost),
                                gradient: game.playerData.coins >= biz.managerCost
                                    ? AppTheme.purpleGradient
                                    : null,
                                enabled: game.playerData.coins >= biz.managerCost,
                                onPressed: () => game.hireManager(biz),
                              ),
                            ),
                          ],
                        ],
                      ),

                      // ─── Upgrades toggle ───
                      if (isUnlocked && biz.upgrades.any((u) => !u.purchased)) ...[
                        const SizedBox(height: 8),
                        GestureDetector(
                          onTap: () => setState(() => _showUpgrades = !_showUpgrades),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 7),
                            decoration: BoxDecoration(
                              color: AppTheme.accentBlue.withValues(alpha: 0.05),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  _showUpgrades ? Icons.expand_less_rounded : Icons.expand_more_rounded,
                                  color: AppTheme.accentBlue,
                                  size: 18,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  '${biz.upgrades.where((u) => !u.purchased).length} upgrades available',
                                  style: GoogleFonts.outfit(
                                    color: AppTheme.accentBlue,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        if (_showUpgrades)
                          ...biz.upgrades.where((u) => !u.purchased).map(
                                (upgrade) => Padding(
                                  padding: const EdgeInsets.only(top: 6),
                                  child: _UpgradeRow(biz: biz, upgrade: upgrade, game: game),
                                ),
                              ),
                      ],
                    ],
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

class _BusinessIcon extends StatelessWidget {
  final Business biz;
  final bool isUnlocked;
  const _BusinessIcon({required this.biz, required this.isUnlocked});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 58,
      height: 58,
      decoration: BoxDecoration(
        gradient: isUnlocked
            ? LinearGradient(
                colors: [biz.color.withValues(alpha: 0.35), biz.color.withValues(alpha: 0.07)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              )
            : null,
        color: isUnlocked ? null : Colors.white.withValues(alpha: 0.03),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: isUnlocked ? biz.color.withValues(alpha: 0.55) : Colors.white.withValues(alpha: 0.06),
          width: 1.5,
        ),
        boxShadow: isUnlocked
            ? [BoxShadow(color: biz.color.withValues(alpha: 0.28), blurRadius: 16)]
            : null,
      ),
      child: Icon(
        biz.icon,
        color: isUnlocked ? biz.color : AppTheme.textMuted,
        size: 28,
      ),
    );
  }
}

class _IncomeBadge extends StatelessWidget {
  final double income;
  const _IncomeBadge({required this.income});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppTheme.accentGreen.withValues(alpha: 0.2), AppTheme.accentGreen.withValues(alpha: 0.05)],
        ),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.accentGreen.withValues(alpha: 0.3)),
      ),
      child: Column(
        children: [
          Text(
            BigNumber.formatCurrency(income),
            style: GoogleFonts.outfit(
              color: AppTheme.accentGreen,
              fontWeight: FontWeight.w800,
              fontSize: 13,
            ),
          ),
          Text('/sec', style: GoogleFonts.inter(color: AppTheme.accentGreen, fontSize: 9)),
        ],
      ),
    );
  }
}

class _GradientButton extends StatelessWidget {
  final String label;
  final String sublabel;
  final Gradient? gradient;
  final bool enabled;
  final VoidCallback onPressed;

  const _GradientButton({
    required this.label,
    required this.sublabel,
    this.gradient,
    required this.enabled,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: enabled
          ? () {
              HapticFeedback.lightImpact();
              onPressed();
            }
          : null,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 11),
        decoration: BoxDecoration(
          gradient: enabled ? gradient : null,
          color: enabled ? null : Colors.white.withValues(alpha: 0.03),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: enabled ? Colors.white.withValues(alpha: 0.15) : Colors.white.withValues(alpha: 0.04),
          ),
          boxShadow: enabled && gradient != null
              ? [BoxShadow(color: Colors.white.withValues(alpha: 0.05), blurRadius: 8)]
              : null,
        ),
        child: Column(
          children: [
            Text(
              label,
              style: GoogleFonts.outfit(
                color: enabled ? Colors.white : AppTheme.textMuted,
                fontWeight: FontWeight.w800,
                fontSize: 12,
              ),
            ),
            Text(
              sublabel,
              style: GoogleFonts.inter(
                color: enabled ? Colors.white.withValues(alpha: 0.8) : AppTheme.textMuted,
                fontSize: 10,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _UpgradeRow extends StatelessWidget {
  final Business biz;
  final BusinessUpgrade upgrade;
  final GameProvider game;

  const _UpgradeRow({
    required this.biz,
    required this.upgrade,
    required this.game,
  });

  @override
  Widget build(BuildContext context) {
    final canBuy = game.playerData.coins >= upgrade.cost;
    return GestureDetector(
      onTap: canBuy
          ? () {
              AudioController.playCash();
              game.buyUpgrade(biz, upgrade);
            }
          : null,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          gradient: canBuy
              ? LinearGradient(colors: [AppTheme.accentBlue.withValues(alpha: 0.14), Colors.transparent])
              : null,
          color: canBuy ? null : Colors.white.withValues(alpha: 0.02),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: canBuy ? AppTheme.accentBlue.withValues(alpha: 0.3) : Colors.white.withValues(alpha: 0.04),
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(
                gradient: canBuy ? AppTheme.blueGradient : null,
                color: canBuy ? null : Colors.white.withValues(alpha: 0.05),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(Icons.bolt_rounded, size: 18, color: canBuy ? Colors.white : AppTheme.textMuted),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    upgrade.name,
                    style: GoogleFonts.outfit(
                      color: canBuy ? AppTheme.textPrimary : AppTheme.textMuted,
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  Text(
                    upgrade.description,
                    style: GoogleFonts.inter(color: AppTheme.textMuted, fontSize: 11),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: canBuy ? AppTheme.accentBlue.withValues(alpha: 0.15) : Colors.transparent,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: canBuy ? AppTheme.accentBlue.withValues(alpha: 0.3) : Colors.transparent,
                ),
              ),
              child: Text(
                BigNumber.formatCurrency(upgrade.cost),
                style: GoogleFonts.outfit(
                  color: canBuy ? AppTheme.accentBlue : AppTheme.textMuted,
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
// GEM SHOP HEADER
// ─────────────────────────────────────────────

class _GemShopHeader extends StatelessWidget {
  final GameProvider game;
  final dynamic player;

  const _GemShopHeader({required this.game, required this.player});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: AppTheme.cardDecoration(borderColor: AppTheme.accentPurple.withValues(alpha: 0.2)),
      child: Row(
        children: [
          // Gems Balance
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '💎 AEON GEMS',
                  style: GoogleFonts.outfit(color: AppTheme.accentPurple, fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 1),
                ),
                const SizedBox(height: 4),
                Text(
                  BigNumber.formatCurrency(player.gems.toDouble()).replaceAll('\$', ''),
                  style: GoogleFonts.outfit(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900),
                ),
              ],
            ),
          ),
          
          // Time Warp Button
          GestureDetector(
            onTap: () {
              if (player.gems >= 100) {
                player.gems -= 100;
                // Add 4 hours of earnings (4 * 60 * 60 = 14400 seconds)
                final warpEarnings = game.totalIncomePerSecond * 14400;
                player.coins += warpEarnings;
                player.lifetimeEarnings += warpEarnings;
                game.notifyListeners();
                
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('⏳ Time Warped 4 Hours! Earned ${BigNumber.formatCurrency(warpEarnings)}', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
                    backgroundColor: AppTheme.accentPurple,
                  ),
                );
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Not enough Gems! Complete quests to earn more.', style: GoogleFonts.inter()),
                    backgroundColor: AppTheme.accentRed,
                  ),
                );
              }
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                gradient: AppTheme.purpleGradient,
                borderRadius: BorderRadius.circular(14),
                boxShadow: [
                  BoxShadow(color: AppTheme.accentPurple.withValues(alpha: 0.3), blurRadius: 8, offset: const Offset(0, 2)),
                ],
              ),
              child: Row(
                children: [
                  const Icon(Icons.fast_forward_rounded, color: Colors.white, size: 18),
                  const SizedBox(width: 6),
                  Text(
                    'WARP\n100 💎',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 11, height: 1.1),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(delay: 100.ms, duration: 400.ms).slideY(begin: 0.1, end: 0);
  }
}
