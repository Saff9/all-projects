/// @file test/features/chat/domain/use_cases/send_message_use_case_test.dart
/// @brief Unit tests for the send message use case with comprehensive test coverage
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file implements comprehensive unit tests for the SendMessageUseCase class.
/// It tests various scenarios including successful message sending, validation failures,
/// rate limiting, encryption errors, and edge cases. The tests use mock repositories
/// and services to isolate the use case logic and ensure robust error handling.

import 'package:chatly/core/constants/app_constants.dart';
import 'package:chatly/core/errors/exceptions.dart';
import 'package:chatly/core/providers/auth_provider.dart';
import 'package:chatly/core/services/algorithm_service.dart';
import 'package:chatly/core/services/encryption_service.dart';
import 'package:chatly/core/services/moderation_service.dart';
import 'package:chatly/data/models/chat_model.dart';
import 'package:chatly/data/models/message_model.dart';
import 'package:chatly/data/models/user_model.dart';
import 'package:chatly/data/repositories/chat_repository.dart';
import 'package:chatly/features/chat/domain/use_cases/send_message_use_case.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';

class MockChatRepository extends Mock implements ChatRepository {}
class MockAuthProvider extends Mock implements AuthProvider {}
class MockEncryptionService extends Mock implements EncryptionService {}
class MockModerationService extends Mock implements ModerationService {}
class MockAlgorithmService extends Mock implements AlgorithmService {}

