/// @file lib/core/utils/handlers/error_catcher.dart
/// @brief Global error handling widget and utility functions
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file provides comprehensive error handling for the application.
/// It includes a global error boundary widget that catches unhandled exceptions,
/// logs them to Firebase Crashlytics, and displays user-friendly error messages.
/// It also provides utility functions for handling specific types of errors.

import 'dart:async';
import 'dart:io';
import 'dart:ui';

import 'package:chatly/core/constants/app_constants.dart';
import 'package:chatly/core/utils/handlers/toast_handler.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class ErrorCatcher extends StatefulWidget {
  final Widget child;
  final void Function(Object error, StackTrace stack)? onError;
  
  const ErrorCatcher({
    super.key,
    required this.child,
    this.onError,
  });
  
  static void initialize() {
    // Set up global error handlers
    FlutterError.onError = (FlutterErrorDetails details) {
      FirebaseCrashlytics.instance.recordFlutterError(details);
    };

    PlatformDispatcher.instance.onError = (error, stack) {
      FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
      return true;
    };
  }
  
  @override
  State<ErrorCatcher> createState() => _ErrorCatcherState();
}

class _ErrorCatcherState extends State<ErrorCatcher> {
  @override
  Widget build(BuildContext context) {
    return Builder(
      builder: (context) {
        return ErrorBoundary(
          onError: (error, stack) {
            _handleError(context, error, stack);
            if (widget.onError != null) {
              widget.onError!(error, stack);
            }
          },
          child: widget.child,
        );
      },
    );
  }
  
  void _handleError(BuildContext context, Object error, StackTrace stack) {
    // Log to Firebase Crashlytics
    FirebaseCrashlytics.instance.recordError(error, stack);

    // Show user-friendly error message
    final errorMessage = _getUserFriendlyErrorMessage(error);

    if (mounted) {
      ToastHandler.showError(context, errorMessage);
    }

    // Log error details in debug mode
    if (AppConstants.enableDebugLogging) {
      print('Error caught: $error');
      print('Stack trace: $stack');
    }
  }
  
  String _getUserFriendlyErrorMessage(Object error) {
    if (error is HttpException) {
      return 'Network error. Please check your internet connection.';
    } else if (error is SocketException) {
      return 'Connection failed. Please check your network.';
    } else if (error is TimeoutException) {
      return 'Request timed out. Please try again later.';
    } else if (error is FirebaseException) {
      return _getFirebaseErrorMessage(error);
    } else if (error is FormatException) {
      return 'Data format error. Please try again.';
    } else if (error is StateError) {
      return 'Application state error. Please restart the app.';
    } else if (error is ArgumentError) {
      return 'Invalid input. Please check your data.';
    } else if (error.toString().contains('database')) {
      return 'Database error. Please try again later.';
    } else if (error.toString().contains('auth')) {
      return 'Authentication error. Please log in again.';
    } else if (error.toString().contains('permission')) {
      return 'Permission denied. Please check your settings.';
    } else if (error.toString().contains('not found')) {
      return 'Requested item not found.';
    } else if (error.toString().contains('rate limit')) {
      return 'Too many requests. Please try again later.';
    } else {
      return 'Something went wrong. Please try again.';
    }
  }

  String _getFirebaseErrorMessage(FirebaseException error) {
    switch (error.code) {
      case 'permission-denied':
        return 'You don\'t have permission to perform this action.';
      case 'not-found':
        return 'The requested resource was not found.';
      case 'already-exists':
        return 'This item already exists.';
      case 'failed-precondition':
        return 'Operation failed. Please try again.';
      case 'cancelled':
        return 'Operation was cancelled.';
      case 'resource-exhausted':
        return 'Resource limit exceeded. Please try again later.';
      case 'deadline-exceeded':
        return 'Operation timed out. Please try again.';
      case 'invalid-argument':
        return 'Invalid input. Please check your data.';
      case 'unauthenticated':
        return 'Authentication required. Please log in again.';
      case 'unavailable':
        return 'Service unavailable. Please try again later.';
      case 'internal':
        return 'Internal server error. Please try again later.';
      default:
        return 'Firebase error: ${error.code}';
    }
  }

}

