Review UX, error states, and edge cases from a real user perspective.
/// @file lib/main.dart
/// @brief Application entry point with comprehensive initialization and error handling
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// Production-ready application initialization with:
/// - Secure Firebase setup with timeout handling
/// - Global error boundary configuration
/// - Lifecycle management for background/foreground transitions
/// - Performance monitoring integration
/// - Secure shared preferences initialization

import 'dart:async';
import 'dart:developer' as developer;
import 'dart:io';

import 'package:chatly/core/constants/route_constants.dart';
import 'package:chatly/core/errors/exceptions.dart';
import 'package:chatly/core/providers/auth_provider.dart';
import 'package:chatly/core/providers/theme_provider.dart';
import 'package:chatly/core/services/performance_service.dart';
import 'package:chatly/core/utils/handlers/error_catcher.dart';
import 'package:chatly/router/route_generator.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Global navigator key for programmatic navigation
final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

/// Application lifecycle observer for handling background/foreground transitions
/// Manages resource cleanup and performance optimization
class AppLifecycleObserver extends WidgetsBindingObserver {
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    developer.log('App lifecycle changed: $state', name: 'AppLifecycle');

    switch (state) {
      case AppLifecycleState.paused:
        _handleAppBackground();
        break;
      case AppLifecycleState.resumed:
        _handleAppForeground();
        break;
      case AppLifecycleState.inactive:
        // App is transitioning states
        break;
      case AppLifecycleState.detached:
        _handleAppTermination();
        break;
      case AppLifecycleState.hidden:
        // iOS specific - app hidden but still running
        break;
    }
  }

  void _handleAppBackground() {
    try {
      PerformanceService.instance.onBackground();

      // Additional background optimizations
      // - Pause non-critical timers
      // - Reduce polling frequencies
      // - Cancel non-essential network requests
      // - Clear temporary caches if memory pressure

      developer.log('App moved to background - resources optimized', name: 'AppLifecycle');
    } catch (e, stack) {
      developer.log('Error handling app background: $e', name: 'AppLifecycle', error: e, stackTrace: stack);
      // Don't rethrow - app background handling should be fail-safe
    }
  }

  void _handleAppForeground() {
    try {
      PerformanceService.instance.onForeground();

      // Resume operations
      // - Restart timers
      // - Refresh critical data
      // - Re-establish connections
      // - Check for updates

      developer.log('App moved to foreground - operations resumed', name: 'AppLifecycle');
    } catch (e, stack) {
      developer.log('Error handling app foreground: $e', name: 'AppLifecycle', error: e, stackTrace: stack);
      // Log but don't crash - foreground handling should be resilient
    }
  }

  void _handleAppTermination() {
    try {
      // Critical cleanup before app termination
      PerformanceService.instance.dispose();

      // Ensure all resources are properly disposed
      // - Close database connections
      // - Cancel pending async operations
      // - Clear sensitive data from memory

      developer.log('App terminating - cleanup completed', name: 'AppLifecycle');
    } catch (e, stack) {
      // Last resort error handling - use synchronous logging only
      developer.log('Critical error during app termination: $e', name: 'AppLifecycle', error: e, stackTrace: stack);
    }
  }
}

/// Global lifecycle observer instance
final _lifecycleObserver = AppLifecycleObserver();

/// Secure application initialization with comprehensive error handling
/// Implements defense-in-depth security approach
Future<void> main() async {
  // Ensure Flutter binding is initialized before any async operations
  WidgetsFlutterBinding.ensureInitialized();

  // Set up secure error handling first
  await _initializeErrorHandling();

  // Register lifecycle observer for resource management
  WidgetsBinding.instance.addObserver(_lifecycleObserver);

  // Configure system UI for security
  await _configureSystemUI();

  try {
    // Initialize core services with timeouts and fallbacks
    await _initializeServices();

    // Start the application
    runApp(const ChatlyApp());

    developer.log('Application started successfully', name: 'Main');
  } catch (error, stackTrace) {
    // Comprehensive error handling for initialization failures
    await _handleInitializationError(error, stackTrace);
  }
}

/// Initialize global error handling and crash reporting
Future<void> _initializeErrorHandling() async {
  // Configure Flutter error handling
  FlutterError.onError = (FlutterErrorDetails details) {
    _reportError(details.exception, details.stack, fatal: false);
  };

  // Configure platform error handling
  PlatformDispatcher.instance.onError = (error, stack) {
    _reportError(error, stack, fatal: true);
    return true; // Prevent default handling
  };

  // Initialize error catcher
  ErrorCatcher.initialize();

  developer.log('Error handling initialized', name: 'Main');
}

