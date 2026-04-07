/// @file lib/features/chat/presentation/widgets/chat_list_item.dart
/// @brief Chat list item widget for displaying individual conversations
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file implements a reusable widget for displaying individual chat items
/// in the chat list screen. It shows chat details including participant names,
/// last message preview, timestamps, unread message indicators, and participant
/// status. The widget supports both 1-to-1 and group chats with appropriate styling.

import 'package:chatly/core/constants/theme_constants.dart';
import 'package:chatly/data/models/chat_model.dart';
import 'package:chatly/data/models/user_model.dart';
import 'package:flutter/material.dart';

class ChatListItem extends StatelessWidget {
  final ChatModel chat;
  final List<UserModel> participants;
  final VoidCallback onTap;
  final VoidCallback? onLongPress;
  
  const ChatListItem({
    super.key,
    required this.chat,
    required this.participants,
    required this.onTap,
    this.onLongPress,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final currentUser = participants.firstWhere((u) => u.uid == 'user1', orElse: () => participants.first);
    final otherUser = chat.isGroup 
      ? null 
      : participants.firstWhere((u) => u.uid != currentUser.uid, orElse: () => currentUser);
    
    final hasUnreadMessages = !chat.isReadBy(currentUser.uid);
    final isOnline = otherUser?.isOnline ?? false;
    final chatTypeIcon = chat.isGroup 
      ? Icons.people 
      : (chat.isAnonymous ? Icons.masks : Icons.person);
    
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: InkWell(
        onTap: onTap,
        onLongPress: onLongPress,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              // Avatar/Icon
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: chat.isGroup 
                    ? ThemeConstants.secondaryEmerald.withOpacity(0.1)
                    : (chat.isAnonymous 
                        ? ThemeConstants.accentAmber.withOpacity(0.1)
                        : ThemeConstants.primaryIndigo.withOpacity(0.1)),
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Icon(
                    chatTypeIcon,
                    size: 28,
                    color: chat.isGroup 
                      ? ThemeConstants.secondaryEmerald
                      : (chat.isAnonymous 
                          ? ThemeConstants.accentAmber
                          : ThemeConstants.primaryIndigo),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              
              // Chat details
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Chat name and status
                    Row(
                      children: [
                        Text(
                          chat.getDisplayName(participants),
                          style: theme.textTheme.titleLarge!.copyWith(
                            fontWeight: hasUnreadMessages ? FontWeight.bold : FontWeight.normal,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(width: 8),
                        if (!chat.isGroup && otherUser != null)
                          Container(
                            width: 8,
                            height: 8,
                            decoration: BoxDecoration(
                              color: isOnline 
                                ? ThemeConstants.onlineStatus 
                                : ThemeConstants.offlineStatus,
                              shape: BoxShape.circle,
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    
                    // Last message preview
                    Text(
                      chat.lastMessageText,
                      style: theme.textTheme.bodyMedium!.copyWith(
                        color: hasUnreadMessages
                          ? theme.textTheme.bodyMedium!.color
                          : theme.textTheme.bodyMedium!.color!.withOpacity(0.7),
                        fontWeight: hasUnreadMessages ? FontWeight.w500 : FontWeight.normal,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    
                    // Chat metadata
                    Row(
                      children: [
                        // Last message time
                        Text(
                          chat.getFormattedLastMessageTime(),
                          style: theme.textTheme.bodySmall!.copyWith(
                            color: theme.textTheme.bodySmall!.color!.withOpacity(0.7),
                          ),
                        ),
                        const SizedBox(width: 12),
                        
                        // Unread count
                        if (hasUnreadMessages)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: theme.primaryColor,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              '3', // In real app, this would be actual unread count
                              style: theme.textTheme.bodySmall!.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        
                        // Premium badge
                        if (otherUser?.tier == 'pro')
                          const SizedBox(width: 8),
                        if (otherUser?.tier == 'pro')
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: ThemeConstants.proDiamond,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Text(
                              'Pro',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
              
              // Additional indicators
              Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  if (chat.topicTags.isNotEmpty)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: ThemeConstants.accentAmber.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        '#${chat.topicTags.first}',
                        style: theme.textTheme.bodySmall!.copyWith(
                          color: ThemeConstants.accentAmber,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  if (chat.isAnonymous)
                    Icon(
                      Icons.masks,
                      size: 16,
                      color: ThemeConstants.accentAmber,
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
