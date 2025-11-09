import 'package:flutter/material.dart';
import '../core/big_number.dart';
import '../theme/app_theme.dart';

/// Shows offline earnings popup when player returns.
class OfflineEarningsDialog extends StatelessWidget {
  final double earnings;
  final VoidCallback onCollect;
  final VoidCallback onDoubleWithAd;

  const OfflineEarningsDialog({
    super.key,
    required this.earnings,
    required this.onCollect,
    required this.onDoubleWithAd,
  });

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      child: Container(
        padding: const EdgeInsets.all(28),
        decoration: AppTheme.glowDecoration(
          glowColor: AppTheme.accentGold,
          borderRadius: 24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('🌙', style: TextStyle(fontSize: 56)),
            const SizedBox(height: 12),
            const Text(
              'Welcome Back!',
              style: TextStyle(
                color: AppTheme.textPrimary,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Your businesses earned while you were away:',
              style: TextStyle(color: AppTheme.textSecondary, fontSize: 14),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            Text(
              BigNumber.formatCurrency(earnings),
              style: const TextStyle(
                color: AppTheme.accentGold,
                fontSize: 36,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 24),
            // Collect button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: onCollect,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.accentBlue,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                child: const Text(
                  'Collect',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
              ),
            ),
            const SizedBox(height: 10),
            // Watch Ad for 2x
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: onDoubleWithAd,
                icon: const Icon(Icons.play_circle_outline),
                label: const Text(
                  'Watch Ad → 2x Earnings!',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.accentGold,
                  foregroundColor: AppTheme.bgDark,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
