/// @file lib/core/services/algorithm_service.dart
/// @brief Smart algorithm service for notification timing, contact sorting, and conversation health
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file implements the core algorithm service that powers Chatly's smart features
/// including smart notification timing, most chatted contact sorting, interest-based matching,
/// and conversation health scoring. The service uses machine learning principles and
/// user behavior analysis to enhance the chat experience while maintaining privacy.

import 'dart:math';
import 'package:chatly/core/constants/app_constants.dart';
import 'package:chatly/core/providers/auth_provider.dart';
import 'package:chatly/data/models/chat_model.dart';
import 'package:chatly/data/models/message_model.dart';
import 'package:chatly/data/models/user_model.dart';
import 'package:flutter/foundation.dart';

class AlgorithmService {
  static final AlgorithmService _instance = AlgorithmService._internal();
  late final Random _random;

  // Performance optimization: Caches for expensive calculations
  final Map<String, dynamic> _calculationCache = {};
  final Map<String, DateTime> _cacheTimestamps = {};
  static const Duration _cacheExpiry = Duration(minutes: 10);

  factory AlgorithmService() {
    return _instance;
  }

  AlgorithmService._internal() {
    _random = Random.secure();
  }

  /// Performance: Get cached value or compute if expired/not exists
  T _getCached<T>(String cacheKey, T Function() computeFunction) {
    final cacheEntry = _calculationCache[cacheKey];
    final timestamp = _cacheTimestamps[cacheKey];

    if (cacheEntry != null && timestamp != null &&
        DateTime.now().difference(timestamp) < _cacheExpiry) {
      return cacheEntry as T;
    }

    // Compute and cache
    final result = computeFunction();
    _calculationCache[cacheKey] = result;
    _cacheTimestamps[cacheKey] = DateTime.now();

    // Clean old cache entries periodically
    if (_calculationCache.length > 100) {
      _cleanupCache();
    }

    return result;
  }

  /// Performance: Clear expired cache entries
  void _cleanupCache() {
    final now = DateTime.now();
    final expiredKeys = <String>[];

    _cacheTimestamps.forEach((key, timestamp) {
      if (now.difference(timestamp) >= _cacheExpiry) {
        expiredKeys.add(key);
      }
    });

    for (final key in expiredKeys) {
      _calculationCache.remove(key);
      _cacheTimestamps.remove(key);
    }
  }

  /// Performance: Clear all cache (useful for testing or memory management)
  void clearCache() {
    _calculationCache.clear();
    _cacheTimestamps.clear();
  }

  /// Dispose and clear all resources
  void dispose() {
    clearCache();
    debugPrint('🔧 AlgorithmService: Disposed and caches cleared');
  }

  /// Cleanup old cache entries to reduce memory usage
  void _performMemoryCleanup() {
    _cleanupCache();

    // Additional aggressive cleanup if cache is still large
    if (_calculationCache.length > 200) {
      final sortedEntries = _cacheTimestamps.entries.toList()
        ..sort((a, b) => a.value.compareTo(b.value));

      // Remove oldest 30% of entries
      final entriesToRemove = (sortedEntries.length * 0.3).ceil();
      for (var i = 0; i < entriesToRemove && i < sortedEntries.length; i++) {
        final key = sortedEntries[i].key;
        _calculationCache.remove(key);
        _cacheTimestamps.remove(key);
      }

      debugPrint('🔧 AlgorithmService: Aggressively cleaned up ${entriesToRemove} cache entries');
    }
  }

