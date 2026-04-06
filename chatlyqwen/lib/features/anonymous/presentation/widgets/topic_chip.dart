/// @file lib/features/anonymous/presentation/widgets/topic_chip.dart
/// @brief Topic chip widget for selecting and displaying topic tags
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file implements a reusable topic chip widget that can be used for
/// selecting and displaying topic tags in the anonymous chat feature. It provides
/// visual feedback for selection state, supports both tap and long press interactions,
/// and includes animations for enhanced user experience.

import 'package:chatly/core/constants/theme_constants.dart';
import 'package:flutter/material.dart';

class TopicChip extends StatefulWidget {
  final String text;
  final bool isSelected;
  final VoidCallback? onPressed;
  final VoidCallback? onLongPress;
  final double fontSize;
  
  const TopicChip({
    super.key,
    required this.text,
    this.isSelected = false,
    this.onPressed,
    this.onLongPress,
    this.fontSize = 14,
  });

  @override
  State<TopicChip> createState() => _TopicChipState();
}

class _TopicChipState extends State<TopicChip> with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  bool _isPressed = false;
  
  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 150),
      lowerBound: 0,
      upperBound: 1,
    );
  }
  
  @override
  void didUpdateWidget(covariant TopicChip oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isSelected != oldWidget.isSelected) {
      if (widget.isSelected) {
        _animationController.forward();
      } else {
        _animationController.reverse();
      }
    }
  }
  
  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }
  
  void _handlePressDown() {
    if (widget.onPressed != null) {
      setState(() {
        _isPressed = true;
      });
    }
  }
  
  void _handlePressUp() {
    if (widget.onPressed != null) {
      setState(() {
        _isPressed = false;
      });
    }
  }
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final backgroundColor = widget.isSelected
        ? ThemeConstants.primaryIndigo.withOpacity(0.2)
        : theme.cardColor;
    final borderColor = widget.isSelected
        ? theme.primaryColor
        : theme.dividerColor;
    final textColor = widget.isSelected
        ? theme.primaryColor
        : theme.textTheme.bodyMedium!.color!.withOpacity(0.8);
    
    return GestureDetector(
      onTapDown: (_) => _handlePressDown(),
      onTapUp: (_) => _handlePressUp(),
      onTapCancel: () => _handlePressUp(),
      onTap: widget.onPressed,
      onLongPress: widget.onLongPress,
      child: ScaleTransition(
        scale: _animationController,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: backgroundColor,
            border: Border.all(color: borderColor, width: 1.5),
            borderRadius: BorderRadius.circular(16),
            boxShadow: _isPressed
                ? [
                    BoxShadow(
                      color: theme.primaryColor.withOpacity(0.3),
                      blurRadius: 8,
                      spreadRadius: 1,
                    ),
                  ]
                : [],
          ),
          child: Text(
            widget.text,
            style: theme.textTheme.bodyMedium!.copyWith(
              color: textColor,
              fontSize: widget.fontSize,
              fontWeight: widget.isSelected ? FontWeight.w600 : FontWeight.normal,
            ),
          ),
        ),
      ),
    );
  }
}
