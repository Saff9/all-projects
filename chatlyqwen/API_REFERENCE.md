# 📚 Chatly API Reference

<div align="center">

# Chatly API Documentation

*Complete API reference for developers*

</div>

---

## 📋 API Overview

Chatly provides a comprehensive set of APIs for building chat applications, managing users, and integrating with third-party services.

### API Architecture

```
├── Core APIs
│   ├── Authentication
│   ├── User Management
│   └── Chat Operations
├── Advanced APIs
│   ├── AI Services
│   ├── Analytics
│   └── Moderation
└── Integration APIs
    ├── Webhooks
    ├── REST API
    └── SDK Libraries
```

---

## 🔐 Authentication API

### Firebase Authentication

#### Initialize Authentication
```dart
import 'package:firebase_auth/firebase_auth.dart';

final FirebaseAuth _auth = FirebaseAuth.instance;

// Listen to auth state changes
Stream<User?> authStateChanges() => _auth.authStateChanges();

// Get current user
User? getCurrentUser() => _auth.currentUser;
```

#### Email/Password Authentication
```dart
// Sign Up
Future<UserCredential> signUpWithEmail(String email, String password) async {
  try {
    final credential = await _auth.createUserWithEmailAndPassword(
      email: email,
      password: password,
    );
    return credential;
  } on FirebaseAuthException catch (e) {
    throw AuthException(e.message ?? 'Sign up failed');
  }
}

// Sign In
Future<UserCredential> signInWithEmail(String email, String password) async {
  try {
    final credential = await _auth.signInWithEmailAndPassword(
      email: email,
      password: password,
    );
    return credential;
  } on FirebaseAuthException catch (e) {
    throw AuthException(e.message ?? 'Sign in failed');
  }
}
```

#### Social Authentication
```dart
// Google Sign In
Future<UserCredential> signInWithGoogle() async {
  final GoogleSignInAccount? googleUser = await GoogleSignIn().signIn();
  final GoogleSignInAuthentication googleAuth = await googleUser!.authentication;

  final credential = GoogleAuthProvider.credential(
    accessToken: googleAuth.accessToken,
    idToken: googleAuth.idToken,
  );

  return await _auth.signInWithCredential(credential);
}

// Phone Authentication
Future<void> verifyPhoneNumber(String phoneNumber) async {
  await _auth.verifyPhoneNumber(
    phoneNumber: phoneNumber,
    verificationCompleted: (PhoneAuthCredential credential) async {
      await _auth.signInWithCredential(credential);
    },
    verificationFailed: (FirebaseAuthException e) {
      throw AuthException(e.message ?? 'Verification failed');
    },
    codeSent: (String verificationId, int? resendToken) {
      // Handle code sent
    },
    codeAutoRetrievalTimeout: (String verificationId) {
      // Handle timeout
    },
  );
}
```

#### Anonymous Authentication
```dart
Future<UserCredential> signInAnonymously() async {
  try {
    final credential = await _auth.signInAnonymously();
    return credential;
  } on FirebaseAuthException catch (e) {
    throw AuthException(e.message ?? 'Anonymous sign in failed');
  }
}
```

---

## 👤 User Management API

### User Profile Operations

