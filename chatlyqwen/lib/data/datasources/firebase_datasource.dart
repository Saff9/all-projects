/// @file lib/data/datasources/firebase_datasource.dart
/// @brief Firebase data source implementing Firestore database operations
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file implements the FirebaseDatasource class that handles all Firestore
/// database operations for the Chatly application. It provides CRUD operations
/// for user profiles, messages, chats, and other application data with proper
/// error handling and security considerations.

import 'dart:async';
import 'package:chatly/core/errors/exceptions.dart';
import 'package:chatly/data/models/user_model.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';

class FirebaseDatasource {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Caching and concurrency optimization
  final Map<String, Future<DocumentSnapshot>> _pendingRequests = {};
  final Map<String, DocumentSnapshot> _userCache = {};
  final Map<String, DateTime> _cacheTimestamps = {};
  static const Duration _cacheExpiry = Duration(minutes: 5);
  static const Duration _requestTimeout = Duration(seconds: 10);

  // Semaphore for limiting concurrent requests
  static const int _maxConcurrentRequests = 5;
  int _activeRequests = 0;
  final List<Completer<void>> _requestQueue = [];
  
  /// Get user document by UID with caching and request deduplication
  Future<DocumentSnapshot> getUserDocument(String uid) async {
    final cacheKey = 'user_$uid';

    // Check cache first
    final cachedDoc = _userCache[cacheKey];
    final cacheTimestamp = _cacheTimestamps[cacheKey];

    if (cachedDoc != null && cacheTimestamp != null &&
        DateTime.now().difference(cacheTimestamp) < _cacheExpiry) {
      return cachedDoc;
    }

    // Check if request is already pending (deduplication)
    final pendingRequest = _pendingRequests[cacheKey];
    if (pendingRequest != null) {
      return pendingRequest;
    }

    // Acquire request slot for concurrency control
    await _acquireRequestSlot();

    try {
      // Create and store the pending request
      final requestFuture = _firestore.collection('users').doc(uid)
          .get()
          .timeout(_requestTimeout);

      _pendingRequests[cacheKey] = requestFuture;

      final doc = await requestFuture;

      // Cache the result
      _userCache[cacheKey] = doc;
      _cacheTimestamps[cacheKey] = DateTime.now();

      // Remove from pending requests
      _pendingRequests.remove(cacheKey);

      // Periodic cache cleanup
      if (_userCache.length % 10 == 0) {
        _cleanupExpiredCache();
      }

      return doc;
    } on FirebaseException catch (e) {
      _pendingRequests.remove(cacheKey);
      throw _handleFirebaseException(e, 'get user document');
    } catch (e) {
      _pendingRequests.remove(cacheKey);
      throw DatabaseException('Failed to get user document: ${e.toString()}');
    } finally {
      _releaseRequestSlot();
    }
  }
  
  /// Create user document
  Future<void> createUserDocument(UserModel userModel) async {
    await _acquireRequestSlot();

    try {
      await _firestore.collection('users').doc(userModel.uid).set(
        userModel.toFirestore(),
        SetOptions(merge: true),
      ).timeout(_requestTimeout);

      // Invalidate cache for this user
      final cacheKey = 'user_${userModel.uid}';
      _userCache.remove(cacheKey);
      _cacheTimestamps.remove(cacheKey);
      _pendingRequests.remove(cacheKey);
    } on FirebaseException catch (e) {
      throw _handleFirebaseException(e, 'create user document');
    } catch (e) {
      throw DatabaseException('Failed to create user document: ${e.toString()}');
    } finally {
      _releaseRequestSlot();
    }
  }
  
  /// Update user document
  Future<void> updateUserDocument(UserModel updatedProfile) async {
    await _acquireRequestSlot();

    try {
      await _firestore.collection('users').doc(updatedProfile.uid).update(
        updatedProfile.toFirestore(),
      ).timeout(_requestTimeout);

      // Invalidate cache for this user
      final cacheKey = 'user_${updatedProfile.uid}';
      _userCache.remove(cacheKey);
      _cacheTimestamps.remove(cacheKey);
      _pendingRequests.remove(cacheKey);
    } on FirebaseException catch (e) {
      throw _handleFirebaseException(e, 'update user document');
    } catch (e) {
      throw DatabaseException('Failed to update user document: ${e.toString()}');
    } finally {
      _releaseRequestSlot();
    }
  }
  
