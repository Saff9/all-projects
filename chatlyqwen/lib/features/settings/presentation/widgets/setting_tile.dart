/// @file lib/features/settings/presentation/widgets/setting_tile.dart
/// @brief Reusable setting tile widget for settings screens
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file implements a reusable widget for displaying individual settings
/// items in settings screens. It supports various configurations including
/// icons, subtitles, switches, badges, and disabled states. The widget provides
/// consistent styling and interaction feedback across all settings screens.

import 'package:chatly/core/constants/theme_constants.dart';
import 'package:chatly/core/widgets/premium/premium_badge.dart';
import 'package:flutter/material.dart';

class SettingTile extends StatelessWidget {
  final String title;
  final String? subtitle;
  final IconData icon;
  final VoidCallback? onTap;
  final Color? textColor;
  final bool isSwitch;
  final bool switchValue;
  final ValueChanged<bool>? onSwitchChanged;
  final Widget? badge;
  final bool disabled;
  
  const SettingTile({
    super.key,
    required this.title,
    this.subtitle,
    required this.icon,
    this.onTap,
    this.textColor,
    this.isSwitch = false,
    this.switchValue = false,
    this.onSwitchChanged,
    this.badge,
    this.disabled = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final effectiveTextColor = textColor ?? theme.textTheme.bodyLarge!.color;
    final effectiveIconColor = disabled
        ? theme.textTheme.bodyLarge!.color!.withOpacity(0.5)
        : (textColor ?? theme.primaryColor);
    
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      leading: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: effectiveIconColor.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(
          icon,
          color: effectiveIconColor,
          size: 24,
        ),
      ),
      title: Text(
        title,
        style: theme.textTheme.titleLarge!.copyWith(
          color: disabled
              ? effectiveTextColor!.withOpacity(0.5)
              : effectiveTextColor,
          fontWeight: FontWeight.w500,
        ),
      ),
      subtitle: subtitle != null
          ? Text(
              subtitle!,
              style: theme.textTheme.bodyMedium!.copyWith(
                color: disabled
                    ? theme.textTheme.bodyMedium!.color!.withOpacity(0.5)
                    : theme.textTheme.bodyMedium!.color!.withOpacity(0.7),
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            )
          : null,
      trailing: _buildTrailing(theme),
      onTap: disabled ? null : onTap,
      enabled: !disabled,
    );
  }
  
  Widget? _buildTrailing(ThemeData theme) {
    if (isSwitch) {
      return Switch(
        value: switchValue,
        onChanged: onSwitchChanged,
        activeColor: theme.primaryColor,
        inactiveThumbColor: ThemeConstants.textSecondaryDark,
        inactiveTrackColor: ThemeConstants.textSecondaryDark.withOpacity(0.3),
      );
    }
    
    if (badge != null) {
      return badge;
    }
    
    return const Icon(Icons.chevron_right, size: 24);
  }
}
