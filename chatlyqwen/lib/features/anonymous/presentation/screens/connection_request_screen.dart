/// @file lib/features/anonymous/presentation/screens/connection_request_screen.dart
/// @brief Screen for anonymous connection requests to transition to regular chats
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file implements the screen that handles connection requests between users
/// who met through anonymous chat. It displays the anonymous message thread,
/// allows users to send/receive connection requests, and facilitates the transition
/// from anonymous to regular 1-to-1 chat. The screen includes privacy controls
/// and real-time status updates.

import 'dart:async';
import 'package:chatly/core/constants/app_constants.dart';
import 'package:chatly/core/constants/route_constants.dart';
import 'package:chatly/core/constants/theme_constants.dart';
import 'package:chatly/core/providers/auth_provider.dart';
import 'package:chatly/core/utils/handlers/toast_handler.dart';
import 'package:chatly/core/widgets/common/custom_button.dart';
import 'package:chatly/core/widgets/chat/message_bubble.dart';
import 'package:chatly/data/models/message_model.dart';
import 'package:chatly/data/models/user_model.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class ConnectionRequestScreen extends StatefulWidget {
  final String anonymousId;
  
  const ConnectionRequestScreen({super.key, required this.anonymousId});

  @override
  State<ConnectionRequestScreen> createState() => _ConnectionRequestScreenState();
}

class _ConnectionRequestScreenState extends State<ConnectionRequestScreen> {
  List<AnonymousMessageThread> _threadMessages = [];
  ConnectionStatus _status = ConnectionStatus.waiting;
  Timer? _statusTimer;
  bool _isLoading = false;
  bool _isSendingRequest = false;
  
  @override
  void initState() {
    super.initState();
    _loadThreadData();
    _simulateConnectionProcess();
  }
  
  @override
  void dispose() {
    _statusTimer?.cancel();
    super.dispose();
  }
  
  Future<void> _loadThreadData() async {
    // In real app, this would fetch from repository
    await Future.delayed(const Duration(milliseconds: 500));
    
    setState(() {
      _threadMessages = [
        AnonymousMessageThread(
          id: 'msg1',
          text: 'Feeling alone today. Anyone want to talk?',
          timestamp: DateTime.now().subtract(const Duration(hours: 2)),
          isCurrentUser: false,
        ),
        AnonymousMessageThread(
          id: 'msg2',
          text: 'I\'m here. How can I help?',
          timestamp: DateTime.now().subtract(const Duration(hours: 1, minutes: 45)),
          isCurrentUser: true,
        ),
        AnonymousMessageThread(
          id: 'msg3',
          text: 'Just need someone to listen, I guess. Life has been tough lately.',
          timestamp: DateTime.now().subtract(const Duration(hours: 1, minutes: 30)),
          isCurrentUser: false,
        ),
      ];
    });
  }
  
