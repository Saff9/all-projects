/// @file lib/data/models/chat_model.dart
/// @brief Chat data model for individual and group chats
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file defines the ChatModel class that represents chat conversations
/// in the Chatly application. It supports both 1-to-1 chats and group chats,
/// with comprehensive properties for chat metadata, participants, and settings.

import 'package:chatly/data/models/message_model.dart';
import 'package:chatly/data/models/user_model.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:equatable/equatable.dart';
import 'package:uuid/uuid.dart';

class ChatModel extends Equatable {
  final String chatId;
  final List<String> participantIds;
  final String chatName;
  final String? chatPhoto;
  final DateTime createdAt;
  final DateTime lastMessageAt;
  final String lastMessageText;
  final String lastMessageSenderId;
  final bool isGroup;
  final Map<String, dynamic> settings;
  final String? createdBy;
  final int maxParticipants;
  final bool isAnonymous;
  final bool isEncrypted;
  final List<String> topicTags;

  const ChatModel({
    required this.chatId,
    required this.participantIds,
    required this.chatName,
    this.chatPhoto,
    required this.createdAt,
    required this.lastMessageAt,
    required this.lastMessageText,
    required this.lastMessageSenderId,
    this.isGroup = false,
    this.settings = const {
      'notificationSound': 'default',
      'muteNotifications': 'false',
      'messageRetentionDays': '7',
    },
    this.createdBy,
    this.maxParticipants = 25,
    this.isAnonymous = false,
    this.isEncrypted = true,
    this.topicTags = const [],
  });

  /// Generate new chat ID
  static String generateId() {
    return const Uuid().v4();
  }

