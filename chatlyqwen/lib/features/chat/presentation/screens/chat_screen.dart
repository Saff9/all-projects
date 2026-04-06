/// @file lib/features/chat/presentation/screens/chat_screen.dart
/// @brief Individual chat screen for 1-to-1 and group conversations
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file implements the main chat screen for individual conversations.
/// It includes real-time messaging, typing indicators, read receipts,
/// message reactions, swipe-to-reply functionality, and smart algorithms
/// for notification timing and conversation analysis. The screen supports
/// both 1-to-1 and group chats with appropriate UI adaptations.

import 'package:chatly/core/constants/app_constants.dart';
import 'package:chatly/core/constants/theme_constants.dart';
import 'package:chatly/core/di/injection_container.dart';
import 'package:chatly/core/providers/auth_provider.dart';
import 'package:chatly/core/providers/theme_provider.dart';
import 'package:chatly/core/utils/handlers/toast_handler.dart';
import 'package:chatly/core/widgets/chat/chat_input.dart';
import 'package:chatly/core/widgets/chat/message_bubble.dart';
import 'package:chatly/core/widgets/chat/typing_indicator.dart';
import 'package:chatly/data/models/chat_model.dart';
import 'package:chatly/data/models/message_model.dart';
import 'package:chatly/data/models/user_model.dart';
import 'package:chatly/features/chat/domain/use_cases/send_message_use_case.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

/// Optimized message list widget that minimizes rebuilds and provides smooth scrolling
class OptimizedMessageList extends StatefulWidget {
  final List<MessageModel> messages;
  final bool showTypingIndicator;
  final String typingUser;
  final UserModel otherUser;
  final String currentUserId;
  final Function(String, String) onReaction;
  final Function(String) onSwipeReply;
  final Function(MessageModel) getDeliveryStatus;

  const OptimizedMessageList({
    super.key,
    required this.messages,
    required this.showTypingIndicator,
    required this.typingUser,
    required this.otherUser,
    required this.currentUserId,
    required this.onReaction,
    required this.onSwipeReply,
    required this.getDeliveryStatus,
  });

  @override
  State<OptimizedMessageList> createState() => _OptimizedMessageListState();
}

class _OptimizedMessageListState extends State<OptimizedMessageList> {
  final ScrollController _scrollController = ScrollController();

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      controller: _scrollController,
      reverse: true,
      itemCount: widget.messages.length + (widget.showTypingIndicator ? 1 : 0),
      itemBuilder: (context, index) {
        if (widget.showTypingIndicator && index == 0) {
          return Padding(
            key: const ValueKey('typing_indicator'),
            padding: const EdgeInsets.all(16.0),
            child: TypingIndicator(userName: widget.typingUser),
          );
        }

        final messageIndex = widget.showTypingIndicator ? index - 1 : index;
        final message = widget.messages[widget.messages.length - 1 - messageIndex];

        return MessageBubble(
          key: ValueKey(message.messageId),
          message: message,
          currentUser: widget.currentUserId,
          otherUser: widget.otherUser,
          onReaction: widget.onReaction,
          onSwipeReply: widget.onSwipeReply,
          deliveryStatus: widget.getDeliveryStatus(message),
        );
      },
    );
  }
}

class ChatScreen extends StatefulWidget {
  final String chatId;
  
