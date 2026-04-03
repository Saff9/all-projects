/// @file lib/core/di/injection_container.dart
/// @brief Dependency injection container for managing app dependencies
/// @author Chatly Development Team
/// @date 2026-01-13
///
/// This file implements a simple dependency injection container that manages
/// the creation and lifecycle of services, repositories, and use cases.
/// It ensures proper dependency management and allows for easy testing and mocking.

import 'package:chatly/core/providers/auth_provider.dart';
import 'package:chatly/core/services/algorithm_service.dart';
import 'package:chatly/core/services/encryption_service.dart';
import 'package:chatly/core/services/moderation_service.dart';
import 'package:chatly/data/datasources/firebase_datasource.dart';
import 'package:chatly/data/repositories/auth_repository.dart';
import 'package:chatly/data/repositories/chat_repository.dart';
import 'package:chatly/features/chat/domain/use_cases/send_message_use_case.dart';

/// Dependency injection container
class InjectionContainer {
  static final InjectionContainer _instance = InjectionContainer._internal();
  static InjectionContainer get instance => _instance;

  InjectionContainer._internal();

  // Singleton instances
  FirebaseDatasource? _firebaseDatasource;
  AuthRepository? _authRepository;
  ChatRepository? _chatRepository;
  AlgorithmService? _algorithmService;
  EncryptionService? _encryptionService;
  ModerationService? _moderationService;

  // Factories for non-singleton dependencies
  SendMessageUseCase createSendMessageUseCase(AuthProvider authProvider) {
    return SendMessageUseCase(
      chatRepository: getChatRepository(),
      authProvider: authProvider,
      encryptionService: getEncryptionService(),
      moderationService: getModerationService(),
      algorithmService: getAlgorithmService(),
    );
  }

  /// Get Firebase datasource instance
  FirebaseDatasource getFirebaseDatasource() {
    _firebaseDatasource ??= FirebaseDatasource();
    return _firebaseDatasource!;
  }

  /// Get Auth repository instance
  AuthRepository getAuthRepository() {
    _authRepository ??= AuthRepository();
    return _authRepository!;
  }

  /// Get Chat repository instance
  ChatRepository getChatRepository() {
    _chatRepository ??= ChatRepositoryImpl(
      getFirebaseDatasource(),
    );
    return _chatRepository!;
  }

  /// Get Algorithm service instance
  AlgorithmService getAlgorithmService() {
    _algorithmService ??= AlgorithmService();
    return _algorithmService!;
  }

  /// Get Encryption service instance
  EncryptionService getEncryptionService() {
    _encryptionService ??= EncryptionService();
    return _encryptionService!;
  }

  /// Get Moderation service instance
  ModerationService getModerationService() {
    _moderationService ??= ModerationService();
    return _moderationService!;
  }

  /// Reset all instances (useful for testing or logout)
  void reset() {
    _firebaseDatasource?.dispose();
    _firebaseDatasource = null;
    _authRepository = null;
    _chatRepository = null;
    _algorithmService?.dispose();
    _algorithmService = null;
    _encryptionService?.dispose();
    _encryptionService = null;
    _moderationService?.dispose();
    _moderationService = null;
  }
}