import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:google_mobile_ads/google_mobile_ads.dart';

import '../theme/app_theme.dart';
import '../core/audio_controller.dart';
import '../core/ad_manager.dart';
import 'games/void_tap_game.dart';
import 'games/gem_crafter_game.dart';
import 'games/aura_blast_game.dart';

class ArcadeScreen extends StatefulWidget {
  const ArcadeScreen({super.key});

  @override
  State<ArcadeScreen> createState() => _ArcadeScreenState();
}

class _ArcadeScreenState extends State<ArcadeScreen> {
  BannerAd? _bannerAd;
  bool _isBannerAdLoaded = false;

  @override
  void initState() {
    super.initState();
    _loadBannerAd();
  }

  void _loadBannerAd() {
    if (!AdManager.isSupported) return;
    _bannerAd = AdManager.createBannerAd(
      onAdLoaded: () {
        setState(() {
          _isBannerAdLoaded = true;
        });
      },
      onAdFailedToLoad: (error) {
        setState(() {
          _isBannerAdLoaded = false;
        });
      },
    )..load();
  }

  @override
  void dispose() {
    _bannerAd?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final scrollView = CustomScrollView(
      slivers: [
        // Hero Header
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFFF4081), AppTheme.accentPurple],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(color: const Color(0xFFFF4081).withValues(alpha: 0.3), blurRadius: 20, offset: const Offset(0, 5)),
                ],
              ),
              child: Column(
                children: [
                  const Icon(Icons.videogame_asset_rounded, color: Colors.white, size: 48)
                      .animate(onPlay: (c) => c.repeat(reverse: true))
                      .scale(begin: const Offset(0.95, 0.95), end: const Offset(1.05, 1.05), duration: 2.seconds),
                  const SizedBox(height: 12),
                  Text(
                    'THE ARCADE',
                    style: GoogleFonts.outfit(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900, letterSpacing: 2),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Play mini-games to earn extra Aeon Gems, Evolution Shards, and Coins!',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.inter(color: Colors.white.withValues(alpha: 0.9), fontSize: 13, height: 1.5),
                  ),
                ],
              ),
            ).animate().fadeIn(duration: 400.ms).slideY(begin: -0.1, end: 0),
          ),
        ),

        // Game Selection
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
          sliver: SliverList(
            delegate: SliverChildListDelegate([
              _GameCard(
                title: 'VOID TAP',
                description: 'Screen touch reaction game. Tap the anomalies before they vanish!',
                icon: Icons.touch_app_rounded,
                color: AppTheme.accentOrange,
                rewardEmoji: '💎',
                onPlay: () {
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const VoidTapGame()));
                },
              ),
              const SizedBox(height: 16),
              _GameCard(
                title: 'GEM CRAFTER',
                description: 'Match-3 puzzle game. Match 3 or more gems to earn massive rewards!',
                icon: Icons.diamond_rounded,
                color: AppTheme.accentCyan,
                rewardEmoji: '🪙',
                onPlay: () {
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const GemCrafterGame()));
                },
              ),
              const SizedBox(height: 16),
              _GameCard(
                title: 'AURA BLAST',
                description: 'Bubble shooter strategy. Clear the elemental aura grid!',
                icon: Icons.bubble_chart_rounded,
                color: AppTheme.accentGreen,
                rewardEmoji: '🧬',
                onPlay: () {
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const AuraBlastGame()));
                },
              ),
            ]),
          ),
        ),
      ],
    );

    if (_isBannerAdLoaded && _bannerAd != null) {
      return Column(
        children: [
          Expanded(child: scrollView),
          Container(
            color: AppTheme.bgDark,
            width: _bannerAd!.size.width.toDouble(),
            height: _bannerAd!.size.height.toDouble(),
            child: AdWidget(ad: _bannerAd!),
          ),
        ],
      );
    }
    
    return scrollView;
  }

  void _showComingSoon(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Working on it! Coming very soon.', style: GoogleFonts.inter()),
        backgroundColor: AppTheme.accentPurple,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }
}

class _GameCard extends StatelessWidget {
  final String title;
  final String description;
  final IconData icon;
  final Color color;
  final String rewardEmoji;
  final VoidCallback onPlay;

  const _GameCard({
    required this.title,
    required this.description,
    required this.icon,
    required this.color,
    required this.rewardEmoji,
    required this.onPlay,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        AudioController.playClick();
        onPlay();
      },
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: AppTheme.glowDecoration(
          glowColor: color,
          borderRadius: 20,
          glowIntensity: 0.15,
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: color.withValues(alpha: 0.4)),
              ),
              child: Icon(icon, color: color, size: 36),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        title,
                        style: GoogleFonts.outfit(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          'Win $rewardEmoji',
                          style: GoogleFonts.outfit(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    description,
                    style: GoogleFonts.inter(color: AppTheme.textSecondary, fontSize: 12, height: 1.4),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Icon(Icons.play_circle_fill_rounded, color: color, size: 36),
          ],
        ),
      ).animate().fadeIn(duration: 300.ms).slideX(begin: 0.1, end: 0),
    );
  }
}