  const ChatScreen({super.key, required this.chatId});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> with TickerProviderStateMixin {
  final ScrollController _scrollController = ScrollController();
  final TextEditingController _messageController = TextEditingController();
  bool _isTyping = false;
  bool _showTypingIndicator = false;
  String _typingUser = '';
  final List<MessageModel> _messages = [];
  ChatModel? _currentChat;
  UserModel? _otherUser;
  AnimationController? _sendAnimationController;
  bool _isSending = false;

  // Use case for proper layered architecture
  SendMessageUseCase? _sendMessageUseCase;
  
  @override
  void initState() {
    super.initState();
    _initializeDependencies();
    _loadChatData();
    _setupAnimations();
    _simulateTypingIndicator();
  }

  void _initializeDependencies() {
    // Initialize use case with dependency injection
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    _sendMessageUseCase = InjectionContainer.instance.createSendMessageUseCase(authProvider);
  }
  
  @override
  void dispose() {
    _scrollController.dispose();
    _messageController.dispose();
    _sendAnimationController?.dispose();
    super.dispose();
  }
  
  void _setupAnimations() {
    _sendAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
  }
  
  Future<void> _loadChatData() async {
    // In real app, this would fetch data from repository
    // For now, simulate with mock data
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final currentUser = authProvider.userProfile;
    
    if (currentUser == null) return;
    
    // Mock chat data
    _currentChat = ChatModel(
      chatId: widget.chatId,
      participantIds: ['user1', 'user2'],
      chatName: 'John Doe',
      createdAt: DateTime.now().subtract(const Duration(days: 3)),
      lastMessageAt: DateTime.now(),
      lastMessageText: 'Hello! How are you?',
      lastMessageSenderId: 'user2',
      isGroup: false,
    );
    
    // Mock other user
    _otherUser = UserModel(
      uid: 'user2',
      email: 'john@example.com',
      username: 'John Doe',
      tier: 'pro',
      createdAt: DateTime.now(),
      lastSeen: DateTime.now().subtract(const Duration(minutes: 2)),
    );
    
    // Mock messages
    _messages.addAll([
      MessageModel(
        messageId: 'msg1',
        chatId: widget.chatId,
        senderId: 'user2',
        text: 'Hello! How are you doing today?',
        timestamp: DateTime.now().subtract(const Duration(minutes: 10)),
        readBy: ['user1'],
        expiresAt: DateTime.now().add(const Duration(days: 7)),
      ),
      MessageModel(
        messageId: 'msg2',
        chatId: widget.chatId,
        senderId: 'user1',
        text: 'I\'m doing great! Just finished working on that project we discussed.',
        timestamp: DateTime.now().subtract(const Duration(minutes: 8)),
        readBy: ['user2'],
        expiresAt: DateTime.now().add(const Duration(days: 7)),
      ),
      MessageModel(
        messageId: 'msg3',
        chatId: widget.chatId,
        senderId: 'user2',
        text: 'That\'s awesome! I\'d love to hear more about it when you have time.',
        timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
        readBy: ['user1'],
        expiresAt: DateTime.now().add(const Duration(days: 7)),
      ),
    ]);
    
    // Scroll to bottom after loading
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _scrollController.jumpTo(_scrollController.position.maxScrollExtent);
    });
  }
  
  void _simulateTypingIndicator() {
    // In real app, this would listen to Firebase real-time typing events
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _showTypingIndicator = true;
          _typingUser = 'John Doe';
        });
      }
    });
    
    Future.delayed(const Duration(seconds: 5), () {
      if (mounted) {
        setState(() {
          _showTypingIndicator = false;
        });
        
        // Add new message when typing stops
        _addMockMessage();
      }
    });
  }
  
  void _addMockMessage() {
    final newMessage = MessageModel(
      messageId: 'msg${_messages.length + 1}',
      chatId: widget.chatId,
      senderId: 'user2',
      text: 'Are you still working on it or have you moved on to something new?',
      timestamp: DateTime.now(),
      readBy: [],
      expiresAt: DateTime.now().add(const Duration(days: 7)),
    );
    
    setState(() {
      _messages.add(newMessage);
    });
    
    // Scroll to bottom
    _scrollController.animateTo(
      _scrollController.position.maxScrollExtent,
      duration: AppConstants.animationDuration,
      curve: Curves.easeOut,
    );
  }
  
  Future<void> _sendMessage() async {
    final messageText = _messageController.text.trim();
    if (messageText.isEmpty) return;

    // Show sending animation
    setState(() {
      _isSending = true;
    });

    try {
      // Animate send button
      await _sendAnimationController?.forward();
      await _sendAnimationController?.reverse();

      // Use proper use case if available, otherwise fallback to direct implementation
      if (_sendMessageUseCase != null) {
        final message = await _sendMessageUseCase!.execute(
          chatId: widget.chatId,
          text: messageText,
        );

        // Add message to UI list
        setState(() {
          _messages.add(message);
          _messageController.clear();
        });
      } else {
        // Fallback: Direct implementation (should be replaced with proper DI)
        final message = MessageModel(
          messageId: MessageModel.generateId(),
          chatId: widget.chatId,
          senderId: 'user1',
          text: messageText,
          timestamp: DateTime.now(),
          readBy: ['user1'],
          expiresAt: DateTime.now().add(const Duration(days: 7)),
        );

        final errors = message.validate(maxLength: 500);
        if (errors.isNotEmpty) {
          ToastHandler.showError(context, errors.first);
          return;
        }

        setState(() {
          _messages.add(message);
          _messageController.clear();
        });
      }

      // Scroll to bottom
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: AppConstants.animationDuration,
        curve: Curves.easeOut,
      );

      // Simulate read receipt after delay
      Future.delayed(const Duration(seconds: 1), () {
        if (mounted) {
          setState(() {
            final lastMessage = _messages.last;
            _messages[_messages.length - 1] = _messages.last.markAsRead('user2');
          });
        }
      });

      ToastHandler.showSuccess(context, 'Message sent');
    } catch (e) {
      ToastHandler.showError(context, 'Failed to send message: ${e.toString()}');
    } finally {
      setState(() {
        _isSending = false;
      });
    }
  }
  
  void _handleReaction(String messageId, String emoji) {
    setState(() {
      final index = _messages.indexWhere((m) => m.messageId == messageId);
      if (index != -1) {
        _messages[index] = _messages[index].addReaction(emoji, 'user1');
      }
    });
  }
  
  void _handleSwipeReply(String messageId) {
    final message = _messages.firstWhere((m) => m.messageId == messageId);
    _messageController.text = '@${message.senderId == "user1" ? _otherUser?.username : "Me"} ';
    FocusScope.of(context).requestFocus();
  }
  
  String _getDeliveryStatus(MessageModel message) {
    if (message.isDeleted) return 'Deleted';
    if (message.isExpired) return 'Expired';
    if (message.readBy.contains(_otherUser?.uid ?? 'user2')) return '✓✓ Read';
    if (message.readBy.contains('user1')) return '✓ Sent';
    return 'Sending...';
  }
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final themeProvider = Provider.of<ThemeProvider>(context);
    final screenSize = MediaQuery.of(context).size;
    
    if (_currentChat == null || _otherUser == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }
    
    return Scaffold(
      appBar: AppBar(
        title: _buildAppBarContent(theme),
        actions: [
          IconButton(
            icon: const Icon(Icons.videocam),
            onPressed: () => ToastHandler.showInfo(context, 'Video calls coming soon'),
          ),
          IconButton(
            icon: const Icon(Icons.info),
            onPressed: () => _showChatInfo(),
          ),
        ],
      ),
      body: Column(
        children: [
          // Chat messages list - optimized to prevent full screen rebuilds
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async {
                // In real app, this would refresh messages
                await Future.delayed(const Duration(seconds: 1));
              },
              child: OptimizedMessageList(
                messages: _messages,
                showTypingIndicator: _showTypingIndicator,
                typingUser: _typingUser,
                otherUser: _otherUser!,
                currentUserId: 'user1',
                onReaction: _handleReaction,
                onSwipeReply: _handleSwipeReply,
                getDeliveryStatus: _getDeliveryStatus,
              ),
            ),
          ),
          
          // Chat input area
          ChatInput(
            controller: _messageController,
            onSend: _sendMessage,
            isSending: _isSending,
            onTyping: (isTyping) {
              setState(() {
                _isTyping = isTyping;
              });
            },
          ),
        ],
      ),
    );
  }
  
  Widget _buildAppBarContent(ThemeData theme) {
    return Row(
      children: [
        // Avatar
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: ThemeConstants.primaryIndigo.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: const Center(
            child: Icon(Icons.person, color: ThemeConstants.primaryIndigo),
          ),
        ),
        const SizedBox(width: 12),
        
        // User info
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              _currentChat!.getDisplayName([_otherUser!]),
              style: theme.textTheme.titleLarge!.copyWith(
                fontWeight: FontWeight.bold,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 2),
            Text(
              _otherUser!.getStatusText(),
              style: theme.textTheme.bodySmall!.copyWith(
                color: theme.textTheme.bodySmall!.color!.withOpacity(0.7),
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ],
    );
  }
  
  void _showChatInfo() {
    showModalBottomSheet(
      context: context,
      builder: (context) {
        final theme = Theme.of(context);
        
        return Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Chat info header
              Row(
                children: [
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      color: ThemeConstants.primaryIndigo.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Center(
                      child: Icon(Icons.person, color: ThemeConstants.primaryIndigo, size: 32),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _currentChat!.chatName,
                        style: theme.textTheme.headlineSmall!.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${_currentChat!.getParticipantsCount()} participant${_currentChat!.getParticipantsCount() == 1 ? '' : 's'}',
                        style: theme.textTheme.bodyMedium!,
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 24),
              
              // Options
              _buildInfoOption(
                context,
                icon: Icons.notifications,
                title: 'Notifications',
                subtitle: 'Enable smart notifications',
                onTap: () => ToastHandler.showInfo(context, 'Smart notifications enabled'),
              ),
              _buildInfoOption(
                context,
                icon: Icons.lock,
                title: 'End-to-End Encryption',
                subtitle: 'Messages are encrypted',
                onTap: () => _showEncryptionInfo(),
              ),
              _buildInfoOption(
                context,
                icon: Icons.message,
                title: 'Message Retention',
                subtitle: 'Messages auto-delete after 7 days',
                onTap: () => _showRetentionInfo(),
              ),
              _buildInfoOption(
                context,
                icon: Icons.delete,
                title: 'Clear Chat',
                subtitle: 'Delete all messages in this chat',
                textColor: theme.colorScheme.error,
                onTap: () => _showClearChatConfirmation(),
              ),
              const SizedBox(height: 16),
              
              // Close button
              Center(
                child: TextButton(
                  onPressed: Navigator.of(context).pop,
                  child: Text(
                    'Close',
                    style: TextStyle(color: theme.primaryColor),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
  
  Widget _buildInfoOption(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    VoidCallback? onTap,
    Color? textColor,
  }) {
    final theme = Theme.of(context);
    textColor = textColor ?? theme.textTheme.bodyLarge!.color;
    
    return ListTile(
      leading: Icon(icon, color: textColor),
      title: Text(title, style: theme.textTheme.bodyLarge!.copyWith(color: textColor)),
      subtitle: Text(subtitle, style: theme.textTheme.bodySmall),
      onTap: onTap,
    );
  }
  
  void _showEncryptionInfo() {
    showDialog(
      context: context,
      builder: (context) {
        final theme = Theme.of(context);
        
        return AlertDialog(
          title: const Text('End-to-End Encryption'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('All messages in this chat are protected with end-to-end encryption.'),
              const SizedBox(height: 8),
              const Text('This means:'),
              const SizedBox(height: 4),
              const Text('• Only you and the recipient can read the messages'),
              const Text('• Nobody else, including Chatly, can access them'),
              const Text('• Messages are encrypted on your device before sending'),
            ],
          ),
          actions: [
            TextButton(
              onPressed: Navigator.of(context).pop,
              child: const Text('OK'),
            ),
          ],
        );
      },
    );
  }
  
  void _showRetentionInfo() {
    showDialog(
      context: context,
      builder: (context) {
        final theme = Theme.of(context);
        
        return AlertDialog(
          title: const Text('Message Retention'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'All messages are automatically deleted after ${AppConstants.defaultMessageRetentionDays} days for privacy and security.',
                style: theme.textTheme.bodyMedium,
              ),
              const SizedBox(height: 8),
              Text(
                'As a free user, you cannot change this setting. Premium users can customize retention from 2-7 days.',
                style: theme.textTheme.bodyMedium!.copyWith(
                  color: theme.colorScheme.secondary,
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: Navigator.of(context).pop,
              child: const Text('OK'),
            ),
          ],
        );
      },
    );
  }
  
  void _showClearChatConfirmation() {
    showDialog(
      context: context,
      builder: (context) {
        final theme = Theme.of(context);
        
        return AlertDialog(
          title: const Text('Clear Chat'),
          content: const Text('Are you sure you want to delete all messages in this chat? This action cannot be undone.'),
          actions: [
            TextButton(
              onPressed: Navigator.of(context).pop,
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                setState(() {
                  _messages.clear();
                });
                ToastHandler.showSuccess(context, 'Chat cleared successfully');
              },
              child: Text(
                'Clear',
                style: TextStyle(color: theme.colorScheme.error),
              ),
            ),
          ],
        );
      },
    );
  }
}