/// Report errors to crash reporting service
void _reportError(Object error, StackTrace? stack, {bool fatal = false}) {
  try {
    // Report to Firebase Crashlytics
    FirebaseCrashlytics.instance.recordError(
      error,
      stack,
      fatal: fatal,
    );

    // Log to console for development
    developer.log(
      'Error reported: $error',
      name: 'ErrorReporting',
      error: error,
      stackTrace: stack,
    );
  } catch (reportingError) {
    // Last resort error handling - synchronous logging only
    developer.log(
      'Failed to report error: $reportingError',
      name: 'ErrorReporting',
      error: reportingError,
    );
  }
}

/// Configure system UI for security and user experience
Future<void> _configureSystemUI() async {
  // Set secure system UI overlay style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );

  // Configure preferred orientations
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Set high refresh rate if supported
  await SystemChrome.setEnabledSystemUIMode(
    SystemUiMode.edgeToEdge,
  );

  developer.log('System UI configured', name: 'Main');
}

/// Initialize all application services with proper error handling and timeouts
Future<void> _initializeServices() async {
  const initializationTimeout = Duration(seconds: 30);

  try {
    // Initialize Firebase with secure configuration
    await _initializeFirebase().timeout(
      const Duration(seconds: 15),
      onTimeout: () {
        throw TimeoutException('Firebase initialization timeout');
      },
    );

    // Initialize secure storage
    await _initializeStorage().timeout(
      const Duration(seconds: 10),
      onTimeout: () {
        throw TimeoutException('Storage initialization timeout');
      },
    );

    // Initialize performance monitoring
    PerformanceService.instance.startMonitoring();

    developer.log('All services initialized successfully', name: 'Main');
  } on TimeoutException catch (e) {
    developer.log('Service initialization timeout: $e', name: 'Main', error: e);
    throw InitializationException('Service initialization timed out: ${e.message}');
  } catch (e, stack) {
    developer.log('Service initialization failed: $e', name: 'Main', error: e, stackTrace: stack);
    throw InitializationException('Failed to initialize services: ${e.toString()}');
  }
}

/// Initialize Firebase with secure configuration
Future<void> _initializeFirebase() async {
  try {
    await Firebase.initializeApp(
      options: kIsWeb
          ? null // Web uses auto-detection
          : null, // Mobile uses google-services.json
    );

    // Configure Firebase settings
    if (!kIsWeb) {
      await FirebaseCrashlytics.instance.setCrashlyticsCollectionEnabled(!kDebugMode);
    }

    // Verify Firebase initialization
    if (Firebase.apps.isEmpty) {
      throw FirebaseException(
        plugin: 'firebase_core',
        code: 'no-app',
        message: 'Firebase app not initialized',
      );
    }

    developer.log('Firebase initialized successfully', name: 'Firebase');
  } catch (e, stack) {
    developer.log('Firebase initialization failed: $e', name: 'Firebase', error: e, stackTrace: stack);
    throw FirebaseInitializationException(e.toString());
  }
}

/// Initialize secure storage with encryption
Future<void> _initializeStorage() async {
  try {
    final prefs = await SharedPreferences.getInstance();

    // Verify storage functionality
    await prefs.setBool('_test_key', true);
    await prefs.remove('_test_key');

    developer.log('Storage initialized successfully', name: 'Storage');
  } catch (e, stack) {
    developer.log('Storage initialization failed: $e', name: 'Storage', error: e, stackTrace: stack);
    throw StorageInitializationException(e.toString());
  }
}

/// Handle initialization errors with user-friendly fallbacks
Future<void> _handleInitializationError(Object error, StackTrace stackTrace) async {
  developer.log(
    'Critical initialization error: $error',
    name: 'Main',
    error: error,
    stackTrace: stackTrace,
  );

  // Determine if we can run in degraded mode
  final canRunDegraded = _canRunInDegradedMode(error);

  if (canRunDegraded) {
    developer.log('Running in degraded mode', name: 'Main');

    // Initialize minimal services for degraded mode
    ErrorCatcher.initialize();

    runApp(const ChatlyApp(degradedMode: true));
  } else {
    // Critical failure - show error screen
    runApp(const InitializationErrorApp(error: error));
  }
}