  /// Smart notification timing algorithm
  DateTime predictOptimalNotificationTime({
    required UserModel user,
    required DateTime messageTime,
  }) {
    final now = DateTime.now();
    final hour = now.hour;
    final dayOfWeek = now.weekday; // 1=Monday, 7=Sunday
    final batteryLevel = _getSimulatedBatteryLevel(); // In real app, get actual battery level
    
    // Base delay in minutes
    double baseDelay = 0.0;
    
    // Night mode (10PM - 6AM)
    if (hour >= 22 || hour < 6) {
      baseDelay = dayOfWeek == 6 || dayOfWeek == 7 // Weekend
          ? 60 * 2 // 2 hours
          : 60 * 8; // 8 hours (until 9AM)
    } 
    // Evening hours (6PM - 10PM)
    else if (hour >= 18) {
      baseDelay = 30;
    } 
    // Work hours (9AM - 6PM)
    else if (hour >= 9 && hour < 18) {
      // Check if user is typically active during work hours
      final isWorkHourActive = _isUserActiveDuringWorkHours(user);
      if (!isWorkHourActive) {
        baseDelay = 60; // 1 hour delay
      }
    }
    
    // Low battery optimization
    if (batteryLevel < 0.2 && baseDelay < 60) {
      baseDelay = 60; // Batch notifications when battery is low
    }
    
    // User preference override
    if (user.settings['enableSmartNotifications'] == 'false') {
      baseDelay = 0;
    }
    
    return now.add(Duration(minutes: baseDelay.toInt()));
  }

  /// Get most chatted contacts with intelligent sorting
  List<UserModel> getMostChattedContacts({
    required List<UserModel> contacts,
    required List<ChatModel> chats,
    required List<MessageModel> messages,
    required String currentUserUid,
    bool premium = false,
  }) {
    final contactScores = <String, double>{};
    
    for (final chat in chats) {
      if (chat.isGroup) continue;
      
      final otherUserUid = chat.participantIds.firstWhere((uid) => uid != currentUserUid);
      final chatMessages = messages.where((m) => m.chatId == chat.chatId).toList();
      
      // Calculate base score
      double score = _calculateChatScore(
        chat: chat,
        messages: chatMessages,
        currentUserUid: currentUserUid,
        premium: premium,
      );
      
      contactScores[otherUserUid] = (contactScores[otherUserUid] ?? 0) + score;
    }
    
    // Sort contacts by score
    final sortedContacts = contacts.toList();
    sortedContacts.sort((a, b) {
      final scoreA = contactScores[a.uid] ?? 0;
      final scoreB = contactScores[b.uid] ?? 0;
      return scoreB.compareTo(scoreA);
    });
    
    return sortedContacts;
  }

  /// Calculate conversation health score for groups (Pro feature)
  double calculateConversationHealthScore({
    required ChatModel group,
    required List<MessageModel> messages,
    required List<UserModel> participants,
  }) {
    if (!group.isGroup || participants.length < 3) return 1.0;
    
    // 1. Participation balance score (0-1)
    final participationScore = _calculateParticipationBalance(
      messages: messages,
      participantIds: group.participantIds,
    );
    
    // 2. Response time score (0-1)
    final responseTimeScore = _calculateResponseTimeScore(messages);
    
    // 3. Positivity score using sentiment analysis (0-1)
    final positivityScore = _calculatePositivityScore(messages);
    
    // 4. Engagement consistency score (0-1)
    final engagementScore = _calculateEngagementConsistency(messages);
    
    // Weighted average
    return (participationScore * 0.4) +
           (responseTimeScore * 0.3) +
           (positivityScore * 0.2) +
           (engagementScore * 0.1);
  }

  /// Interest-based matching for anonymous chat
  List<AnonymousMatch> findAnonymousMatches({
    required String userId,
    required String messageContent,
    required List<String> topics,
    required List<AnonymousProfile> profiles,
  }) {
    final matches = <AnonymousMatch>[];
    
    for (final profile in profiles) {
      if (profile.userId == userId) continue;
      
      // Topic matching score
      final topicScore = _calculateTopicMatchingScore(
        userTopics: topics,
        profileTopics: profile.preferredTopics,
      );
      
      // Content similarity score (basic keyword matching)
      final contentScore = _calculateContentSimilarity(
        messageContent: messageContent,
        profileInterests: profile.interests,
      );
      
      // Combined score
      final totalScore = (topicScore * 0.6) + (contentScore * 0.4);
      
      if (totalScore > 0.3) { // Minimum threshold for matching
        matches.add(AnonymousMatch(
          profile: profile,
          score: totalScore,
          matchReason: _getMatchReason(topicScore, contentScore),
        ));
      }
    }
    
    // Sort by score descending
    matches.sort((a, b) => b.score.compareTo(a.score));
    
    // Limit to top 5 matches
    return matches.take(5).toList();
  }

