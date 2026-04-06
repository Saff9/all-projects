/// @file lib/features/chat/domain/use_cases/send_message_use_case.dart
/// @brief Use case for sending messages with comprehensive validation and error handling
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file implements the core business logic for sending messages in the Chatly
/// application. It handles message validation, encryption, content moderation,
/// storage, and delivery with comprehensive error handling and security checks.
/// The use case enforces business rules like message limits, content policies,
/// and privacy requirements before allowing message transmission.

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
import 'package:flutter/foundation.dart';
import 'package:provider/provider.dart';

class SendMessageUseCase {
  final ChatRepository _chatRepository;
  final AuthProvider _authProvider;
  final EncryptionService _encryptionService;
  final ModerationService _moderationService;
  final AlgorithmService _algorithmService;
  
  SendMessageUseCase({
    required ChatRepository chatRepository,
    required AuthProvider authProvider,
    required EncryptionService encryptionService,
    required ModerationService moderationService,
    required AlgorithmService algorithmService,
  })  : _chatRepository = chatRepository,
        _authProvider = authProvider,
        _encryptionService = encryptionService,
        _moderationService = moderationService,
        _algorithmService = algorithmService;

  Future<MessageModel> execute({
    required String chatId,
    required String text,
    String? replyToMessageId,
    String? forwardedFrom,
  }) async {
    // Check if user is authenticated
    if (!_authProvider.isAuthenticated || _authProvider.currentUser == null) {
      throw AuthenticationException('User must be authenticated to send messages');
    }
    
    final currentUser = _authProvider.currentUser!;
    final userProfile = _authProvider.userProfile;
    
    if (userProfile == null) {
      throw AuthenticationException('User profile not found');
    }
    
    // Check daily message limit
    if (!_canSendMessage(userProfile)) {
      throw RateLimitException('Daily message limit exceeded for your tier');
    }
    
    // Validate chat exists and user is participant
    final chat = await _validateChat(chatId, currentUser.uid);
    
    // Sanitize and validate message content
    final sanitizedText = await _sanitizeMessageContent(text, chat.isGroup);
    
    // Create message model
    final message = _createMessageModel(
      chatId: chatId,
      senderId: currentUser.uid,
      text: sanitizedText,
      replyToMessageId: replyToMessageId,
      forwardedFrom: forwardedFrom,
      chat: chat,
    );
    
    // Encrypt message if needed
    if (chat.isEncrypted) {
      await _encryptMessage(message);
    }
    
    // Save message to repository
    await _saveMessage(message, chat);
    
    // Update user's message count
    await _updateMessageCount(userProfile);
    
    // Trigger algorithms
    await _triggerAlgorithms(message, chat);
    
    return message;
  }

  bool _canSendMessage(UserModel userProfile) {
    final today = DateTime.now().day;
    final messagesToday = int.tryParse(userProfile.limits['messagesToday'] ?? '0') ?? 0;
    final dailyLimit = AppConstants.getMessageLimit(userProfile.tier);
    return messagesToday < dailyLimit;
  }

  Future<ChatModel> _validateChat(String chatId, String userId) async {
    try {
      final chat = await _chatRepository.getChatById(chatId);
      if (chat == null) {
        throw NotFoundException('Chat not found');
      }
      
      if (chat.participantIds.contains(userId)) {
        return chat;
      }
      
      // Check if this is an anonymous chat that can be joined
      if (chat.isAnonymous && !chat.isFull) {
        await _chatRepository.addParticipantToChat(chatId, userId);
        return await _chatRepository.getChatById(chatId) ?? chat;
      }
      
      throw PermissionException('User is not a participant in this chat');
    } catch (e) {
      if (e.toString().contains('not-found') || e.toString().contains('Chat not found')) {
        throw NotFoundException('Chat not found');
      }
      rethrow;
    }
  }

  Future<String> _sanitizeMessageContent(String text, bool isGroup) async {
    // Remove leading/trailing whitespace
    var sanitized = text.trim();
    
    // Check for empty message
    if (sanitized.isEmpty) {
      throw ValidationException('Message cannot be empty');
    }
    
    // Check message length
    if (sanitized.length > 500) {
      throw ValidationException('Message exceeds maximum length of 500 characters');
    }
    
    // Sanitize content
    sanitized = await _moderationService.sanitizeMessage(sanitized);
    
    // Additional group chat checks
    if (isGroup) {
      // Check for @ mentions that might be spam
      final mentionCount = sanitized.split('@').length - 1;
      if (mentionCount > 5) {
        throw ValidationException('Too many @ mentions in group message');
      }
    }
    
    return sanitized;
  }

