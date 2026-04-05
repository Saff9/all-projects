/// @file lib/data/models/message_model.dart
/// @brief Message data model for chat messages with comprehensive properties
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file defines the MessageModel class that represents chat messages in the
/// Chatly application. It includes message content, metadata, read receipts,
/// reactions, and provides methods for serialization, validation, and business logic.

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:equatable/equatable.dart';
import 'package:uuid/uuid.dart';

class MessageModel extends Equatable {
  final String messageId;
  final String chatId;
  final String senderId;
  final String text;
  final DateTime timestamp;
  final List<String> readBy;
  final DateTime expiresAt;
  final bool isEncrypted;
  final Map<String, List<String>> reactions;
  final bool isDeleted;
  final String? replyToMessageId;
  final String? forwardedFrom;
  final bool isAnonymous;
  
  const MessageModel({
    required this.messageId,
    required this.chatId,
    required this.senderId,
    required this.text,
    required this.timestamp,
    required this.readBy,
    required this.expiresAt,
    this.isEncrypted = true,
    this.reactions = const {},
    this.isDeleted = false,
    this.replyToMessageId,
    this.forwardedFrom,
    this.isAnonymous = false,
  });

  /// Generate new message ID
  static String generateId() {
    return const Uuid().v4();
  }

  /// Create MessageModel from Firestore document
  factory MessageModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    
    return MessageModel(
      messageId: doc.id,
      chatId: data['chatId'] ?? '',
      senderId: data['senderId'] ?? '',
      text: data['text'] ?? '',
      timestamp: (data['timestamp'] as Timestamp).toDate(),
      readBy: List<String>.from(data['readBy'] ?? []),
      expiresAt: (data['expiresAt'] as Timestamp).toDate(),
      isEncrypted: data['isEncrypted'] ?? true,
      reactions: _parseReactions(data['reactions']),
      isDeleted: data['isDeleted'] ?? false,
      replyToMessageId: data['replyToMessageId'],
      forwardedFrom: data['forwardedFrom'],
      isAnonymous: data['isAnonymous'] ?? false,
    );
  }

  /// Helper method to parse reactions from Firestore format
  static Map<String, List<String>> _parseReactions(dynamic reactionsData) {
    if (reactionsData == null || reactionsData is! Map) return {};
    
    return reactionsData.map((key, value) {
      if (value is List) {
        return MapEntry(key.toString(), List<String>.from(value));
      }
      return MapEntry(key.toString(), []);
    });
  }

  /// Convert MessageModel to Firestore data
  Map<String, dynamic> toFirestore() {
    return {
      'chatId': chatId,
      'senderId': senderId,
      'text': text,
      'timestamp': Timestamp.fromDate(timestamp),
      'readBy': readBy,
      'expiresAt': Timestamp.fromDate(expiresAt),
      'isEncrypted': isEncrypted,
      'reactions': reactions.map((key, value) => MapEntry(key, value)),
      'isDeleted': isDeleted,
      'replyToMessageId': replyToMessageId,
      'forwardedFrom': forwardedFrom,
      'isAnonymous': isAnonymous,
    };
  }

  /// Create copy with updated fields
  MessageModel copyWith({
    String? messageId,
    String? chatId,
    String? senderId,
    String? text,
    DateTime? timestamp,
    List<String>? readBy,
    DateTime? expiresAt,
    bool? isEncrypted,
    Map<String, List<String>>? reactions,
    bool? isDeleted,
    String? replyToMessageId,
    String? forwardedFrom,
    bool? isAnonymous,
  }) {
    return MessageModel(
      messageId: messageId ?? this.messageId,
      chatId: chatId ?? this.chatId,
      senderId: senderId ?? this.senderId,
      text: text ?? this.text,
      timestamp: timestamp ?? this.timestamp,
      readBy: readBy ?? this.readBy,
      expiresAt: expiresAt ?? this.expiresAt,
      isEncrypted: isEncrypted ?? this.isEncrypted,
      reactions: reactions ?? this.reactions,
      isDeleted: isDeleted ?? this.isDeleted,
      replyToMessageId: replyToMessageId ?? this.replyToMessageId,
      forwardedFrom: forwardedFrom ?? this.forwardedFrom,
      isAnonymous: isAnonymous ?? this.isAnonymous,
    );
  }

  /// Validate message content before sending
  List<String> validate({int maxLength = 100}) {
    final errors = <String>[];
    
    if (text.isEmpty) {
      errors.add('Message cannot be empty');
    } else if (text.length > maxLength) {
      errors.add('Message cannot exceed $maxLength characters');
    } else if (text.contains(RegExp(r'[\x00-\x1F\x7F]'))) {
      errors.add('Message contains invalid characters');
    }
    
    return errors;
  }

  /// Add reaction to message
  MessageModel addReaction(String emoji, String userId) {
    final updatedReactions = Map<String, List<String>>.from(reactions);
    
    if (updatedReactions.containsKey(emoji)) {
      if (!updatedReactions[emoji]!.contains(userId)) {
        updatedReactions[emoji] = [...updatedReactions[emoji]!, userId];
      }
    } else {
      updatedReactions[emoji] = [userId];
    }
    
    return copyWith(reactions: updatedReactions);
  }

  /// Remove reaction from message
  MessageModel removeReaction(String emoji, String userId) {
    final updatedReactions = Map<String, List<String>>.from(reactions);
    
    if (updatedReactions.containsKey(emoji)) {
      updatedReactions[emoji] = updatedReactions[emoji]!
          .where((id) => id != userId)
          .toList();
      
      if (updatedReactions[emoji]!.isEmpty) {
        updatedReactions.remove(emoji);
      }
    }
    
    return copyWith(reactions: updatedReactions);
  }

  /// Mark message as read by user
  MessageModel markAsRead(String userId) {
    if (readBy.contains(userId)) return this;
    
    return copyWith(readBy: [...readBy, userId]);
  }

  /// Check if message has been read by user
  bool isReadBy(String userId) {
    return readBy.contains(userId);
  }

  /// Check if message is expired
  bool get isExpired {
    return DateTime.now().isAfter(expiresAt);
  }

  /// Get message delivery status
  String getDeliveryStatus(String currentUserId) {
    if (isDeleted) return 'Deleted';
    if (isExpired) return 'Expired';
    if (readBy.contains(currentUserId)) return 'Read';
    return 'Sent';
  }

  /// Get formatted time for display
  String getFormattedTime() {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final messageDate = DateTime(timestamp.year, timestamp.month, timestamp.day);
    
    String timePart;
    final hour = timestamp.hour % 12 == 0 ? 12 : timestamp.hour % 12;
    final minute = timestamp.minute.toString().padLeft(2, '0');
    final period = timestamp.hour >= 12 ? 'PM' : 'AM';
    timePart = '$hour:$minute $period';
    
    if (messageDate.isAtSameMomentAs(today)) {
      return timePart;
    } else if (messageDate.isAtSameMomentAs(today.subtract(const Duration(days: 1)))) {
      return 'Yesterday $timePart';
    } else {
      final months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      return '${messageDate.day} ${months[messageDate.month - 1]} $timePart';
    }
  }

  /// Get message preview text (first 50 characters)
  String getPreviewText() {
    if (isDeleted) return 'Message deleted';
    return text.length > 50 ? '${text.substring(0, 50)}...' : text;
  }

  /// Check if message can be replied to
  bool canReply() {
    return !isDeleted && !isExpired && text.isNotEmpty;
  }

  /// Get reaction counts
  Map<String, int> getReactionCounts() {
    return reactions.map((emoji, userIds) => MapEntry(emoji, userIds.length));
  }

  /// Get user's reaction to this message
  String? getUserReaction(String userId) {
    for (final entry in reactions.entries) {
      if (entry.value.contains(userId)) {
        return entry.key;
      }
    }
    return null;
  }

  @override
  List<Object?> get props => [
    messageId,
    chatId,
    senderId,
    text,
    timestamp,
    readBy,
    expiresAt,
    isEncrypted,
    reactions,
    isDeleted,
    replyToMessageId,
    forwardedFrom,
    isAnonymous,
  ];

  @override
  bool get stringify => true;
}
