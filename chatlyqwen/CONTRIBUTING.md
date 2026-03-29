# 🤝 Contributing to Chatly

<div align="center">

# Welcome Contributors! 🎉

*Help us build the future of intelligent chat applications*

</div>

---

## 📋 Contribution Guidelines

We welcome contributions from developers of all skill levels! Whether you're fixing bugs, adding features, improving documentation, or suggesting ideas, your input is valuable.

### Quick Start
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
5. Wait for review and merge!

---

## 🏗️ Development Setup

### Prerequisites

#### Required Software
- **Flutter** 3.10.3 or later
- **Dart** 3.0 or later
- **Git** 2.25 or later
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)

#### Recommended Tools
- **VS Code** with Flutter and Dart extensions
- **Android SDK** (API level 21+)
- **iOS Simulator** or physical device
- **Chrome** for web development

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/chatly.git
   cd chatly
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Set up Firebase** (for full functionality)
   - Create Firebase project
   - Enable Authentication, Firestore, Storage
   - Add configuration files:
     - `lib/firebase_options.dart`
     - `android/app/google-services.json`
     - `ios/Runner/GoogleService-Info.plist`
     - `web/firebase-config.js`

4. **Verify setup**
   ```bash
   flutter doctor
   flutter run lib/main_minimal.dart  # Test minimal version
   flutter run lib/main.dart          # Test full version
   ```

### Project Structure

```
chatly/
├── lib/                          # Main application code
│   ├── core/                     # Core business logic
│   │   ├── constants/           # App constants
│   │   ├── errors/              # Error handling
│   │   ├── providers/           # State providers
│   │   ├── services/            # Business services
│   │   └── themes/              # UI themes
│   ├── data/                    # Data layer
│   │   ├── datasources/         # Data sources
│   │   ├── models/              # Data models
│   │   └── repositories/        # Repository pattern
│   ├── features/                # Feature modules
│   │   ├── auth/                # Authentication
│   │   ├── chat/                # Chat functionality
│   │   ├── premium/             # Premium features
│   │   └── settings/            # App settings
│   └── router/                  # Navigation
├── test/                        # Unit and integration tests
├── android/                     # Android configuration
├── ios/                         # iOS configuration
├── web/                         # Web configuration
├── docs/                        # Documentation
└── build/                       # Build artifacts
```

---

## 🚀 Development Workflow

### 1. Choose an Issue

Visit our [GitHub Issues](https://github.com/chatly/chatly/issues) and pick:
- **Good first issues** for beginners
- **Bug fixes** for stability improvements
- **Feature requests** for new functionality
- **Documentation** for helping others

### 2. Create Feature Branch

```bash
# Create and switch to feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-number-description

# Or for documentation
git checkout -b docs/improve-contributing-guide
```

### 3. Make Changes

#### Code Standards
- Follow **Dart style guide**
- Use **Effective Dart** principles
- Write **comprehensive documentation**
- Add **unit tests** for new features
- Follow **SOLID principles**

#### Commit Guidelines
```bash
# Write clear, descriptive commit messages
git commit -m "feat: add smart message suggestions

- Implement AI-powered message suggestions
- Add personality-based recommendations
- Include user preference learning
- Add comprehensive tests

Closes #123"

# Use conventional commit format
# type(scope): description
#
# Types: feat, fix, docs, style, refactor, test, chore
```

### 4. Test Your Changes

#### Run Tests
```bash
# Unit tests
flutter test

# Integration tests
flutter test integration_test/

# Widget tests
flutter test test/widget/

# With coverage
flutter test --coverage
```

#### Manual Testing
```bash
# Test on different platforms
flutter run -d chrome      # Web
flutter run -d android     # Android
flutter run -d ios         # iOS (macOS only)

# Test different screen sizes
flutter run -d chrome --web-browser-flag="--window-size=375,667"  # Mobile web
```

### 5. Submit Pull Request

#### Before Submitting
```bash
# Ensure code is formatted
flutter format .

# Run static analysis
flutter analyze

# Update documentation if needed
# Update tests if needed

# Squash commits if necessary
git rebase -i HEAD~n
```

#### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Performance improvement

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] All tests pass