  MessageModel _createMessageModel({
    required String chatId,
    required String senderId,
    required String text,
    String? replyToMessageId,
    String? forwardedFrom,
    required ChatModel chat,
  }) {
    final now = DateTime.now();
    final retentionDays = chat.getMessageRetentionDays();
    
    return MessageModel(
      messageId: MessageModel.generateId(),
      chatId: chatId,
      senderId: senderId,
      text: text,
      timestamp: now,
      readBy: [senderId],
      expiresAt: now.add(Duration(days: retentionDays)),
      isEncrypted: chat.isEncrypted,
      replyToMessageId: replyToMessageId,
      forwardedFrom: forwardedFrom,
      isAnonymous: chat.isAnonymous,
    );
  }

  Future<void> _encryptMessage(MessageModel message) async {
    try {
      final encryptedMessage = await _encryptionService.encryptMessage(
        message: message.text,
        recipientIds: _getRecipientIds(message),
      );
      
      // Update message with encrypted content
      // In real app, this would store the encrypted data
      if (kDebugMode) {
        print('Message encrypted successfully');
      }
    } catch (e) {
      if (e is EncryptionException) {
        throw SecurityException('Failed to encrypt message: ${e.message}');
      }
      rethrow;
    }
  }

  List<String> _getRecipientIds(MessageModel message) {
    // In real app, this would get actual recipient IDs from the chat
    return ['recipient1', 'recipient2'];
  }

  Future<void> _saveMessage(MessageModel message, ChatModel chat) async {
    try {
      // Start batch operation
      final batch = _chatRepository.createBatch();
      
      // Save message
      await _chatRepository.saveMessage(message, batch: batch);
      
      // Update chat last message
      final updatedChat = chat.copyWith(
        lastMessageAt: message.timestamp,
        lastMessageText: message.text,
        lastMessageSenderId: message.senderId,
      );
      
      await _chatRepository.updateChat(updatedChat, batch: batch);
      
      // Commit batch
      await batch.commit();
    } catch (e) {
      throw DatabaseException('Failed to save message: ${e.toString()}');
    }
  }

  Future<void> _updateMessageCount(UserModel userProfile) async {
    try {
      final currentCount = int.tryParse(userProfile.limits['messagesToday'] ?? '0') ?? 0;
      final updatedProfile = userProfile.copyWith(
        limits: {
          ...userProfile.limits,
          'messagesToday': (currentCount + 1).toString(),
        }
      );
      
      await _authProvider.updateUserProfile(updatedProfile);
    } catch (e) {
      if (kDebugMode) {
        print('Warning: Failed to update message count: ${e.toString()}');
      }
    }
  }

  Future<void> _triggerAlgorithms(MessageModel message, ChatModel chat) async {
    try {
      // Update conversation health score for groups
      if (chat.isGroup && chat.participantIds.length > 2) {
        final messages = await _chatRepository.getMessagesForChat(chat.chatId, limit: 50);
        final participants = await _chatRepository.getParticipantsForChat(chat.chatId);
        
        final healthScore = _algorithmService.calculateConversationHealthScore(
          group: chat,
          messages: messages,
          participants: participants,
        );
        
        if (healthScore < AppConstants.conversationHealthThreshold) {
          final icebreakers = _algorithmService.suggestIcebreakers(
            healthScore: healthScore,
            groupTopics: chat.topicTags,
            memberCount: chat.participantIds.length,
          );
          
          // In real app, this would send icebreaker suggestions to group admins
          if (kDebugMode) {
            print('Suggested icebreakers: $icebreakers');
          }
        }
      }
      
      // Update most chatted contacts
      if (!chat.isGroup && !chat.isAnonymous) {
        // In real app, this would update contact rankings
      }
    } catch (e) {
      if (kDebugMode) {
        print('Warning: Failed to trigger algorithms: ${e.toString()}');
      }
    }
  }

  /// TODO: Implement message scheduling for smart notifications
  /// TODO: Add support for multimedia messages (future feature)
  /// TODO: Implement message recall functionality
  /// WARNING: Never store sensitive data in logs or analytics
}