#### User Model
```dart
class UserModel {
  final String uid;
  final String displayName;
  final String email;
  final String? photoURL;
  final DateTime createdAt;
  final DateTime lastSeen;
  final UserTier tier;
  final Map<String, dynamic> preferences;
  final PersonalityProfile? personality;

  const UserModel({
    required this.uid,
    required this.displayName,
    required this.email,
    this.photoURL,
    required this.createdAt,
    required this.lastSeen,
    required this.tier,
    required this.preferences,
    this.personality,
  });

  // Factory constructors
  factory UserModel.fromFirebase(User user) {
    return UserModel(
      uid: user.uid,
      displayName: user.displayName ?? 'Anonymous',
      email: user.email ?? '',
      photoURL: user.photoURL,
      createdAt: user.metadata.creationTime ?? DateTime.now(),
      lastSeen: DateTime.now(),
      tier: UserTier.free,
      preferences: {},
    );
  }

  factory UserModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return UserModel(
      uid: doc.id,
      displayName: data['displayName'] ?? 'Anonymous',
      email: data['email'] ?? '',
      photoURL: data['photoURL'],
      createdAt: (data['createdAt'] as Timestamp).toDate(),
      lastSeen: (data['lastSeen'] as Timestamp).toDate(),
      tier: UserTier.values[data['tier'] ?? 0],
      preferences: data['preferences'] ?? {},
      personality: data['personality'] != null
        ? PersonalityProfile.fromJson(data['personality'])
        : null,
    );
  }

  // Methods
  Map<String, dynamic> toFirestore() {
    return {
      'displayName': displayName,
      'email': email,
      'photoURL': photoURL,
      'createdAt': Timestamp.fromDate(createdAt),
      'lastSeen': Timestamp.fromDate(lastSeen),
      'tier': tier.index,
      'preferences': preferences,
      'personality': personality?.toJson(),
    };
  }

  UserModel copyWith({
    String? displayName,
    String? photoURL,
    DateTime? lastSeen,
    UserTier? tier,
    Map<String, dynamic>? preferences,
    PersonalityProfile? personality,
  }) {
    return UserModel(
      uid: uid,
      displayName: displayName ?? this.displayName,
      email: email,
      photoURL: photoURL ?? this.photoURL,
      createdAt: createdAt,
      lastSeen: lastSeen ?? this.lastSeen,
      tier: tier ?? this.tier,
      preferences: preferences ?? this.preferences,
      personality: personality ?? this.personality,
    );
  }
}
```

#### User Service
```dart
class UserService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;

  // Get current user profile
  Future<UserModel?> getCurrentUserProfile() async {
    final user = _auth.currentUser;
    if (user == null) return null;

    final doc = await _firestore.collection('users').doc(user.uid).get();
    if (doc.exists) {
      return UserModel.fromFirestore(doc);
    }
    return null;
  }

  // Update user profile
  Future<void> updateUserProfile(UserModel userProfile) async {
    await _firestore.collection('users').doc(userProfile.uid).set(
      userProfile.toFirestore(),
      SetOptions(merge: true),
    );
  }

  // Update last seen
  Future<void> updateLastSeen(String userId) async {
    await _firestore.collection('users').doc(userId).update({
      'lastSeen': FieldValue.serverTimestamp(),
    });
  }

  // Get user by ID
  Future<UserModel?> getUserById(String userId) async {
    final doc = await _firestore.collection('users').doc(userId).get();
    if (doc.exists) {
      return UserModel.fromFirestore(doc);
    }
    return null;
  }

  // Search users
  Future<List<UserModel>> searchUsers(String query) async {
    final snapshot = await _firestore
        .collection('users')
        .where('displayName', isGreaterThanOrEqualTo: query)
        .where('displayName', isLessThan: query + 'z')
        .limit(20)
        .get();

    return snapshot.docs.map((doc) => UserModel.fromFirestore(doc)).toList();
  }
}
```

---

## 💬 Chat API

### Chat Model
```dart
enum ChatType { direct, group, anonymous }

class ChatModel {
  final String chatId;
  final ChatType type;
  final String name;
  final String? description;
  final String? photoURL;
  final List<String> participantIds;
  final String createdBy;
  final DateTime createdAt;
  final DateTime lastMessageAt;
  final String? lastMessageText;
  final String? lastMessageSenderId;
  final bool isEncrypted;
  final List<String> topicTags;
  final Map<String, dynamic> metadata;

  const ChatModel({
    required this.chatId,
    required this.type,
    required this.name,
    this.description,
    this.photoURL,
    required this.participantIds,
    required this.createdBy,
    required this.createdAt,
    required this.lastMessageAt,
    this.lastMessageText,
    this.lastMessageSenderId,
    this.isEncrypted = false,
    this.topicTags = const [],
    this.metadata = const {},
  });

  factory ChatModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return ChatModel(
      chatId: doc.id,
      type: ChatType.values[data['type'] ?? 0],
      name: data['name'] ?? 'Unnamed Chat',
      description: data['description'],
      photoURL: data['photoURL'],
      participantIds: List<String>.from(data['participantIds'] ?? []),
      createdBy: data['createdBy'] ?? '',
      createdAt: (data['createdAt'] as Timestamp).toDate(),
      lastMessageAt: (data['lastMessageAt'] as Timestamp).toDate(),
      lastMessageText: data['lastMessageText'],
      lastMessageSenderId: data['lastMessageSenderId'],
      isEncrypted: data['isEncrypted'] ?? false,
      topicTags: List<String>.from(data['topicTags'] ?? []),
      metadata: data['metadata'] ?? {},
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'type': type.index,
      'name': name,
      'description': description,
      'photoURL': photoURL,
      'participantIds': participantIds,
      'createdBy': createdBy,
      'createdAt': Timestamp.fromDate(createdAt),
      'lastMessageAt': Timestamp.fromDate(lastMessageAt),
      'lastMessageText': lastMessageText,
      'lastMessageSenderId': lastMessageSenderId,
      'isEncrypted': isEncrypted,
      'topicTags': topicTags,
      'metadata': metadata,
    };
  }
}
```