  /// Suggest icebreakers when conversation health is low
  List<String> suggestIcebreakers({
    required double healthScore,
    required List<String> groupTopics,
    required int memberCount,
  }) {
    if (healthScore > 0.5) return [];
    
    final suggestions = <String>[];
    
    // Topic-based suggestions
    for (final topic in groupTopics) {
      suggestions.addAll(_getTopicBasedIcebreakers(topic, memberCount));
    }
    
    // General engagement suggestions
    suggestions.addAll(_getGeneralIcebreakers(memberCount));
    
    // Return unique suggestions, capped at 3
    return suggestions.toSet().toList().take(3).toList();
  }

  // Helper methods
  double _calculateChatScore({
    required ChatModel chat,
    required List<MessageModel> messages,
    required String currentUserUid,
    bool premium = false,
  }) {
    double score = 0.0;
    
    // Message count factor
    score += min(messages.length * 0.1, 2.0);
    
    // Recency factor (messages in last 24 hours)
    final recentMessages = messages.where((m) => 
      m.timestamp.isAfter(DateTime.now().subtract(const Duration(hours: 24)))
    ).length;
    score += recentMessages * 0.5;
    
    // Response time factor
    final avgResponseTime = _calculateAverageResponseTime(messages, currentUserUid);
    if (avgResponseTime < 60) { // Less than 1 hour
      score += 1.0;
    } else if (avgResponseTime < 180) { // Less than 3 hours
      score += 0.5;
    }
    
    // Premium features
    if (premium) {
      // Sentiment analysis factor
      final sentimentScore = _calculateSentimentScore(messages);
      score += sentimentScore * 0.5;
      
      // Engagement pattern factor
      final engagementScore = _calculateEngagementPattern(messages);
      score += engagementScore * 0.3;
    }
    
    return score;
  }

  double _calculateParticipationBalance({
    required List<MessageModel> messages,
    required List<String> participantIds,
  }) {
    if (participantIds.length < 2 || messages.isEmpty) return 1.0;
    
    final messageCounts = <String, int>{};
    for (final uid in participantIds) {
      messageCounts[uid] = 0;
    }
    
    for (final message in messages) {
      messageCounts[message.senderId] = (messageCounts[message.senderId] ?? 0) + 1;
    }
    
    final totalCount = messageCounts.values.fold(0, (sum, count) => sum + count);
    if (totalCount == 0) return 1.0;
    
    // Calculate standard deviation of participation
    final avg = totalCount / participantIds.length;
    final variance = messageCounts.values.map((count) => pow(count - avg, 2)).reduce((a, b) => a + b) / participantIds.length;
    final stdDev = sqrt(variance);
    
    // Convert to balance score (0-1, where 1 is perfect balance)
    return 1.0 - min(stdDev / avg, 1.0);
  }

  double _calculateResponseTimeScore(List<MessageModel> messages) {
    if (messages.length < 2) return 1.0;
    
    messages.sort((a, b) => a.timestamp.compareTo(b.timestamp));
    
    var totalTime = Duration.zero;
    var responseCount = 0;
    
    for (var i = 1; i < messages.length; i++) {
      if (messages[i].senderId != messages[i-1].senderId) {
        final timeDiff = messages[i].timestamp.difference(messages[i-1].timestamp);
        if (timeDiff.inMinutes < 60) { // Only count responses within 1 hour
          totalTime += timeDiff;
          responseCount++;
        }
      }
    }
    
    if (responseCount == 0) return 0.5;
    
    final avgMinutes = totalTime.inMinutes / responseCount;
    // Convert to score (0-1, where 1 is instant response)
    return max(0.0, 1.0 - (avgMinutes / 60.0));
  }

