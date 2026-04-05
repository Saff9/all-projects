/// @file lib/core/widgets/chat/message_bubble.dart
/// @brief Message bubble widget for chat messages with reactions and delivery status
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file implements a reusable widget for displaying chat message bubbles
/// with support for different message types, reactions, delivery status indicators,
/// and swipe-to-reply functionality. The widget handles both sent and received
/// messages with appropriate styling and animations.

import 'dart:async';
import 'package:chatly/core/constants/app_constants.dart';
import 'package:chatly/core/constants/theme_constants.dart';
import 'package:chatly/data/models/message_model.dart';
import 'package:chatly/data/models/user_model.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class MessageBubble extends StatefulWidget {
  final MessageModel message;
  final String currentUser;
  final UserModel otherUser;
  final Function(String, String) onReaction;
  final Function(String) onSwipeReply;
  final String deliveryStatus;
  
  const MessageBubble({
    super.key,
    required this.message,
    required this.currentUser,
    required this.otherUser,
    required this.onReaction,
    required this.onSwipeReply,
    required this.deliveryStatus,
  });

  @override
  State<MessageBubble> createState() => _MessageBubbleState();
}

class _MessageBubbleState extends State<MessageBubble> with SingleTickerProviderStateMixin {
  late AnimationController _reactionAnimationController;
  bool _showReactionPicker = false;
  final GlobalKey _reactionPickerKey = GlobalKey();
  