### Message Model
```dart
enum MessageStatus { sending, sent, delivered, read, failed }
enum MessageType { text, image, video, file, audio, location }

class MessageModel {
  final String messageId;
  final String chatId;
  final String senderId;
  final String text;
  final MessageType type;
  final DateTime timestamp;
  final DateTime expiresAt;
  final MessageStatus status;
  final List<String> readBy;
  final String? replyToMessageId;
  final String? forwardedFrom;
  final Map<String, dynamic>? metadata;
  final bool isEncrypted;
  final bool isAnonymous;

  const MessageModel({
    required this.messageId,
    required this.chatId,
    required this.senderId,
    required this.text,
    this.type = MessageType.text,
    required this.timestamp,
    required this.expiresAt,
    this.status = MessageStatus.sent,
    this.readBy = const [],
    this.replyToMessageId,
    this.forwardedFrom,
    this.metadata,
    this.isEncrypted = false,
    this.isAnonymous = false,
  });

  static String generateId() {
    return const Uuid().v4();
  }

  factory MessageModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return MessageModel(
      messageId: doc.id,
      chatId: data['chatId'] ?? '',
      senderId: data['senderId'] ?? '',
      text: data['text'] ?? '',
      type: MessageType.values[data['type'] ?? 0],
      timestamp: (data['timestamp'] as Timestamp).toDate(),
      expiresAt: (data['expiresAt'] as Timestamp).toDate(),
      status: MessageStatus.values[data['status'] ?? 1],
      readBy: List<String>.from(data['readBy'] ?? []),
      replyToMessageId: data['replyToMessageId'],
      forwardedFrom: data['forwardedFrom'],
      metadata: data['metadata'],
      isEncrypted: data['isEncrypted'] ?? false,
      isAnonymous: data['isAnonymous'] ?? false,
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'chatId': chatId,
      'senderId': senderId,
      'text': text,
      'type': type.index,
      'timestamp': Timestamp.fromDate(timestamp),
      'expiresAt': Timestamp.fromDate(expiresAt),
      'status': status.index,
      'readBy': readBy,
      'replyToMessageId': replyToMessageId,
      'forwardedFrom': forwardedFrom,
      'metadata': metadata,
      'isEncrypted': isEncrypted,
      'isAnonymous': isAnonymous,
    };
  }
}
```

