/// @file lib/router/route_generator.dart
/// @brief Custom route generator for named routing
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file implements a custom route generator that handles named routes
/// with proper transitions, error handling, and route validation. It supports
/// both simple routes and routes with parameters.

import 'package:chatly/core/constants/route_constants.dart';
import 'package:chatly/core/utils/handlers/error_catcher.dart';
import 'package:chatly/features/anonymous/presentation/screens/anonymous_feed_screen.dart';
import 'package:chatly/features/anonymous/presentation/screens/connection_request_screen.dart';
import 'package:chatly/features/anonymous/presentation/screens/post_anonymous_screen.dart';
import 'package:chatly/features/auth/presentation/screens/forgot_password_screen.dart';
import 'package:chatly/features/auth/presentation/screens/login_screen.dart';
import 'package:chatly/features/auth/presentation/screens/signup_screen.dart';
import 'package:chatly/features/auth/presentation/screens/username_setup_screen.dart';
import 'package:chatly/features/auth/presentation/screens/verify_otp_screen.dart';
import 'package:chatly/features/chat/presentation/screens/chat_list_screen.dart';
import 'package:chatly/features/chat/presentation/screens/chat_screen.dart';
import 'package:chatly/features/chat/presentation/screens/new_chat_screen.dart';
import 'package:chatly/features/groups/presentation/screens/create_group_screen.dart';
import 'package:chatly/features/groups/presentation/screens/groups_list_screen.dart';
import 'package:chatly/features/onboarding/presentation/screens/onboarding_screen.dart';
import 'package:chatly/features/onboarding/presentation/screens/splash_screen.dart';
import 'package:chatly/features/premium/presentation/screens/premium_screen.dart';
import 'package:chatly/features/settings/presentation/screens/settings_screen.dart';
import 'package:flutter/material.dart';

class RouteGenerator {
  static Route<dynamic> generateRoute(RouteSettings settings) {
    final args = settings.arguments;
    
    switch (settings.name) {
      case RouteConstants.splash:
        return _buildRoute(const SplashScreen());
      
      case RouteConstants.onboarding:
        return _buildRoute(const OnboardingScreen());
      
      case RouteConstants.login:
        return _buildRoute(const LoginScreen());
      
      case RouteConstants.signup:
        return _buildRoute(const SignupScreen());
      
      case RouteConstants.verifyOTP:
        return _buildRoute(const VerifyOTPScreen());
      
      case RouteConstants.usernameSetup:
        return _buildRoute(const UsernameSetupScreen());
      
      case RouteConstants.forgotPassword:
        return _buildRoute(const ForgotPasswordScreen());
      
      case RouteConstants.home:
      case RouteConstants.chatList:
        return _buildRoute(const ChatListScreen());
      
      case RouteConstants.chat:
        if (args is Map<String, dynamic> && args.containsKey('chatId')) {
          return _buildRoute(ChatScreen(chatId: args['chatId']));
        }
        return _errorRoute('Invalid chat ID');
      
      case RouteConstants.newChat:
        return _buildRoute(const NewChatScreen());
      
      case RouteConstants.anonymousFeed:
        return _buildRoute(const AnonymousFeedScreen());
      
      case RouteConstants.postAnonymous:
        return _buildRoute(const PostAnonymousScreen());
      
      case RouteConstants.connectionRequest:
        if (args is Map<String, dynamic> && args.containsKey('anonymousId')) {
          return _buildRoute(ConnectionRequestScreen(anonymousId: args['anonymousId']));
        }
        return _errorRoute('Invalid anonymous ID');
      
      case RouteConstants.groupsList:
        return _buildRoute(const GroupsListScreen());
      
      case RouteConstants.createGroup:
        return _buildRoute(const CreateGroupScreen());
      
      case RouteConstants.settings:
        return _buildRoute(const SettingsScreen());
      
      case RouteConstants.premiumScreen:
        return _buildRoute(const PremiumScreen());
      
      case RouteConstants.error:
        if (args is String) {
          return _buildRoute(ErrorScreen(errorMessage: args));
        }
        return _buildRoute(const ErrorScreen());
      
      default:
        return _errorRoute('Route not found: ${settings.name}');
    }
  }
  
  static Route<dynamic> _buildRoute(Widget screen) {
    return MaterialPageRoute(
      builder: (context) => ErrorCatcher(child: screen),
    );
  }
  
  static Route<dynamic> _errorRoute(String message) {
    return MaterialPageRoute(
      builder: (context) => ErrorScreen(errorMessage: message),
    );
  }
}

/// Error screen for route errors
class ErrorScreen extends StatelessWidget {
  final String? errorMessage;
  
  const ErrorScreen({super.key, this.errorMessage});
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Error')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error, size: 64, color: Theme.of(context).colorScheme.error),
              const SizedBox(height: 16),
              Text(
                errorMessage ?? 'An error occurred while navigating',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('Back'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
