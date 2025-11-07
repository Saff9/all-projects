import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'providers/game_provider.dart';
import 'screens/home_screen.dart';
import 'theme/app_theme.dart';

import 'core/audio_controller.dart';
import 'core/ad_manager.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await AdManager.init();
  // DO NOT init AudioController here on Web, it violates autoplay policy before user interaction and crashes runApp()!
  runApp(const IdleEmpireApp());
}

class IdleEmpireApp extends StatelessWidget {
  const IdleEmpireApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => GameProvider()..initialize(),
      child: MaterialApp(
        title: 'Idle Empire',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.darkTheme,
        builder: (context, child) {
          if (kIsWeb) {
            return Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 500),
                child: child!,
              ),
            );
          }
          return child!;
        },
        home: const _SplashWrapper(),
      ),
    );
  }
}

/// Shows a splash screen while the game initializes.
class _SplashWrapper extends StatelessWidget {
  const _SplashWrapper();

  @override
  Widget build(BuildContext context) {
    return Consumer<GameProvider>(
      builder: (context, game, _) {
        if (!game.isInitialized) {
          return const _SplashScreen();
        }
        return const HomeScreen();
      },
    );
  }
}

class _SplashScreen extends StatefulWidget {
  const _SplashScreen();

  @override
  State<_SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<_SplashScreen>
    with TickerProviderStateMixin {
  late AnimationController _progressController;
  late AnimationController _pulseController;
  late Animation<double> _pulseAnim;

  @override
  void initState() {
    super.initState();
    _progressController = AnimationController(
      duration: const Duration(milliseconds: 2000),
      vsync: this,
    )..forward();

    _pulseController = AnimationController(
      duration: const Duration(milliseconds: 1400),
      vsync: this,
    )..repeat(reverse: true);

    _pulseAnim = Tween<double>(begin: 1.0, end: 1.08).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _progressController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgDark,
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF07091A), Color(0xFF0E1535), Color(0xFF07091A)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Floating orbs background effect
                Stack(
                  alignment: Alignment.center,
                  children: [
                    // Outer glow ring
                    Container(
                      width: 160,
                      height: 160,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.accentGold.withValues(alpha: 0.15),
                            blurRadius: 60,
                            spreadRadius: 20,
                          ),
                          BoxShadow(
                            color: AppTheme.accentBlue.withValues(alpha: 0.1),
                            blurRadius: 80,
                            spreadRadius: 10,
                          ),
                        ],
                      ),
                    ),
                    // Main icon container
                    AnimatedBuilder(
                      animation: _pulseAnim,
                      builder: (ctx, child) => Transform.scale(
                        scale: _pulseAnim.value,
                        child: child,
                      ),
                      child: Container(
                        width: 130,
                        height: 130,
                        decoration: AppTheme.neonGlowDecoration(
                          glowColor: AppTheme.accentGold,
                          borderRadius: 36,
                          glowIntensity: 0.35,
                        ),
                        child: const Center(
                          child: Text('🏙️', style: TextStyle(fontSize: 62)),
                        ),
                      ),
                    ),
                  ],
                )
                    .animate()
                    .fadeIn(duration: 600.ms)
                    .scale(begin: const Offset(0.7, 0.7), duration: 600.ms, curve: Curves.elasticOut),

                const SizedBox(height: 32),

                // Title
                Text(
                  'IDLE EMPIRE',
                  style: GoogleFonts.outfit(
                    color: AppTheme.accentGold,
                    fontSize: 36,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 7,
                  ),
                )
                    .animate(delay: 300.ms)
                    .fadeIn(duration: 600.ms)
                    .slideY(begin: 0.3, end: 0, curve: Curves.easeOut),

                const SizedBox(height: 8),

                Text(
                  'Business Tycoon & Creature Evolution',
                  style: GoogleFonts.inter(
                    color: AppTheme.textSecondary,
                    fontSize: 13,
                    letterSpacing: 0.5,
                  ),
                )
                    .animate(delay: 500.ms)
                    .fadeIn(duration: 500.ms),

                const SizedBox(height: 12),

                // Version badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppTheme.accentBlue.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppTheme.accentBlue.withValues(alpha: 0.3)),
                  ),
                  child: Text(
                    'v1.2.0  •  PRO EDITION',
                    style: GoogleFonts.inter(
                      color: AppTheme.accentBlue,
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1,
                    ),
                  ),
                )
                    .animate(delay: 700.ms)
                    .fadeIn(duration: 400.ms),

                const SizedBox(height: 56),

                // Animated progress bar
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 60),
                  child: Column(
                    children: [
                      AnimatedBuilder(
                        animation: _progressController,
                        builder: (ctx, _) => ClipRRect(
                          borderRadius: BorderRadius.circular(6),
                          child: LinearProgressIndicator(
                            value: _progressController.value,
                            minHeight: 6,
                            backgroundColor: AppTheme.bgCard,
                            valueColor: AlwaysStoppedAnimation<Color>(AppTheme.accentGold),
                          ),
                        ),
                      ),
                      const SizedBox(height: 14),
                      Text(
                        'Building your empire...',
                        style: GoogleFonts.inter(
                          color: AppTheme.textMuted,
                          fontSize: 12,
                        ),
                      )
                          .animate(delay: 200.ms)
                          .fadeIn()
                          .then(delay: 800.ms)
                          .custom(
                            duration: 200.ms,
                            builder: (ctx, val, child) => child!,
                          ),
                    ],
                  ),
                ).animate(delay: 400.ms).fadeIn(duration: 500.ms),

                const SizedBox(height: 40),

                // City silhouette row
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: ['🏗️', '🏢', '🏙️', '🏦', '🌆']
                      .asMap()
                      .entries
                      .map((e) => Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 4),
                            child: Text(
                              e.value,
                              style: const TextStyle(fontSize: 20),
                            )
                                .animate(delay: Duration(milliseconds: 600 + e.key * 100))
                                .fadeIn(duration: 400.ms)
                                .slideY(begin: 0.5, end: 0),
                          ))
                      .toList(),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