### Chat Service
```dart
class ChatService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;

  // Get user chats
  Stream<List<ChatModel>> getUserChats() {
    final userId = _auth.currentUser?.uid;
    if (userId == null) return Stream.value([]);

    return _firestore
        .collection('chats')
        .where('participantIds', arrayContains: userId)
        .orderBy('lastMessageAt', descending: true)
        .snapshots()
        .map((snapshot) =>
            snapshot.docs.map((doc) => ChatModel.fromFirestore(doc)).toList());
  }

  // Create new chat
  Future<String> createChat({
    required String name,
    required List<String> participantIds,
    ChatType type = ChatType.direct,
    bool isEncrypted = false,
  }) async {
    final userId = _auth.currentUser?.uid;
    if (userId == null) throw Exception('User not authenticated');

    final chatId = const Uuid().v4();
    final chat = ChatModel(
      chatId: chatId,
      type: type,
      name: name,
      participantIds: [...participantIds, userId],
      createdBy: userId,
      createdAt: DateTime.now(),
      lastMessageAt: DateTime.now(),
      isEncrypted: isEncrypted,
    );

    await _firestore.collection('chats').doc(chatId).set(chat.toFirestore());
    return chatId;
  }

  // Send message
  Future<void> sendMessage(MessageModel message) async {
    final batch = _firestore.batch();

    // Add message
    final messageRef = _firestore
        .collection('chats')
        .doc(message.chatId)
        .collection('messages')
        .doc(message.messageId);
    batch.set(messageRef, message.toFirestore());

    // Update chat metadata
    final chatRef = _firestore.collection('chats').doc(message.chatId);
    batch.update(chatRef, {
      'lastMessageAt': Timestamp.fromDate(message.timestamp),
      'lastMessageText': message.text,
      'lastMessageSenderId': message.senderId,
    });

    await batch.commit();
  }

  // Get chat messages
  Stream<List<MessageModel>> getChatMessages(String chatId, {int limit = 50}) {
    return _firestore
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .orderBy('timestamp', descending: true)
        .limit(limit)
        .snapshots()
        .map((snapshot) =>
            snapshot.docs.map((doc) => MessageModel.fromFirestore(doc)).toList());
  }

  // Mark messages as read
  Future<void> markMessagesAsRead(String chatId, List<String> messageIds) async {
    final userId = _auth.currentUser?.uid;
    if (userId == null) return;

    final batch = _firestore.batch();

    for (final messageId in messageIds) {
      final messageRef = _firestore
          .collection('chats')
          .doc(chatId)
          .collection('messages')
          .doc(messageId);

      batch.update(messageRef, {
        'readBy': FieldValue.arrayUnion([userId]),
        'status': MessageStatus.read.index,
      });
    }

    await batch.commit();
  }
}
```

---

## 🤖 AI Services API

### Personality Analyzer
```dart
class PersonalityAnalyzer {
  static PersonalityProfile analyzeUserPersonality(List<MessageModel> messages) {
    if (messages.isEmpty) return PersonalityProfile.neutral();

    final sentiment = _calculateOverallSentiment(messages);
    final style = _analyzeCommunicationStyle(messages);
    final activityPattern = _analyzeActivityPatterns(messages);

    return PersonalityProfile(
      talkativeness: _calculateTalkativeness(messages),
      positivity: sentiment,
      communicationStyle: style,
      interests: _extractInterests(messages),
      activityPattern: activityPattern,
    );
  }

  static double _calculateTalkativeness(List<MessageModel> messages) {
    final totalChars = messages.fold<int>(0, (sum, msg) => sum + msg.text.length);
    final avgChars = totalChars / messages.length;
    return _normalizeScore(avgChars, 10, 200); // 0-1 scale
  }

  static double _calculateOverallSentiment(List<MessageModel> messages) {
    final positiveWords = ['good', 'great', 'awesome', 'love', 'happy', 'thanks'];
    final negativeWords = ['bad', 'terrible', 'hate', 'angry', 'sad', 'disappointed'];

    int positive = 0, negative = 0;

    for (final message in messages) {
      final text = message.text.toLowerCase();
      for (final word in positiveWords) {
        if (text.contains(word)) positive++;
      }
      for (final word in negativeWords) {
        if (text.contains(word)) negative++;
      }
    }

    final total = positive + negative;
    return total == 0 ? 0.5 : positive / total;
  }

  static CommunicationStyle _analyzeCommunicationStyle(List<MessageModel> messages) {
    final hasEmojis = messages.any((msg) => _containsEmoji(msg.text));
    final avgCaps = messages.map((msg) =>
      msg.text.split('').where((c) => c == c.toUpperCase()).length / msg.text.length
    ).reduce((a, b) => a + b) / messages.length;

    if (avgCaps > 0.3) return CommunicationStyle.excited;
    if (hasEmojis) return CommunicationStyle.friendly;
    return CommunicationStyle.professional;
  }

  static List<String> _extractInterests(List<MessageModel> messages) {
    final interests = <String>[];
    final commonTopics = {
      'music': ['music', 'song', 'band', 'concert'],
      'sports': ['football', 'basketball', 'game', 'match'],
      'tech': ['computer', 'phone', 'app', 'code'],
      'travel': ['trip', 'vacation', 'flight', 'beach'],
    };

    for (final entry in commonTopics.entries) {
      final mentions = messages.where((msg) =>
        entry.value.any((word) => msg.text.toLowerCase().contains(word))
      ).length;

      if (mentions > messages.length * 0.1) {
        interests.add(entry.key);
      }
    }

    return interests;
  }

  static double _normalizeScore(double value, double min, double max) {
    return ((value - min) / (max - min)).clamp(0.0, 1.0);
  }
}
```