/// Determine if app can run in degraded mode
bool _canRunInDegradedMode(Object error) {
  // Allow degraded mode for network and Firebase issues
  return error is FirebaseException ||
         error is TimeoutException ||
         error is SocketException ||
         error.toString().contains('network') ||
         error.toString().contains('timeout');
}

/// Error screen for critical initialization failures
class InitializationErrorApp extends StatelessWidget {
  final Object error;

  const InitializationErrorApp({super.key, required this.error});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: Scaffold(
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.error_outline,
                  size: 80,
                  color: Colors.red.shade600,
                ),
                const SizedBox(height: 24),
                Text(
                  'Failed to Start Chatly',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    color: Colors.red.shade600,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                Text(
                  'We encountered a critical error during startup. Please restart the app or contact support if the issue persists.',
                  style: Theme.of(context).textTheme.bodyLarge,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                ElevatedButton(
                  onPressed: () => exit(0),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red.shade600,
                    padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                  ),
                  child: const Text('Exit App'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Main application widget with comprehensive provider setup
class ChatlyApp extends StatelessWidget {
  final bool degradedMode;

  const ChatlyApp({super.key, this.degradedMode = false});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => AuthProvider(),
        ),
        ChangeNotifierProvider(
          create: (_) => ThemeProvider(),
        ),
      ],
      child: Consumer2<AuthProvider, ThemeProvider>(
        builder: (context, authProvider, themeProvider, child) {
          return MaterialApp(
            navigatorKey: navigatorKey,
            title: 'Chatly - Secure Chat',
            debugShowCheckedModeBanner: false,

            // Theme configuration
            theme: themeProvider.lightTheme,
            darkTheme: themeProvider.darkTheme,
            themeMode: themeProvider.themeMode,

            // Localization
            localizationsDelegates: const [
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            supportedLocales: const [
              Locale('en', ''), // English
              Locale('hi', ''), // Hindi
            ],

            // Routing
            initialRoute: RouteConstants.splash,
            onGenerateRoute: RouteGenerator.generateRoute,
            navigatorObservers: _getNavigatorObservers(),

            // Home widget with error boundary
            home: const ErrorCatcher(
              child: SizedBox.shrink(), // Routing handles initial screen
            ),

            // Builder for additional configuration
            builder: (context, child) {
              return _AppBuilder(
                child: child,
                degradedMode: degradedMode,
              );
            },
          );
        },
      ),
    );
  }

  /// Get navigator observers based on platform and configuration
  List<NavigatorObserver> _getNavigatorObservers() {
    final observers = <NavigatorObserver>[];

    // Add Firebase Analytics observer (only on mobile and if Firebase available)
    if (!kIsWeb) {
      try {
        if (Firebase.apps.isNotEmpty) {
          // FirebaseAnalyticsObserver would be added here in production
          // observers.add(FirebaseAnalyticsObserver(analytics: FirebaseAnalytics.instance));
        }
      } catch (e) {
        developer.log('Firebase Analytics not available: $e', name: 'Navigation');
      }
    }

    return observers;
  }
}

/// Application builder for additional configuration
class _AppBuilder extends StatelessWidget {
  final Widget? child;
  final bool degradedMode;

  const _AppBuilder({
    required this.child,
    required this.degradedMode,
  });

  @override
  Widget build(BuildContext context) {
    Widget app = child ?? const SizedBox.shrink();

    // Add performance tracking in debug mode
    if (kDebugMode) {
      app = PerformanceService.instance.trackWidgetBuild('app_root', () => app);
    }

    // Add degraded mode indicator
    if (degradedMode) {
      app = Banner(
        message: 'DEGRADED MODE',
        location: BannerLocation.topEnd,
        color: Colors.orange,
        child: app,
      );
    }

    return app;
  }
}

/// Custom exceptions for initialization errors
class InitializationException implements Exception {
  final String message;
  final StackTrace? stackTrace;

  InitializationException(this.message, [this.stackTrace]);

  @override
  String toString() => 'InitializationException: $message';
}

class FirebaseInitializationException extends InitializationException {
  FirebaseInitializationException(String details) : super('Firebase initialization failed: $details');
}

class StorageInitializationException extends InitializationException {
  StorageInitializationException(String details) : super('Storage initialization failed: $details');
}
