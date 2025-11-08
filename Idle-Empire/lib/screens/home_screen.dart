import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../core/big_number.dart';
import '../providers/game_provider.dart';
import '../screens/dashboard_screen.dart';
import '../screens/business_screen.dart';
import '../screens/creature_screen.dart';
import '../screens/prestige_screen.dart';
import '../screens/expedition_screen.dart';
import '../screens/arcade_screen.dart';
import '../screens/settings_screen.dart';
import '../screens/tech_screen.dart';
import '../screens/aether_market_screen.dart';
import '../theme/app_theme.dart';
import '../widgets/offline_earnings_dialog.dart';
import '../widgets/daily_reward_dialog.dart';
import '../widgets/animated_background.dart';
import '../widgets/achievement_toast.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with TickerProviderStateMixin {
  int _currentTab = 0;
  late AnimationController _coinAnimController;
  late Animation<double> _coinPulse;

  final List<Widget> _screens = const [
    DashboardScreen(),
    BusinessScreen(),
    CreatureScreen(),
    PrestigeScreen(),
    ExpeditionScreen(),
    ArcadeScreen(),
    TechScreen(),
    AetherMarketScreen(),
    SettingsScreen(),
  ];

  @override
  void initState() {
    super.initState();
    _coinAnimController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat(reverse: true);
    _coinPulse = Tween<double>(begin: 1.0, end: 1.04).animate(
      CurvedAnimation(parent: _coinAnimController, curve: Curves.easeInOut),
    );

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _showStartupDialogs();
    });
  }

  void _showStartupDialogs() async {
    final game = context.read<GameProvider>();

    if (game.showOfflinePopup && game.offlineEarnings > 0) {
      await showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => OfflineEarningsDialog(
          earnings: game.offlineEarnings,
          onCollect: () {
            game.dismissOfflinePopup();
            Navigator.pop(ctx);
          },
          onDoubleWithAd: () {
            game.playerData.coins += game.offlineEarnings;
            game.dismissOfflinePopup();
            Navigator.pop(ctx);
          },
        ),
      );
    }

    if (game.playerData.canClaimDaily && mounted) {
      await showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => DailyRewardDialog(
          streak: game.playerData.loginStreak + 1,
          onClaim: () {
            final reward = game.claimDailyReward();
            Navigator.pop(ctx);
            if (reward != null && mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    'Claimed ${BigNumber.formatCurrency(reward)}! 🎉',
                    style: GoogleFonts.outfit(fontWeight: FontWeight.w700),
                  ),
                  backgroundColor: AppTheme.accentGold,
                  behavior: SnackBarBehavior.floating,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
              );
            }
          },
        ),
      );
    }
  }

  @override
  void dispose() {
    _coinAnimController.dispose();
    super.dispose();
  }

  void _onTabTap(int index) {
    if (index == _currentTab) return;
    HapticFeedback.selectionClick();
    setState(() => _currentTab = index);
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<GameProvider>(
      builder: (context, game, _) {
        return AnimatedBackground(
          child: AchievementToastOverlay(
            child: Scaffold(
              backgroundColor: Colors.transparent,
              body: SafeArea(
                bottom: false,
                child: Column(
                  children: [
                    _CurrencyBar(game: game, coinPulse: _coinPulse),
                    Expanded(
                      child: AnimatedSwitcher(
                        duration: const Duration(milliseconds: 350),
                        switchInCurve: Curves.easeInOut,
                        switchOutCurve: Curves.easeInOut,
                        transitionBuilder: (child, animation) => FadeTransition(
                          opacity: animation,
                          child: child,
                        ),
                        child: KeyedSubtree(
                          key: ValueKey(_currentTab),
                          child: _screens[_currentTab],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              bottomNavigationBar: _PremiumNavBar(
                currentIndex: _currentTab,
                onTap: _onTabTap,
              ),
            ),
          ),
        );
      },
    );
  }
}

// ─────────────────────────────────────────────
// CURRENCY BAR
// ─────────────────────────────────────────────

class _CurrencyBar extends StatelessWidget {
  final GameProvider game;
  final Animation<double> coinPulse;

  const _CurrencyBar({required this.game, required this.coinPulse});

  @override
  Widget build(BuildContext context) {
    final prestigeCount = game.playerData.prestigeCount;
    String rankLabel;
    if (prestigeCount == 0) rankLabel = 'Rookie';
    else if (prestigeCount < 3) rankLabel = 'Tycoon';
    else if (prestigeCount < 7) rankLabel = 'Mogul';
    else rankLabel = 'Emperor';

    return Container(
      padding: const EdgeInsets.fromLTRB(14, 10, 14, 14),
      decoration: const BoxDecoration(
        gradient: AppTheme.topBarGradient,
        border: Border(
          bottom: BorderSide(color: Color(0x10FFFFFF), width: 1),
        ),
      ),
      child: Row(
        children: [
          // Coin display
          Expanded(
            flex: 3,
            child: AnimatedBuilder(
              animation: coinPulse,
              builder: (ctx, child) => Transform.scale(
                scale: coinPulse.value,
                child: child,
              ),
              child: _CurrencyPill(
                emoji: '🪙',
                value: BigNumber.formatCurrency(game.playerData.coins),
                color: AppTheme.accentGold,
              ),
            ),
          ),

          const SizedBox(width: 8),

          // Income per second
          Expanded(
            flex: 2,
            child: _CurrencyPill(
              icon: Icons.bolt_rounded,
              value: '${BigNumber.formatCurrency(game.totalIncomePerSecond)}/s',
              color: AppTheme.accentGreen,
            ),
          ),

          const SizedBox(width: 8),

          // Rank badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            decoration: BoxDecoration(
              color: AppTheme.accentPurple.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppTheme.accentPurple.withValues(alpha: 0.25)),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('🌆', style: TextStyle(fontSize: 14)),
                Text(
                  rankLabel,
                  style: GoogleFonts.outfit(
                    color: AppTheme.accentPurple,
                    fontSize: 9,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.5,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _CurrencyPill extends StatelessWidget {
  final String? emoji;
  final IconData? icon;
  final String value;
  final Color color;

  const _CurrencyPill({this.emoji, this.icon, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [color.withValues(alpha: 0.14), color.withValues(alpha: 0.02)],
        ),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withValues(alpha: 0.3)),
        boxShadow: [BoxShadow(color: color.withValues(alpha: 0.08), blurRadius: 10)],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (emoji != null)
            Text(emoji!, style: const TextStyle(fontSize: 18))
          else if (icon != null)
            Icon(icon, color: color, size: 16),
          const SizedBox(width: 6),
          Flexible(
            child: Text(
              value,
              style: GoogleFonts.outfit(
                color: color,
                fontWeight: FontWeight.w800,
                fontSize: 15,
                letterSpacing: -0.3,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────
// PREMIUM NAVIGATION BAR
// ─────────────────────────────────────────────

class _PremiumNavBar extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;

  const _PremiumNavBar({required this.currentIndex, required this.onTap});

  static const _items = [
    _NavItem(label: 'HOME', activeIcon: Icons.home_rounded, inactiveIcon: Icons.home_outlined),
    _NavItem(label: 'CITY', activeIcon: Icons.location_city_rounded, inactiveIcon: Icons.location_city_outlined),
    _NavItem(label: 'CORE', activeIcon: Icons.hub_rounded, inactiveIcon: Icons.hub_outlined),
    _NavItem(label: 'BOOST', activeIcon: Icons.rocket_launch_rounded, inactiveIcon: Icons.rocket_launch_outlined),
    _NavItem(label: 'EXPED', activeIcon: Icons.explore_rounded, inactiveIcon: Icons.explore_outlined),
    _NavItem(label: 'ARCADE', activeIcon: Icons.videogame_asset_rounded, inactiveIcon: Icons.videogame_asset_outlined),
    _NavItem(label: 'TECH', activeIcon: Icons.settings_suggest_rounded, inactiveIcon: Icons.settings_outlined),
    _NavItem(label: 'MARKET', activeIcon: Icons.storefront_rounded, inactiveIcon: Icons.storefront_outlined),
    _NavItem(label: 'DATA', activeIcon: Icons.analytics_rounded, inactiveIcon: Icons.analytics_outlined),
  ];

  static const _activeColors = [
    AppTheme.accentGold,
    AppTheme.accentBlue,
    AppTheme.accentPurple,
    AppTheme.accentOrange,
    AppTheme.accentTeal,
    Color(0xFFFF4081),
    Color(0xFF818CF8),   // Tech – indigo
    Color(0xFF34D399),   // Market – emerald
    AppTheme.accentCyan,
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      height: AppTheme.kNavBarHeight + MediaQuery.of(context).padding.bottom,
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).padding.bottom),
      decoration: BoxDecoration(
        color: AppTheme.bgCard,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(26)),
        border: Border.all(color: Colors.white.withValues(alpha: 0.06), width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.35),
            blurRadius: 30,
            offset: const Offset(0, -8),
          ),
          BoxShadow(
            color: _activeColors[currentIndex].withValues(alpha: 0.06),
            blurRadius: 30,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: Row(
        children: List.generate(_items.length, (i) {
          final isActive = i == currentIndex;
          final color = _activeColors[i];
          final item = _items[i];
          return Expanded(
            child: GestureDetector(
              onTap: () => onTap(i),
              behavior: HitTestBehavior.opaque,
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 250),
                child: isActive
                    ? _ActiveNavItem(key: ValueKey(i), color: color, item: item)
                    : _InactiveNavItem(key: ValueKey('i_$i'), color: AppTheme.textMuted, item: item),
              ),
            ),
          );
        }),
      ),
    );
  }
}

class _NavItem {
  final String label;
  final IconData activeIcon;
  final IconData inactiveIcon;
  const _NavItem({required this.label, required this.activeIcon, required this.inactiveIcon});
}

class _ActiveNavItem extends StatelessWidget {
  final Color color;
  final _NavItem item;
  const _ActiveNavItem({super.key, required this.color, required this.item});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [color.withValues(alpha: 0.25), color.withValues(alpha: 0.1)],
            ),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: color.withValues(alpha: 0.35), width: 1),
            boxShadow: [
              BoxShadow(color: color.withValues(alpha: 0.25), blurRadius: 14, spreadRadius: 0),
            ],
          ),
          child: Icon(item.activeIcon, color: color, size: 22),
        )
            .animate()
            .scale(begin: const Offset(0.8, 0.8), duration: 200.ms, curve: Curves.elasticOut),
        const SizedBox(height: 4),
        Text(
          item.label,
          style: GoogleFonts.outfit(
            color: color,
            fontSize: 9,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.8,
          ),
        ),
        // Active dot
        Container(
          width: 4,
          height: 4,
          margin: const EdgeInsets.only(top: 3),
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
            boxShadow: [BoxShadow(color: color.withValues(alpha: 0.6), blurRadius: 4)],
          ),
        ),
      ],
    );
  }
}

class _InactiveNavItem extends StatelessWidget {
  final Color color;
  final _NavItem item;
  const _InactiveNavItem({super.key, required this.color, required this.item});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(item.inactiveIcon, color: color, size: 22),
        const SizedBox(height: 4),
        Text(
          item.label,
          style: GoogleFonts.outfit(
            color: color,
            fontSize: 9,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 7), // space for dot
      ],
    );
  }
}