### Smart Matching
```dart
class ChatMatcher {
  static List<MatchResult> findBestMatches({
    required UserModel currentUser,
    required List<UserModel> potentialMatches,
    required List<ChatModel> existingChats,
  }) {
    final results = <MatchResult>[];

    for (final candidate in potentialMatches) {
      if (candidate.uid == currentUser.uid) continue;

      // Skip existing chats
      if (existingChats.any((chat) =>
        chat.participantIds.contains(candidate.uid))) continue;

      final score = _calculateMatchScore(currentUser, candidate);
      final reasons = _getMatchReasons(currentUser, candidate, score);

      if (score > 0.3) {
        results.add(MatchResult(
          user: candidate,
          score: score,
          reasons: reasons,
        ));
      }
    }

    results.sort((a, b) => b.score.compareTo(a.score));
    return results.take(5).toList();
  }

  static double _calculateMatchScore(UserModel u1, UserModel u2) {
    double score = 0.0;

    // Age compatibility
    if ((u1.age - u2.age).abs() <= 5) score += 0.2;

    // Shared interests
    final shared = u1.interests.where((i) => u2.interests.contains(i)).length;
    score += (shared / u1.interests.length) * 0.3;

    // Communication style
    if (u1.communicationStyle == u2.communicationStyle) {
      score += 0.2;
    }

    // Activity patterns
    final activityCompat = _calculateActivityCompatibility(u1, u2);
    score += activityCompat * 0.2;

    return score.clamp(0.0, 1.0);
  }
}
```

---

## 🔒 Encryption API

### Encryption Service
```dart
class EncryptionService {
  static final EncryptionService _instance = EncryptionService._internal();
  static EncryptionService get instance => _instance;

  EncryptionService._internal();

  Future<void> init() async {
    // Initialize encryption keys
  }

  Future<EncryptedMessage> encryptMessage({
    required String message,
    required List<String> recipientIds,
  }) async {
    // AES-256-GCM encryption implementation
    final key = _generateRandomKey(32);
    final iv = _generateRandomKey(16);

    final messageBytes = utf8.encode(message);
    final encrypted = _encryptAES(messageBytes, key, iv);
    final mac = _generateMAC(base64.encode(encrypted), key);
    final keyShares = _generateKeyShares(key, recipientIds);

    return EncryptedMessage(
      ciphertext: base64.encode(encrypted),
      iv: base64.encode(iv),
      mac: mac,
      keyShares: keyShares,
      recipientIds: recipientIds,
      encryptionTime: DateTime.now(),
    );
  }

  Future<String> decryptMessage({
    required EncryptedMessage encryptedMessage,
    required String recipientId,
  }) async {
    final keyShare = encryptedMessage.keyShares[recipientId];
    if (keyShare == null) throw Exception('No key share available');

    final key = _reconstructKey(keyShare, recipientId);
    final calculatedMac = _generateMAC(encryptedMessage.ciphertext, key);

    if (calculatedMac != encryptedMessage.mac) {
      throw Exception('Message integrity verification failed');
    }

    final encrypted = base64.decode(encryptedMessage.ciphertext);
    final iv = base64.decode(encryptedMessage.iv);
    final decrypted = _decryptAES(encrypted, key, iv);

    return utf8.decode(decrypted);
  }

  Uint8List _generateRandomKey(int length) {
    final random = Random.secure();
    return Uint8List.fromList(
      List<int>.generate(length, (_) => random.nextInt(256)),
    );
  }

  Uint8List _encryptAES(Uint8List data, Uint8List key, Uint8List iv) {
    // AES-GCM encryption implementation
    // This is a placeholder - use pointycastle or similar in production
    return data; // Placeholder
  }

  Uint8List _decryptAES(Uint8List data, Uint8List key, Uint8List iv) {
    // AES-GCM decryption implementation
    return data; // Placeholder
  }

  String _generateMAC(String data, Uint8List key) {
    final hmac = Hmac(sha256, key);
    final hash = hmac.convert(utf8.encode(data));
    return base64.encode(hash.bytes);
  }
}
```