## Screenshots (if applicable)
Add screenshots of UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] Tests added for new features
- [ ] All tests pass
- [ ] Ready for review
```

---

## 🧪 Testing Guidelines

### Unit Tests
```dart
// Example test for a service
import 'package:flutter_test/flutter_test.dart';
import 'package:chatly/core/services/algorithm_service.dart';

void main() {
  group('AlgorithmService', () {
    late AlgorithmService service;

    setUp(() {
      service = AlgorithmService();
    });

    test('calculateChatScore returns valid score', () {
      final messages = [
        MessageModel(
          messageId: '1',
          chatId: 'chat1',
          senderId: 'user1',
          text: 'Hello!',
          timestamp: DateTime.now(),
          expiresAt: DateTime.now().add(const Duration(days: 30)),
        )
      ];

      final score = service.calculateChatScore(
        chat: ChatModel(...),
        messages: messages,
        currentUserUid: 'user1',
      );

      expect(score, greaterThanOrEqualTo(0.0));
      expect(score, lessThanOrEqualTo(1.0));
    });
  });
}
```

### Widget Tests
```dart
// Example widget test
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:chatly/features/chat/presentation/widgets/message_bubble.dart';

void main() {
  testWidgets('MessageBubble displays text', (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: MessageBubble(
            message: MessageModel(
              messageId: '1',
              chatId: 'chat1',
              senderId: 'user1',
              text: 'Hello World!',
              timestamp: DateTime.now(),
              expiresAt: DateTime.now().add(const Duration(days: 30)),
            ),
            isCurrentUser: true,
          ),
        ),
      ),
    );

    expect(find.text('Hello World!'), findsOneWidget);
  });
}
```

### Integration Tests
```dart
// Example integration test
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:chatly/main.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('Full app integration test', (WidgetTester tester) async {
    // Build app
    await tester.pumpWidget(const ChatlyApp());

    // Navigate to login
    await tester.tap(find.text('Login'));
    await tester.pumpAndSettle();

    // Enter credentials
    await tester.enterText(find.byType(TextField).first, 'test@example.com');
    await tester.enterText(find.byType(TextField).last, 'password');

    // Submit
    await tester.tap(find.text('Sign In'));
    await tester.pumpAndSettle();

    // Verify login success
    expect(find.text('Welcome back!'), findsOneWidget);
  });
}
```

---

## 📝 Code Style Guidelines

### Dart Conventions

#### Naming Conventions
```dart
// Classes: PascalCase
class ChatService {}

// Methods: camelCase
void sendMessage() {}

// Variables: camelCase
String userName = 'John';

// Constants: SCREAMING_SNAKE_CASE
const String API_KEY = 'key';

// Private members: prefix with _
class _ChatService {
  String _apiKey;
}
```

#### Documentation
```dart
/// Calculates the optimal notification time based on user behavior.
///
/// Uses machine learning algorithms to analyze:
/// - User's typical response times
/// - Current time and day of week
/// - Battery level and device status
/// - User's activity patterns
///
/// [user] The user model containing behavior data
/// [messageTime] When the message was sent
///
/// Returns the optimal time to send notification
/// Throws [ArgumentError] if user is null
DateTime predictOptimalNotificationTime({
  required UserModel user,
  required DateTime messageTime,
}) {
  // Implementation
}
```

### Flutter Best Practices

#### Widget Structure
```dart
class MessageInput extends StatefulWidget {
  const MessageInput({super.key, required this.chatId});

  final String chatId;

  @override
  State<MessageInput> createState() => _MessageInputState();
}

class _MessageInputState extends State<MessageInput> {
  final _controller = TextEditingController();
  final _focusNode = FocusNode();

  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: _controller,
      focusNode: _focusNode,
      decoration: InputDecoration(
        hintText: 'Type a message...',
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(20),
        ),
      ),
      onSubmitted: _sendMessage,
    );
  }

  void _sendMessage(String text) {
    if (text.trim().isEmpty) return;

    // Send message logic
    _controller.clear();
  }
}
```

#### State Management
```dart
// Use Provider for state management
class AuthProvider extends ChangeNotifier {
  UserModel? _currentUser;

