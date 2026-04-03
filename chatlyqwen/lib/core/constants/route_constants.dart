/// @file lib/core/constants/route_constants.dart
/// @brief Route names and navigation constants
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file defines all the route names used throughout the application for navigation.
/// Using constants for routes ensures consistency and makes it easier to refactor routes
/// without breaking navigation across the app.

class RouteConstants {
  // Authentication routes
  static const String splash = '/splash';
  static const String onboarding = '/onboarding';
  static const String login = '/login';
  static const String signup = '/signup';
  static const String verifyOTP = '/verify-otp';
  static const String usernameSetup = '/username-setup';
  static const String forgotPassword = '/forgot-password';
  
  // Main app routes
  static const String home = '/home';
  static const String chatList = '/chats';
  static const String chat = '/chat';
  static const String newChat = '/new-chat';
  
  // Anonymous chat routes
  static const String anonymousFeed = '/anonymous-feed';
  static const String postAnonymous = '/post-anonymous';
  static const String anonymousThread = '/anonymous-thread';
  static const String connectionRequest = '/connection-request';
  
  // Groups routes
  static const String groupsList = '/groups';
  static const String groupChat = '/group-chat';
  static const String createGroup = '/create-group';
  static const String groupInfo = '/group-info';
  
  // Settings routes
  static const String settings = '/settings';
  static const String themeSettings = '/settings/theme';
  static const String wallpaperSettings = '/settings/wallpaper';
  static const String notificationSettings = '/settings/notifications';
  static const String privacySettings = '/settings/privacy';
  static const String accountSettings = '/settings/account';
  static const String deleteAccount = '/settings/delete-account';
  
  // Premium routes
  static const String premiumScreen = '/premium';
  static const String subscriptionPlans = '/premium/plans';
  static const String paymentScreen = '/premium/payment';
  
  // Other routes
  static const String profile = '/profile';
  static const String search = '/search';
  static const String error = '/error';
  
  // Route parameters
  static const String chatIdParam = 'chatId';
  static const String userIdParam = 'userId';
  static const String groupIdParam = 'groupId';
  static const String messageIdParam = 'messageId';
  static const String anonymousIdParam = 'anonymousId';
  static const String fromParam = 'from';
  
  /// Returns route with parameters
  static String chatRoute(String chatId) {
    return '$chat/$chatId';
  }
  
  /// Returns group chat route with ID
  static String groupChatRoute(String groupId) {
    return '$groupChat/$groupId';
  }
  
  /// Returns anonymous thread route with ID
  static String anonymousThreadRoute(String anonymousId) {
    return '$anonymousThread/$anonymousId';
  }
  
  /// Returns settings route with section
  static String settingsRoute(String section) {
    return '$settings/$section';
  }
  
  /// Validates if a route exists in the app
  static bool isValidRoute(String route) {
    final validRoutes = [
      splash, onboarding, login, signup, verifyOTP, usernameSetup,
      forgotPassword, home, chatList, chat, newChat, anonymousFeed,
      postAnonymous, anonymousThread, connectionRequest, groupsList,
      groupChat, createGroup, groupInfo, settings, themeSettings,
      wallpaperSettings, notificationSettings, privacySettings,
      accountSettings, deleteAccount, premiumScreen, subscriptionPlans,
      paymentScreen, profile, search, error
    ];
    
    return validRoutes.contains(route) || 
           route.startsWith(chat) || 
           route.startsWith(groupChat) ||
           route.startsWith(anonymousThread) ||
           route.startsWith(settings);
  }
  
  /// TODO: Implement route guard middleware for authentication
  /// TODO: Add deep linking support for all routes
}
