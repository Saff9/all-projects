/// @file lib/core/errors/exceptions.dart
/// @brief Custom exception classes for comprehensive error handling
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file defines custom exception classes for different types of errors
/// that can occur in the Chatly application. Each exception type represents
/// a specific category of errors and provides meaningful error messages
/// for debugging and user feedback. The exceptions are designed to work
/// with the global error handling system and Firebase Crashlytics.

import 'package:firebase_auth/firebase_auth.dart';

class ChatlyException implements Exception {
  final String message;
  final String? code;
  final StackTrace? stackTrace;
  
  ChatlyException(this.message, {this.code, this.stackTrace});
  
  @override
  String toString() {
    return 'ChatlyException(code: $code, message: $message)${stackTrace != null ? '\n$stackTrace' : ''}';
  }
}

class AuthenticationException extends ChatlyException {
  AuthenticationException(String message, {String? code, StackTrace? stackTrace})
      : super(message, code: code ?? 'AUTH_ERROR', stackTrace: stackTrace);
}

class NetworkException extends ChatlyException {
  NetworkException(String message, {String? code, StackTrace? stackTrace})
      : super(message, code: code ?? 'NETWORK_ERROR', stackTrace: stackTrace);
}

class DatabaseException extends ChatlyException {
  DatabaseException(String message, {String? code, StackTrace? stackTrace})
      : super(message, code: code ?? 'DATABASE_ERROR', stackTrace: stackTrace);
}

class ValidationException extends ChatlyException {
  ValidationException(String message, {String? code, StackTrace? stackTrace})
      : super(message, code: code ?? 'VALIDATION_ERROR', stackTrace: stackTrace);
}

class PermissionException extends ChatlyException {
  PermissionException(String message, {String? code, StackTrace? stackTrace})
      : super(message, code: code ?? 'PERMISSION_ERROR', stackTrace: stackTrace);
}

class NotFoundException extends ChatlyException {
  NotFoundException(String message, {String? code, StackTrace? stackTrace})
      : super(message, code: code ?? 'NOT_FOUND_ERROR', stackTrace: stackTrace);
}

class RateLimitException extends ChatlyException {
  RateLimitException(String message, {String? code, StackTrace? stackTrace})
      : super(message, code: code ?? 'RATE_LIMIT_ERROR', stackTrace: stackTrace);
}

class TimeoutException extends ChatlyException {
  TimeoutException(String message, {String? code, StackTrace? stackTrace})
      : super(message, code: code ?? 'TIMEOUT_ERROR', stackTrace: stackTrace);
}

class SecurityException extends ChatlyException {
  SecurityException(String message, {String? code, StackTrace? stackTrace})
      : super(message, code: code ?? 'SECURITY_ERROR', stackTrace: stackTrace);
}

class StorageException extends ChatlyException {
  StorageException(String message, {String? code, StackTrace? stackTrace})
      : super(message, code: code ?? 'STORAGE_ERROR', stackTrace: stackTrace);
}

class PaymentException extends ChatlyException {
  PaymentException(String message, {String? code, StackTrace? stackTrace})
      : super(message, code: code ?? 'PAYMENT_ERROR', stackTrace: stackTrace);
}

class AnalyticsException extends ChatlyException {
  AnalyticsException(String message, {String? code, StackTrace? stackTrace})
      : super(message, code: code ?? 'ANALYTICS_ERROR', stackTrace: stackTrace);
}

// Helper function to convert Firebase exceptions to Chatly exceptions
ChatlyException convertFirebaseException(dynamic firebaseException) {
  if (firebaseException is FirebaseException) {
    switch (firebaseException.code) {
      case 'permission-denied':
        return PermissionException(firebaseException.message ?? 'Permission denied');
      case 'not-found':
        return NotFoundException(firebaseException.message ?? 'Resource not found');
      case 'network-request-failed':
        return NetworkException(firebaseException.message ?? 'Network request failed');
      case 'too-many-requests':
        return RateLimitException(firebaseException.message ?? 'Too many requests');
      case 'invalid-argument':
        return ValidationException(firebaseException.message ?? 'Invalid argument');
      case 'deadline-exceeded':
        return TimeoutException(firebaseException.message ?? 'Request timed out');
      case 'unavailable':
        return NetworkException(firebaseException.message ?? 'Service unavailable');
      case 'internal':
        return DatabaseException(firebaseException.message ?? 'Internal server error');
      default:
        return ChatlyException(firebaseException.message ?? 'Unknown Firebase error');
    }
  }
  
  return ChatlyException(firebaseException.toString());
}

// TODO: Add more specific exception types for business logic errors
// TODO: Implement exception hierarchy for better error categorization
// WARNING: Never expose sensitive information in exception messages
