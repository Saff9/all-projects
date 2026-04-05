/// @file lib/data/repositories/chat_repository.dart
/// @brief Repository for chat-related operations
/// @author Chatly Development Team
/// @date 2025-12-08

import 'package:chatly/core/errors/exceptions.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:chatly/data/datasources/firebase_datasource.dart';
import 'package:chatly/data/models/chat_model.dart';
import 'package:chatly/data/models/message_model.dart';
import 'package:chatly/data/models/user_model.dart';

abstract class ChatRepository {
  Future<ChatModel?> getChatById(String chatId);
  Future<void> addParticipantToChat(String chatId, String userId);
  dynamic createBatch();
  Future<void> saveMessage(MessageModel message, {dynamic batch});
  Future<void> updateChat(ChatModel chat, {dynamic batch});
  Future<List<MessageModel>> getMessagesForChat(String chatId, {int limit});
  Future<List<UserModel>> getParticipantsForChat(String chatId);
}

class ChatRepositoryImpl implements ChatRepository {
  final FirebaseDatasource _firebaseDatasource;

  ChatRepositoryImpl(this._firebaseDatasource);

  @override
  Future<ChatModel?> getChatById(String chatId) async {
    try {
      final doc = await _firebaseDatasource.getDocument('chats', chatId).get();
      if (!doc.exists) return null;
      return ChatModel.fromFirestore(doc);
    } catch (e) {
      throw DatabaseException('Failed to get chat: ${e.toString()}');
    }
  }

  @override
  Future<void> addParticipantToChat(String chatId, String userId) async {
    try {
      final chatDoc = _firebaseDatasource.getDocument('chats', chatId);
      await chatDoc.update({
        'participantIds': FieldValue.arrayUnion([userId]),
      });
    } catch (e) {
      throw DatabaseException('Failed to add participant: ${e.toString()}');
    }
  }

  @override
  dynamic createBatch() {
    return _firebaseDatasource.createBatch();
  }

  @override
  Future<void> saveMessage(MessageModel message, {dynamic batch}) async {
    try {
      final messageData = message.toFirestore();
      final docRef = _firebaseDatasource.getDocument('messages', message.messageId);
      if (batch != null) {
        batch.set(docRef, messageData);
      } else {
        await docRef.set(messageData);
      }
    } catch (e) {
      throw DatabaseException('Failed to save message: ${e.toString()}');
    }
  }

  @override
  Future<void> updateChat(ChatModel chat, {dynamic batch}) async {
    try {
      final chatData = chat.toFirestore();
      final docRef = _firebaseDatasource.getDocument('chats', chat.chatId);
      if (batch != null) {
        batch.update(docRef, chatData);
      } else {
        await docRef.update(chatData);
      }
    } catch (e) {
      throw DatabaseException('Failed to update chat: ${e.toString()}');
    }
  }

  @override
  Future<List<MessageModel>> getMessagesForChat(String chatId, {int limit = 50}) async {
    try {
      final query = _firebaseDatasource.getCollection('messages')
          .where('chatId', isEqualTo: chatId)
          .orderBy('timestamp', descending: true)
          .limit(limit);
      final snapshot = await query.get();
      return snapshot.docs.map((doc) => MessageModel.fromFirestore(doc)).toList();
    } catch (e) {
      throw DatabaseException('Failed to get messages: ${e.toString()}');
    }
  }

  @override
  Future<List<UserModel>> getParticipantsForChat(String chatId) async {
    try {
      final chat = await getChatById(chatId);
      if (chat == null) return [];

      final participantIds = chat.participantIds;
      final participants = <UserModel>[];

      for (final uid in participantIds) {
        final userDoc = await _firebaseDatasource.getUserDocument(uid);
        if (userDoc.exists) {
          participants.add(UserModel.fromFirestore(userDoc));
        }
      }

      return participants;
    } catch (e) {
      throw DatabaseException('Failed to get participants: ${e.toString()}');
    }
  }
}