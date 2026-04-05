/// @file lib/core/widgets/premium/premium_badge.dart
/// @brief Premium badge widget indicating premium-only features
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file implements a reusable premium badge widget that indicates
/// premium-only features throughout the application. It displays different
/// styles based on subscription tier (Plus or Pro) and provides visual
/// feedback when tapped. The badge includes animations and tooltips
/// for enhanced user experience.

import 'package:chatly/core/constants/theme_constants.dart';
import 'package:flutter/material.dart';

class PremiumBadge extends StatelessWidget {
  final String tier;
  final bool showText;
  final double size;
  
  const PremiumBadge({
    super.key,
    this.tier = 'plus',
    this.showText = true,
    this.size = 16,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final badgeColor = tier == 'pro'
        ? ThemeConstants.proDiamond
        : ThemeConstants.plusGold;
    final badgeText = tier == 'pro' ? 'Pro' : 'Plus';
    
    return GestureDetector(
      onTap: () {
        // Show tooltip or navigate to premium screen
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              tier == 'pro'
                  ? 'This feature is available with Chatly Pro subscription'
                  : 'This feature is available with Chatly Plus or Pro subscription',
            ),
            action: SnackBarAction(
              label: 'Upgrade',
              onPressed: () {
                // Navigate to premium screen
              },
            ),
          ),
        );
      },
      child: Container(
        padding: showText ? const EdgeInsets.symmetric(horizontal: 6, vertical: 2) : null,
        decoration: BoxDecoration(
          color: badgeColor.withOpacity(0.15),
          borderRadius: BorderRadius.circular(showText ? 4 : size / 2),
          border: Border.all(color: badgeColor, width: 1),
        ),
        child: showText
            ? Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    tier == 'pro' ? Icons.star : Icons.heart_broken,
                    size: size * 0.8,
                    color: badgeColor,
                  ),
                  const SizedBox(width: 2),
                  Text(
                    badgeText,
                    style: theme.textTheme.bodySmall!.copyWith(
                      color: badgeColor,
                      fontWeight: FontWeight.w600,
                      fontSize: size * 0.5,
                    ),
                  ),
                ],
              )
            : Icon(
                tier == 'pro' ? Icons.star : Icons.heart_broken,
                size: size,
                color: badgeColor,
              ),
      ),
    );
  }
}
