/// @file lib/features/groups/presentation/screens/groups_list_screen.dart
/// @brief Groups list screen for displaying and managing group chats
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file implements the groups list screen that displays all group chats
/// a user is part of. It includes group creation functionality (with tier limits),
/// group management options, health score indicators for Pro users, and search/filter
/// capabilities. The screen adapts based on user subscription tier and provides
/// visual feedback for group activity and engagement levels.

import 'package:chatly/core/constants/app_constants.dart';
import 'package:chatly/core/constants/route_constants.dart';
import 'package:chatly/core/constants/theme_constants.dart';
import 'package:chatly/core/providers/auth_provider.dart';
import 'package:chatly/core/utils/handlers/toast_handler.dart';
import 'package:chatly/core/widgets/common/custom_button.dart';
import 'package:chatly/data/models/chat_model.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class GroupsListScreen extends StatefulWidget {
  const GroupsListScreen({super.key});

  @override
  State<GroupsListScreen> createState() => _GroupsListScreenState();
}

class _GroupsListScreenState extends State<GroupsListScreen> {
  List<ChatModel> _groups = [];
  bool _isLoading = false;
  bool _showCreateGroupOption = false;
  
  @override
  void initState() {
    super.initState();
    _loadGroups();
    _checkGroupCreationEligibility();
  }
  