  /// Create ChatModel from Firestore document
  factory ChatModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    
    return ChatModel(
      chatId: doc.id,
      participantIds: List<String>.from(data['participantIds'] ?? []),
      chatName: data['chatName'] ?? '',
      chatPhoto: data['chatPhoto'],
      createdAt: (data['createdAt'] as Timestamp).toDate(),
      lastMessageAt: (data['lastMessageAt'] as Timestamp).toDate(),
      lastMessageText: data['lastMessageText'] ?? '',
      lastMessageSenderId: data['lastMessageSenderId'] ?? '',
      isGroup: data['isGroup'] ?? false,
      settings: Map<String, dynamic>.from(data['settings'] ?? {}),
      createdBy: data['createdBy'],
      maxParticipants: data['maxParticipants'] ?? (data['isGroup'] == true ? 25 : 2),
      isAnonymous: data['isAnonymous'] ?? false,
      topicTags: List<String>.from(data['topicTags'] ?? []),
    );
  }

  /// Convert ChatModel to Firestore data
  Map<String, dynamic> toFirestore() {
    return {
      'participantIds': participantIds,
      'chatName': chatName,
      'chatPhoto': chatPhoto,
      'createdAt': Timestamp.fromDate(createdAt),
      'lastMessageAt': Timestamp.fromDate(lastMessageAt),
      'lastMessageText': lastMessageText,
      'lastMessageSenderId': lastMessageSenderId,
      'isGroup': isGroup,
      'settings': settings,
      'createdBy': createdBy,
      'maxParticipants': maxParticipants,
      'isAnonymous': isAnonymous,
      'isEncrypted': isEncrypted,
      'topicTags': topicTags,
    };
  }

  /// Create copy with updated fields
  ChatModel copyWith({
    String? chatId,
    List<String>? participantIds,
    String? chatName,
    String? chatPhoto,
    DateTime? createdAt,
    DateTime? lastMessageAt,
    String? lastMessageText,
    String? lastMessageSenderId,
    bool? isGroup,
    Map<String, dynamic>? settings,
    String? createdBy,
    int? maxParticipants,
    bool? isAnonymous,
    List<String>? topicTags,
  }) {
    return ChatModel(
      chatId: chatId ?? this.chatId,
      participantIds: participantIds ?? this.participantIds,
      chatName: chatName ?? this.chatName,
      chatPhoto: chatPhoto ?? this.chatPhoto,
      createdAt: createdAt ?? this.createdAt,
      lastMessageAt: lastMessageAt ?? this.lastMessageAt,
      lastMessageText: lastMessageText ?? this.lastMessageText,
      lastMessageSenderId: lastMessageSenderId ?? this.lastMessageSenderId,
      isGroup: isGroup ?? this.isGroup,
      settings: settings ?? this.settings,
      createdBy: createdBy ?? this.createdBy,
      maxParticipants: maxParticipants ?? this.maxParticipants,
      isAnonymous: isAnonymous ?? this.isAnonymous,
      topicTags: topicTags ?? this.topicTags,
    );
  }

  /// Validate chat data before creation
  List<String> validate() {
    final errors = <String>[];
    
    if (participantIds.isEmpty) {
      errors.add('Chat must have at least one participant');
    }
    
    if (isGroup && participantIds.length > maxParticipants) {
      errors.add('Group cannot exceed $maxParticipants participants');
    }
    
    if (chatName.isEmpty && !isAnonymous) {
      errors.add('Chat name cannot be empty');
    }
    
    if (isGroup && chatName.length > 50) {
      errors.add('Group name cannot exceed 50 characters');
    }
    
    return errors;
  }

  /// Check if user is a participant in this chat
  bool isParticipant(String userId) {
    return participantIds.contains(userId);
  }

  /// Check if chat is muted for a user
  bool isMuted(String userId) {
    // In a real app, this would be stored per user
    return settings['muteNotifications'] == 'true';
  }

  /// Get chat type display text
  String getChatTypeText() {
    if (isAnonymous) return 'Anonymous';
    if (isGroup) return 'Group';
    return 'Chat';
  }

  /// Get participants count
  int getParticipantsCount() {
    return participantIds.length;
  }

  /// Check if chat is full (for groups)
  bool get isFull {
    return isGroup && participantIds.length >= maxParticipants;
  }

  /// Get chat retention days
  int getMessageRetentionDays() {
    try {
      return int.parse(settings['messageRetentionDays'] ?? '7');
    } catch (e) {
      return 7;
    }
  }

  /// Check if notifications are enabled
  bool getNotificationsEnabled() {
    return settings['muteNotifications'] != 'true';
  }

  /// Get chat health score (for groups)
  double calculateHealthScore(List<MessageModel> messages) {
    if (!isGroup || messages.isEmpty) return 1.0;
    
    // This is a simplified version - real implementation would be more complex
    final activeParticipants = messages
        .where((m) => !m.isDeleted && !m.isExpired)
        .map((m) => m.senderId)
        .toSet()
        .length;
    
    final participationRate = activeParticipants / participantIds.length;
    final messageCount = messages.length;
    final responseTime = _calculateAverageResponseTime(messages);
    
    // Simple weighted calculation
    return (participationRate * 0.4) + 
           (messageCount > 10 ? 0.3 : messageCount / 10 * 0.3) + 
           ((1 - responseTime) * 0.3);
  }

  /// Calculate average response time between messages
  double _calculateAverageResponseTime(List<MessageModel> messages) {
    if (messages.length < 2) return 0.5;
    
    messages.sort((a, b) => a.timestamp.compareTo(b.timestamp));
    
    var totalTime = Duration.zero;
    var responseCount = 0;
    
    for (var i = 1; i < messages.length; i++) {
      final timeDiff = messages[i].timestamp.difference(messages[i-1].timestamp);
      if (timeDiff.inMinutes < 60) { // Only count responses within 1 hour
        totalTime += timeDiff;
        responseCount++;
      }
    }
    
    if (responseCount == 0) return 0.5;
    
    final avgMinutes = totalTime.inMinutes / responseCount;
    // Normalize to 0-1 scale (0 = instant response, 1 = very slow)
    return avgMinutes.clamp(0, 60) / 60;
  }

  /// Get formatted last message time
  String getFormattedLastMessageTime() {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final messageDate = DateTime(lastMessageAt.year, lastMessageAt.month, lastMessageAt.day);
    
    if (messageDate.isAtSameMomentAs(today)) {
      final hour = lastMessageAt.hour % 12 == 0 ? 12 : lastMessageAt.hour % 12;
      final minute = lastMessageAt.minute.toString().padLeft(2, '0');
      final period = lastMessageAt.hour >= 12 ? 'PM' : 'AM';
      return '$hour:$minute $period';
    } else if (messageDate.isAtSameMomentAs(today.subtract(const Duration(days: 1)))) {
      return 'Yesterday';
    } else {
      final months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      return '${messageDate.day} ${months[messageDate.month - 1]}';
    }
  }

  /// Check if chat needs attention (unread messages, mentions, etc.)
  bool needsAttention(String currentUserId, int unreadCount) {
    return unreadCount > 0 && !isMuted(currentUserId);
  }

  /// Get display name for chat (simpler name for 1-to-1 chats)
  String getDisplayName(List<UserModel> participants) {
    if (isAnonymous) return 'Anonymous Chat';
    if (!isGroup && participants.length == 2) {
      final otherUser = participants.firstWhere((u) => u.uid != participants.first.uid);
      return otherUser.getDisplayName();
    }
    return chatName;
  }

  @override
  List<Object?> get props => [
    chatId,
    participantIds,
    chatName,
    chatPhoto,
    createdAt,
    lastMessageAt,
    lastMessageText,
    lastMessageSenderId,
    isGroup,
    settings,
    createdBy,
    maxParticipants,
    isAnonymous,
    topicTags,
  ];

  @override
  bool get stringify => true;
}
