/// @file lib/core/services/moderation_service.dart
/// @brief Content moderation service using Perspective API and custom rules
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file implements the content moderation service that analyzes messages
/// for toxicity, banned words, and harmful content. It integrates with the
/// Google Perspective API for advanced toxicity detection and maintains
/// custom banned word lists. The service enforces community guidelines and
/// automatically flags or blocks inappropriate content.

import 'dart:convert';
import 'dart:io';
import 'dart:math';
import 'package:chatly/core/constants/app_constants.dart';
import 'package:chatly/core/errors/exceptions.dart';
import 'package:chatly/core/utils/handlers/preference_handler.dart';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class ModerationService {
  static final ModerationService _instance = ModerationService._internal();
  final String _perspectiveApiKey = 'YOUR_PERSPECTIVE_API_KEY'; // Should be in .env
  late List<String> _bannedWords;
  final PreferenceHandler _preferenceHandler = PreferenceHandler();
  
  factory ModerationService() {
    return _instance;
  }
  
  ModerationService._internal() {
    _bannedWords = _loadBannedWords();
  }

  List<String> _loadBannedWords() {
    // In real app, this would be loaded from a remote source
    return [
      'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'nigga', 'nigger', 
      'dick', 'pussy', 'cock', 'whore', 'slut', 'retard', 'idiot',
      'fag', 'faggot', 'dyke', 'kike', 'chink', 'spic', 'terrorist',
      'kill yourself', 'suicide', 'bomb', 'weapon', 'drugs', 'illegal',
    ];
  }

  /// Sanitize message input - remove harmful characters and check content
  Future<String> sanitizeMessage(String input) async {
    // Remove harmful HTML/script characters
    var sanitized = input
      .replaceAll(RegExp(r'<script.*?>.*?</script>'), '')
      .replaceAll(RegExp(r'<.*?>'), '')
      .replaceAll(RegExp(r'[<>{}]'), '')
      .replaceAll(RegExp(r'javascript:'), '')
      .replaceAll(RegExp(r'data:'), '');
    
    // Check for banned words
    await _checkBannedWords(sanitized);
    
    // Check toxicity score
    final toxicityScore = await _checkToxicity(sanitized);
    if (toxicityScore > AppConstants.toxicityThreshold) {
      throw ModerationException(
        'Message appears toxic (score: ${toxicityScore.toStringAsFixed(2)})',
        code: 'TOXIC_CONTENT',
        toxicityScore: toxicityScore,
      );
    }
    
    return sanitized.trim();
  }

  /// Check if message contains banned words
  Future<void> _checkBannedWords(String message) async {
    final lowerMessage = message.toLowerCase();
    
    for (final bannedWord in _bannedWords) {
      if (lowerMessage.contains(bannedWord)) {
        final lastWarning = await _preferenceHandler.getLastToxicityWarning();
        final now = DateTime.now();
        
        // Rate limiting for warnings
        if (lastWarning == null || now.difference(lastWarning).inMinutes > 60) {
          await _preferenceHandler.saveLastToxicityWarning(now);
        }
        
        throw ModerationException(
          'Message contains inappropriate content',
          code: 'BANNED_WORDS',
          bannedWord: bannedWord,
        );
      }
    }
  }

  /// Check message toxicity using Perspective API
  Future<double> _checkToxicity(String message) async {
    if (message.length < 3) return 0.0;
    
    try {
      final response = await http.post(
        Uri.parse('https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=$_perspectiveApiKey'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'comment': {'text': message},
          'languages': ['en'],
          'requestedAttributes': {'TOXICITY': {}},
        }),
      );
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['attributeScores']['TOXICITY']['summaryScore']['value'];
      } else {
        // Fallback to basic toxicity check if API fails
        return _basicToxicityCheck(message);
      }
    } catch (e) {
      // Fallback to basic check on error
      return _basicToxicityCheck(message);
    }
  }

  /// Basic toxicity check as fallback
  double _basicToxicityCheck(String message) {
    final lowerMessage = message.toLowerCase();
    var toxicityScore = 0.0;
    
    // Count negative words
    final negativeWords = [
      'hate', 'angry', 'frustrated', 'disappointed', 'terrible', 'awful',
      'horrible', 'stupid', 'idiot', 'loser', 'failure', 'useless', 'worthless'
    ];
    
    for (final word in negativeWords) {
      if (lowerMessage.contains(word)) {
        toxicityScore += 0.1;
      }
    }
    
    // Check aggressive punctuation
    if (message.contains('!!!') || message.contains('???')) {
      toxicityScore += 0.15;
    }
    
    // Check ALL CAPS
    if (message == message.toUpperCase() && message.length > 5) {
      toxicityScore += 0.2;
    }
    
    return min(toxicityScore, 1.0);
  }

  /// Report user for inappropriate behavior
  Future<void> reportUser({
    required String reporterId,
    required String reportedUserId,
    required String reason,
    String? messageId,
  }) async {
    try {
      // In real app, this would send the report to backend
      print('User $reporterId reported user $reportedUserId for: $reason');
      
      // Log report locally for rate limiting
      await _logUserReport(reporterId, reportedUserId);
      
    } catch (e) {
      throw ModerationException('Failed to submit report', code: 'REPORT_ERROR');
    }
  }

  /// Log user report for rate limiting and pattern detection
  Future<void> _logUserReport(String reporterId, String reportedUserId) async {
    final now = DateTime.now();
    final reportKey = 'report_${reporterId}_${reportedUserId}_${now.year}${now.month}${now.day}';
    
    // Check if user has already reported this user today
    final hasReported = await _preferenceHandler.hasUserReported(reportKey);
    if (hasReported) {
      throw ModerationException('You can only report a user once per day', code: 'RATE_LIMIT');
    }
    
    // Save report
    await _preferenceHandler.logUserReport(reportKey, now);
  }

  /// Get user report count for automated banning
  Future<int> getUserReportCount({
    required String userId,
    required DateTime periodStart,
  }) async {
    // In real app, this would query backend for reports
    // For now, simulate with random data
    return _getSimulatedReportCount(userId, periodStart);
  }

  int _getSimulatedReportCount(String userId, DateTime periodStart) {
    // Simulate different report counts based on user ID hash
    final hash = userId.hashCode;
    final now = DateTime.now();
    final daysSincePeriod = now.difference(periodStart).inDays;
    
    return (hash.abs() % (3 + daysSincePeriod)) + 1;
  }

  /// Check if user should be banned based on reports
  Future<BanDecision> checkUserBanStatus({
    required String userId,
    required int reports24h,
    required int reports30d,
  }) async {
    if (reports30d >= 26) {
      return BanDecision(
        shouldBan: true,
        banDuration: const Duration(days: 365 * 100), // Permanent
        reason: 'Excessive reports (26+ in 30 days)',
      );
    }
    
    if (reports30d >= 10) {
      return BanDecision(
        shouldBan: true,
        banDuration: const Duration(days: 7),
        reason: 'Multiple reports (10-25 in 30 days)',
      );
    }
    
    if (reports24h >= 10) {
      return BanDecision(
        shouldBan: true,
        banDuration: const Duration(days: 7),
        reason: 'High volume reports (10+ in 24 hours)',
      );
    }
    
    if (reports24h >= 5) {
      return BanDecision(
        shouldBan: true,
        banDuration: const Duration(days: 3),
        reason: 'Moderate reports (5-9 in 24 hours)',
      );
    }
    
    if (reports24h >= 2) {
      return BanDecision(
        shouldBan: true,
        banDuration: const Duration(days: 1),
        reason: 'Initial reports (2-4 in 24 hours)',
      );
    }
    
    return BanDecision(shouldBan: false, banDuration: Duration.zero, reason: 'No ban required');
  }

  /// Filter message for age-appropriate content (13+)
  bool isAgeAppropriate(String message) {
    final lowerMessage = message.toLowerCase();
    
    // Check for adult content indicators
    final adultKeywords = [
      'sex', 'porn', 'nude', 'naked', 'boobs', 'penis', 'vagina', 'masturbate',
      'fuck', 'sexual', 'erotic', 'adult', 'xxx', '18+', 'onlyfans'
    ];
    
    for (final keyword in adultKeywords) {
      if (lowerMessage.contains(keyword)) {
        return false;
      }
    }
    
    return true;
  }

  /// Get sanitized version of message with sensitive content masked
  String getSanitizedPreview(String message) {
    var preview = message;

    // Mask phone numbers
    preview = preview.replaceAll(RegExp(r'\b\d{10}\b'), '**********');

    // Mask email addresses
    preview = preview.replaceAll(RegExp(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'), '*****@*****.com');

    // Mask URLs
    preview = preview.replaceAll(RegExp(r'https?://[^\s]+'), '[LINK]');

    // Truncate long messages
    if (preview.length > 100) {
      preview = preview.substring(0, 97) + '...';
    }

    return preview;
  }

  /// Dispose of resources
  void dispose() {
    // Clean up any resources if needed
    debugPrint('🔧 ModerationService: Disposed');
  }

  /// TODO: Implement real-time moderation with WebSocket connection
  /// TODO: Add image moderation for future media support
  /// TODO: Implement machine learning model for custom toxicity detection
  /// WARNING: Never log or store raw message content in moderation logs
}

class ModerationException extends ChatlyException {
  final double? toxicityScore;
  final String? bannedWord;
  
  ModerationException(String message, {String? code, this.toxicityScore, this.bannedWord})
      : super(message, code: code);
}

class BanDecision {
  final bool shouldBan;
  final Duration banDuration;
  final String reason;
  
  BanDecision({
    required this.shouldBan,
    required this.banDuration,
    required this.reason,
  });
}