---

## 📊 Analytics API

### Performance Service
```dart
class PerformanceService {
  static final PerformanceService _instance = PerformanceService._internal();

  static PerformanceService get instance => _instance;

  PerformanceService._internal();

  final Map<String, PerformanceMetric> _metrics = {};
  final StreamController<PerformanceMetric> _metricStream = StreamController.broadcast();

  Stream<PerformanceMetric> get metricStream => _metricStream.stream;

  void startMonitoring() {
    Timer.periodic(const Duration(seconds: 30), _recordPeriodicMetrics);
    _recordMetric('app_startup', DateTime.now().millisecondsSinceEpoch.toDouble(),
        unit: 'ms', category: 'startup');
  }

  void recordMetric(String name, double value,
      {String unit = 'ms', String category = 'general'}) {
    final metric = PerformanceMetric(
      name: name,
      value: value,
      timestamp: DateTime.now(),
      unit: unit,
      category: category,
    );

    _metrics[name] = metric;
    FirebaseAnalytics.instance.logEvent(
      name: 'performance_metric',
      parameters: {
        'metric_name': name,
        'value': value,
        'unit': unit,
        'category': category,
      },
    );

    if (kDebugMode) {
      print('📊 Performance: $name = ${value.toStringAsFixed(2)} $unit');
    }

    _metricStream.add(metric);
  }

  PerformanceReport getReport() {
    final memoryUsage = _getCurrentMemoryUsage();
    final buildMetrics = _metrics.values.where((m) => m.category == 'ui').toList();
    final operationMetrics = _metrics.values.where((m) => m.category == 'operation').toList();

    final avgBuildTime = buildMetrics.isNotEmpty
        ? buildMetrics.map((m) => m.value).reduce((a, b) => a + b) / buildMetrics.length
        : 0.0;

    final avgOperationTime = operationMetrics.isNotEmpty
        ? operationMetrics.map((m) => m.value).reduce((a, b) => a + b) / operationMetrics.length
        : 0.0;

    final bottlenecks = _identifyBottlenecks();

    return PerformanceReport(
      totalMetrics: _metrics.length,
      memoryUsage: memoryUsage,
      averageBuildTime: avgBuildTime,
      averageOperationTime: avgOperationTime,
      bottlenecks: bottlenecks,
      recommendations: _generateRecommendations(bottlenecks),
    );
  }
}
```

---

## 🔧 Integration APIs

### Webhook Support
```dart
class WebhookService {
  static Future<void> sendWebhook({
    required String url,
    required Map<String, dynamic> payload,
    required String secret,
  }) async {
    final signature = _generateSignature(payload, secret);

    final response = await http.post(
      Uri.parse(url),
      headers: {
        'Content-Type': 'application/json',
        'X-Chatly-Signature': signature,
        'X-Chatly-Event': payload['event'],
      },
      body: json.encode(payload),
    );

    if (response.statusCode != 200) {
      throw Exception('Webhook delivery failed: ${response.statusCode}');
    }
  }

  static String _generateSignature(Map<String, dynamic> payload, String secret) {
    final payloadString = json.encode(payload);
    final hmac = Hmac(sha256, utf8.encode(secret));
    final signature = hmac.convert(utf8.encode(payloadString));
    return base64.encode(signature.bytes);
  }
}
```