  /// Set username for user
  Future<void> setUsername(String uid, String username) async {
    try {
      // Check if username exists first
      final usernameQuery = await _firestore
          .collection('usernames')
          .doc(username.toLowerCase())
          .get();
      
      if (usernameQuery.exists) {
        final existingUid = usernameQuery.data()?['uid'];
        if (existingUid != uid) {
          throw ChatlyException('Username already taken');
        }
      }
      
      // Update user document
      await _firestore.collection('users').doc(uid).update({
        'username': username,
      });
      
      // Update username mapping
      await _firestore.collection('usernames').doc(username.toLowerCase()).set({
        'uid': uid,
        'username': username,
        'createdAt': FieldValue.serverTimestamp(),
      });
    } on FirebaseException catch (e) {
      throw _handleFirebaseException(e, 'set username');
    } catch (e) {
      throw DatabaseException('Failed to set username: ${e.toString()}');
    }
  }
  
  /// Check if username is available with caching
  Future<bool> isUsernameAvailable(String username) async {
    final cacheKey = 'username_${username.toLowerCase()}';

    // Check cache first (simple boolean cache)
    final cachedResult = _userCache[cacheKey];
    final cacheTimestamp = _cacheTimestamps[cacheKey];

    if (cachedResult != null && cacheTimestamp != null &&
        DateTime.now().difference(cacheTimestamp) < _cacheExpiry) {
      // Cache stores a mock document - if exists, username is taken
      return cachedResult.data() == null;
    }

    await _acquireRequestSlot();

    try {
      final usernameDoc = await _firestore
          .collection('usernames')
          .doc(username.toLowerCase())
          .get()
          .timeout(_requestTimeout);

      // Cache the result (null data means available)
      _userCache[cacheKey] = usernameDoc;
      _cacheTimestamps[cacheKey] = DateTime.now();

      return !usernameDoc.exists;
    } on FirebaseException catch (e) {
      throw _handleFirebaseException(e, 'check username availability');
    } catch (e) {
      throw DatabaseException('Failed to check username availability: ${e.toString()}');
    } finally {
      _releaseRequestSlot();
    }
  }
  
  /// Update last seen timestamp
  Future<void> updateLastSeen(String uid) async {
    try {
      await _firestore.collection('users').doc(uid).update({
        'lastSeen': FieldValue.serverTimestamp(),
      });
    } on FirebaseException catch (e) {
      // Don't throw exception for this operation - it's not critical
      // if (FirebaseCore.instance.options.logLevel == Level.debug) {
      //   print('Warning: Failed to update last seen: ${e.toString()}');
      // }
    } catch (e) {
      // if (FirebaseCore.instance.options.logLevel == Level.debug) {
      //   print('Warning: Failed to update last seen: ${e.toString()}');
      // }
    }
  }
  
  /// Delete user document
  Future<void> deleteUserDocument(String uid) async {
    try {
      final batch = _firestore.batch();
      
      // Delete user document
      batch.delete(_firestore.collection('users').doc(uid));
      
      // Delete user's username mapping
      final userDoc = await getUserDocument(uid);
      if (userDoc.exists) {
        final userData = userDoc.data() as Map<String, dynamic>;
        final username = userData['username'] as String?;
        if (username != null) {
          batch.delete(_firestore.collection('usernames').doc(username.toLowerCase()));
        }
      }
      
      // TODO: Delete user's messages, chats, and other related data
      
      await batch.commit();
    } on FirebaseException catch (e) {
      throw _handleFirebaseException(e, 'delete user document');
    } catch (e) {
      throw DatabaseException('Failed to delete user document: ${e.toString()}');
    }
  }
  
  /// Get user by username
  Future<UserModel?> getUserByUsername(String username) async {
    try {
      final usernameDoc = await _firestore
          .collection('usernames')
          .doc(username.toLowerCase())
          .get();
      
      if (!usernameDoc.exists) return null;
      
      final userData = usernameDoc.data() as Map<String, dynamic>;
      final uid = userData['uid'] as String;
      
      final userDoc = await getUserDocument(uid);
      if (!userDoc.exists) return null;
      
      return UserModel.fromFirestore(userDoc);
    } on FirebaseException catch (e) {
      throw _handleFirebaseException(e, 'get user by username');
    } catch (e) {
      throw DatabaseException('Failed to get user by username: ${e.toString()}');
    }
  }
  
