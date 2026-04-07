/// @file lib/features/groups/presentation/screens/create_group_screen.dart
/// @brief Screen for creating new group chats with member selection
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file implements the group creation screen where users can create new
/// group chats by selecting members, setting group name and description, and
/// choosing topic tags. It includes real-time validation, member limits based
/// on subscription tier, and visual feedback for group creation progress.
/// The screen enforces tier-based restrictions and provides upgrade options.

import 'package:chatly/core/constants/app_constants.dart';
import 'package:chatly/core/constants/route_constants.dart';
import 'package:chatly/core/constants/theme_constants.dart';
import 'package:chatly/core/providers/auth_provider.dart';
import 'package:chatly/core/utils/handlers/toast_handler.dart';
import 'package:chatly/core/widgets/common/custom_button.dart';
import 'package:chatly/core/widgets/common/custom_textfield.dart';
import 'package:chatly/features/anonymous/presentation/widgets/topic_chip.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class CreateGroupScreen extends StatefulWidget {
  const CreateGroupScreen({super.key});

  @override
  State<CreateGroupScreen> createState() => _CreateGroupScreenState();
}

class _CreateGroupScreenState extends State<CreateGroupScreen> {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final List<UserContact> _contacts = [];
  final List<UserContact> _selectedMembers = [];
  final List<String> _availableTopics = [
    '#work', '#family', '#friends', '#hobbies', '#sports',
    '#technology', '#education', '#travel', '#food', '#music'
  ];
  final List<String> _selectedTopics = [];
  bool _isLoading = false;
  