  double _calculatePositivityScore(List<MessageModel> messages) {
    // In real app, this would use proper sentiment analysis
    // For now, use a basic approach with positive/negative keywords
    final positiveKeywords = ['good', 'great', 'awesome', 'love', 'happy', 'thanks', 'thank you', 'please', 'nice', 'wonderful'];
    final negativeKeywords = ['bad', 'terrible', 'hate', 'angry', 'frustrated', 'disappointed', 'sorry', 'problem', 'issue', 'complain'];
    
    double score = 0.5; // Neutral starting point
    
    for (final message in messages) {
      final text = message.text.toLowerCase();
      
      // Count positive keywords
      var positiveCount = 0;
      for (final keyword in positiveKeywords) {
        if (text.contains(keyword)) positiveCount++;
      }
      
      // Count negative keywords
      var negativeCount = 0;
      for (final keyword in negativeKeywords) {
        if (text.contains(keyword)) negativeCount++;
      }
      
      if (positiveCount > 0 || negativeCount > 0) {
        final netSentiment = positiveCount - negativeCount;
        score += netSentiment * 0.1;
      }
    }
    
    return min(max(score, 0.0), 1.0);
  }

  double _calculateEngagementConsistency(List<MessageModel> messages) {
    if (messages.isEmpty) return 1.0;
    
    // Group messages by day
    final messagesByDay = <DateTime, int>{};
    
    for (final message in messages) {
      final day = DateTime(message.timestamp.year, message.timestamp.month, message.timestamp.day);
      messagesByDay[day] = (messagesByDay[day] ?? 0) + 1;
    }
    
    if (messagesByDay.length < 2) return 1.0;
    
    // Calculate coefficient of variation
    final counts = messagesByDay.values.toList();
    final avg = counts.reduce((a, b) => a + b) / counts.length;
    final stdDev = sqrt(counts.map((count) => pow(count - avg, 2)).reduce((a, b) => a + b) / counts.length);
    
    // Lower CV means more consistent engagement
    final cv = stdDev / avg;
    return 1.0 - min(cv, 1.0);
  }

  double _calculateTopicMatchingScore({
    required List<String> userTopics,
    required List<String> profileTopics,
  }) {
    if (userTopics.isEmpty || profileTopics.isEmpty) return 0.0;
    
    var matches = 0;
    for (final topic in userTopics) {
      if (profileTopics.contains(topic)) matches++;
    }
    
    return matches / max(userTopics.length, profileTopics.length);
  }

  double _calculateContentSimilarity({
    required String messageContent,
    required List<String> profileInterests,
  }) {
    final text = messageContent.toLowerCase();
    var matches = 0;
    
    for (final interest in profileInterests) {
      if (text.contains(interest.toLowerCase())) matches++;
    }
    
    return matches / max(profileInterests.length, 1);
  }

  String _getMatchReason(double topicScore, double contentScore) {
    if (topicScore > 0.7 && contentScore > 0.5) return 'Strong topic and interest match';
    if (topicScore > 0.7) return 'Perfect topic match';
    if (contentScore > 0.7) return 'Shared interests detected';
    return 'Similar conversation topics';
  }

  List<String> _getTopicBasedIcebreakers(String topic, int memberCount) {
    final topicLower = topic.toLowerCase();
    
    if (topicLower.contains('work') || topicLower.contains('job')) {
      return [
        'What\'s one work achievement you\'re proud of this year?',
        'If you could instantly master one professional skill, what would it be?',
        memberCount > 5 ? 'Let\'s do a quick round: share one work win and one challenge you\'re facing' : null,
      ].whereType<String>().toList();
    }
    
    if (topicLower.contains('hobby') || topicLower.contains('interest')) {
      return [
        'What hobby have you always wanted to try but haven\'t yet?',
        'What\'s a skill you\'ve learned recently that surprised you?',
        memberCount > 5 ? 'Show and tell time! Share something you\'ve created or are working on' : null,
      ].whereType<String>().toList();
    }
    
    if (topicLower.contains('music') || topicLower.contains('entertainment')) {
      return [
        'What song has been stuck in your head lately?',
        'If you could have dinner with any artist/musician, who would it be?',
        memberCount > 5 ? 'Let\'s play two truths and a lie about our music tastes!' : null,
      ].whereType<String>().toList();
    }
    
    return [
      'What\'s the best piece of advice you\'ve ever received?',
      'What\'s something you\'re looking forward to this week?',
      memberCount > 5 ? 'Let\'s do a quick check-in: how is everyone feeling today on a scale of 1-10?' : null,
    ].whereType<String>().toList();
  }

