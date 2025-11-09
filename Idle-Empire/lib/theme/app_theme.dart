import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Premium dark theme with neon accents for the idle game.
class AppTheme {
  // Core Colors
  static const Color bgDark = Color(0xFF080C1A);
  static const Color bgCard = Color(0xFF131836);
  static const Color bgCardLight = Color(0xFF1E2448);
  static const Color bgSurface = Color(0xFF0E1228);

  // Accent Colors
  static const Color accentGold = Color(0xFFFFD54F);
  static const Color accentGreen = Color(0xFF69F0AE);
  static const Color accentBlue = Color(0xFF448AFF);
  static const Color accentPurple = Color(0xFFE040FB);
  static const Color accentPink = Color(0xFFFF4081);
  static const Color accentOrange = Color(0xFFFFAB40);
  static const Color accentCyan = Color(0xFF18FFFF);
  static const Color accentRed = Color(0xFFFF5252);
  static const Color accentTeal = Color(0xFF00E5CC);

  // Text Colors
  static const Color textPrimary = Color(0xFFF5F5F5);
  static const Color textSecondary = Color(0xFFB0BEC5);
  static const Color textMuted = Color(0xFF607D8B);

  // Nav bar height constant
  static const double kNavBarHeight = 80.0;

  // Gradients
  static const LinearGradient goldGradient = LinearGradient(
    colors: [Color(0xFFFFD54F), Color(0xFFFF8F00)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient blueGradient = LinearGradient(
    colors: [Color(0xFF448AFF), Color(0xFF7C4DFF)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient greenGradient = LinearGradient(
    colors: [Color(0xFF69F0AE), Color(0xFF00E676)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient purpleGradient = LinearGradient(
    colors: [Color(0xFFE040FB), Color(0xFF7C4DFF)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient fireGradient = LinearGradient(
    colors: [Color(0xFFFF6D00), Color(0xFFFF1744)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient cyanGradient = LinearGradient(
    colors: [Color(0xFF18FFFF), Color(0xFF00B8D4)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient tealGradient = LinearGradient(
    colors: [Color(0xFF00E5CC), Color(0xFF00B0FF)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient cosmicGradient = LinearGradient(
    colors: [Color(0xFF4A0080), Color(0xFF00B8D4), Color(0xFF0D0D2B)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const LinearGradient cardGradient = LinearGradient(
    colors: [Color(0xFF131836), Color(0xFF1E2448)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const LinearGradient heroGradient = LinearGradient(
    colors: [Color(0xFF1A237E), Color(0xFF0D47A1), Color(0xFF131836)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const LinearGradient topBarGradient = LinearGradient(
    colors: [Color(0xFF0A0F20), Color(0xFF080C1A)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  /// Card decoration with glassmorphism effect.
  static BoxDecoration cardDecoration({
    Color? borderColor,
    double borderWidth = 1,
    double borderRadius = 20,
    Gradient? gradient,
  }) {
    return BoxDecoration(
      gradient: gradient ?? cardGradient,
      borderRadius: BorderRadius.circular(borderRadius),
      border: Border.all(
        color: borderColor ?? Colors.white.withValues(alpha: 0.06),
        width: borderWidth,
      ),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.4),
          blurRadius: 16,
          offset: const Offset(0, 6),
        ),
      ],
    );
  }

  /// Glowing card decoration for highlighted items.
  static BoxDecoration glowDecoration({
    required Color glowColor,
    double borderRadius = 20,
    double glowIntensity = 0.25,
  }) {
    return BoxDecoration(
      gradient: LinearGradient(
        colors: [
          glowColor.withValues(alpha: 0.08),
          bgCard,
        ],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
      borderRadius: BorderRadius.circular(borderRadius),
      border: Border.all(
        color: glowColor.withValues(alpha: 0.4),
        width: 1.5,
      ),
      boxShadow: [
        BoxShadow(
          color: glowColor.withValues(alpha: glowIntensity),
          blurRadius: 24,
          spreadRadius: 0,
        ),
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.3),
          blurRadius: 12,
          offset: const Offset(0, 4),
        ),
      ],
    );
  }

  /// Neon glow — stronger multi-layer glow for hero elements.
  static BoxDecoration neonGlowDecoration({
    required Color glowColor,
    double borderRadius = 20,
    double glowIntensity = 0.4,
  }) {
    return BoxDecoration(
      gradient: LinearGradient(
        colors: [
          glowColor.withValues(alpha: 0.12),
          bgCard.withValues(alpha: 0.95),
        ],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
      borderRadius: BorderRadius.circular(borderRadius),
      border: Border.all(
        color: glowColor.withValues(alpha: 0.55),
        width: 1.5,
      ),
      boxShadow: [
        BoxShadow(
          color: glowColor.withValues(alpha: glowIntensity),
          blurRadius: 40,
          spreadRadius: 2,
        ),
        BoxShadow(
          color: glowColor.withValues(alpha: glowIntensity * 0.5),
          blurRadius: 16,
          spreadRadius: 0,
        ),
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.4),
          blurRadius: 12,
          offset: const Offset(0, 6),
        ),
      ],
    );
  }

  /// Shimmer gradient decoration for premium items.
  static BoxDecoration shimmerDecoration({
    required Color color1,
    required Color color2,
    double borderRadius = 20,
  }) {
    return BoxDecoration(
      gradient: LinearGradient(
        colors: [color1, color2, color1],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
      borderRadius: BorderRadius.circular(borderRadius),
      boxShadow: [
        BoxShadow(
          color: color1.withValues(alpha: 0.4),
          blurRadius: 16,
          spreadRadius: 0,
        ),
      ],
    );
  }

  static ThemeData get darkTheme {
    final textTheme = GoogleFonts.outfitTextTheme().copyWith(
      displayLarge: GoogleFonts.outfit(color: textPrimary, fontWeight: FontWeight.w800, letterSpacing: -0.5),
      displayMedium: GoogleFonts.outfit(color: textPrimary, fontWeight: FontWeight.w700),
      headlineLarge: GoogleFonts.outfit(color: textPrimary, fontWeight: FontWeight.w700),
      headlineMedium: GoogleFonts.outfit(color: textPrimary, fontWeight: FontWeight.w600),
      titleLarge: GoogleFonts.outfit(color: textPrimary, fontWeight: FontWeight.w600),
      titleMedium: GoogleFonts.outfit(color: textPrimary, fontWeight: FontWeight.w500),
      bodyLarge: GoogleFonts.inter(color: textSecondary),
      bodyMedium: GoogleFonts.inter(color: textSecondary),
      bodySmall: GoogleFonts.inter(color: textMuted),
      labelLarge: GoogleFonts.outfit(color: textPrimary, fontWeight: FontWeight.w600),
      labelMedium: GoogleFonts.inter(color: textSecondary, fontWeight: FontWeight.w500),
    );

    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: bgDark,
      primaryColor: accentBlue,
      colorScheme: const ColorScheme.dark(
        primary: accentBlue,
        secondary: accentGold,
        surface: bgCard,
        error: accentPink,
      ),
      textTheme: textTheme,
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: bgCard,
        selectedItemColor: accentGold,
        unselectedItemColor: textMuted,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: accentBlue,
          foregroundColor: textPrimary,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
          elevation: 8,
          textStyle: GoogleFonts.outfit(fontWeight: FontWeight.w700),
        ),
      ),
    );
  }
}
