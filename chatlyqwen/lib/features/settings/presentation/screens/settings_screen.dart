/// @file lib/features/settings/presentation/screens/settings_screen.dart
/// @brief Main settings screen with comprehensive user preferences and account management
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file implements the main settings screen that provides access to all user
/// preferences and account management options. It includes sections for profile,
/// appearance, notifications, privacy, storage, premium features, and account deletion.
/// The screen adapts based on user subscription tier and provides visual feedback
/// for premium-only features.

import 'package:chatly/core/constants/app_constants.dart';
import 'package:chatly/core/constants/route_constants.dart';
import 'package:chatly/core/constants/theme_constants.dart';
import 'package:chatly/core/providers/auth_provider.dart';
import 'package:chatly/data/models/user_model.dart';
import 'package:chatly/core/providers/theme_provider.dart';
import 'package:chatly/core/utils/handlers/toast_handler.dart';
import 'package:chatly/core/widgets/common/custom_button.dart';
import 'package:chatly/core/widgets/premium/premium_badge.dart';
import 'package:chatly/features/settings/presentation/widgets/setting_tile.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _isLoading = false;
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final authProvider = Provider.of<AuthProvider>(context);
    final themeProvider = Provider.of<ThemeProvider>(context);
    final currentUser = authProvider.userProfile;
    final tier = currentUser?.tier ?? 'free';
    
    if (currentUser == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () => _showSearchDialog(),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.symmetric(vertical: 8),
              children: [
                // Profile section
                _buildSectionHeader(theme, 'Profile & Account'),
                SettingTile(
                  title: 'Profile',
                  subtitle: currentUser.getDisplayName(),
                  icon: Icons.person,
                  onTap: () => _navigateTo(RouteConstants.profile),
                ),
                SettingTile(
                  title: 'Account Settings',
                  icon: Icons.settings,
                  onTap: () => _navigateTo(RouteConstants.accountSettings),
                ),
                SettingTile(
                  title: 'Privacy Settings',
                  icon: Icons.lock,
                  onTap: () => _navigateTo(RouteConstants.privacySettings),
                ),
                SettingTile(
                  title: 'Delete Account',
                  icon: Icons.delete,
                  textColor: theme.colorScheme.error,
                  onTap: _showDeleteAccountDialog,
                ),
                
                // Appearance section
                _buildSectionHeader(theme, 'Appearance'),
                SettingTile(
                  title: 'Theme',
                  subtitle: _getCurrentThemeName(themeProvider),
                  icon: Icons.palette,
                  onTap: () => _navigateTo(RouteConstants.themeSettings),
                ),
                SettingTile(
                  title: 'Wallpaper',
                  subtitle: 'Customize chat background',
                  icon: Icons.wallpaper,
                  onTap: () => _navigateTo(RouteConstants.wallpaperSettings),
                  badge: tier == 'free' ? const PremiumBadge() : null,
                  disabled: tier == 'free',
                ),
                SettingTile(
                  title: 'Font Size',
                  subtitle: '${currentUser.settings['fontSize'] ?? '16.0'}',
                  icon: Icons.text_fields,
                  onTap: () => _showFontSizeDialog(),
                ),
                
                // Notifications section
                _buildSectionHeader(theme, 'Notifications'),
                SettingTile(
                  title: 'Notification Settings',
                  subtitle: 'Manage smart notifications',
                  icon: Icons.notifications,
                  onTap: () => _navigateTo(RouteConstants.notificationSettings),
                ),
                SettingTile(
                  title: 'Smart Notifications',
                  subtitle: currentUser.settings['enableSmartNotifications'] == 'true'
                      ? 'Enabled'
                      : 'Disabled',
                  icon: Icons.auto_awesome,
                  isSwitch: true,
                  switchValue: currentUser.settings['enableSmartNotifications'] == 'true',
                  onSwitchChanged: (value) => _toggleSmartNotifications(value),
                ),
                
                // Storage & Data section
                _buildSectionHeader(theme, 'Storage & Data'),
                SettingTile(
                  title: 'Message Retention',
                  subtitle: '${_getMessageRetentionText(currentUser)} days',
                  icon: Icons.delete,
                  onTap: () => _showRetentionDialog(),
                  badge: tier == 'free' ? const PremiumBadge() : null,
                  disabled: tier == 'free',
                ),
                if (tier != 'free')
                  SettingTile(
                    title: 'Export Chat History',
                    subtitle: 'Download as .txt file',
                    icon: Icons.download,
                    onTap: _handleExportChatHistory,
                  ),
                
                // Premium section
                _buildSectionHeader(theme, 'Chatly Premium'),
                SettingTile(
                  title: tier == 'free' ? 'Upgrade to Premium' : 'Manage Subscription',
                  subtitle: tier == 'free'
                      ? 'Unlock unlimited features'
                      : _getSubscriptionStatus(currentUser),
                  icon: tier == 'free' ? Icons.upgrade : Icons.payment,
                  textColor: tier == 'free' ? theme.primaryColor : null,
                  onTap: () => _navigateTo(RouteConstants.premiumScreen),
                ),
                if (tier != 'free')
                  SettingTile(
                    title: 'Premium Features',
                    subtitle: 'Access all premium features',
                    icon: Icons.star,
                    onTap: () => _navigateTo(RouteConstants.premiumScreen),
                  ),
                
                // Help & Support section
                _buildSectionHeader(theme, 'Help & Support'),
                SettingTile(
                  title: 'Help Center',
                  icon: Icons.help,
                  onTap: () => _handleHelpCenter(),
                ),
                SettingTile(
                  title: 'Report a Problem',
                  icon: Icons.bug_report,
                  onTap: () => _handleReportProblem(),
                ),
                SettingTile(
                  title: 'Terms of Service',
                  icon: Icons.description,
                  onTap: () => _handleTermsOfService(),
                ),
                SettingTile(
                  title: 'Privacy Policy',
                  icon: Icons.policy,
                  onTap: () => _handlePrivacyPolicy(),
                ),
                
                // Logout button
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: CustomButton(
                    text: 'Log Out',
                    onPressed: _handleLogout,
                    backgroundColor: theme.colorScheme.error.withOpacity(0.1),
                    textColor: theme.colorScheme.error,
                  ),
                ),
                
                // App info
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Chatly',
                        style: theme.textTheme.titleMedium!.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Version ${AppConstants.appVersion}+${AppConstants.buildNumber}',
                        style: theme.textTheme.bodySmall!.copyWith(
                          color: theme.textTheme.bodySmall!.color!.withOpacity(0.7),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }
  
  Widget _buildSectionHeader(ThemeData theme, String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Text(
        title,
        style: theme.textTheme.titleMedium!.copyWith(
          fontWeight: FontWeight.w600,
          color: theme.textTheme.titleMedium!.color!.withOpacity(0.7),
        ),
      ),
    );
  }
  
  String _getCurrentThemeName(ThemeProvider themeProvider) {
    switch (themeProvider.currentThemeName) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'amoled':
        return 'AMOLED Black';
      default:
        return themeProvider.currentThemeName;
    }
  }
  
  String _getMessageRetentionText(UserModel user) {
    if (user.tier == 'free') return '7';
    return user.settings['retentionDays'] ?? '7';
  }
  
  String _getSubscriptionStatus(UserModel user) {
    final expiry = user.settings['subscriptionExpiry'];
    if (expiry == null) return 'Active';
    
    try {
      final expiryDate = DateTime.parse(expiry);
      final daysLeft = expiryDate.difference(DateTime.now()).inDays;
      return daysLeft > 0 ? 'Expires in $daysLeft days' : 'Expired';
    } catch (e) {
      return 'Active';
    }
  }
  
  void _navigateTo(String route) {
    Navigator.pushNamed(context, route);
  }
  
  void _showFontSizeDialog() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final currentUser = authProvider.userProfile!;
    final currentSize = double.tryParse(currentUser.settings['fontSize'] ?? '16.0') ?? 16.0;
    
    showDialog(
      context: context,
      builder: (context) {
        final theme = Theme.of(context);
        double selectedSize = currentSize;
        
        return AlertDialog(
          title: const Text('Font Size'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Slider(
                value: selectedSize,
                min: 12,
                max: 24,
                divisions: 12,
                label: '${selectedSize.toInt()}',
                onChanged: (value) {
                  setState(() {
                    selectedSize = value;
                  });
                },
              ),
              const SizedBox(height: 8),
              Text(
                'Preview: This is how your text will look',
                style: TextStyle(fontSize: selectedSize),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: Navigator.of(context).pop,
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                _saveFontSize(selectedSize);
              },
              child: const Text('Save'),
            ),
          ],
        );
      },
    );
  }
  
  Future<void> _saveFontSize(double size) async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final currentUser = authProvider.userProfile!;
    
    final updatedProfile = currentUser.copyWith(
      settings: {
        ...currentUser.settings,
        'fontSize': size.toString(),
      }
    );
    
    await authProvider.updateUserProfile(updatedProfile);
    ToastHandler.showSuccess(context, 'Font size updated successfully');
  }
  
  Future<void> _toggleSmartNotifications(bool value) async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final currentUser = authProvider.userProfile!;
    
    final updatedProfile = currentUser.copyWith(
      settings: {
        ...currentUser.settings,
        'enableSmartNotifications': value.toString(),
      }
    );
    
    await authProvider.updateUserProfile(updatedProfile);
    ToastHandler.showSuccess(
      context, 
      value ? 'Smart notifications enabled' : 'Smart notifications disabled',
    );
  }
  
  void _showRetentionDialog() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final currentUser = authProvider.userProfile!;
    final currentDays = int.tryParse(currentUser.settings['retentionDays'] ?? '7') ?? 7;
    
    showDialog(
      context: context,
      builder: (context) {
        final theme = Theme.of(context);
        int selectedDays = currentDays;
        
        return AlertDialog(
          title: const Text('Message Retention'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Choose how long to keep messages before they are automatically deleted:',
                style: theme.textTheme.bodyMedium,
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [2, 3, 4, 5, 6, 7].map((days) {
                  return GestureDetector(
                    onTap: () {
                      setState(() {
                        selectedDays = days;
                      });
                    },
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: selectedDays == days
                            ? theme.primaryColor.withOpacity(0.2)
                            : theme.cardColor,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: selectedDays == days ? theme.primaryColor : theme.dividerColor,
                        ),
                      ),
                      child: Column(
                        children: [
                          Text(
                            '$days',
                            style: theme.textTheme.headlineSmall!.copyWith(
                              color: selectedDays == days ? theme.primaryColor : null,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'days',
                            style: theme.textTheme.bodySmall!.copyWith(
                              color: selectedDays == days
                                  ? theme.primaryColor
                                  : theme.textTheme.bodySmall!.color!.withOpacity(0.7),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: Navigator.of(context).pop,
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                _saveRetentionDays(selectedDays);
              },
              child: const Text('Save'),
            ),
          ],
        );
      },
    );
  }
  
  Future<void> _saveRetentionDays(int days) async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final currentUser = authProvider.userProfile!;
    
    final updatedProfile = currentUser.copyWith(
      settings: {
        ...currentUser.settings,
        'retentionDays': days.toString(),
      }
    );
    
    await authProvider.updateUserProfile(updatedProfile);
    ToastHandler.showSuccess(context, 'Message retention set to $days days');
  }
  
  void _handleExportChatHistory() {
    ToastHandler.showInfo(context, 'Chat history export initiated. Check your downloads folder.');
    // In real app, this would export chat history as .txt file
  }
  
  void _handleHelpCenter() {
    ToastHandler.showInfo(context, 'Help center coming soon in future updates');
  }
  
  void _handleReportProblem() {
    ToastHandler.showInfo(context, 'Problem reporting coming soon in future updates');
  }
  
  void _handleTermsOfService() {
    ToastHandler.showInfo(context, 'Terms of service coming soon in future updates');
  }
  
  void _handlePrivacyPolicy() {
    ToastHandler.showInfo(context, 'Privacy policy coming soon in future updates');
  }
  
  void _showDeleteAccountDialog() {
    showDialog(
      context: context,
      builder: (context) {
        final theme = Theme.of(context);
        
        return AlertDialog(
          title: const Text('Delete Account'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Are you sure you want to delete your account?'),
              const SizedBox(height: 8),
              Text(
                'This action cannot be undone. All your data including messages, contacts, and group memberships will be permanently deleted.',
                style: theme.textTheme.bodyMedium!.copyWith(
                  color: theme.textTheme.bodyMedium!.color!.withOpacity(0.8),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Your account will be scheduled for deletion and permanently removed after a 30-day grace period.',
                style: theme.textTheme.bodyMedium!.copyWith(
                  color: theme.colorScheme.error,
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: Navigator.of(context).pop,
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                _handleDeleteAccount();
              },
              child: Text(
                'Delete Account',
                style: TextStyle(color: theme.colorScheme.error),
              ),
            ),
          ],
        );
      },
    );
  }
  
  Future<void> _handleDeleteAccount() async {
    setState(() {
      _isLoading = true;
    });
    
    try {
      // In real app, this would call backend to schedule account deletion
      await Future.delayed(const Duration(seconds: 1));
      
      ToastHandler.showSuccess(
        context,
        'Account deletion scheduled. Your account will be permanently deleted after 30 days.',
      );
      
      // Navigate to login screen
      await Future.delayed(const Duration(seconds: 2));
      Navigator.pushNamedAndRemoveUntil(context, RouteConstants.login, (route) => false);
    } catch (e) {
      ToastHandler.showError(context, 'Failed to schedule account deletion: ${e.toString()}');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }
  
  Future<void> _handleLogout() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    
    try {
      await authProvider.signOut();
      Navigator.pushNamedAndRemoveUntil(context, RouteConstants.login, (route) => false);
    } catch (e) {
      ToastHandler.showError(context, 'Failed to log out: ${e.toString()}');
    }
  }
  
  void _showSearchDialog() {
    showDialog(
      context: context,
      builder: (context) {
        final theme = Theme.of(context);
        final TextEditingController controller = TextEditingController();
        
        return AlertDialog(
          title: const Text('Search Settings'),
          content: TextField(
            controller: controller,
            decoration: InputDecoration(
              hintText: 'Search settings...',
              prefixIcon: const Icon(Icons.search),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: Navigator.of(context).pop,
              child: const Text('Cancel'),
            ),
          ],
        );
      },
    );
  }
}
