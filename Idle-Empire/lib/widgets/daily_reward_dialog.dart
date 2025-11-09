import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// Daily login reward popup with streak display.
class DailyRewardDialog extends StatelessWidget {
  final int streak;
  final VoidCallback onClaim;

  const DailyRewardDialog({
    super.key,
    required this.streak,
    required this.onClaim,
  });

  @override
  Widget build(BuildContext context) {
    final reward = 100 * streak;

    return Dialog(
      backgroundColor: Colors.transparent,
      child: Container(
        padding: const EdgeInsets.all(28),
        decoration: AppTheme.glowDecoration(
          glowColor: AppTheme.accentPurple,
          borderRadius: 24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('📅', style: TextStyle(fontSize: 56)),
            const SizedBox(height: 12),
            const Text(
              'Daily Reward!',
              style: TextStyle(
                color: AppTheme.textPrimary,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),

            // Streak display
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              decoration: BoxDecoration(
                color: AppTheme.accentPurple.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: AppTheme.accentPurple.withValues(alpha: 0.3),
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.local_fire_department,
                      color: AppTheme.accentOrange, size: 20),
                  const SizedBox(width: 6),
                  Text(
                    'Day $streak Streak!',
                    style: const TextStyle(
                      color: AppTheme.accentPurple,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Reward display
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text('💰', style: TextStyle(fontSize: 28)),
                const SizedBox(width: 8),
                Text(
                  '\$$reward',
                  style: const TextStyle(
                    color: AppTheme.accentGold,
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            const Text(
              'Reward increases with streak!',
              style: TextStyle(color: AppTheme.textMuted, fontSize: 12),
            ),

            const SizedBox(height: 20),

            // Calendar row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: List.generate(7, (i) {
                final day = i + 1;
                final isPast = day < streak;
                final isCurrent = day == streak;
                return Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: isCurrent
                        ? AppTheme.accentGold
                        : isPast
                            ? AppTheme.accentGreen.withValues(alpha: 0.3)
                            : Colors.white.withValues(alpha: 0.05),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: isCurrent
                          ? AppTheme.accentGold
                          : isPast
                              ? AppTheme.accentGreen.withValues(alpha: 0.5)
                              : Colors.white.withValues(alpha: 0.1),
                    ),
                  ),
                  child: Center(
                    child: isPast
                        ? const Icon(Icons.check, color: AppTheme.accentGreen,
                            size: 18)
                        : Text(
                            '$day',
                            style: TextStyle(
                              color: isCurrent
                                  ? AppTheme.bgDark
                                  : AppTheme.textMuted,
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                            ),
                          ),
                  ),
                );
              }),
            ),

            const SizedBox(height: 24),

            // Claim button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: onClaim,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.accentGold,
                  foregroundColor: AppTheme.bgDark,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                child: const Text(
                  '🎁 CLAIM REWARD',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
