/// @file lib/features/auth/presentation/widgets/social_auth_buttons.dart
/// @brief Social authentication buttons widget
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file implements a widget that displays social authentication buttons
/// including Google sign-in and phone authentication options. It provides a
/// consistent UI for social login options across different authentication screens
/// and handles the respective authentication flows.

import 'package:flutter/material.dart';

class SocialAuthButtons extends StatelessWidget {
  final VoidCallback onGoogleLogin;
  final VoidCallback onPhoneLogin;
  
  const SocialAuthButtons({
    super.key,
    required this.onGoogleLogin,
    required this.onPhoneLogin,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Column(
      children: [
        // Google Sign-in button
        _buildSocialButton(
          context,
          icon: Icons.account_circle,
          label: 'Continue with Google',
          color: const Color(0xFFDB4437),
          onPressed: onGoogleLogin,
        ),
        const SizedBox(height: 12),
        
        // Phone authentication button
        _buildSocialButton(
          context,
          icon: Icons.phone,
          label: 'Continue with Phone',
          color: const Color(0xFF4285F4),
          onPressed: onPhoneLogin,
        ),
        const SizedBox(height: 12),
        
        // WhatsApp OTP button (future implementation)
        if (false) // Disabled for now - future feature
          _buildSocialButton(
            context,
            icon: Icons.message,
            label: 'Continue with WhatsApp',
            color: const Color(0xFF25D366),
            onPressed: () {},
          ),
      ],
    );
  }

  Widget _buildSocialButton(
    BuildContext context, {
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onPressed,
  }) {
    final theme = Theme.of(context);
    
    return ElevatedButton.icon(
      icon: Icon(icon, color: Colors.white),
      label: Text(
        label,
        style: theme.textTheme.labelLarge!.copyWith(
          color: Colors.white,
          fontWeight: FontWeight.w600,
        ),
      ),
      style: ElevatedButton.styleFrom(
        backgroundColor: color,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        elevation: 2,
        shadowColor: color.withOpacity(0.3),
      ),
      onPressed: onPressed,
    );
  }
}
