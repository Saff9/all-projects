/// @file lib/core/types/app_types.dart
/// @brief Strongly typed enums and value objects for type safety
/// @author Chatly Development Team
/// @date 2026-01-13
///
/// This file defines strongly typed enums and value objects to improve
/// type safety throughout the application and reduce runtime errors.

/// User subscription tiers with associated limits
enum UserTier {
  free('free'),
  plus('plus'),
  pro('pro');

  const UserTier(this.value);
  final String value;

  static UserTier fromString(String value) {
    return UserTier.values.firstWhere(
      (tier) => tier.value == value,
      orElse: () => UserTier.free,
    );
  }

  int get dailyMessageLimit {
    switch (this) {
      case UserTier.free:
        return 200;
      case UserTier.plus:
        return 500;
      case UserTier.pro:
        return 1000;
    }
  }

  int get weeklyAnonymousLimit {
    switch (this) {
      case UserTier.free:
        return 3;
      case UserTier.plus:
        return 10;
      case UserTier.pro:
        return 1000000; // Effectively unlimited
    }
  }

  int get maxGroups {
    switch (this) {
      case UserTier.free:
        return 0;
      case UserTier.plus:
        return 1;
      case UserTier.pro:
        return 2;
    }
  }
}

/// Message delivery status
enum MessageStatus {
  sending('sending'),
  sent('sent'),
  delivered('delivered'),
  read('read'),
  failed('failed');

  const MessageStatus(this.value);
  final String value;

  static MessageStatus fromString(String value) {
    return MessageStatus.values.firstWhere(
      (status) => status.value == value,
      orElse: () => MessageStatus.sending,
    );
  }

  bool get isDelivered => this == MessageStatus.delivered || this == MessageStatus.read;
  bool get isRead => this == MessageStatus.read;
}

/// Chat types for better type safety
enum ChatType {
  direct('direct'),
  group('group'),
  anonymous('anonymous');

  const ChatType(this.value);
  final String value;

  static ChatType fromString(String value) {
    return ChatType.values.firstWhere(
      (type) => type.value == value,
      orElse: () => ChatType.direct,
    );
  }

  bool get isGroup => this == ChatType.group;
  bool get isAnonymous => this == ChatType.anonymous;
}

/// Theme options with type safety
enum AppThemeType {
  light('light'),
  dark('dark'),
  amoled('amoled'),
  ocean('ocean'),
  forest('forest'),
  sunset('sunset'),
  midnight('midnight'),
  rose('rose'),
  cosmic('cosmic'),
  neon('neon'),
  vintage('vintage'),
  minimal('minimal'),
  gradient('gradient'),
  custom('custom');

  const AppThemeType(this.value);
  final String value;

  static AppThemeType fromString(String value) {
    return AppThemeType.values.firstWhere(
      (theme) => theme.value == value,
      orElse: () => AppThemeType.light,
    );
  }

  bool isAvailableForTier(UserTier tier) {
    if (tier == UserTier.pro) return true;
    if (tier == UserTier.plus) {
      const plusThemes = [
        AppThemeType.ocean,
        AppThemeType.forest,
        AppThemeType.sunset,
        AppThemeType.midnight,
        AppThemeType.rose,
      ];
      return [AppThemeType.light, AppThemeType.dark, AppThemeType.amoled, ...plusThemes].contains(this);
    }
    return [AppThemeType.light, AppThemeType.dark, AppThemeType.amoled].contains(this);
  }
}

/// Value object for message content with validation
class MessageContent {
  final String value;

  MessageContent._(this.value);

  static Result<MessageContent, String> create(String input) {
    final trimmed = input.trim();

    if (trimmed.isEmpty) {
      return Result.error('Message cannot be empty');
    }

    if (trimmed.length > 500) {
      return Result.error('Message cannot exceed 500 characters');
    }

    if (trimmed.contains(RegExp(r'[\x00-\x1F\x7F]'))) {
      return Result.error('Message contains invalid characters');
    }

    return Result.success(MessageContent._(trimmed));
  }

  @override
  String toString() => value;

  @override
  bool operator ==(Object other) => other is MessageContent && other.value == value;

  @override
  int get hashCode => value.hashCode;
}

/// Simple Result type for functional error handling
class Result<T, E> {
  final T? value;
  final E? error;

  Result._(this.value, this.error);

  factory Result.success(T value) => Result._(value, null);
  factory Result.error(E error) => Result._(null, error);

  bool get isSuccess => value != null;
  bool get isError => error != null;
}

/// Value object for username with validation
class Username {
  final String value;

  Username._(this.value);

  static Result<Username, String> create(String input) {
    final trimmed = input.trim();

    if (trimmed.isEmpty || trimmed.length < 3 || trimmed.length > 20) {
      return Result.error('Username must be between 3-20 characters');
    }

    if (!trimmed.contains(RegExp(r'^[a-zA-Z0-9_]+$'))) {
      return Result.error('Username can only contain letters, numbers, and underscores');
    }

    return Result.success(Username._(trimmed));
  }

  @override
  String toString() => value;

  @override
  bool operator ==(Object other) => other is Username && other.value == value;

  @override
  int get hashCode => value.hashCode;
}

/// Strongly typed message ID
class MessageId {
  final String value;

  MessageId._(this.value);

  factory MessageId.generate() {
    // In real app, use proper UUID generation
    return MessageId._('msg_${DateTime.now().millisecondsSinceEpoch}_${_counter++}');
  }

  factory MessageId.fromString(String value) {
    return MessageId._(value);
  }

  @override
  String toString() => value;

  @override
  bool operator ==(Object other) => other is MessageId && other.value == value;

  @override
  int get hashCode => value.hashCode;

  static int _counter = 0;
}