  @override
  void initState() {
    super.initState();
    _reactionAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
      lowerBound: 0,
      upperBound: 1,
    );
  }
  
  @override
  void dispose() {
    _reactionAnimationController.dispose();
    super.dispose();
  }
  
  bool get _isCurrentUserMessage => widget.message.senderId == widget.currentUser;
  
  void _toggleReactionPicker() {
    setState(() {
      _showReactionPicker = !_showReactionPicker;
    });
    
    if (_showReactionPicker) {
      _reactionAnimationController.forward();
    } else {
      _reactionAnimationController.reverse();
    }
  }
  
  void _handleReaction(String emoji) {
    widget.onReaction(widget.message.messageId, emoji);
    _toggleReactionPicker();
  }
  
  void _handleLongPress() {
    _toggleReactionPicker();
  }
  
  void _handleSwipe() {
    widget.onSwipeReply(widget.message.messageId);
    ToastHandler.showInfo(context, 'Replying to message');
  }
  
  String? _getUserReaction() {
    return widget.message.getUserReaction(widget.currentUser);
  }
  
  Map<String, int> _getReactionCounts() {
    return widget.message.getReactionCounts();
  }
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isCurrentUserMessage = _isCurrentUserMessage;
    final messageColor = isCurrentUserMessage
        ? ThemeConstants.primaryIndigo
        : ThemeConstants.backgroundSurfaceLight;
    final textColor = isCurrentUserMessage
        ? Colors.white
        : theme.textTheme.bodyLarge!.color;
    
    // Determine if message should show as deleted
    final isDeleted = widget.message.isDeleted || widget.message.isExpired;
    final displayText = isDeleted
        ? 'Message deleted'
        : (widget.message.text.isNotEmpty ? widget.message.text : '[Empty message]');
    
    return Padding(
      padding: EdgeInsets.only(
        left: isCurrentUserMessage ? 60 : 16,
        right: isCurrentUserMessage ? 16 : 60,
        top: 8,
        bottom: 8,
      ),
      child: GestureDetector(
        onLongPress: _handleLongPress,
        onHorizontalDragEnd: (details) {
          if (details.primaryVelocity != null && details.primaryVelocity! > 0) {
            _handleSwipe();
          }
        },
        child: Column(
          crossAxisAlignment: isCurrentUserMessage ? CrossAxisAlignment.end : CrossAxisAlignment.start,
          children: [
            // Message bubble
            Container(
              constraints: BoxConstraints(
                maxWidth: MediaQuery.of(context).size.width * 0.75,
              ),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: isDeleted
                    ? ThemeConstants.textSecondaryLight.withOpacity(0.1)
                    : messageColor,
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(18),
                  topRight: const Radius.circular(18),
                  bottomLeft: isCurrentUserMessage ? const Radius.circular(18) : const Radius.circular(4),
                  bottomRight: isCurrentUserMessage ? const Radius.circular(4) : const Radius.circular(18),
                ),
                boxShadow: [
                  BoxShadow(
                    color: isCurrentUserMessage
                        ? ThemeConstants.primaryIndigo.withOpacity(0.2)
                        : Colors.grey.withOpacity(0.1),
                    blurRadius: 4,
                    spreadRadius: 1,
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Message sender (for group chats or forwarded messages)
                  if (widget.message.forwardedFrom != null || widget.message.replyToMessageId != null)
                    _buildMessageContext(theme),
                  
                  // Message content
                  if (isDeleted)
                    Icon(Icons.delete, size: 20, color: ThemeConstants.textSecondaryLight),
                  
                  if (!isDeleted)
                    Text(
                      displayText,
                      style: theme.textTheme.bodyMedium!.copyWith(
                        color: textColor,
                        fontSize: 16,
                      ),
                    ),
                  
                  // Delivery status and timestamp
                  if (!isDeleted)
                    _buildMessageFooter(theme),
                ],
              ),
            ),
            
            // Reactions
            if (_getReactionCounts().isNotEmpty)
              _buildReactionsRow(theme),
            
            // Reaction picker (animated)
            if (_showReactionPicker)
              _buildReactionPicker(theme),
          ],
        ),
      ),
    );
  }
  
  Widget _buildMessageContext(ThemeData theme) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        children: [
          if (widget.message.forwardedFrom != null)
            Icon(Icons.forward, size: 14, color: theme.textTheme.bodySmall!.color!.withOpacity(0.7)),
          
          if (widget.message.replyToMessageId != null)
            Icon(Icons.reply, size: 14, color: theme.textTheme.bodySmall!.color!.withOpacity(0.7)),
          
          const SizedBox(width: 4),
          Text(
            widget.message.forwardedFrom != null
                ? 'Forwarded'
                : 'Replying to ${widget.message.senderId == widget.currentUser ? 'you' : widget.otherUser.username}',
            style: theme.textTheme.bodySmall!.copyWith(
              color: theme.textTheme.bodySmall!.color!.withOpacity(0.7),
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildMessageFooter(ThemeData theme) {
    final isCurrentUserMessage = _isCurrentUserMessage;
    
    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: Row(
        mainAxisAlignment: isCurrentUserMessage ? MainAxisAlignment.end : MainAxisAlignment.start,
        children: [
          // Timestamp
          Text(
            widget.message.getFormattedTime(),
            style: theme.textTheme.bodySmall!.copyWith(
              color: isCurrentUserMessage
                  ? Colors.white70
                  : theme.textTheme.bodySmall!.color!.withOpacity(0.7),
            ),
          ),
          
          // Delivery status (only for current user's messages)
          if (isCurrentUserMessage)
            const SizedBox(width: 4),
          
          if (isCurrentUserMessage)
            Text(
              widget.deliveryStatus,
              style: theme.textTheme.bodySmall!.copyWith(
                color: widget.deliveryStatus.contains('Read')
                    ? ThemeConstants.secondaryEmerald
                    : (widget.deliveryStatus.contains('Sent')
                        ? ThemeConstants.primaryIndigo
                        : theme.textTheme.bodySmall!.color!.withOpacity(0.7)),
              ),
            ),
        ],
      ),
    );
  }
  
  Widget _buildReactionsRow(ThemeData theme) {
    final reactions = _getReactionCounts();
    final userReaction = _getUserReaction();
    
    return Padding(
      padding: EdgeInsets.only(
        left: _isCurrentUserMessage ? 60 : 0,
        right: _isCurrentUserMessage ? 0 : 60,
        top: 4,
      ),
      child: GestureDetector(
        onTap: _toggleReactionPicker,
        child: Row(
          children: reactions.entries.map((entry) {
            final isUserReaction = userReaction == entry.key;
            return Padding(
              padding: const EdgeInsets.only(right: 8),
              child: Row(
                children: [
                  Text(
                    entry.key,
                    style: TextStyle(
                      fontSize: 18,
                      color: isUserReaction ? theme.primaryColor : null,
                    ),
                  ),
                  const SizedBox(width: 2),
                  Text(
                    entry.value.toString(),
                    style: theme.textTheme.bodySmall!.copyWith(
                      color: isUserReaction ? theme.primaryColor : theme.textTheme.bodySmall!.color!.withOpacity(0.7),
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
  
  Widget _buildReactionPicker(ThemeData theme) {
    final availableReactions = ['❤️', '😂', '😍', '😮', '😢', '😡', '👍', '🙏'];
    final userReaction = _getUserReaction();
    
    return ScaleTransition(
      scale: _reactionAnimationController,
      child: Padding(
        padding: EdgeInsets.only(
          left: _isCurrentUserMessage ? 60 : 16,
          right: _isCurrentUserMessage ? 16 : 60,
          top: 4,
        ),
        child: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: theme.cardColor,
            borderRadius: BorderRadius.circular(12),
            boxShadow: ThemeConstants.cardShadow,
          ),
          child: Wrap(
            spacing: 8,
            runSpacing: 4,
            children: availableReactions.map((emoji) {
              final isSelected = userReaction == emoji;
              return GestureDetector(
                onTap: () => _handleReaction(emoji),
                child: Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: isSelected ? theme.primaryColor.withOpacity(0.2) : theme.cardColor,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(
                      color: isSelected ? theme.primaryColor : theme.dividerColor,
                    ),
                  ),
                  child: Center(
                    child: Text(
                      emoji,
                      style: const TextStyle(fontSize: 20),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }
}

/// Helper function to show reaction picker
void showReactionPicker(BuildContext context, Offset position, Function(String) onReaction) {
  final availableReactions = ['❤️', '😂', '😍', '😮', '😢', '😡', '👍', '🙏'];
  
  showMenu<String>(
    context: context,
    position: RelativeRect.fromLTRB(
      position.dx - 100,
      position.dy - 150,
      position.dx + 100,
      position.dy,
    ),
    items: availableReactions.map((String emoji) {
      return PopupMenuItem<String>(
        value: emoji,
        child: Text(emoji, style: const TextStyle(fontSize: 24)),
      );
    }).toList(),
  ).then((String? selectedReaction) {
    if (selectedReaction != null) {
      onReaction(selectedReaction);
    }
  });
}

/// Helper for showing info messages
class ToastHandler {
  static void showInfo(BuildContext context, String message) {
    final scaffoldMessenger = ScaffoldMessenger.of(context);
    scaffoldMessenger.showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.info, color: Colors.white, size: 20),
            const SizedBox(width: 8),
            Text(message, style: const TextStyle(color: Colors.white)),
          ],
        ),
        backgroundColor: ThemeConstants.primaryIndigo,
        duration: const Duration(seconds: 2),
      ),
    );
  }
  
  static void showError(BuildContext context, String message) {
    final scaffoldMessenger = ScaffoldMessenger.of(context);
    scaffoldMessenger.showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.error, color: Colors.white, size: 20),
            const SizedBox(width: 8),
            Text(message, style: const TextStyle(color: Colors.white)),
          ],
        ),
        backgroundColor: ThemeConstants.errorRed,
        duration: const Duration(seconds: 3),
      ),
    );
  }
}
