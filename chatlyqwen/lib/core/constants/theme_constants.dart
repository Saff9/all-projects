/// @file lib/core/constants/theme_constants.dart
/// @brief Color palette and theme constants for the application
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file defines all the color constants, gradients, and theme-related values
/// used throughout the Chatly application. The design follows the brand guidelines
/// with primary, secondary, and accent colors that create a cohesive visual experience.

import 'package:flutter/material.dart';

class ThemeConstants {
  // Primary brand colors
  static const Color primaryIndigo = Color(0xFF6366F1);
  static const Color secondaryEmerald = Color(0xFF10B981);
  static const Color accentAmber = Color(0xFFF59E0B);
  
  // Background colors
  static const Color backgroundLight = Color(0xFFF9FAFB);
  static const Color backgroundDark = Color(0xFF111827);
  static const Color backgroundSurfaceLight = Color(0xFFFFFFFF);
  static const Color backgroundSurfaceDark = Color(0xFF1F2937);
  
  // Text colors
  static const Color textPrimaryLight = Color(0xFF1F2937);
  static const Color textSecondaryLight = Color(0xFF6B7280);
  static const Color textPrimaryDark = Color(0xFFF9FAFB);
  static const Color textSecondaryDark = Color(0xFF9CA3AF);
  
  // Status colors
  static const Color onlineStatus = Color(0xFF10B981);
  static const Color awayStatus = Color(0xFFF59E0B);
  static const Color offlineStatus = Color(0xFF6B7280);
  
  // Notification colors
  static const Color notificationPrimary = Color(0xFF8B5CF6);
  static const Color notificationSecondary = Color(0xFFEC4899);
  
  // Error and success colors
  static const Color errorRed = Color(0xFFEF4444);
  static const Color successGreen = Color(0xFF10B981);
  static const Color warningYellow = Color(0xFFFBBF24);
  
  // Premium colors
  static const Color plusGold = Color(0xFFFBBF24);
  static const Color proDiamond = Color(0xFF8B5CF6);
  
  // Gradients
  static const List<Color> primaryGradient = [
    Color(0xFF6366F1),
    Color(0xFF8B5CF6),
  ];
  
  static const List<Color> successGradient = [
    Color(0xFF10B981),
    Color(0xFF34D399),
  ];
  
  static const List<Color> premiumGradient = [
    Color(0xFF8B5CF6),
    Color(0xFFEC4899),
  ];
  
  // Opacity levels
  static const double highOpacity = 0.85;
  static const double mediumOpacity = 0.65;
  static const double lowOpacity = 0.35;
  
  // Shadows (non-const due to withOpacity calls)
  static List<BoxShadow> get cardShadow => [
    BoxShadow(
      color: const Color(0xFF6366F1).withOpacity(0.1),
      blurRadius: 10,
      spreadRadius: 2,
      offset: const Offset(0, 4),
    ),
  ];

  static List<BoxShadow> get elevatedShadow => [
    BoxShadow(
      color: const Color(0xFF6366F1).withOpacity(0.15),
      blurRadius: 15,
      spreadRadius: 3,
      offset: const Offset(0, 6),
    ),
  ];
  
  /// Returns color based on theme mode
  static Color getTextColor(bool isDarkMode) {
    return isDarkMode ? textPrimaryDark : textPrimaryLight;
  }
  
  /// Returns secondary text color based on theme mode
  static Color getSecondaryTextColor(bool isDarkMode) {
    return isDarkMode ? textSecondaryDark : textSecondaryLight;
  }
  
  /// Returns background color based on theme mode
  static Color getBackgroundColor(bool isDarkMode) {
    return isDarkMode ? backgroundDark : backgroundLight;
  }
  
  /// Returns surface color based on theme mode
  static Color getSurfaceColor(bool isDarkMode) {
    return isDarkMode ? backgroundSurfaceDark : backgroundSurfaceLight;
  }
  
  /// Returns appropriate shadow color with opacity
  static BoxShadow getCardShadow(Color primaryColor) {
    return BoxShadow(
      color: primaryColor.withOpacity(0.1),
      blurRadius: 10,
      spreadRadius: 2,
      offset: const Offset(0, 4),
    );
  }
  
  /// WARNING: These colors are critical for brand identity.
  /// Any changes should be approved by design team and tested for accessibility.
  
  /// TODO: Add more theme variants for premium users
  /// TODO: Implement custom theme creation for Pro users
}