void main() {
  late SendMessageUseCase useCase;
  late MockChatRepository mockChatRepository;
  late MockAuthProvider mockAuthProvider;
  late MockEncryptionService mockEncryptionService;
  late MockModerationService mockModerationService;
  late MockAlgorithmService mockAlgorithmService;
  late User mockUser;
  late UserModel mockUserModel;
  late ChatModel mockChat;
  
  setUp(() {
    mockChatRepository = MockChatRepository();
    mockAuthProvider = MockAuthProvider();
    mockEncryptionService = MockEncryptionService();
    mockModerationService = MockModerationService();
    mockAlgorithmService = MockAlgorithmService();
    
    mockUser = User(
      uid: 'test_user',
      email: 'test@example.com',
      emailVerified: true,
      isAnonymous: false,
      providerData: [],
      metadata: UserMetadata(DateTime.now().toString(), DateTime.now().toString()),
    );
    
    mockUserModel = UserModel(
      uid: 'test_user',
      email: 'test@example.com',
      username: 'testuser',
      tier: 'free',
      createdAt: DateTime.now().subtract(const Duration(days: 30)),
      lastSeen: DateTime.now(),
      settings: {
        'theme': 'light',
        'fontSize': '16.0',
        'retentionDays': '7',
        'showOnlineStatus': 'true',
        'allowContactsSync': 'false',
      },
      limits: {
        'anonymousThisWeek': '0',
        'messagesToday': '0',
        'groupsCreated': '0',
      },
    );
    
    mockChat = ChatModel(
      chatId: 'test_chat',
      participantIds: ['test_user', 'other_user'],
      chatName: 'Test Chat',
      createdAt: DateTime.now().subtract(const Duration(days: 1)),
      lastMessageAt: DateTime.now().subtract(const Duration(hours: 1)),
      lastMessageText: 'Hello',
      lastMessageSenderId: 'other_user',
      isGroup: false,
      settings: {
        'messageRetentionDays': '7',
      },
    );
    
    useCase = SendMessageUseCase(
      chatRepository: mockChatRepository,
      authProvider: mockAuthProvider,
      encryptionService: mockEncryptionService,
      moderationService: mockModerationService,
      algorithmService: mockAlgorithmService,
    );
  });
  
  group('SendMessageUseCase', () {
    test('should throw AuthenticationException when user is not authenticated', () async {
      when(mockAuthProvider.isAuthenticated).thenReturn(false);
      when(mockAuthProvider.currentUser).thenReturn(null);
      
      expect(
        () => useCase.execute(chatId: 'test_chat', text: 'Hello'),
        throwsA(isA<AuthenticationException>()),
      );
    });
    
    test('should throw AuthenticationException when user profile is not found', () async {
      when(mockAuthProvider.isAuthenticated).thenReturn(true);
      when(mockAuthProvider.currentUser).thenReturn(mockUser);
      when(mockAuthProvider.userProfile).thenReturn(null);
      
      expect(
        () => useCase.execute(chatId: 'test_chat', text: 'Hello'),
        throwsA(isA<AuthenticationException>()),
      );
    });
    
    test('should throw RateLimitException when daily message limit is exceeded', () async {
      when(mockAuthProvider.isAuthenticated).thenReturn(true);
      when(mockAuthProvider.currentUser).thenReturn(mockUser);
      when(mockAuthProvider.userProfile).thenReturn(mockUserModel.copyWith(
        limits: {'messagesToday': AppConstants.getMessageLimit('free').toString()},
      ));
      
      expect(
        () => useCase.execute(chatId: 'test_chat', text: 'Hello'),
        throwsA(isA<RateLimitException>()),
      );
    });
    
    test('should throw NotFoundException when chat is not found', () async {
      when(mockAuthProvider.isAuthenticated).thenReturn(true);
      when(mockAuthProvider.currentUser).thenReturn(mockUser);
      when(mockAuthProvider.userProfile).thenReturn(mockUserModel);
      when(mockChatRepository.getChatById('non_existent_chat')).thenThrow(
        FirebaseException(code: 'not-found', message: 'Chat not found'),
      );
      
      expect(
        () => useCase.execute(chatId: 'non_existent_chat', text: 'Hello'),
        throwsA(isA<NotFoundException>()),
      );
    });
    
    test('should throw PermissionException when user is not a participant', () async {
      final otherChat = mockChat.copyWith(participantIds: ['other_user', 'third_user']);
      
      when(mockAuthProvider.isAuthenticated).thenReturn(true);
      when(mockAuthProvider.currentUser).thenReturn(mockUser);
      when(mockAuthProvider.userProfile).thenReturn(mockUserModel);
      when(mockChatRepository.getChatById('test_chat')).thenReturn(otherChat);
      
      expect(
        () => useCase.execute(chatId: 'test_chat', text: 'Hello'),
        throwsA(isA<PermissionException>()),
      );
    });
    
    test('should throw ValidationException for empty message', () async {
      when(mockAuthProvider.isAuthenticated).thenReturn(true);
      when(mockAuthProvider.currentUser).thenReturn(mockUser);
      when(mockAuthProvider.userProfile).thenReturn(mockUserModel);
      when(mockChatRepository.getChatById('test_chat')).thenReturn(mockChat);
      when(mockModerationService.sanitizeMessage('')).thenThrow(
        ValidationException('Message cannot be empty'),
      );
      
      expect(
        () => useCase.execute(chatId: 'test_chat', text: ''),
        throwsA(isA<ValidationException>()),
      );
    });
    
    test('should throw ValidationException for message exceeding length limit', () async {
      final longMessage = 'a' * 501;
      
      when(mockAuthProvider.isAuthenticated).thenReturn(true);
      when(mockAuthProvider.currentUser).thenReturn(mockUser);
      when(mockAuthProvider.userProfile).thenReturn(mockUserModel);
      when(mockChatRepository.getChatById('test_chat')).thenReturn(mockChat);
      when(mockModerationService.sanitizeMessage(longMessage)).thenThrow(
        ValidationException('Message exceeds maximum length of 500 characters'),
      );
      
      expect(
        () => useCase.execute(chatId: 'test_chat', text: longMessage),
        throwsA(isA<ValidationException>()),
      );
    });
    
    test('should throw ModerationException for toxic content', () async {
      when(mockAuthProvider.isAuthenticated).thenReturn(true);
      when(mockAuthProvider.currentUser).thenReturn(mockUser);
      when(mockAuthProvider.userProfile).thenReturn(mockUserModel);
      when(mockChatRepository.getChatById('test_chat')).thenReturn(mockChat);
      when(mockModerationService.sanitizeMessage('toxic message')).thenThrow(
        ModerationException('Message appears toxic', code: 'TOXIC_CONTENT', toxicityScore: 0.8),
      );
      
      expect(
        () => useCase.execute(chatId: 'test_chat', text: 'toxic message'),
        throwsA(isA<ModerationException>()),
      );
    });
    
    test('should successfully send a valid message', () async {
      when(mockAuthProvider.isAuthenticated).thenReturn(true);
      when(mockAuthProvider.currentUser).thenReturn(mockUser);
      when(mockAuthProvider.userProfile).thenReturn(mockUserModel);
      when(mockChatRepository.getChatById('test_chat')).thenReturn(mockChat);
      when(mockModerationService.sanitizeMessage('Hello')).thenReturn('Hello');
      when(mockChatRepository.createBatch()).thenReturn(MockBatch());
      when(mockChatRepository.saveMessage(any, batch: any)).thenAnswer((_) async {});
      when(mockChatRepository.updateChat(any, batch: any)).thenAnswer((_) async {});
      
      final message = await useCase.execute(chatId: 'test_chat', text: 'Hello');
      
      expect(message.text, 'Hello');
      expect(message.senderId, 'test_user');
      expect(message.chatId, 'test_chat');
      verify(mockChatRepository.saveMessage(any, batch: any)).called(1);
      verify(mockChatRepository.updateChat(any, batch: any)).called(1);
    });
    
    test('should handle encryption errors gracefully', () async {
      when(mockAuthProvider.isAuthenticated).thenReturn(true);
      when(mockAuthProvider.currentUser).thenReturn(mockUser);
      when(mockAuthProvider.userProfile).thenReturn(mockUserModel);
      when(mockChatRepository.getChatById('test_chat')).thenReturn(mockChat.copyWith(isEncrypted: true));
      when(mockModerationService.sanitizeMessage('Hello')).thenReturn('Hello');
      when(mockEncryptionService.encryptMessage(message: anyNamed('message'), recipientIds: anyNamed('recipientIds'))).thenThrow(
        EncryptionException('Encryption failed'),
      );
      
      expect(
        () => useCase.execute(chatId: 'test_chat', text: 'Hello'),
        throwsA(isA<SecurityException>()),
      );
    });
    
    test('should handle database errors during message saving', () async {
      when(mockAuthProvider.isAuthenticated).thenReturn(true);
      when(mockAuthProvider.currentUser).thenReturn(mockUser);
      when(mockAuthProvider.userProfile).thenReturn(mockUserModel);
      when(mockChatRepository.getChatById('test_chat')).thenReturn(mockChat);
      when(mockModerationService.sanitizeMessage('Hello')).thenReturn('Hello');
      when(mockChatRepository.createBatch()).thenReturn(MockBatch());
      when(mockChatRepository.saveMessage(any, batch: any)).thenThrow(
        DatabaseException('Database error'),
      );
      
      expect(
        () => useCase.execute(chatId: 'test_chat', text: 'Hello'),
        throwsA(isA<DatabaseException>()),
      );
    });
    
    test('should increment message count after successful send', () async {
      when(mockAuthProvider.isAuthenticated).thenReturn(true);
      when(mockAuthProvider.currentUser).thenReturn(mockUser);
      when(mockAuthProvider.userProfile).thenReturn(mockUserModel);
      when(mockChatRepository.getChatById('test_chat')).thenReturn(mockChat);
      when(mockModerationService.sanitizeMessage('Hello')).thenReturn('Hello');
      when(mockChatRepository.createBatch()).thenReturn(MockBatch());
      when(mockChatRepository.saveMessage(any, batch: any)).thenAnswer((_) async {});
      when(mockChatRepository.updateChat(any, batch: any)).thenAnswer((_) async {});
      when(mockAuthProvider.updateUserProfile(any)).thenAnswer((_) async {});
      
      await useCase.execute(chatId: 'test_chat', text: 'Hello');
      
      verify(mockAuthProvider.updateUserProfile(any)).called(1);
    });
    
    test('should handle anonymous chat joining correctly', () async {
      final anonymousChat = mockChat.copyWith(
        chatId: 'anonymous_chat',
        isAnonymous: true,
        participantIds: ['other_user'],
      );
      
      when(mockAuthProvider.isAuthenticated).thenReturn(true);
      when(mockAuthProvider.currentUser).thenReturn(mockUser);
      when(mockAuthProvider.userProfile).thenReturn(mockUserModel);
      when(mockChatRepository.getChatById('anonymous_chat')).thenReturn(anonymousChat);
      when(mockChatRepository.addParticipantToChat('anonymous_chat', 'test_user')).thenAnswer((_) async {});
      when(mockChatRepository.getChatById('anonymous_chat')).thenReturn(anonymousChat.copyWith(
        participantIds: ['other_user', 'test_user'],
      ));
      when(mockModerationService.sanitizeMessage('Hello')).thenReturn('Hello');
      when(mockChatRepository.createBatch()).thenReturn(MockBatch());
      when(mockChatRepository.saveMessage(any, batch: any)).thenAnswer((_) async {});
      when(mockChatRepository.updateChat(any, batch: any)).thenAnswer((_) async {});
      
      final message = await useCase.execute(chatId: 'anonymous_chat', text: 'Hello');
      
      expect(message.text, 'Hello');
      verify(mockChatRepository.addParticipantToChat('anonymous_chat', 'test_user')).called(1);
    });
  });
}

class MockBatch {
  Future<void> commit() async {}
}
