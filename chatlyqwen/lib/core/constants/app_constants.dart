/// @file lib/core/constants/app_constants.dart
/// @brief Application-wide constants and configuration values
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file contains all the constants used throughout the application including
/// version information, API endpoints, default values, and configuration parameters.
/// Keeping constants centralized makes maintenance easier and ensures consistency.

class AppConstants {
  // App metadata
  static const String appName = 'Chatly';
  static const String appVersion = '1.0.0';
  static const String buildNumber = '1';
  
  // Firebase configuration
  static const int maxSignupsPerIPPerDay = 3;
  static const int defaultMessageRetentionDays = 7;
  static const int maxGroupMembers = 25;
  
  // Message limits by tier
  static const Map<String, int> messageLimits = {
    'free': 200,
    'plus': 500,
    'pro': 1000,
  };
  
  static const Map<String, Map<String, dynamic>> anonymousLimits = {
    'free': {
      'messagesPerWeek': 3,
      'maxCharacters': 100,
    },
    'plus': {
      'messagesPerWeek': 10,
      'maxCharacters': 250,
    },
    'pro': {
      'messagesPerWeek': -1, // Unlimited
      'maxCharacters': 500,
    },
  };
  
  // Group creation limits by tier
  static const Map<String, int> groupCreationLimits = {
    'free': 0,
    'plus': 1,
    'pro': 2,
  };
  
  // Account deletion policies
  static const int minInactivityDaysForAutoDeletion = 40;
  static const int maxInactivityDaysForAutoDeletion = 70;
  static const int deletionRequestGracePeriodDays = 30;
  
  // Toxicity threshold for message filtering
  static const double toxicityThreshold = 0.7;
  
  // Algorithm thresholds
  static const double conversationHealthThreshold = 0.3;
  
  // Animation durations
  static const Duration animationDuration = Duration(milliseconds: 300);
  static const Duration quickAnimationDuration = Duration(milliseconds: 150);
  
  // Network timeouts
  static const Duration networkTimeout = Duration(seconds: 30);
  
  // Premium pricing
  static const double plusAnnualPrice = 199.0; // INR
  static const double proAnnualPrice = 299.0; // INR
  static const int freeTrialDays = 7; // For future implementation
  
  // External API endpoints
  static const String unsplashAPI = 'https://api.unsplash.com';
  static const String perspectiveAPI = 'https://commentanalyzer.googleapis.com';
  
  // Subscription identifiers
  static const String plusSubscriptionId = 'chatly_plus_annual';
  static const String proSubscriptionId = 'chatly_pro_annual';
  
  // Default settings
  static const String defaultTheme = 'light';
  static const double defaultFontSize = 16.0;
  static const bool defaultShowOnlineStatus = true;
  static const bool defaultAllowContactsSync = false;
  
  // Notification settings
  static const bool defaultEnableSmartNotifications = true;
  static const int lowBatteryThreshold = 20; // Percentage
  
  // Security settings
  static const int minimumPasswordLength = 8;
  static const Duration sessionTimeout = Duration(minutes: 30);
  
  // Debug flags - Set to false in production
  static const bool enableDebugLogging = false;
  static const bool enableMockData = false;
  
  /// Returns the appropriate limit based on user tier
  static int getMessageLimit(String tier) {
    return messageLimits[tier.toLowerCase()] ?? messageLimits['free']!;
  }
  
  /// Returns anonymous chat limits for a specific tier
  static Map<String, dynamic> getAnonymousLimits(String tier) {
    return anonymousLimits[tier.toLowerCase()] ?? anonymousLimits['free']!;
  }
  
  /// Returns group creation limit for a specific tier
  static int getGroupCreationLimit(String tier) {
    return groupCreationLimits[tier.toLowerCase()] ?? groupCreationLimits['free']!;
  }
  
  /// Validates if a tier is valid
  static bool isValidTier(String tier) {
    return ['free', 'plus', 'pro'].contains(tier.toLowerCase());
  }
  
  /// TODO: Add environment-specific constants for staging/production
  /// TODO: Implement feature flags system for gradual rollouts
}
