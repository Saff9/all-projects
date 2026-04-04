/// @file lib/core/themes/app_theme.dart
/// @brief Theme manager and theme configuration
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file manages the application's theme system, providing light, dark, and
/// custom themes based on user preferences. It handles theme switching, persistence,
/// and provides theme data for the entire application.

import 'package:chatly/core/constants/theme_constants.dart';
import 'package:chatly/core/utils/handlers/preference_handler.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  /// Get the light theme
  static ThemeData get lightTheme {
    return ThemeData(
      brightness: Brightness.light,
      primaryColor: ThemeConstants.primaryIndigo,
      scaffoldBackgroundColor: ThemeConstants.backgroundLight,
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: IconThemeData(color: Colors.black),
        titleTextStyle: TextStyle(
          color: Colors.black,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
      textTheme: GoogleFonts.robotoTextTheme(
        const TextTheme(
          displayLarge: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
          displayMedium: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
          displaySmall: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          headlineMedium: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
          headlineSmall: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
          titleLarge: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          bodyLarge: TextStyle(fontSize: 16),
          bodyMedium: TextStyle(fontSize: 14),
          bodySmall: TextStyle(fontSize: 12),
          labelLarge: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
          labelSmall: TextStyle(fontSize: 10),
        ),
      ).copyWith(
        displayLarge: GoogleFonts.montserrat(
          fontSize: 32,
          fontWeight: FontWeight.bold,
          color: ThemeConstants.textPrimaryLight,
        ),
        headlineMedium: GoogleFonts.montserrat(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: ThemeConstants.textPrimaryLight,
        ),
      ),
      colorScheme: const ColorScheme.light(
        primary: ThemeConstants.primaryIndigo,
        secondary: ThemeConstants.secondaryEmerald,
        tertiary: ThemeConstants.accentAmber,
        error: ThemeConstants.errorRed,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onBackground: Colors.black,
        onSurface: Colors.black,
        surface: Colors.white,
        background: ThemeConstants.backgroundLight,
      ),
      cardTheme: CardThemeData(
        color: ThemeConstants.backgroundSurfaceLight,
        elevation: 2,
        margin: const EdgeInsets.all(8),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: ThemeConstants.primaryIndigo),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: ThemeConstants.primaryIndigo, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: ThemeConstants.errorRed),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: ThemeConstants.errorRed, width: 2),
        ),
        labelStyle: TextStyle(color: ThemeConstants.primaryIndigo),
        hintStyle: TextStyle(color: ThemeConstants.textSecondaryLight),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: ThemeConstants.primaryIndigo,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          textStyle: GoogleFonts.roboto(
            fontWeight: FontWeight.w600,
            fontSize: 16,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: 3,
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: ThemeConstants.primaryIndigo,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          textStyle: GoogleFonts.roboto(
            fontWeight: FontWeight.w600,
            fontSize: 16,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: ThemeConstants.primaryIndigo,
          side: const BorderSide(color: ThemeConstants.primaryIndigo),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          textStyle: GoogleFonts.roboto(
            fontWeight: FontWeight.w600,
            fontSize: 16,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: ThemeConstants.primaryIndigo,
        foregroundColor: Colors.white,
        elevation: 4,
      ),
      listTileTheme: const ListTileThemeData(
        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        tileColor: Colors.transparent,
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: ThemeConstants.backgroundSurfaceLight,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: ThemeConstants.backgroundSurfaceLight,
        selectedItemColor: ThemeConstants.primaryIndigo,
        unselectedItemColor: ThemeConstants.textSecondaryLight,
        elevation: 8,
        type: BottomNavigationBarType.fixed,
      ),
    );
  }

  /// Get the dark theme
  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      primaryColor: ThemeConstants.primaryIndigo,
      scaffoldBackgroundColor: ThemeConstants.backgroundDark,
      appBarTheme: const AppBarTheme(
        backgroundColor: ThemeConstants.backgroundDark,
        elevation: 0,
        iconTheme: IconThemeData(color: Colors.white),
        titleTextStyle: TextStyle(
          color: Colors.white,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
      textTheme: GoogleFonts.robotoTextTheme(
        const TextTheme(
          displayLarge: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
          displayMedium: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
          displaySmall: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          headlineMedium: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
          headlineSmall: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
          titleLarge: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          bodyLarge: TextStyle(fontSize: 16),
          bodyMedium: TextStyle(fontSize: 14),
          bodySmall: TextStyle(fontSize: 12),
          labelLarge: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
          labelSmall: TextStyle(fontSize: 10),
        ),
      ).copyWith(
        displayLarge: GoogleFonts.montserrat(
          fontSize: 32,
          fontWeight: FontWeight.bold,
          color: ThemeConstants.textPrimaryDark,
        ),
        headlineMedium: GoogleFonts.montserrat(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: ThemeConstants.textPrimaryDark,
        ),
      ),
      colorScheme: const ColorScheme.dark(
        primary: ThemeConstants.primaryIndigo,
        secondary: ThemeConstants.secondaryEmerald,
        tertiary: ThemeConstants.accentAmber,
        error: ThemeConstants.errorRed,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onBackground: Colors.white,
        onSurface: Colors.white,
        surface: ThemeConstants.backgroundSurfaceDark,
        background: ThemeConstants.backgroundDark,
      ),
      cardTheme: CardThemeData(
        color: ThemeConstants.backgroundSurfaceDark,
        elevation: 2,
        margin: const EdgeInsets.all(8),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: ThemeConstants.primaryIndigo),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: ThemeConstants.primaryIndigo, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: ThemeConstants.errorRed),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: ThemeConstants.errorRed, width: 2),
        ),
        labelStyle: TextStyle(color: ThemeConstants.primaryIndigo),
        hintStyle: TextStyle(color: ThemeConstants.textSecondaryDark),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: ThemeConstants.primaryIndigo,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          textStyle: GoogleFonts.roboto(
            fontWeight: FontWeight.w600,
            fontSize: 16,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: 3,
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: ThemeConstants.primaryIndigo,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          textStyle: GoogleFonts.roboto(
            fontWeight: FontWeight.w600,
            fontSize: 16,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: ThemeConstants.primaryIndigo,
          side: const BorderSide(color: ThemeConstants.primaryIndigo),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          textStyle: GoogleFonts.roboto(
            fontWeight: FontWeight.w600,
            fontSize: 16,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: ThemeConstants.primaryIndigo,
        foregroundColor: Colors.white,
        elevation: 4,
      ),
      listTileTheme: const ListTileThemeData(
        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        tileColor: Colors.transparent,
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: ThemeConstants.backgroundSurfaceDark,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: ThemeConstants.backgroundSurfaceDark,
        selectedItemColor: ThemeConstants.primaryIndigo,
        unselectedItemColor: ThemeConstants.textSecondaryDark,
        elevation: 8,
        type: BottomNavigationBarType.fixed,
      ),
    );
  }

  /// Get a specific theme by name
  static ThemeData getTheme(String themeName) {
    switch (themeName.toLowerCase()) {
      case 'light':
        return lightTheme;
      case 'dark':
        return darkTheme;
      case 'amoled':
        return _getAmoledTheme();
      default:
        return lightTheme;
    }
  }

  /// Get AMOLED black theme (for premium users)
  static ThemeData _getAmoledTheme() {
    return ThemeData(
      brightness: Brightness.dark,
      primaryColor: ThemeConstants.primaryIndigo,
      scaffoldBackgroundColor: Colors.black,
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.black,
        elevation: 0,
        iconTheme: IconThemeData(color: Colors.white),
        titleTextStyle: TextStyle(
          color: Colors.white,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
      textTheme: GoogleFonts.robotoTextTheme(
        const TextTheme(
          displayLarge: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
          displayMedium: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
          displaySmall: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          headlineMedium: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
          headlineSmall: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
          titleLarge: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          bodyLarge: TextStyle(fontSize: 16),
          bodyMedium: TextStyle(fontSize: 14),
          bodySmall: TextStyle(fontSize: 12),
          labelLarge: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
          labelSmall: TextStyle(fontSize: 10),
        ),
      ).copyWith(
        displayLarge: GoogleFonts.montserrat(
          fontSize: 32,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
        headlineMedium: GoogleFonts.montserrat(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: Colors.white,
        ),
      ),
      colorScheme: ColorScheme.dark(
        primary: ThemeConstants.primaryIndigo,
        secondary: ThemeConstants.secondaryEmerald,
        tertiary: ThemeConstants.accentAmber,
        error: ThemeConstants.errorRed,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onBackground: Colors.white,
        onSurface: Colors.white,
        surface: const Color(0xFF212121),
        background: Colors.black,
      ),
      cardTheme: CardThemeData(
        color: const Color(0xFF212121), // Using direct color instead of shade900 for const
        elevation: 2,
        margin: const EdgeInsets.all(8),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: ThemeConstants.primaryIndigo),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: ThemeConstants.primaryIndigo, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: ThemeConstants.errorRed),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: ThemeConstants.errorRed, width: 2),
        ),
        labelStyle: TextStyle(color: ThemeConstants.primaryIndigo),
        hintStyle: TextStyle(color: ThemeConstants.textSecondaryDark),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: ThemeConstants.primaryIndigo,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          textStyle: GoogleFonts.roboto(
            fontWeight: FontWeight.w600,
            fontSize: 16,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: 3,
        ),
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: Colors.grey.shade900,
        selectedItemColor: ThemeConstants.primaryIndigo,
        unselectedItemColor: ThemeConstants.textSecondaryDark,
        elevation: 8,
        type: BottomNavigationBarType.fixed,
      ),
    );
  }

  /// Apply custom theme colors (for Pro users)
  static ThemeData getCustomTheme(Map<String, dynamic> customColors) {
    // Default to light theme if custom colors are invalid
    if (customColors.isEmpty) return lightTheme;
    
    final primaryColor = Color(int.parse(customColors['primary'] ?? '0xFF6366F1'));
    final secondaryColor = Color(int.parse(customColors['secondary'] ?? '0xFF10B981'));
    final backgroundColor = Color(int.parse(customColors['background'] ?? '0xFFF9FAFB'));
    final textColor = Color(int.parse(customColors['text'] ?? '0xFF1F2937'));
    
    return ThemeData(
      brightness: Brightness.light,
      primaryColor: primaryColor,
      scaffoldBackgroundColor: backgroundColor,
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: IconThemeData(color: textColor),
        titleTextStyle: TextStyle(
          color: textColor,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
      textTheme: GoogleFonts.robotoTextTheme(
        TextTheme(
          displayLarge: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: textColor),
          displayMedium: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: textColor),
          displaySmall: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: textColor),
          headlineMedium: TextStyle(fontSize: 20, fontWeight: FontWeight.w600, color: textColor),
          headlineSmall: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: textColor),
          titleLarge: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: textColor),
          bodyLarge: TextStyle(fontSize: 16, color: textColor),
          bodyMedium: TextStyle(fontSize: 14, color: textColor.withOpacity(0.8)),
          bodySmall: TextStyle(fontSize: 12, color: textColor.withOpacity(0.7)),
          labelLarge: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: textColor),
          labelSmall: TextStyle(fontSize: 10, color: textColor.withOpacity(0.6)),
        ),
      ),
      colorScheme: ColorScheme.light(
        primary: primaryColor,
        secondary: secondaryColor,
        tertiary: ThemeConstants.accentAmber,
        error: ThemeConstants.errorRed,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onBackground: textColor,
        onSurface: textColor,
        surface: Colors.white,
        background: backgroundColor,
      ),
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 2,
        margin: const EdgeInsets.all(8),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
    );
  }
  
  /// TODO: Implement theme animations for smooth transitions
  /// TODO: Add support for animated wallpapers in Pro tier
  /// WARNING: Custom themes should be validated for accessibility before applying
}