### REST API Client
```dart
class ChatlyApiClient {
  static const String baseUrl = 'https://api.chatly.com/v1';

  final http.Client _client;
  final String? _apiKey;

  ChatlyApiClient({http.Client? client, String? apiKey})
      : _client = client ?? http.Client(),
        _apiKey = apiKey;

  Future<Map<String, dynamic>> get(String endpoint) async {
    final response = await _client.get(
      Uri.parse('$baseUrl$endpoint'),
      headers: _getHeaders(),
    );

    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> post(String endpoint, Map<String, dynamic> data) async {
    final response = await _client.post(
      Uri.parse('$baseUrl$endpoint'),
      headers: _getHeaders(),
      body: json.encode(data),
    );

    return _handleResponse(response);
  }

  Map<String, String> _getHeaders() {
    return {
      'Content-Type': 'application/json',
      if (_apiKey != null) 'Authorization': 'Bearer $_apiKey',
    };
  }

  Map<String, dynamic> _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return json.decode(response.body);
    } else {
      throw ApiException('API request failed: ${response.statusCode}', response.body);
    }
  }
}
```

---

## 📋 Data Types

### Enums
```dart
enum UserTier { free, plus, pro }

enum CommunicationStyle { professional, friendly, excited }

enum MessageStatus { sending, sent, delivered, read, failed }

enum MessageType { text, image, video, file, audio, location }

enum ChatType { direct, group, anonymous }
```

### Exception Classes
```dart
class ChatlyException implements Exception {
  final String message;
  final String? code;
  final dynamic details;

  ChatlyException(this.message, {this.code, this.details});

  @override
  String toString() => 'ChatlyException: $message${code != null ? ' ($code)' : ''}';
}

class AuthException extends ChatlyException {
  AuthException(String message) : super(message, code: 'AUTH_ERROR');
}

class ApiException extends ChatlyException {
  final int? statusCode;

  ApiException(String message, [String? details, this.statusCode])
      : super(message, code: 'API_ERROR', details: details);
}

class ValidationException extends ChatlyException {
  ValidationException(String message) : super(message, code: 'VALIDATION_ERROR');
}
```

---

## 🔗 SDK Libraries

### JavaScript SDK
```javascript
// Installation
npm install chatly-sdk

// Usage
import { ChatlyClient } from 'chatly-sdk';

const client = new ChatlyClient({
  apiKey: 'your-api-key',
  projectId: 'your-project-id'
});

// Send message
await client.sendMessage({
  chatId: 'chat-123',
  text: 'Hello, World!',
  type: 'text'
});

// Listen for messages
client.onMessage((message) => {
  console.log('New message:', message);
});
```

### React Native SDK
```typescript
import Chatly, { MessageList, MessageInput } from 'react-native-chatly';

export default function ChatScreen() {
  return (
    <Chatly.ChatContainer chatId="chat-123">
      <MessageList />
      <MessageInput />
    </Chatly.ChatContainer>
  );
}
```

---

## 📈 Rate Limits & Quotas

### API Rate Limits
```
Free Tier:    100 requests/minute
Plus Tier:    500 requests/minute
Pro Tier:     2000 requests/minute
Enterprise:   Custom limits
```

### Message Limits
```
Free:         100 messages/day
Plus:         Unlimited messages
Pro:          Unlimited + analytics
Enterprise:   Custom quotas
```

### Storage Limits
```
Free:         1GB storage
Plus:         10GB storage
Pro:          100GB storage
Enterprise:   Unlimited
```

---

## 🏷️ Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `AUTH_ERROR` | Authentication failed | 401 |
| `PERMISSION_DENIED` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `VALIDATION_ERROR` | Invalid input data | 400 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `INTERNAL_ERROR` | Server error | 500 |

---

## 🔗 Related Links

- [Firebase Documentation](https://firebase.google.com/docs)
- [Flutter API Reference](https://api.flutter.dev/)
- [Material Design Guidelines](https://material.io/design)
- [Web API Standards](https://developer.mozilla.org/en-US/docs/Web/API)

---

<div align="center">

## 🎯 API Reference Complete

*Comprehensive documentation for all Chatly APIs*

**🚀 Ready to build amazing chat experiences!**

[⬆️ Back to Top](#-chatly-api-reference)

</div>