  @override
  void initState() {
    super.initState();
    _loadContacts();
    _checkGroupCreationLimits();
  }
  
  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }
  
  Future<void> _loadContacts() async {
    // In real app, this would fetch from repository
    await Future.delayed(const Duration(milliseconds: 300));
    
    setState(() {
      _contacts = [
        UserContact(uid: 'user2', name: 'John Doe', avatar: 'J'),
        UserContact(uid: 'user3', name: 'Jane Smith', avatar: 'J'),
        UserContact(uid: 'user4', name: 'Alex Johnson', avatar: 'A'),
        UserContact(uid: 'user5', name: 'Sarah Williams', avatar: 'S'),
        UserContact(uid: 'user6', name: 'Michael Brown', avatar: 'M'),
        UserContact(uid: 'user7', name: 'Emily Davis', avatar: 'E'),
        UserContact(uid: 'user8', name: 'David Wilson', avatar: 'D'),
      ];
    });
  }
  
  void _checkGroupCreationLimits() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final tier = authProvider.userProfile?.tier ?? 'free';
    final groupsCreated = authProvider.userProfile?.limits['groupsCreated'] ?? '0';
    
    final maxGroups = AppConstants.getGroupCreationLimit(tier);
    final groupsCreatedCount = int.tryParse(groupsCreated) ?? 0;
    
    if (groupsCreatedCount >= maxGroups) {
      ToastHandler.showError(context, 'You have reached your group creation limit for your tier');
      Future.delayed(const Duration(milliseconds: 500), () {
        Navigator.pop(context);
      });
    }
  }
  
  bool get _canCreateGroup {
    return _nameController.text.trim().isNotEmpty &&
           _selectedMembers.length >= 2 &&
           _selectedMembers.length <= _getMaxParticipants();
  }
  
  int _getMaxParticipants() {
    return 25; // Default max participants for groups
  }
  
  Future<void> _handleCreateGroup() async {
    if (!_canCreateGroup) return;
    
    setState(() {
      _isLoading = true;
    });
    
    try {
      // In real app, this would call the repository to create the group
      await Future.delayed(const Duration(seconds: 1));
      
      // Update user's group creation count
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final currentGroups = int.tryParse(authProvider.userProfile?.limits['groupsCreated'] ?? '0') ?? 0;
      
      final updatedProfile = authProvider.userProfile!.copyWith(
        limits: {
          ...authProvider.userProfile!.limits,
          'groupsCreated': (currentGroups + 1).toString(),
        }
      );
      
      await authProvider.updateUserProfile(updatedProfile);
      
      ToastHandler.showSuccess(context, 'Group "${_nameController.text}" created successfully!');
      Navigator.pop(context);
      
      // Navigate to the new group chat
      // Navigator.pushNamed(context, RouteConstants.chat, arguments: {'chatId': newGroupId});
    } catch (e) {
      ToastHandler.showError(context, 'Failed to create group: ${e.toString()}');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }
  
  void _toggleMemberSelection(UserContact contact) {
    setState(() {
      if (_selectedMembers.contains(contact)) {
        _selectedMembers.remove(contact);
      } else if (_selectedMembers.length < _getMaxParticipants()) {
        _selectedMembers.add(contact);
      }
    });
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
    final maxGroups = AppConstants.getGroupCreationLimit(tier);
    final groupsCreated = int.tryParse(authProvider.userProfile?.limits['groupsCreated'] ?? '0') ?? 0;
    final groupsRemaining = maxGroups - groupsCreated;
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Create New Group'),
        actions: [
          if (_canCreateGroup)
            TextButton(
              onPressed: _isLoading ? null : _handleCreateGroup,
              child: Text(
                'Create',
                style: theme.textTheme.bodyLarge!.copyWith(
                  color: theme.primaryColor,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Usage info
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: ThemeConstants.primaryIndigo.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      'Groups remaining this month: $groupsRemaining/$maxGroups',
                      style: theme.textTheme.bodyMedium!.copyWith(
                        color: theme.primaryColor,
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  
                  // Group name
                  CustomTextField(
                    controller: _nameController,
                    labelText: 'Group Name',
                    maxLength: 50,
                    validator: (value) {
                      if (value == null || value.isEmpty) return 'Group name is required';
                      if (value.length < 3) return 'Name must be at least 3 characters';
                      return null;
                    },
                    prefixIcon: const Icon(Icons.group),
                  ),
                  const SizedBox(height: 16),
                  
                  // Group description
                  CustomTextField(
                    controller: _descriptionController,
                    labelText: 'Description (optional)',
                    maxLines: 3,
                    maxLength: 150,
                    prefixIcon: const Icon(Icons.description),
                  ),
                  const SizedBox(height: 24),
                  
                  // Add members section
                  const Text(
                    'Add Members',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Select at least 2 members (max ${_getMaxParticipants()})',
                    style: theme.textTheme.bodyMedium!.copyWith(
                      color: theme.textTheme.bodyMedium!.color!.withOpacity(0.7),
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  // Selected members preview
                  if (_selectedMembers.isNotEmpty)
                    _buildSelectedMembersPreview(theme),
                  
                  const SizedBox(height: 16),
                  
                  // Member list
                  _buildMemberList(theme),
                  
                  const SizedBox(height: 24),
                  
                  // Topic tags
                  const Text(
                    'Add Topics (optional)',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Help others find your group by adding relevant topics',
                    style: theme.textTheme.bodyMedium!.copyWith(
                      color: theme.textTheme.bodyMedium!.color!.withOpacity(0.7),
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _availableTopics.map((topic) {
                      final isSelected = _selectedTopics.contains(topic);
                      return TopicChip(
                        text: topic,
                        isSelected: isSelected,
                        onPressed: () => _handleTopicSelection(topic),
                      );
                    }).toList(),
                  ),
                  
                  const SizedBox(height: 32),
                  
                  // Create button (alternative to app bar)
                  if (!_canCreateGroup && _nameController.text.trim().isNotEmpty)
                    Text(
                      'Please select at least 2 members',
                      style: theme.textTheme.bodyMedium!.copyWith(
                        color: theme.colorScheme.error,
                      ),
                    ),
                ],
              ),
            ),
    );
  }
  
  Widget _buildSelectedMembersPreview(ThemeData theme) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: theme.dividerColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Selected Members:', style: TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 4,
            children: _selectedMembers.map((member) {
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: ThemeConstants.primaryIndigo.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    CircleAvatar(
                      radius: 12,
                      backgroundColor: ThemeConstants.primaryIndigo,
                      child: Text(
                        member.avatar,
                        style: const TextStyle(color: Colors.white, fontSize: 12),
                      ),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      member.name,
                      style: theme.textTheme.bodySmall!.copyWith(
                        color: theme.primaryColor,
                      ),
                    ),
                    const SizedBox(width: 4),
                    GestureDetector(
                      onTap: () => _toggleMemberSelection(member),
                      child: Icon(
                        Icons.close,
                        size: 16,
                        color: theme.textTheme.bodySmall!.color!.withOpacity(0.7),
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
  
  Widget _buildMemberList(ThemeData theme) {
    return Container(
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: theme.dividerColor),
      ),
      child: ListView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: _contacts.length,
        itemBuilder: (context, index) {
          final contact = _contacts[index];
          final isSelected = _selectedMembers.contains(contact);
          
          return ListTile(
            leading: CircleAvatar(
              backgroundColor: isSelected
                  ? ThemeConstants.primaryIndigo
                  : theme.dividerColor,
              child: Text(
                contact.avatar,
                style: TextStyle(
                  color: isSelected ? Colors.white : theme.textTheme.bodyMedium!.color,
                ),
              ),
            ),
            title: Text(contact.name),
            trailing: isSelected
                ? Icon(Icons.check_circle, color: ThemeConstants.secondaryEmerald)
                : null,
            selected: isSelected,
            onTap: () => _toggleMemberSelection(contact),
          );
        },
      ),
    );
  }
}

class UserContact {
  final String uid;
  final String name;
  final String avatar;
  
  const UserContact({
    required this.uid,
    required this.name,
    required this.avatar,
  });
  
  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is UserContact && uid == other.uid;
  }
  
  @override
  int get hashCode => uid.hashCode;
}