  UserModel? get currentUser => _currentUser;

  Future<void> signIn(String email, String password) async {
    try {
      // Sign in logic
      _currentUser = userModel;
      notifyListeners();
    } catch (e) {
      // Handle error
      notifyListeners();
    }
  }
}

// Use Consumer in widgets
class ProfileScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, auth, child) {
        if (auth.currentUser == null) {
          return const LoginPrompt();
        }

        return ProfileView(user: auth.currentUser!);
      },
    );
  }
}
```

### Error Handling
```dart
// Use custom exceptions
class ChatlyException implements Exception {
  final String message;
  final String code;

  ChatlyException(this.message, {this.code = 'UNKNOWN'});

  @override
  String toString() => 'ChatlyException: $message (${code})';
}

// Handle errors gracefully
Future<void> sendMessage(String text) async {
  try {
    await chatService.sendMessage(text);
  } on NetworkException catch (e) {
    // Show network error message
    ToastHandler.showError(context, 'Network error: ${e.message}');
  } on ValidationException catch (e) {
    // Show validation error
    ToastHandler.showError(context, e.message);
  } catch (e) {
    // Handle unexpected errors
    ErrorCatcher.reportError(e, StackTrace.current);
    ToastHandler.showError(context, 'Something went wrong');
  }
}
```

---

## 📋 Pull Request Process

### PR Checklist
- [ ] **Title**: Clear, descriptive title using conventional commits
- [ ] **Description**: Detailed explanation of changes
- [ ] **Tests**: Unit tests added for new features
- [ ] **Documentation**: Updated if needed
- [ ] **Screenshots**: For UI changes
- [ ] **Breaking Changes**: Marked if applicable
- [ ] **Related Issues**: Linked to issues if applicable

### Review Process
1. **Automated Checks**: CI/CD runs tests and linting
2. **Peer Review**: 1-2 maintainers review code
3. **Testing**: Reviewer tests functionality
4. **Approval**: Approved PRs are merged
5. **Release**: Changes included in next release

### Review Guidelines
- **Be constructive** and respectful
- **Explain reasoning** for requested changes
- **Suggest improvements** not just problems
- **Test changes** before approving
- **Consider edge cases** and error scenarios

---

## 🏷️ Issue Labels

### Priority Labels
- `🔥 critical` - Security issues, app crashes
- `🚨 high` - Major bugs, broken functionality
- `⚠️ medium` - Minor bugs, UX issues
- `📝 low` - Minor improvements, nice-to-haves

### Type Labels
- `🐛 bug` - Bug fixes
- `✨ feature` - New features
- `📚 docs` - Documentation changes
- `🎨 style` - Code style improvements
- `♻️ refactor` - Code refactoring
- `🧪 test` - Testing improvements
- `🔧 chore` - Maintenance tasks

### Status Labels
- `🚧 in-progress` - Work in progress
- `👀 needs-review` - Ready for review
- `✅ approved` - Approved for merge
- `🚫 blocked` - Blocked by dependencies
- `⏳ pending` - Waiting for information

---

## 🎯 Feature Development

### Planning New Features
1. **Create Issue**: Describe feature requirements
2. **Design Review**: Discuss implementation approach
3. **Technical Spec**: Write detailed specifications
4. **Implementation**: Develop feature with tests
5. **Code Review**: Get feedback and iterate
6. **Testing**: Comprehensive testing across platforms
7. **Documentation**: Update docs and user guides

### Feature Flags
```dart
// Use feature flags for gradual rollout
class FeatureFlags {
  static const bool smartMatching = true;
  static const bool anonymousChat = true;
  static const bool premiumFeatures = false; // Coming soon
}