/// ErrorBoundary widget that catches errors in its subtree
class ErrorBoundary extends StatefulWidget {
  final Widget child;
  final void Function(Object error, StackTrace stack)? onError;
  
  const ErrorBoundary({
    super.key,
    required this.child,
    this.onError,
  });
  
  @override
  State<ErrorBoundary> createState() => _ErrorBoundaryState();
}

class _ErrorBoundaryState extends State<ErrorBoundary> {
  Object? _error;
  StackTrace? _stackTrace;
  
  @override
  void initState() {
    super.initState();
    _error = null;
    _stackTrace = null;
  }
  
  @override
  Widget build(BuildContext context) {
    if (_error != null) {
      return _buildErrorWidget(context);
    }
    
    return ErrorWidgetBuilder(
      onError: (error, stack) {
        setState(() {
          _error = error;
          _stackTrace = stack;
        });
        
        if (widget.onError != null) {
          widget.onError!(error, stack);
        }
      },
      child: widget.child,
    );
  }
  
  Widget _buildErrorWidget(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 64, color: Theme.of(context).colorScheme.error),
              const SizedBox(height: 16),
              Text(
                'Oops! Something went wrong',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  color: Theme.of(context).colorScheme.error,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'We apologize for the inconvenience. Please try refreshing the page or contact support if the issue persists.',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  setState(() {
                    _error = null;
                    _stackTrace = null;
                  });
                },
                child: const Text('Try Again'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// ErrorWidgetBuilder that catches errors during widget building
class ErrorWidgetBuilder extends StatefulWidget {
  final Widget child;
  final void Function(Object error, StackTrace stack) onError;
  
  const ErrorWidgetBuilder({
    super.key,
    required this.child,
    required this.onError,
  });
  
  @override
  State<ErrorWidgetBuilder> createState() => _ErrorWidgetBuilderState();
}

class _ErrorWidgetBuilderState extends State<ErrorWidgetBuilder> {
  @override
  Widget build(BuildContext context) {
    return Builder(
      builder: (context) {
        ErrorWidget.builder = (FlutterErrorDetails details) {
          widget.onError(details.exception, details.stack!);
          return const SizedBox.shrink();
        };
        
        return widget.child;
      },
    );
  }
}

/// Utility functions for error handling
class ErrorHandler {
  /// Handle async errors with fallback value
  static Future<T> handleAsyncError<T>(
    Future<T> Function() future,
    T fallbackValue,
  ) async {
    try {
      return await future();
    } catch (e, stack) {
      FirebaseCrashlytics.instance.recordError(e, stack);
      return fallbackValue;
    }
  }

  /// Handle async errors with custom handler
  static Future<T?> handleAsyncErrorWithHandler<T>(
    Future<T> Function() future,
    Function(Object error, StackTrace stack)? onError,
  ) async {
    try {
      return await future();
    } catch (e, stack) {
      FirebaseCrashlytics.instance.recordError(e, stack);
      if (onError != null) {
        onError(e, stack);
      }
      return null;
    }
  }
  
  /// Validate user input with error handling
  static String? validateInput(String? input, String fieldName, {required int minLength}) {
    if (input == null || input.isEmpty) {
      return '$fieldName cannot be empty';
    }
    if (input.length < minLength) {
      return '$fieldName must be at least $minLength characters long';
    }
    return null;
  }
  
  /// Handle network connectivity errors
  static void handleNetworkError(BuildContext context) {
    ToastHandler.showError(
      context,
      'No internet connection. Please check your network and try again.',
    );
  }

  /// Handle permission errors
  static void handlePermissionError(BuildContext context, String permissionName) {
    ToastHandler.showError(
      context,
      'Permission denied for $permissionName. Please enable it in settings.',
    );
  }
}

/// TODO: Implement error categorization for better analytics
/// TODO: Add user feedback collection for errors
/// TODO: Implement automatic error recovery for common issues
/// WARNING: Never expose sensitive information in error messages