  void _simulateConnectionProcess() {
    // Simulate different connection states
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted && _status == ConnectionStatus.waiting) {
        setState(() {
          _status = ConnectionStatus.requested;
        });
      }
    });
    
    Future.delayed(const Duration(seconds: 8), () {
      if (mounted && _status == ConnectionStatus.requested) {
        setState(() {
          _status = ConnectionStatus.accepted;
        });
      }
    });
  }
  
  Future<void> _sendConnectionRequest() async {
    if (_status != ConnectionStatus.waiting) return;
    
    setState(() {
      _isSendingRequest = true;
    });
    
    try {
      // In real app, this would send a connection request to backend
      await Future.delayed(const Duration(seconds: 2));
      
      setState(() {
        _status = ConnectionStatus.requested;
      });
      
      ToastHandler.showInfo(context, 'Connection request sent!');
      
      // Simulate response after delay
      _statusTimer = Timer(const Duration(seconds: 5), () {
        if (mounted) {
          setState(() {
            _status = ConnectionStatus.accepted;
          });
          ToastHandler.showSuccess(context, 'Connection accepted! You can now chat normally.');
        }
      });
      
    } catch (e) {
      ToastHandler.showError(context, 'Failed to send request: ${e.toString()}');
      setState(() {
        _status = ConnectionStatus.waiting;
      });
    } finally {
      setState(() {
        _isSendingRequest = false;
      });
    }
  }
  
  void _handleCancelRequest() {
    _statusTimer?.cancel();
    setState(() {
      _status = ConnectionStatus.waiting;
    });
    ToastHandler.showInfo(context, 'Request cancelled');
  }
  
  void _handleStartChat() {
    // In real app, this would create a regular chat between the users
    Navigator.pushNamed(context, RouteConstants.chat, arguments: {'chatId': 'new_chat_${DateTime.now().millisecondsSinceEpoch}'});
  }
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final authProvider = Provider.of<AuthProvider>(context);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('🎭 Anonymous Connection'),
        actions: [
          if (_status == ConnectionStatus.waiting)
            IconButton(
              icon: const Icon(Icons.refresh),
              onPressed: _loadThreadData,
            ),
        ],
      ),
      body: Column(
        children: [
          // Status banner
          _buildStatusBanner(theme),
          
          // Thread messages
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _threadMessages.length,
              itemBuilder: (context, index) {
                final message = _threadMessages[index];
                return _buildMessageBubble(message, authProvider.userProfile!);
              },
            ),
          ),
          
          // Action button
          _buildActionButton(theme),
        ],
      ),
    );
  }
  
  Widget _buildStatusBanner(ThemeData theme) {
    String statusText;
    Color statusColor;
    IconData statusIcon;
    
    switch (_status) {
      case ConnectionStatus.waiting:
        statusText = 'Waiting for connection...';
        statusColor = ThemeConstants.primaryIndigo;
        statusIcon = Icons.hourglass_empty;
        break;
      case ConnectionStatus.requested:
        statusText = 'Request sent! Waiting for response...';
        statusColor = ThemeConstants.accentAmber;
        statusIcon = Icons.send;
        break;
      case ConnectionStatus.accepted:
        statusText = 'Connection established!';
        statusColor = ThemeConstants.secondaryEmerald;
        statusIcon = Icons.check_circle;
        break;
      case ConnectionStatus.rejected:
        statusText = 'Connection rejected';
        statusColor = ThemeConstants.errorRed;
        statusIcon = Icons.close;
        break;
    }
    
    return Container(
      padding: const EdgeInsets.all(12),
      color: statusColor.withOpacity(0.1),
      child: Row(
        children: [
          Icon(statusIcon, color: statusColor, size: 20),
          const SizedBox(width: 8),
          Text(
            statusText,
            style: theme.textTheme.bodyMedium!.copyWith(
              color: statusColor,
              fontWeight: FontWeight.w600,
            ),
          ),
          const Spacer(),
          if (_status == ConnectionStatus.requested)
            IconButton(
              icon: const Icon(Icons.close),
              onPressed: _handleCancelRequest,
              color: theme.colorScheme.error,
            ),
        ],
      ),
    );
  }
  
  Widget _buildMessageBubble(AnonymousMessageThread message, UserModel currentUser) {
    final theme = Theme.of(context);
    
    return Padding(
      padding: EdgeInsets.only(
        left: message.isCurrentUser ? 60 : 16,
        right: message.isCurrentUser ? 16 : 60,
        bottom: 12,
      ),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: message.isCurrentUser
              ? ThemeConstants.primaryIndigo
              : theme.cardColor,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          crossAxisAlignment: message.isCurrentUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
          children: [
            // Message content
            Text(
              message.text,
              style: theme.textTheme.bodyMedium!.copyWith(
                color: message.isCurrentUser ? Colors.white : theme.textTheme.bodyMedium!.color,
              ),
            ),
            
            // Timestamp
            const SizedBox(height: 4),
            Align(
              alignment: message.isCurrentUser ? Alignment.centerRight : Alignment.centerLeft,
              child: Text(
                _formatTime(message.timestamp),
                style: theme.textTheme.bodySmall!.copyWith(
                  color: message.isCurrentUser
                      ? Colors.white70
                      : theme.textTheme.bodySmall!.color!.withOpacity(0.7),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildActionButton(ThemeData theme) {
    if (_status == ConnectionStatus.accepted) {
      return Padding(
        padding: const EdgeInsets.all(16),
        child: CustomButton(
          text: 'Start Regular Chat',
          onPressed: _handleStartChat,
          icon: Icons.chat,
          backgroundColor: ThemeConstants.secondaryEmerald,
        ),
      );
    }
    
    if (_status == ConnectionStatus.waiting) {
      return Padding(
        padding: const EdgeInsets.all(16),
        child: CustomButton(
          text: _isSendingRequest ? 'Sending Request...' : 'Send Connection Request',
          onPressed: _isSendingRequest ? null : _sendConnectionRequest,
          icon: Icons.send,
          isLoading: _isSendingRequest,
        ),
      );
    }
    
    if (_status == ConnectionStatus.rejected) {
      return Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            CustomButton(
              text: 'Send New Request',
              onPressed: _sendConnectionRequest,
              icon: Icons.refresh,
            ),
            const SizedBox(height: 8),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text(
                'Back to Anonymous Feed',
                style: theme.textTheme.bodyMedium!.copyWith(
                  color: theme.primaryColor,
                ),
              ),
            ),
          ],
        ),
      );
    }
    
    return const SizedBox(height: 60); // Space for waiting/requested states
  }
  
  String _formatTime(DateTime timestamp) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final messageDate = DateTime(timestamp.year, timestamp.month, timestamp.day);
    
    if (messageDate.isAtSameMomentAs(today)) {
      return '${timestamp.hour}:${timestamp.minute.toString().padLeft(2, '0')}';
    } else if (messageDate.isAtSameMomentAs(today.subtract(const Duration(days: 1)))) {
      return 'Yesterday ${timestamp.hour}:${timestamp.minute.toString().padLeft(2, '0')}';
    } else {
      return '${messageDate.day}/${messageDate.month}/${messageDate.year}';
    }
  }
}

enum ConnectionStatus {
  waiting,
  requested,
  accepted,
  rejected,
}

class AnonymousMessageThread {
  final String id;
  final String text;
  final DateTime timestamp;
  final bool isCurrentUser;
  
  AnonymousMessageThread({
    required this.id,
    required this.text,
    required this.timestamp,
    required this.isCurrentUser,
  });
}