// Feature-gated widgets
class SmartMatchingWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    if (!FeatureFlags.smartMatching) {
      return const SizedBox.shrink();
    }

    return const MatchSuggestionsScreen();
  }
}
```

---

## 🌍 Internationalization (i18n)

### Adding New Languages
1. **Create ARB file**: `lib/l10n/app_<locale>.arb`
2. **Add translations**:
```json
{
  "@@locale": "hi",
  "appTitle": "Chatly",
  "@appTitle": {
    "description": "Application title"
  },
  "welcomeMessage": "स्वागत है",
  "@welcomeMessage": {
    "description": "Welcome message for users"
  }
}
```

2. **Generate localization files**:
```bash
flutter gen-l10n
```

3. **Use in code**:
```dart
Text(AppLocalizations.of(context)!.welcomeMessage)
```

---

## 📈 Performance Guidelines

### Optimization Checklist
- [ ] **Images**: Compressed and appropriately sized
- [ ] **Lists**: Use `ListView.builder` for large lists
- [ ] **Widgets**: Use `const` constructors where possible
- [ ] **State**: Minimize unnecessary rebuilds
- [ ] **Memory**: Dispose controllers and subscriptions
- [ ] **Network**: Cache API responses appropriately
- [ ] **Bundle**: Tree-shake unused code

### Performance Monitoring
```dart
// Add performance tracking
class PerformanceTracker extends StatelessWidget {
  final String name;
  final Widget child;

  const PerformanceTracker({
    super.key,
    required this.name,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    final startTime = Timeline.now;

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final buildTime = Timeline.now - startTime;
      PerformanceService.instance.recordMetric(
        'build_time_$name',
        buildTime.toDouble(),
        unit: 'μs',
        category: 'ui',
      );
    });

    return child;
  }
}
```

---

## 🔒 Security Guidelines

### Secure Coding Practices
- **Never log sensitive data** (passwords, tokens, keys)
- **Validate all inputs** from users and APIs
- **Use HTTPS** for all network requests
- **Store secrets securely** (use environment variables)
- **Implement proper authentication** checks
- **Sanitize user inputs** to prevent XSS/SQL injection

### Firebase Security Rules
```javascript
// Example Firestore security rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Rate limiting for messages
    match /chats/{chatId}/messages/{messageId} {
      allow create: if isValidMessage() && rateLimit();
    }
  }

  function isValidMessage() {
    return request.resource.data.text is string
        && request.resource.data.text.size() <= 1000;
  }

  function rateLimit() {
    return true; // Implement rate limiting logic
  }
}
```

---

## 📞 Getting Help

### Communication Channels
- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and ideas
- **Discord**: Real-time chat for contributors
- **Email**: maintainers@chatly.com for private matters

### Response Times
- **Critical Issues**: Response within 24 hours
- **Bug Reports**: Response within 3-5 days
- **Feature Requests**: Response within 1-2 weeks
- **General Questions**: Response within 1 week

### Escalation Process
1. **Try Community Support** first (Discord/GitHub)
2. **Create Detailed Issue** with reproduction steps
3. **Tag Maintainers** if urgent
4. **Contact Directly** for security issues

---

## 🎖️ Recognition

### Contributor Tiers
- **🥉 First Contribution**: Welcome message and swag
- **🥈 Regular Contributor**: Recognition in release notes
- **🥇 Top Contributor**: Featured in contributor spotlight
- **👑 Core Contributor**: Invitation to maintainer team

### Rewards
- **Digital Badges**: GitHub profile badges
- **Feature Credits**: Features named after contributors
- **Beta Access**: Early access to new features
- **Exclusive Content**: Contributor-only updates

---

## 📜 License

By contributing to Chatly, you agree that your contributions will be licensed under the same MIT License that covers the project.

### Copyright Assignment
For significant contributions, you may be asked to sign a Contributor License Agreement (CLA) to ensure the project can continue to be distributed under the MIT License.

---

<div align="center">

## 🙌 Thank You for Contributing!

Your contributions help make Chatly better for everyone.

**Ready to contribute? Start with a [good first issue](https://github.com/chatly/chatly/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)!**

[⬆️ Back to Top](#-contributing-to-chatly)

</div>