  Future<void> _loadGroups() async {
    setState(() {
      _isLoading = true;
    });
    
    try {
      // In real app, this would fetch from repository
      await Future.delayed(const Duration(milliseconds: 500));
      
      setState(() {
        _groups = [
          ChatModel(
            chatId: 'group1',
            participantIds: ['user1', 'user2', 'user3', 'user4', 'user5'],
            chatName: 'Work Team',
            lastMessageText: 'Meeting rescheduled to 4PM',
            lastMessageAt: DateTime.now().subtract(const Duration(minutes: 30)),
            lastMessageSenderId: 'user4',
            createdAt: DateTime.now().subtract(const Duration(days: 14)),
            isGroup: true,
            maxParticipants: 25,
            createdBy: 'user1',
          ),
          ChatModel(
            chatId: 'group2',
            participantIds: ['user1', 'user6', 'user7', 'user8'],
            chatName: 'Family Chat',
            lastMessageText: 'Who\'s coming for dinner this weekend?',
            lastMessageAt: DateTime.now().subtract(const Duration(hours: 2)),
            lastMessageSenderId: 'user6',
            createdAt: DateTime.now().subtract(const Duration(days: 5)),
            isGroup: true,
            maxParticipants: 25,
            createdBy: 'user7',
          ),
          ChatModel(
            chatId: 'group3',
            participantIds: ['user1', 'user2', 'user3'],
            chatName: 'Project Alpha',
            lastMessageText: 'Code review completed',
            lastMessageAt: DateTime.now().subtract(const Duration(minutes: 5)),
            lastMessageSenderId: 'user2',
            createdAt: DateTime.now().subtract(const Duration(days: 1)),
            isGroup: true,
            maxParticipants: 25,
            createdBy: 'user1',
            topicTags: ['#development', '#coding'],
          ),
        ];
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }
  
  void _checkGroupCreationEligibility() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final tier = authProvider.userProfile?.tier ?? 'free';
    final groupsCreated = authProvider.userProfile?.limits['groupsCreated'] ?? '0';
    
    final maxGroups = AppConstants.getGroupCreationLimit(tier);
    final groupsCreatedCount = int.tryParse(groupsCreated) ?? 0;
    
    setState(() {
      _showCreateGroupOption = groupsCreatedCount < maxGroups;
    });
  }
  
  void _handleCreateGroup() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final tier = authProvider.userProfile?.tier ?? 'free';
    
    if (!_showCreateGroupOption) {
      // Show upgrade dialog
      _showUpgradeDialog();
      return;
    }
    
    Navigator.pushNamed(context, RouteConstants.createGroup);
  }
  
  void _showUpgradeDialog() {
    showDialog(
      context: context,
      builder: (context) {
        final theme = Theme.of(context);
        
        return AlertDialog(
          title: const Text('Group Creation Limit Reached'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('You have reached your group creation limit for your current tier.'),
              const SizedBox(height: 8),
              Text(
                'Upgrade to Plus or Pro to create more groups:',
                style: theme.textTheme.bodyMedium!.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              ListTile(
                leading: Icon(Icons.group, color: ThemeConstants.plusGold),
                title: const Text('Plus (₹199/year)'),
                subtitle: const Text('1 group creation limit'),
              ),
              ListTile(
                leading: Icon(Icons.star, color: ThemeConstants.proDiamond),
                title: const Text('Pro (₹299/year)'),
                subtitle: const Text('2 group creation limits'),
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
                Navigator.pushNamed(context, RouteConstants.premiumScreen);
              },
              child: const Text('Upgrade Now'),
            ),
          ],
        );
      },
    );
  }
  
  void _handleGroupTap(ChatModel group) {
    Navigator.pushNamed(
      context,
      RouteConstants.chat,
      arguments: {'chatId': group.chatId},
    );
  }
  
  void _showGroupOptions(ChatModel group) {
    showModalBottomSheet(
      context: context,
      builder: (context) {
        final theme = Theme.of(context);
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        final currentUser = authProvider.userProfile?.uid ?? 'user1';
        
        return Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: const Icon(Icons.info),
                title: const Text('Group Info'),
                onTap: () {
                  Navigator.pop(context);
                  // Navigate to group info
                },
              ),
              ListTile(
                leading: const Icon(Icons.notifications),
                title: const Text('Notification Settings'),
                onTap: () {
                  Navigator.pop(context);
                  // Handle notification settings
                },
              ),
              if (group.createdBy == currentUser)
                ListTile(
                  leading: const Icon(Icons.admin_panel_settings),
                  title: const Text('Admin Settings'),
                  onTap: () {
                    Navigator.pop(context);
                    // Handle admin settings
                  },
                ),
              const Divider(),
              ListTile(
                leading: const Icon(Icons.exit_to_app),
                title: const Text('Leave Group'),
                textColor: theme.colorScheme.error,
                onTap: () {
                  Navigator.pop(context);
                  _showLeaveGroupConfirmation(group);
                },
              ),
              if (group.createdBy == currentUser)
                ListTile(
                  leading: const Icon(Icons.delete, color: Colors.red),
                  title: const Text('Delete Group', style: TextStyle(color: Colors.red)),
                  onTap: () {
                    Navigator.pop(context);
                    _showDeleteGroupConfirmation(group);
                  },
                ),
              const SizedBox(height: 8),
              Center(
                child: TextButton(
                  onPressed: Navigator.of(context).pop,
                  child: Text('Cancel', style: TextStyle(color: theme.primaryColor)),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
  
  void _showLeaveGroupConfirmation(ChatModel group) {
    showDialog(
      context: context,
      builder: (context) {
        final theme = Theme.of(context);
        
        return AlertDialog(
          title: const Text('Leave Group'),
          content: Text('Are you sure you want to leave "${group.chatName}"? You can rejoin later if invited.'),
          actions: [
            TextButton(
              onPressed: Navigator.of(context).pop,
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                _leaveGroup(group);
              },
              child: Text(
                'Leave',
                style: TextStyle(color: theme.colorScheme.error),
              ),
            ),
          ],
        );
      },
    );
  }
  
  void _leaveGroup(ChatModel group) {
    setState(() {
      _groups.removeWhere((g) => g.chatId == group.chatId);
    });
    ToastHandler.showSuccess(context, 'You left the group "${group.chatName}"');
  }
  
  void _showDeleteGroupConfirmation(ChatModel group) {
    showDialog(
      context: context,
      builder: (context) {
        final theme = Theme.of(context);
        
        return AlertDialog(
          title: const Text('Delete Group'),
          content: Text('Are you sure you want to delete "${group.chatName}"? This action cannot be undone and all members will be removed.'),
          actions: [
            TextButton(
              onPressed: Navigator.of(context).pop,
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                _deleteGroup(group);
              },
              child: Text(
                'Delete',
                style: TextStyle(color: theme.colorScheme.error),
              ),
            ),
          ],
        );
      },
    );
  }
  
  void _deleteGroup(ChatModel group) {
    setState(() {
      _groups.removeWhere((g) => g.chatId == group.chatId);
    });
    ToastHandler.showSuccess(context, 'Group "${group.chatName}" deleted successfully');
  }
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final authProvider = Provider.of<AuthProvider>(context);
    final tier = authProvider.userProfile?.tier ?? 'free';
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('👥 Groups'),
        actions: [
          if (_groups.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.search),
              onPressed: () {
                // Handle search
              },
            ),
        ],
      ),
      body: _buildBody(theme, tier),
      floatingActionButton: _showCreateGroupOption
          ? FloatingActionButton(
              onPressed: _handleCreateGroup,
              child: const Icon(Icons.add),
              backgroundColor: theme.primaryColor,
              elevation: 4,
            )
          : null,
    );
  }
  
  Widget _buildBody(ThemeData theme, String tier) {
    if (_isLoading && _groups.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }
    
    if (_groups.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.groups,
                size: 64,
                color: theme.primaryColor.withOpacity(0.3),
              ),
              const SizedBox(height: 16),
              Text(
                'No groups yet',
                style: theme.textTheme.headlineSmall!.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Create your first group to chat with multiple people at once',
                style: theme.textTheme.bodyMedium!.copyWith(
                  color: theme.textTheme.bodyMedium!.color!.withOpacity(0.7),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              if (_showCreateGroupOption)
                CustomButton(
                  text: 'Create Group',
                  onPressed: _handleCreateGroup,
                ),
              if (!_showCreateGroupOption)
                CustomButton(
                  text: 'Upgrade to Create Groups',
                  onPressed: () => Navigator.pushNamed(context, RouteConstants.premiumScreen),
                  backgroundColor: ThemeConstants.proDiamond,
                ),
            ],
          ),
        ),
      );
    }
    
    return RefreshIndicator(
      onRefresh: _loadGroups,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _groups.length,
        itemBuilder: (context, index) {
          final group = _groups[index];
          return _buildGroupCard(theme, group, tier);
        },
      ),
    );
  }
  
  Widget _buildGroupCard(ThemeData theme, ChatModel group, String tier) {
    final participantCount = group.participantIds.length;
    final memberText = '$participantCount/${group.maxParticipants} members';
    final healthScore = (Random().nextDouble() * 0.7) + 0.3; // Random score between 0.3 and 1.0
    
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: InkWell(
        onTap: () => _handleGroupTap(group),
        onLongPress: () => _showGroupOptions(group),
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Group header
              Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: ThemeConstants.primaryIndigo.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Center(
                      child: Icon(Icons.group, color: ThemeConstants.primaryIndigo, size: 24),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          group.chatName,
                          style: theme.textTheme.titleLarge!.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          memberText,
                          style: theme.textTheme.bodyMedium!.copyWith(
                            color: theme.textTheme.bodyMedium!.color!.withOpacity(0.7),
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (tier == 'pro')
                    _buildHealthScoreIndicator(healthScore),
                ],
              ),
              const SizedBox(height: 12),
              
              // Last message and time
              Row(
                children: [
                  Expanded(
                    child: Text(
                      group.lastMessageText,
                      style: theme.textTheme.bodyMedium!.copyWith(
                        color: theme.textTheme.bodyMedium!.color!.withOpacity(0.8),
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    _formatTime(group.lastMessageAt),
                    style: theme.textTheme.bodySmall!.copyWith(
                      color: theme.textTheme.bodySmall!.color!.withOpacity(0.7),
                    ),
                  ),
                ],
              ),
              
              // Topic tags
              if (group.topicTags.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Wrap(
                    spacing: 6,
                    children: group.topicTags.map((tag) {
                      return Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: ThemeConstants.accentAmber.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          tag,
                          style: theme.textTheme.bodySmall!.copyWith(
                            color: ThemeConstants.accentAmber,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildHealthScoreIndicator(double score) {
    final theme = Theme.of(context);
    final color = score < 0.5
        ? ThemeConstants.errorRed
        : (score < 0.7 ? ThemeConstants.accentAmber : ThemeConstants.secondaryEmerald);
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            score < 0.5 ? Icons.warning : Icons.check_circle,
            size: 14,
            color: color,
          ),
          const SizedBox(width: 4),
          Text(
            '${(score * 100).toInt()}%',
            style: theme.textTheme.bodySmall!.copyWith(
              color: color,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
  
  String _formatTime(DateTime timestamp) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final messageDate = DateTime(timestamp.year, timestamp.month, timestamp.day);
    
    if (messageDate.isAtSameMomentAs(today)) {
      return '${_padTime(timestamp.hour)}:${_padTime(timestamp.minute)}';
    } else if (messageDate.isAtSameMomentAs(today.subtract(const Duration(days: 1)))) {
      return 'Yesterday';
    } else {
      return '${messageDate.day}/${messageDate.month}';
    }
  }
  
  String _padTime(int time) {
    return time.toString().padLeft(2, '0');
  }
}

class Random {
  static final _instance = Random._internal();
  
  factory Random() {
    return _instance;
  }
  
  Random._internal();
  
  double nextDouble() {
    return DateTime.now().millisecond / 1000.0;
  }
}
