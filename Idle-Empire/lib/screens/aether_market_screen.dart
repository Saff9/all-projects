import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../core/big_number.dart';
import '../providers/game_provider.dart';
import '../theme/app_theme.dart';
import '../core/audio_controller.dart';

class _MarketItem {
  final String id;
  final String title;
  final String subtitle;
  final String description;
  final IconData icon;
  final Color color;
  final double shardCost;

  const _MarketItem({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.description,
    required this.icon,
    required this.color,
    required this.shardCost,
  });
}

const _marketItems = [
  _MarketItem(
    id: 'temporal_echo',
    title: 'Temporal Echo',
    subtitle: '2× Income for 10 minutes',
    description: 'Compresses a time-loop, doubling your income output for 10 minutes.',
    icon: Icons.hourglass_top_rounded,
    color: Color(0xFFF59E0B),
    shardCost: 200,
  ),
  _MarketItem(
    id: 'quantum_infusion',
    title: 'Quantum Infusion',
    subtitle: 'Instantly +50 Gems',
    description: 'Injects raw quantum matter directly into your gem reserves.',
    icon: Icons.diamond_rounded,
    color: Color(0xFFA78BFA),
    shardCost: 150,
  ),
  _MarketItem(
    id: 'dark_matter_surge',
    title: 'Dark Matter Surge',
    subtitle: '+500 Tech Points',
    description: 'Channels concentrated dark matter into your neural processing grid.',
    icon: Icons.auto_awesome_rounded,
    color: Color(0xFF60A5FA),
    shardCost: 300,
  ),
  _MarketItem(
    id: 'phase_catalyst',
    title: 'Phase Catalyst',
    subtitle: '5× Offline Earnings Bonus',
    description: "Supercharges your empire's offline efficiency for the next rest cycle.",
    icon: Icons.power_rounded,
    color: Color(0xFF34D399),
    shardCost: 500,
  ),
  _MarketItem(
    id: 'coin_surge',
    title: 'Capital Spike',
    subtitle: '+100k Coins instantly',
    description: 'A hyper-accelerated capital injection from future revenues.',
    icon: Icons.monetization_on_rounded,
    color: Color(0xFFFCD34D),
    shardCost: 100,
  ),
];

class AetherMarketScreen extends StatefulWidget {
  const AetherMarketScreen({super.key});

  @override
  State<AetherMarketScreen> createState() => _AetherMarketScreenState();
}

class _AetherMarketScreenState extends State<AetherMarketScreen> {
  final Set<String> _processing = {};

  void _buyItem(_MarketItem item, GameProvider game) async {
    if (_processing.contains(item.id)) return;
    if (game.playerData.evolutionShards < item.shardCost) return;

    setState(() => _processing.add(item.id));

    game.playerData.evolutionShards -= item.shardCost;

    switch (item.id) {
      case 'temporal_echo':
        game.playerData.adBoostMultiplier = 2.0;
        game.playerData.adBoostExpiry =
            DateTime.now().add(const Duration(minutes: 10));
        break;
      case 'quantum_infusion':
        game.playerData.gems += 50;
        break;
      case 'dark_matter_surge':
        game.playerData.techPoints += 500;
        break;
      case 'phase_catalyst':
        // Give 5x a simulated 1-hour offline income burst
        game.playerData.coins += game.totalIncomePerSecond * 3600 * 5;
        break;
      case 'coin_surge':
        game.playerData.coins += 100000;
        break;
    }

    AudioController.playLevelUp();
    game.notifyListeners();

    await Future.delayed(const Duration(milliseconds: 800));
    if (mounted) setState(() => _processing.remove(item.id));

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('${item.title} applied!',
              style: GoogleFonts.outfit(fontWeight: FontWeight.w700)),
          backgroundColor: item.color,
          behavior: SnackBarBehavior.floating,
          duration: const Duration(seconds: 2),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<GameProvider>(
      builder: (context, game, _) {
        final shards = game.playerData.evolutionShards;

        return CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Container(
                margin: const EdgeInsets.all(16),
                padding: const EdgeInsets.all(20),
                decoration: AppTheme.glowDecoration(
                    glowColor: AppTheme.accentPurple, borderRadius: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.storefront_rounded,
                            color: AppTheme.accentPurple, size: 36),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('AETHER MARKET',
                                  style: GoogleFonts.outfit(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w900,
                                      fontSize: 18,
                                      letterSpacing: 1)),
                              Text('Spend Evolution Shards for power boosts',
                                  style: GoogleFonts.inter(
                                      color: Colors.white54, fontSize: 12)),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 10),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.06),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                            color: AppTheme.accentCyan.withValues(alpha: 0.3)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Text('🧬', style: TextStyle(fontSize: 22)),
                          const SizedBox(width: 10),
                          Text('${BigNumber.formatCurrency(shards)} Shards available',
                              style: GoogleFonts.outfit(
                                  color: AppTheme.accentCyan,
                                  fontWeight: FontWeight.w700,
                                  fontSize: 15)),
                        ],
                      ),
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
                    final item = _marketItems[i];
                    final canAfford = shards >= item.shardCost;
                    final isProcessing = _processing.contains(item.id);

                    return _MarketCard(
                      item: item,
                      canAfford: canAfford,
                      isProcessing: isProcessing,
                      onBuy: () => _buyItem(item, game),
                    ).animate().fadeIn(
                        delay: Duration(milliseconds: 80 * i),
                        duration: 300.ms);
                  },
                  childCount: _marketItems.length,
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}

class _MarketCard extends StatelessWidget {
  final _MarketItem item;
  final bool canAfford;
  final bool isProcessing;
  final VoidCallback onBuy;

  const _MarketCard({
    required this.item,
    required this.canAfford,
    required this.isProcessing,
    required this.onBuy,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.04),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
            color: canAfford
                ? item.color.withValues(alpha: 0.4)
                : Colors.white.withValues(alpha: 0.08)),
        boxShadow: [
          if (canAfford)
            BoxShadow(
                color: item.color.withValues(alpha: 0.15),
                blurRadius: 20,
                spreadRadius: 1),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: item.color.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(14),
              boxShadow: [
                BoxShadow(color: item.color.withValues(alpha: 0.3), blurRadius: 12),
              ],
            ),
            child: Icon(item.icon, color: item.color, size: 28),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item.title,
                    style: GoogleFonts.outfit(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 15)),
                Text(item.subtitle,
                    style: GoogleFonts.inter(
                        color: item.color,
                        fontWeight: FontWeight.w600,
                        fontSize: 12)),
                const SizedBox(height: 3),
                Text(item.description,
                    style: GoogleFonts.inter(
                        color: Colors.white38, fontSize: 11, height: 1.4)),
              ],
            ),
          ),
          const SizedBox(width: 10),
          Column(
            children: [
              Text('🧬 ${BigNumber.formatCurrency(item.shardCost)}',
                  style: GoogleFonts.outfit(
                      color:
                          canAfford ? AppTheme.accentCyan : Colors.white30,
                      fontWeight: FontWeight.w700,
                      fontSize: 13)),
              const SizedBox(height: 8),
              ElevatedButton(
                onPressed: canAfford && !isProcessing ? onBuy : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor:
                      canAfford ? item.color : Colors.white10,
                  foregroundColor: Colors.white,
                  minimumSize: const Size(72, 36),
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10)),
                ),
                child: isProcessing
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white))
                    : Text('BUY',
                        style: GoogleFonts.outfit(
                            fontWeight: FontWeight.w800, fontSize: 12)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