  List<String> _getGeneralIcebreakers(int memberCount) {
    return [
      'What\'s one thing you\'re grateful for today?',
      'If you could teleport anywhere right now, where would you go?',
      memberCount > 5 ? 'Let\'s do a word association game! I\'ll start with "chat"...' : null,
      memberCount > 3 ? 'What\'s your go-to comfort food?' : null,
    ].whereType<String>().toList();
  }

  double _getSimulatedBatteryLevel() {
    // In real app, this would get actual battery level
    return _random.nextDouble();
  }

  bool _isUserActiveDuringWorkHours(UserModel user) {
    // In real app, this would analyze user's message history
    // For now, simulate based on user tier
    return user.tier == 'pro' || _random.nextBool();
  }

  double _calculateAverageResponseTime(List<MessageModel> messages, String currentUserUid) {
    if (messages.length < 2) return 0.0;
    
    messages.sort((a, b) => a.timestamp.compareTo(b.timestamp));
    
    var totalTime = Duration.zero;
    var responseCount = 0;
    
    for (var i = 0; i < messages.length - 1; i++) {
      final currentMessage = messages[i];
      final nextMessage = messages[i + 1];
      
      // Only count responses from other users to current user
      if (currentMessage.senderId == currentUserUid && nextMessage.senderId != currentUserUid) {
        final responseTime = nextMessage.timestamp.difference(currentMessage.timestamp);
        if (responseTime.inMinutes < 1440) { // Within 24 hours
          totalTime += responseTime;
          responseCount++;
        }
      }
    }
    
    if (responseCount == 0) return 0.0;
    
    return totalTime.inMinutes / responseCount;
  }

  double _calculateSentimentScore(List<MessageModel> messages) {
    // Simulated sentiment score
    var positiveCount = 0;
    var negativeCount = 0;
    
    final positiveWords = ['good', 'great', 'awesome', 'love', 'happy', 'thanks', 'nice', 'wonderful', 'excellent', 'amazing'];
    final negativeWords = ['bad', 'terrible', 'hate', 'angry', 'frustrated', 'disappointed', 'sad', 'upset', 'problem', 'issue'];
    
    for (final message in messages) {
      final text = message.text.toLowerCase();
      
      for (final word in positiveWords) {
        if (text.contains(word)) positiveCount++;
      }
      
      for (final word in negativeWords) {
        if (text.contains(word)) negativeCount++;
      }
    }
    
    if (positiveCount + negativeCount == 0) return 0.5;
    
    return positiveCount / (positiveCount + negativeCount);
  }

  double _calculateEngagementPattern(List<MessageModel> messages) {
    if (messages.isEmpty) return 0.0;
    
    // Calculate engagement consistency over time
    final timePeriods = 24; // Hourly periods
    final engagement = List.filled(timePeriods, 0);
    
    for (final message in messages) {
      final hour = message.timestamp.hour;
      engagement[hour] = engagement[hour] + 1;
    }
    
    final maxEngagement = engagement.reduce((a, b) => a > b ? a : b);
    if (maxEngagement == 0) return 0.0;
    
    // Calculate how evenly distributed the engagement is
    double consistencyScore = 0.0;
    for (var i = 0; i < timePeriods - 1; i++) {
      final diff = (engagement[i] - engagement[i + 1]).abs();
      consistencyScore += 1.0 - (diff / maxEngagement);
    }
    
    return consistencyScore / (timePeriods - 1);
  }
}

class AnonymousMatch {
  final AnonymousProfile profile;
  final double score;
  final String matchReason;
  
  AnonymousMatch({
    required this.profile,
    required this.score,
    required this.matchReason,
  });
}

class AnonymousProfile {
  final String userId;
  final List<String> preferredTopics;
  final List<String> interests;
  final DateTime lastActive;
  
  AnonymousProfile({
    required this.userId,
    required this.preferredTopics,
    required this.interests,
    required this.lastActive,
  });
}
