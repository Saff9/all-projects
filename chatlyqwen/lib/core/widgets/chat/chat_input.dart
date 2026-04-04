/// @file lib/core/widgets/chat/chat_input.dart
/// @brief Chat input widget with message sending, attachments, and typing indicators
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file implements the chat input widget that appears at the bottom of
/// chat screens. It includes a text field for message input, send button with
/// animation, attachment options, and real-time typing indicators. The widget
/// handles keyboard management, message validation, and provides callbacks
/// for message sending and typing events.

import 'dart:async';

import 'package:chatly/core/constants/app_constants.dart';
import 'package:chatly/core/constants/theme_constants.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Optimized chat input widget that minimizes rebuilds and provides smooth UX
class ChatInput extends StatefulWidget {
  final TextEditingController controller;
  final VoidCallback onSend;
  final bool isSending;
  final Function(bool) onTyping;

  const ChatInput({
    super.key,
    required this.controller,
    required this.onSend,
    this.isSending = false,
    required this.onTyping,
  });

  @override
  State<ChatInput> createState() => _ChatInputState();
}

class _ChatInputState extends State<ChatInput> with TickerProviderStateMixin {
  late AnimationController _sendAnimationController;
  FocusNode _focusNode = FocusNode();
  Timer? _typingTimer;
  final ValueNotifier<bool> _hasTextNotifier = ValueNotifier<bool>(false);

  @override
  void initState() {
    super.initState();
    _sendAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );

    // Initialize text state
    _hasTextNotifier.value = widget.controller.text.trim().isNotEmpty;

    widget.controller.addListener(_handleTextChange);
    _focusNode.addListener(_handleFocusChange);
  }
  
  @override
  void dispose() {
    _sendAnimationController.dispose();
    widget.controller.removeListener(_handleTextChange);
    _focusNode.removeListener(_handleFocusChange);
    _focusNode.dispose();
    _typingTimer?.cancel();
    _hasTextNotifier.dispose();
    super.dispose();
  }
  
  void _handleTextChange() {
    final hasText = widget.controller.text.trim().isNotEmpty;

    // Update notifier without triggering rebuilds
    if (_hasTextNotifier.value != hasText) {
      _hasTextNotifier.value = hasText;
    }

    // Clear any existing typing timer
    _typingTimer?.cancel();

    if (hasText) {
      // Start typing indicator with debouncing
      widget.onTyping(true);

      // Set timer to stop typing indicator after 2 seconds of inactivity (optimized)
      _typingTimer = Timer(const Duration(seconds: 2), () {
        if (mounted && widget.controller.text.trim().isNotEmpty) {
          widget.onTyping(false);
        }
      });
    } else {
      // Stop typing indicator if text is empty
      widget.onTyping(false);
    }
  }
  
  void _handleFocusChange() {
    if (_focusNode.hasFocus) {
      // Show keyboard when focused
      _scrollToBottom();
    }
  }
  
  void _scrollToBottom() {
    // This would scroll the chat list to bottom
    // In real app, this would be handled by the parent widget
  }
  
  Future<void> _handleSend() async {
    if (widget.controller.text.trim().isEmpty) return;
    
    // Start send animation
    await _sendAnimationController.forward();
    await _sendAnimationController.reverse();
    
    widget.onSend();
  }
  
  void _handleAttachment() {
    // In real app, this would show attachment options
    // For now, just show a toast
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Attachments coming soon in future updates')),
    );
  }
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final screenSize = MediaQuery.of(context).size;
    
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: theme.cardColor,
        boxShadow: ThemeConstants.cardShadow,
      ),
      child: Column(
        children: [
          // Typing indicator (when other user is typing)
          if (false) // This would be controlled by parent
            Container(
              padding: const EdgeInsets.all(4),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('John is typing...'),
                  const SizedBox(width: 8),
                  _buildTypingDots(),
                ],
              ),
            ),
          
          // Input row
          Row(
            children: [
              // Attachment button
              IconButton(
                icon: const Icon(Icons.attach_file),
                onPressed: _handleAttachment,
                color: theme.primaryColor,
              ),
              
              // Text input field
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    color: theme.cardColor,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: theme.primaryColor.withOpacity(0.3),
                    ),
                  ),
                  child: ValueListenableBuilder<bool>(
                    valueListenable: _hasTextNotifier,
                    builder: (context, hasText, _) => TextField(
                      controller: widget.controller,
                      focusNode: _focusNode,
                      keyboardType: TextInputType.multiline,
                      maxLines: null,
                      minLines: 1,
                      maxLength: 500,
                      decoration: InputDecoration(
                        hintText: 'Type a message...',
                        hintStyle: theme.textTheme.bodyMedium!.copyWith(
                          color: theme.textTheme.bodyMedium!.color!.withOpacity(0.5),
                        ),
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        suffixIcon: hasText
                            ? IconButton(
                                icon: const Icon(Icons.close),
                                onPressed: () => widget.controller.clear(),
                                color: theme.textTheme.bodyMedium!.color!.withOpacity(0.5),
                              )
                            : null,
                      ),
                      style: theme.textTheme.bodyLarge,
                      onSubmitted: (_) => _handleSend(),
                    ),
                  ),
                ),
              ),
              
              // Send button with animation - only rebuild when text state changes
              ValueListenableBuilder<bool>(
                valueListenable: _hasTextNotifier,
                builder: (context, hasText, _) => _buildSendButton(theme, screenSize, hasText),
              ),
            ],
          ),
        ],
      ),
    );
  }
  
  Widget _buildTypingDots() {
    return Row(
      children: [
        _buildDot(delay: 0),
        _buildDot(delay: 200),
        _buildDot(delay: 400),
      ],
    );
  }
  
  Widget _buildDot({required int delay}) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 500),
      width: 8,
      height: 8,
      margin: const EdgeInsets.only(right: 2),
      decoration: BoxDecoration(
        color: ThemeConstants.primaryIndigo,
        shape: BoxShape.circle,
      ),
    );
  }
  
  Widget _buildSendButton(ThemeData theme, Size screenSize, bool hasText) {
    return ScaleTransition(
      scale: _sendAnimationController,
      child: IconButton(
        icon: widget.isSending
            ? const CircularProgressIndicator(strokeWidth: 2)
            : const Icon(Icons.send),
        onPressed: widget.isSending ? null : _handleSend,
        color: hasText
            ? theme.primaryColor
            : theme.textTheme.bodyMedium!.color!.withOpacity(0.5),
        padding: const EdgeInsets.all(12),
      ),
    );
  }
}
