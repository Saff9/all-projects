/// @file lib/core/utils/handlers/preference_handler.dart
/// @brief Handles local storage preferences using SharedPreferences
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file provides a centralized interface for managing local preferences
/// including user settings, theme preferences, session data, and cached values.
/// It abstracts away the complexity of SharedPreferences and provides type-safe
/// methods for storing and retrieving various data types.

import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

// Extensions for SharedPreferences to handle complex types
extension SharedPreferencesExtension on SharedPreferences {
  Future<void> setStringMap(String key, Map<String, String> value) async {
    await setString(key, json.encode(value));
  }

  Map<String, String>? getStringMap(String key) {
    final jsonString = getString(key);
    if (jsonString == null) return null;
    try {
      final decoded = json.decode(jsonString) as Map<String, dynamic>;
      return decoded.map((key, value) => MapEntry(key, value.toString()));
    } catch (e) {
      return null;
    }
  }
}

class PreferenceHandler {
  static final PreferenceHandler _instance = PreferenceHandler._internal();
  late SharedPreferences _prefs;
  
  factory PreferenceHandler() {
    return _instance;
  }
  
  PreferenceHandler._internal();
  
  /// Initialize SharedPreferences
  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }
  
  /// Session Management
  Future<void> saveSessionData(String userId) async {
    await _prefs.setString('session_user_id', userId);
    await _prefs.setString('session_start_time', DateTime.now().toIso8601String());
  }
  
  Future<String?> getSessionUserId() async {
    return _prefs.getString('session_user_id');
  }
  
  Future<DateTime?> getSessionStartTime() async {
    final timeString = _prefs.getString('session_start_time');
    return timeString != null ? DateTime.parse(timeString) : null;
  }
  
  Future<void> clearSessionData() async {
    await _prefs.remove('session_user_id');
    await _prefs.remove('session_start_time');
  }
  
  /// Theme Preferences
  Future<void> saveThemePreference(String themeName) async {
    await _prefs.setString('theme_preference', themeName);
  }
  
  Future<String?> getThemePreference() async {
    return _prefs.getString('theme_preference') ?? 'light';
  }
  
  Future<void> saveThemeModePreference(ThemeMode mode) async {
    await _prefs.setString('theme_mode_preference', mode.toString());
  }
  
  Future<ThemeMode?> getThemeModePreference() async {
    final modeString = _prefs.getString('theme_mode_preference');
    if (modeString == null) return ThemeMode.system;
    
    switch (modeString) {
      case 'ThemeMode.light':
        return ThemeMode.light;
      case 'ThemeMode.dark':
        return ThemeMode.dark;
      case 'ThemeMode.system':
        return ThemeMode.system;
      default:
        return ThemeMode.system;
    }
  }
  
  Future<void> saveCustomThemeColors(Map<String, dynamic> colors) async {
    // Convert colors to string format for storage
    final colorStrings = colors.map((key, value) => MapEntry(
      key,
      value is Color ? value.value.toString() : value.toString(),
    ));
    await _prefs.setStringMap('custom_theme_colors', colorStrings);
  }
  
  Future<Map<String, dynamic>?> getCustomThemeColors() async {
    final colorStrings = _prefs.getStringMap('custom_theme_colors');
    if (colorStrings == null || colorStrings.isEmpty) return null;
    
    // Convert string values back to appropriate types
    return colorStrings.map((key, value) {
      try {
        if (value.startsWith('#')) {
          return MapEntry(key, int.parse(value.substring(1), radix: 16));
        } else if (value.startsWith('0x')) {
          return MapEntry(key, int.parse(value.substring(2), radix: 16));
        } else {
          return MapEntry(key, value);
        }
      } catch (e) {
        return MapEntry(key, value);
      }
    });
  }
  
  /// User Settings
  Future<void> saveFontSize(double size) async {
    await _prefs.setDouble('font_size', size);
  }
  
  Future<double> getFontSize() async {
    return _prefs.getDouble('font_size') ?? 16.0;
  }
  
  Future<void> saveMessageRetentionDays(int days) async {
    await _prefs.setInt('message_retention_days', days);
  }
  
  Future<int> getMessageRetentionDays() async {
    return _prefs.getInt('message_retention_days') ?? 7;
  }
  
  Future<void> saveShowOnlineStatus(bool show) async {
    await _prefs.setBool('show_online_status', show);
  }
  
  Future<bool> getShowOnlineStatus() async {
    return _prefs.getBool('show_online_status') ?? true;
  }
  
  Future<void> saveAllowContactsSync(bool allow) async {
    await _prefs.setBool('allow_contacts_sync', allow);
  }
  
  Future<bool> getAllowContactsSync() async {
    return _prefs.getBool('allow_contacts_sync') ?? false;
  }
  
  /// Anonymous Chat Limits
  Future<void> saveAnonymousMessagesCount(int count) async {
    await _prefs.setInt('anonymous_messages_count', count);
  }
  
  Future<int> getAnonymousMessagesCount() async {
    return _prefs.getInt('anonymous_messages_count') ?? 0;
  }
  
  Future<void> saveLastAnonymousReset(DateTime date) async {
    await _prefs.setString('last_anonymous_reset', date.toIso8601String());
  }
  
  Future<DateTime?> getLastAnonymousReset() async {
    final dateString = _prefs.getString('last_anonymous_reset');
    return dateString != null ? DateTime.parse(dateString) : null;
  }
  
  /// Notification Preferences
  Future<void> saveEnableSmartNotifications(bool enable) async {
    await _prefs.setBool('enable_smart_notifications', enable);
  }
  
  Future<bool> getEnableSmartNotifications() async {
    return _prefs.getBool('enable_smart_notifications') ?? true;
  }
  
  Future<void> saveNotificationSound(String sound) async {
    await _prefs.setString('notification_sound', sound);
  }
  
  Future<String?> getNotificationSound() async {
    return _prefs.getString('notification_sound') ?? 'default';
  }
  
  /// Privacy Settings
  Future<void> saveLastSeenVisibility(String visibility) async {
    await _prefs.setString('last_seen_visibility', visibility);
  }
  
  Future<String> getLastSeenVisibility() async {
    return _prefs.getString('last_seen_visibility') ?? 'everyone';
  }
  
  Future<void> saveProfilePhotoVisibility(String visibility) async {
    await _prefs.setString('profile_photo_visibility', visibility);
  }
  
  Future<String> getProfilePhotoVisibility() async {
    return _prefs.getString('profile_photo_visibility') ?? 'everyone';
  }
  
  /// Premium Status
  Future<void> savePremiumTier(String tier) async {
    await _prefs.setString('premium_tier', tier);
  }
  
  Future<String> getPremiumTier() async {
    return _prefs.getString('premium_tier') ?? 'free';
  }
  
  Future<void> saveSubscriptionExpiry(DateTime expiry) async {
    await _prefs.setString('subscription_expiry', expiry.toIso8601String());
  }
  
  Future<DateTime?> getSubscriptionExpiry() async {
    final expiryString = _prefs.getString('subscription_expiry');
    return expiryString != null ? DateTime.parse(expiryString) : null;
  }
  
  /// Cache Management
  Future<void> saveCachedUserData(Map<String, dynamic> userData) async {
    await _prefs.setString('cached_user_data', json.encode(userData));
  }
  
  Future<Map<String, dynamic>?> getCachedUserData() async {
    final userDataString = _prefs.getString('cached_user_data');
    if (userDataString == null) return null;
    
    try {
      return json.decode(userDataString) as Map<String, dynamic>;
    } catch (e) {
      return null;
    }
  }
  
  Future<void> clearCache() async {
    await _prefs.remove('cached_user_data');
    await _prefs.remove('search_history');
  }
  
  /// First Launch Detection
  Future<bool> isFirstLaunch() async {
    return _prefs.getBool('first_launch') ?? true;
  }
  
  Future<void> markAsNotFirstLaunch() async {
    await _prefs.setBool('first_launch', false);
  }
  
  /// Onboarding Completion
  Future<bool> isOnboardingComplete() async {
    return _prefs.getBool('onboarding_complete') ?? false;
  }
  
  Future<void> markOnboardingComplete() async {
    await _prefs.setBool('onboarding_complete', true);
  }
  
  /// Clear all preferences (for logout or reset)
  Future<void> clearAllPreferences() async {
    await _prefs.clear();
  }

  /// Content Moderation
  Future<void> saveLastToxicityWarning(DateTime date) async {
    await _prefs.setString('last_toxicity_warning', date.toIso8601String());
  }

  Future<DateTime?> getLastToxicityWarning() async {
    final dateString = _prefs.getString('last_toxicity_warning');
    return dateString != null ? DateTime.parse(dateString) : null;
  }

  Future<void> logUserReport(String reportKey, DateTime date) async {
    final reports = _prefs.getStringMap('user_reports') ?? {};
    reports[reportKey] = date.toIso8601String();
    await _prefs.setStringMap('user_reports', reports);
  }

  Future<bool> hasUserReported(String reportKey) async {
    final reports = _prefs.getStringMap('user_reports') ?? {};
    return reports.containsKey(reportKey);
  }
  
  /// TODO: Implement encrypted storage for sensitive data
  /// TODO: Add migration system for preference schema changes
  /// WARNING: Never store passwords or sensitive tokens in SharedPreferences
}
