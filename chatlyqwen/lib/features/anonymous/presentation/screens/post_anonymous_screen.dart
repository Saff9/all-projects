/// @file lib/features/anonymous/presentation/screens/post_anonymous_screen.dart
/// @brief Screen for posting anonymous messages in "Lucky Chat"
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file implements the screen where users can create and post anonymous messages
/// with topic tags. It includes character counting, topic selection, usage limits
/// display, and validation before posting. The screen enforces tier-based limits
/// and provides real-time feedback on remaining messages and characters.

import 'package:chatly/core/constants/app_constants.dart';
import 'package:chatly/core/constants/route_constants.dart';
import 'package:chatly/core/constants/theme_constants.dart';
import 'package:chatly/core/providers/auth_provider.dart';
import 'package:chatly/core/utils/handlers/toast_handler.dart';
import 'package:chatly/core/widgets/common/custom_button.dart';
import 'package:chatly/features/anonymous/presentation/widgets/topic_chip.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class PostAnonymousScreen extends StatefulWidget {
  const PostAnonymousScreen({super.key});

  @override
  State<PostAnonymousScreen> createState() => _PostAnonymousScreenState();
}

class _PostAnonymousScreenState extends State<PostAnonymousScreen> {
  final TextEditingController _messageController = TextEditingController();
  final List<String> _availableTopics = [
    '#advice', '#fun', '#question', '#lonely', '#music', 
    '#movies', '#sports', '#technology', '#food', '#travel'
  ];
  final List<String> _selectedTopics = [];
  bool _isLoading = false;
  
  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }
  
  int get _characterCount => _messageController.text.length;
  
  bool get _canPost => 
    _characterCount > 0 && 
    _characterCount <= _getCharacterLimit() && 
    _selectedTopics.isNotEmpty;
  
  int _getCharacterLimit() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final tier = authProvider.userProfile?.tier ?? 'free';
    return AppConstants.anonymousLimits[tier]?['maxCharacters'] ?? 100;
  }
  
  int _getWeeklyLimit() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final tier = authProvider.userProfile?.tier ?? 'free';
    return AppConstants.anonymousLimits[tier]?['messagesPerWeek'] ?? 3;
  }
  
  int _getMessagesUsedThisWeek() {
    // In real app, this would come from user profile
    return 0; // Placeholder - would be actual count from backend
  }
  
  int _getMessagesRemaining() {
    return _getWeeklyLimit() - _getMessagesUsedThisWeek();
  }
  
  Future<void> _handleSubmit() async {
    if (!_canPost) return;
    
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final tier = authProvider.userProfile?.tier ?? 'free';
    final weeklyLimit = AppConstants.anonymousLimits[tier]?['messagesPerWeek'] ?? 3;
    
    if (_getMessagesUsedThisWeek() >= weeklyLimit) {
      ToastHandler.showError(context, 'You have reached your weekly limit for anonymous messages');
      return;
    }
    
    setState(() {
      _isLoading = true;
    });
    
    try {
      // In real app, this would call the repository to post the message
      await Future.delayed(const Duration(seconds: 1));
      
      ToastHandler.showSuccess(context, 'Anonymous message posted successfully!');
      Navigator.pop(context);
    } catch (e) {
      ToastHandler.showError(context, 'Failed to post message: ${e.toString()}');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }
  
  void _handleTopicSelection(String topic) {
    setState(() {
      if (_selectedTopics.contains(topic)) {
        _selectedTopics.remove(topic);
      } else {
        _selectedTopics.add(topic);
      }
    });
  }
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final authProvider = Provider.of<AuthProvider>(context);
    final tier = authProvider.userProfile?.tier ?? 'free';
    final characterLimit = _getCharacterLimit();
    final messagesRemaining = _getMessagesRemaining();
    final canPostMore = messagesRemaining > 0;
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Post Anonymous Message'),
        actions: [
          if (canPostMore)
            TextButton(
              onPressed: _handleSubmit,
              child: Text(
                'Post',
                style: theme.textTheme.bodyLarge!.copyWith(
                  color: theme.primaryColor,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Usage indicator
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: canPostMore 
                  ? ThemeConstants.secondaryEmerald.withOpacity(0.1) 
                  : ThemeConstants.errorRed.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Icon(
                    canPostMore ? Icons.info : Icons.warning,
                    color: canPostMore ? ThemeConstants.secondaryEmerald : ThemeConstants.errorRed,
                    size: 18,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      canPostMore
                        ? 'Weekly limit: ${_getMessagesUsedThisWeek()}/${_getWeeklyLimit()} used'
                        : 'Weekly limit reached! Upgrade to post more messages',
                      style: theme.textTheme.bodyMedium!.copyWith(
                        color: canPostMore ? ThemeConstants.secondaryEmerald : ThemeConstants.errorRed,
                      ),
                    ),
                  ),
                  if (!canPostMore)
                    TextButton(
                      onPressed: () => Navigator.pushNamed(context, RouteConstants.premiumScreen),
                      child: const Text('Upgrade', style: TextStyle(color: Colors.white)),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            
            // Message input
            Expanded(
              child: TextField(
                controller: _messageController,
                maxLines: null,
                maxLength: characterLimit,
                decoration: InputDecoration(
                  hintText: 'Type your message...',
                  hintStyle: theme.textTheme.bodyMedium!.copyWith(
                    color: theme.textTheme.bodyMedium!.color!.withOpacity(0.5),
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide(color: theme.dividerColor),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide(color: theme.primaryColor, width: 2),
                  ),
                  counterText: '',
                  contentPadding: const EdgeInsets.all(16),
                ),
                style: theme.textTheme.bodyLarge,
                onChanged: (_) => setState(() {}),
              ),
            ),
            const SizedBox(height: 8),
            
            // Character counter
            Align(
              alignment: Alignment.centerRight,
              child: Text(
                '$_characterCount/$characterLimit characters',
                style: theme.textTheme.bodySmall!.copyWith(
                  color: _characterCount > characterLimit * 0.9
                    ? ThemeConstants.errorRed
                    : theme.textTheme.bodySmall!.color!.withOpacity(0.7),
                ),
              ),
            ),
            const SizedBox(height: 16),
            
            // Topic selection
            const Text(
              'Add Topics',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _availableTopics.map((topic) {
                final isSelected = _selectedTopics.contains(topic);
                return TopicChip(
                  text: topic,
                  isSelected: isSelected,
                  onPressed: canPostMore ? () => _handleTopicSelection(topic) : null,
                  onLongPress: canPostMore ? () => _handleTopicSelection(topic) : null,
                );
              }).toList(),
            ),
            const SizedBox(height: 8),
            
            // Topic requirement message
            if (_selectedTopics.isEmpty)
              Text(
                'Please select at least one topic for your message',
                style: theme.textTheme.bodySmall!.copyWith(
                  color: theme.colorScheme.error,
                ),
              ),
            
            const SizedBox(height: 24),
            
            // Post button (alternative to app bar button)
            if (!canPostMore)
              CustomButton(
                text: 'Upgrade to Post More Messages',
                onPressed: () => Navigator.pushNamed(context, RouteConstants.premiumScreen),
                backgroundColor: ThemeConstants.proDiamond,
              ),
          ],
        ),
      ),
    );
  }
}
