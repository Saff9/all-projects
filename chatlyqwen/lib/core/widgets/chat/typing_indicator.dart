/// @file lib/core/widgets/chat/typing_indicator.dart
/// @brief Typing indicator widget showing when other users are typing messages
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file implements a typing indicator widget that displays when other users
/// are typing messages in a chat. It shows the user's name and animated typing
/// dots to indicate active typing. The widget is designed to be compact and
/// non-intrusive while providing clear visual feedback about conversation activity.

import 'package:chatly/core/constants/theme_constants.dart';
import 'package:flutter/material.dart';

class TypingIndicator extends StatefulWidget {
  final String userName;
  
  const TypingIndicator({super.key, required this.userName});

  @override
  State<TypingIndicator> createState() => _TypingIndicatorState();
}

class _TypingIndicatorState extends State<TypingIndicator> with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  int _activeDot = 0;
  
  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
      lowerBound: 0,
      upperBound: 1,
    )..repeat(reverse: true);
    
    // Update active dot periodically
    _startDotAnimation();
  }
  
  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }
  
  void _startDotAnimation() {
    Future.delayed(const Duration(milliseconds: 200), () {
      if (mounted) {
        setState(() {
          _activeDot = (_activeDot + 1) % 3;
        });
        _startDotAnimation();
      }
    });
  }
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        // User avatar
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: ThemeConstants.primaryIndigo.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: const Center(
            child: Icon(Icons.person, size: 16, color: ThemeConstants.primaryIndigo),
          ),
        ),
        const SizedBox(width: 8),
        
        // Typing indicator content
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: theme.cardColor.withOpacity(0.8),
            borderRadius: BorderRadius.circular(16),
            boxShadow: ThemeConstants.cardShadow,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              // User name
              Text(
                '${widget.userName} is typing...',
                style: theme.textTheme.bodySmall!.copyWith(
                  color: theme.textTheme.bodySmall!.color!.withOpacity(0.8),
                ),
              ),
              const SizedBox(width: 8),
              
              // Typing dots
              Row(
                children: List.generate(3, (index) {
                  final isActive = index == _activeDot;
                  return Padding(
                    padding: const EdgeInsets.only(right: 2),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        color: isActive
                            ? ThemeConstants.primaryIndigo
                            : theme.textTheme.bodySmall!.color!.withOpacity(0.4),
                        shape: BoxShape.circle,
                      ),
                    ),
                  );
                }),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
