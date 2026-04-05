/// @file lib/data/models/user_model.dart
/// @brief User data model with comprehensive user profile information
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file defines the UserModel class that represents a user's profile data
/// in the Chatly application. It includes all user properties, tier information,
/// settings, limits, and provides methods for data validation and serialization.

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:equatable/equatable.dart';

class UserModel extends Equatable {
  final String uid;
  final String email;
  final String username;
  final String? phone;
  final String tier; // 'free', 'plus', 'pro'
  final DateTime createdAt;
  final DateTime lastSeen;
  final Map<String, dynamic> settings;
  final Map<String, dynamic> limits;
  final Map<String, dynamic>? customTheme;
  final bool isAnonymous;

  const UserModel({
    required this.uid,
    required this.email,
    required this.username,
    this.phone,
    this.tier = 'free',
    required this.createdAt,
    required this.lastSeen,
    this.settings = const {
      'theme': 'light',
      'fontSize': '16.0',
      'retentionDays': '7',
      'showOnlineStatus': 'true',
      'allowContactsSync': 'false',
      'enableSmartNotifications': 'true',
      'lastSeenVisibility': 'everyone',
      'profilePhotoVisibility': 'everyone',
    },
    this.limits = const {
      'anonymousThisWeek': '0',
      'messagesToday': '0',
      'groupsCreated': '0',
    },
    this.customTheme,
    this.isAnonymous = false,
  });

  /// Create UserModel from Firestore document
  factory UserModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;

    return UserModel(
      uid: doc.id,
      email: data['email'] ?? '',
      username: data['username'] ?? '',
      phone: data['phone'],
      tier: data['tier'] ?? 'free',
      createdAt: (data['createdAt'] as Timestamp).toDate(),
      lastSeen: (data['lastSeen'] as Timestamp).toDate(),
      settings: Map<String, dynamic>.from(data['settings'] ?? {}),
      limits: Map<String, dynamic>.from(data['limits'] ?? {}),
      customTheme: data['customTheme'] != null
          ? Map<String, dynamic>.from(data['customTheme'])
          : null,
      isAnonymous: data['isAnonymous'] ?? false,
    );
  }

  /// Convert UserModel to Firestore data
  Map<String, dynamic> toFirestore() {
    return {
      'email': email,
      'username': username,
      'phone': phone,
      'tier': tier,
      'createdAt': Timestamp.fromDate(createdAt),
      'lastSeen': Timestamp.fromDate(lastSeen),
      'settings': settings,
      'limits': limits,
      'customTheme': customTheme,
      'isAnonymous': isAnonymous,
    };
  }

  /// Create copy with updated fields
  UserModel copyWith({
    String? uid,
    String? email,
    String? username,
    String? phone,
    String? tier,
    DateTime? createdAt,
    DateTime? lastSeen,
    Map<String, dynamic>? settings,
    Map<String, dynamic>? limits,
    Map<String, dynamic>? customTheme,
    bool? isAnonymous,
  }) {
    return UserModel(
      uid: uid ?? this.uid,
      email: email ?? this.email,
      username: username ?? this.username,
      phone: phone ?? this.phone,
      tier: tier ?? this.tier,
      createdAt: createdAt ?? this.createdAt,
      lastSeen: lastSeen ?? this.lastSeen,
      settings: settings ?? this.settings,
      limits: limits ?? this.limits,
      customTheme: customTheme ?? this.customTheme,
      isAnonymous: isAnonymous ?? this.isAnonymous,
    );
  }

  /// Validate user data before saving
  List<String> validate() {
    final errors = <String>[];

    if (username.isEmpty || username.length < 3 || username.length > 20) {
      errors.add('Username must be between 3-20 characters');
    }

    if (!username.contains(RegExp(r'^[a-zA-Z0-9_]+$'))) {
      errors.add('Username can only contain letters, numbers, and underscores');
    }

    if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email)) {
      errors.add('Invalid email format');
    }

    if (tier != 'free' && tier != 'plus' && tier != 'pro') {
      errors.add('Invalid tier specified');
    }

    return errors;
  }

  /// Check if user can send anonymous messages this week
  bool canSendAnonymousMessage() {
    final maxMessages = _getMaxAnonymousMessages();
    final currentCount = int.tryParse(limits['anonymousThisWeek'] ?? '0') ?? 0;
    return currentCount < maxMessages;
  }

  /// Get max anonymous messages allowed per week based on tier
  int _getMaxAnonymousMessages() {
    switch (tier) {
      case 'free':
        return 3;
      case 'plus':
        return 10;
      case 'pro':
        return 1000000; // Effectively unlimited
      default:
        return 3;
    }
  }

  /// Get message retention days based on tier
  int getMessageRetentionDays() {
    if (tier == 'free') return 7;

    try {
      return int.parse(settings['retentionDays'] ?? '7');
    } catch (e) {
      return 7;
    }
  }

  /// Get max groups user can create
  int getMaxGroupsAllowed() {
    switch (tier) {
      case 'free':
        return 0;
      case 'plus':
        return 1;
      case 'pro':
        return 2;
      default:
        return 0;
    }
  }

  /// Get daily message limit
  int getDailyMessageLimit() {
    switch (tier) {
      case 'free':
        return 200;
      case 'plus':
        return 500;
      case 'pro':
        return 1000;
      default:
        return 200;
    }
  }

  /// Check if theme is available for user's tier
  bool isThemeAvailable(String themeName) {
    if (tier == 'pro') return true;
    if (tier == 'plus') {
      final plusThemes = ['ocean', 'forest', 'sunset', 'midnight', 'rose'];
      return themeName == 'light' ||
             themeName == 'dark' ||
             themeName == 'amoled' ||
             plusThemes.contains(themeName);
    }
    return ['light', 'dark', 'amoled'].contains(themeName);
  }

  /// Get user's display name
  String getDisplayName() {
    return username.isNotEmpty ? username : 'user_${uid.substring(0, 8)}';
  }

  /// Check if user is currently online (last seen within 5 minutes)
  bool get isOnline {
    final now = DateTime.now();
    final fiveMinutesAgo = now.subtract(const Duration(minutes: 5));
    return lastSeen.isAfter(fiveMinutesAgo);
  }

  /// Get user's status text
  String getStatusText() {
    if (isOnline) return 'Online';

    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);

    if (lastSeen.isAfter(today)) {
      return 'Last seen today at ${_formatTime(lastSeen)}';
    } else if (lastSeen.isAfter(today.subtract(const Duration(days: 1)))) {
      return 'Last seen yesterday at ${_formatTime(lastSeen)}';
    } else {
      return 'Last seen on ${_formatDate(lastSeen)}';
    }
  }

  /// Helper method to format time
  String _formatTime(DateTime time) {
    final hour = time.hour % 12 == 0 ? 12 : time.hour % 12;
    final minute = time.minute.toString().padLeft(2, '0');
    final period = time.hour >= 12 ? 'PM' : 'AM';
    return '$hour:$minute $period';
  }

  /// Helper method to format date
  String _formatDate(DateTime date) {
    final months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }

  @override
  List<Object?> get props => [
    uid,
    email,
    username,
    phone,
    tier,
    createdAt,
    lastSeen,
    settings,
    limits,
    customTheme,
    isAnonymous,
  ];

  @override
  bool get stringify => true;
}
