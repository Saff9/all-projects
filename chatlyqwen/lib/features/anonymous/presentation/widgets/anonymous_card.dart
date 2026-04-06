/// @file lib/features/anonymous/presentation/widgets/anonymous_card.dart
/// @brief Widget for displaying anonymous messages in the feed
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file implements a reusable card widget for displaying anonymous messages
/// in the feed. It shows the message content, topic tags, view/reply counts,
/// and provides interaction options like connecting with the anonymous user.
/// The widget includes animations and visual feedback for user interactions.

import 'package:chatly/core/constants/theme_constants.dart';
import 'package:chatly/core/utils/handlers/toast_handler.dart';
import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';

class AnonymousCard extends StatefulWidget {
  final AnonymousMessage message;
  final VoidCallback onTap;
  final bool canInteract;
  
  const AnonymousCard({
    super.key,
    required this.message,
    required this.onTap,
    this.canInteract = true,
  });

  @override
  State<AnonymousCard> createState() => _AnonymousCardState();
}

class _AnonymousCardState extends State<AnonymousCard> with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  bool _isExpanded = false;
  bool _isHovering = false;
  
  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
      lowerBound: 0,
      upperBound: 1,
    );
  }
  
  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }
  
  void _handleTap() {
    if (widget.canInteract) {
      widget.onTap();
    }
  }
  
  void _handleLongPress() {
    if (widget.canInteract) {
      setState(() {
        _isExpanded = !_isExpanded;
      });
      
      if (_isExpanded) {
        _animationController.forward();
      } else {
        _animationController.reverse();
      }
    }
  }
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final screenSize = MediaQuery.of(context).size;
    
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: GestureDetector(
        onTap: _handleTap,
        onLongPress: _handleLongPress,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          decoration: BoxDecoration(
            color: theme.cardColor,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 10,
                spreadRadius: 2,
              ),
            ],
            border: Border.all(
              color: _isHovering && widget.canInteract
                  ? theme.primaryColor
                  : theme.dividerColor,
              width: _isHovering && widget.canInteract ? 1.5 : 1,
            ),
          ),
          child: Column(
            children: [
              // Message content
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Topic tags
                    Wrap(
                      spacing: 8,
                      children: widget.message.topics.map((topic) {
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: ThemeConstants.primaryIndigo.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            topic,
                            style: theme.textTheme.bodySmall!.copyWith(
                              color: theme.primaryColor,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 12),
                    
                    // Message text
                    Text(
                      widget.message.text,
                      style: theme.textTheme.bodyLarge!.copyWith(
                        height: 1.5,
                      ),
                      maxLines: _isExpanded ? null : 3,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 8),
                    
                    // Show more/less button
                    if (widget.message.text.length > 150)
                      Align(
                        alignment: Alignment.centerRight,
                        child: TextButton(
                          onPressed: () {
                            setState(() {
                              _isExpanded = !_isExpanded;
                            });
                          },
                          child: Text(
                            _isExpanded ? 'Show less' : 'Show more',
                            style: theme.textTheme.bodySmall!.copyWith(
                              color: theme.primaryColor,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              
              // Stats and action button
              _buildFooter(theme),
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildFooter(ThemeData theme) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          // Stats
          Row(
            children: [
              Icon(Icons.visibility, size: 16, color: theme.textTheme.bodySmall!.color!.withOpacity(0.7)),
              const SizedBox(width: 4),
              Text(
                '${widget.message.seenCount}',
                style: theme.textTheme.bodySmall!.copyWith(
                  color: theme.textTheme.bodySmall!.color!.withOpacity(0.7),
                ),
              ),
              const SizedBox(width: 16),
              Icon(Icons.question_answer, size: 16, color: theme.textTheme.bodySmall!.color!.withOpacity(0.7)),
              const SizedBox(width: 4),
              Text(
                '${widget.message.replyCount}',
                style: theme.textTheme.bodySmall!.copyWith(
                  color: theme.textTheme.bodySmall!.color!.withOpacity(0.7),
                ),
              ),
            ],
          ),
          const Spacer(),
          
          // Time ago
          Text(
            widget.message.timeAgo,
            style: theme.textTheme.bodySmall!.copyWith(
              color: theme.textTheme.bodySmall!.color!.withOpacity(0.7),
            ),
          ),
          const SizedBox(width: 16),
          
          // Connect button
          if (widget.message.canConnect)
            _buildConnectButton(theme),
        ],
      ),
    );
  }
  
  Widget _buildConnectButton(ThemeData theme) {
    return AnimatedScale(
      scale: _animationController.value,
      duration: const Duration(milliseconds: 200),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: ThemeConstants.primaryIndigo,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Lottie.asset(
              'assets/animations/mask_drop.json',
              width: 24,
              height: 24,
              fit: BoxFit.contain,
            ),
            const SizedBox(width: 4),
            Text(
              'Connect',
              style: theme.textTheme.bodyMedium!.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class AnonymousMessage {
  final String id;
  final String text;
  final List<String> topics;
  final int seenCount;
  final int replyCount;
  final String timeAgo;
  final bool canConnect;
  
  AnonymousMessage({
    required this.id,
    required this.text,
    required this.topics,
    required this.seenCount,
    required this.replyCount,
    required this.timeAgo,
    required this.canConnect,
  });
}
