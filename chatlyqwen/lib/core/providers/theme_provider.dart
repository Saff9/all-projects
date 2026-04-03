/// @file lib/core/providers/theme_provider.dart
/// @brief Theme management provider for light/dark mode and custom themes
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file manages the application's theme state, allowing users to switch
/// between light, dark, and custom themes. It handles theme persistence across
/// app restarts and provides reactive updates to UI components when the theme changes.

import 'package:chatly/core/constants/theme_constants.dart';
import 'package:chatly/core/themes/app_theme.dart';
import 'package:chatly/core/utils/handlers/preference_handler.dart';
import 'package:flutter/material.dart';

class ThemeProvider with ChangeNotifier {
  final PreferenceHandler _preferenceHandler = PreferenceHandler();
  
  ThemeMode _themeMode = ThemeMode.light;
  String _currentThemeName = 'light';
  Map<String, dynamic> _customThemeColors = {};
  
  // Getters
  ThemeMode get themeMode => _themeMode;
  String get currentThemeName => _currentThemeName;
  Map<String, dynamic> get customThemeColors => _customThemeColors;
  ThemeData get currentTheme => _getCurrentTheme();
  ThemeData get lightTheme => AppTheme.lightTheme;
  ThemeData get darkTheme => AppTheme.darkTheme;
  
  /// Initialize theme from preferences
  Future<void> initialize() async {
    final savedTheme = await _preferenceHandler.getThemePreference();
    final savedThemeMode = await _preferenceHandler.getThemeModePreference();
    final savedCustomColors = await _preferenceHandler.getCustomThemeColors();
    
    _currentThemeName = savedTheme ?? 'light';
    _themeMode = savedThemeMode ?? ThemeMode.light;
    _customThemeColors = savedCustomColors ?? {};
    
    notifyListeners();
  }
  
  /// Set theme mode (system, light, dark)
  Future<void> setThemeMode(ThemeMode mode) async {
    _themeMode = mode;
    await _preferenceHandler.saveThemeModePreference(mode);
    notifyListeners();
  }
  
  /// Set theme by name
  Future<void> setTheme(String themeName) async {
    _currentThemeName = themeName;
    await _preferenceHandler.saveThemePreference(themeName);
    notifyListeners();
  }
  
  /// Set custom theme colors
  Future<void> setCustomThemeColors(Map<String, dynamic> colors) async {
    _customThemeColors = colors;
    await _preferenceHandler.saveCustomThemeColors(colors);
    notifyListeners();
  }
  
  /// Get current theme based on settings
  ThemeData _getCurrentTheme() {
    if (_currentThemeName == 'custom' && _customThemeColors.isNotEmpty) {
      return AppTheme.getCustomTheme(_customThemeColors);
    }
    
    return AppTheme.getTheme(_currentThemeName);
  }
  
  /// Check if current theme is dark mode
  bool get isDarkMode {
    if (_themeMode == ThemeMode.dark) return true;
    if (_themeMode == ThemeMode.light) return false;
    
    // System mode - check platform brightness
    return WidgetsBinding.instance.platformDispatcher.platformBrightness == Brightness.dark;
  }
  
  /// Toggle between light and dark mode
  Future<void> toggleThemeMode() async {
    if (_themeMode == ThemeMode.light) {
      await setThemeMode(ThemeMode.dark);
    } else if (_themeMode == ThemeMode.dark) {
      await setThemeMode(ThemeMode.light);
    }
    notifyListeners();
  }
  
  /// Apply theme to app
  ThemeData getThemeData() {
    return _getCurrentTheme();
  }
  
  /// Get theme colors for current theme
  Map<String, Color> getThemeColors() {
    final theme = _getCurrentTheme();
    return {
      'primary': theme.colorScheme.primary,
      'secondary': theme.colorScheme.secondary,
      'background': theme.scaffoldBackgroundColor,
      'surface': theme.cardColor,
      'text': theme.textTheme.bodyLarge!.color!,
      'error': theme.colorScheme.error,
      'success': Colors.green,
    };
  }
  
  /// Check if premium theme is available
  bool isPremiumThemeAvailable(String themeName, String userTier) {
    if (userTier == 'pro') return true;
    if (userTier == 'plus') return !themeName.contains('pro');
    return themeName == 'light' || themeName == 'dark' || themeName == 'amoled';
  }
  
  /// Get available themes based on user tier
  List<String> getAvailableThemes(String userTier) {
    final baseThemes = ['light', 'dark', 'amoled'];
    final plusThemes = ['ocean', 'forest', 'sunset', 'midnight', 'rose'];
    final proThemes = ['cosmic', 'neon', 'vintage', 'minimal', 'gradient'];
    
    switch (userTier) {
      case 'free':
        return baseThemes;
      case 'plus':
        return [...baseThemes, ...plusThemes];
      case 'pro':
        return [...baseThemes, ...plusThemes, ...proThemes, 'custom'];
      default:
        return baseThemes;
    }
  }
  
  /// Reset to default theme
  Future<void> resetToDefault() async {
    await setTheme('light');
    await setThemeMode(ThemeMode.system);
    _customThemeColors = {};
    await _preferenceHandler.saveCustomThemeColors({});
    notifyListeners();
  }
  
  /// TODO: Implement animated theme transitions
  /// TODO: Add theme preview functionality
  /// WARNING: Custom themes must be validated for accessibility compliance
}