  /// Handle Firebase exceptions and convert to meaningful errors
  ChatlyException _handleFirebaseException(FirebaseException e, String operation) {
    switch (e.code) {
      case 'permission-denied':
        return PermissionException('Insufficient permissions to $operation');
      case 'not-found':
        return NotFoundException('Resource not found for $operation');
      case 'already-exists':
        return ChatlyException('Resource already exists for $operation');
      case 'failed-precondition':
        return ChatlyException('Operation failed precondition for $operation');
      case 'cancelled':
        return ChatlyException('Operation was cancelled for $operation');
      case 'resource-exhausted':
        return ChatlyException('Resource limit exceeded for $operation');
      case 'deadline-exceeded':
        return TimeoutException('Operation timed out for $operation');
      case 'invalid-argument':
        return ValidationException('Invalid argument for $operation');
      case 'unavailable':
        return NetworkException('Service unavailable for $operation');
      case 'internal':
        return DatabaseException('Internal server error for $operation');
      default:
        return DatabaseException('Database error during $operation: ${e.message}');
    }
  }
  
  /// Batch write operation
  Future<void> batchWrite(WriteBatch batch) async {
    try {
      await batch.commit();
    } on FirebaseException catch (e) {
      throw _handleFirebaseException(e, 'batch write');
    } catch (e) {
      throw DatabaseException('Failed to execute batch write: ${e.toString()}');
    }
  }
  
  /// Create batch write
  WriteBatch createBatch() {
    return _firestore.batch();
  }
  
  /// Get collection reference
  CollectionReference getCollection(String collectionName) {
    return _firestore.collection(collectionName);
  }
  
  /// Get document reference
  DocumentReference getDocument(String collectionName, String docId) {
    return _firestore.collection(collectionName).doc(docId);
  }

  /// Acquire permission to make a request (concurrency control)
  Future<void> _acquireRequestSlot() async {
    if (_activeRequests < _maxConcurrentRequests) {
      _activeRequests++;
      return;
    }

    // Wait in queue
    final completer = Completer<void>();
    _requestQueue.add(completer);
    await completer.future;
  }

  /// Release request slot
  void _releaseRequestSlot() {
    _activeRequests--;

    // Allow next request in queue
    if (_requestQueue.isNotEmpty) {
      final next = _requestQueue.removeAt(0);
      _activeRequests++;
      next.complete();
    }
  }

  /// Clear expired cache entries
  void _cleanupExpiredCache() {
    final now = DateTime.now();
    final expiredKeys = <String>[];

    _cacheTimestamps.forEach((key, timestamp) {
      if (now.difference(timestamp) >= _cacheExpiry) {
        expiredKeys.add(key);
      }
    });

    for (final key in expiredKeys) {
      _userCache.remove(key);
      _cacheTimestamps.remove(key);
    }
  }

  /// Clear all caches (useful for testing or force refresh)
  void clearCache() {
    _userCache.clear();
    _cacheTimestamps.clear();
    _pendingRequests.clear();
  }

  /// Dispose of resources and clear caches
  void dispose() {
    clearCache();
    debugPrint('🔧 FirebaseDatasource: Disposed and caches cleared');
  }

  /// Cleanup expired cache entries (called periodically to reduce memory usage)
  void _performMemoryCleanup() {
    _cleanupExpiredCache();

    // If cache is still too large, clear oldest entries
    if (_userCache.length > 50) {
      final sortedEntries = _cacheTimestamps.entries.toList()
        ..sort((a, b) => a.value.compareTo(b.value));

      // Remove oldest 20% of entries
      final entriesToRemove = (sortedEntries.length * 0.2).ceil();
      for (var i = 0; i < entriesToRemove && i < sortedEntries.length; i++) {
        final key = sortedEntries[i].key;
        _userCache.remove(key);
        _cacheTimestamps.remove(key);
      }

      debugPrint('🔧 FirebaseDatasource: Cleaned up ${entriesToRemove} old cache entries');
    }
  }
  
  /// TODO: Implement data pagination for large collections
  /// TODO: Add offline persistence support
  /// TODO: Implement real-time listeners with proper cleanup
  /// WARNING: Always validate data before writing to Firestore
}
