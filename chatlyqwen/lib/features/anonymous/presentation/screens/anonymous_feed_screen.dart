/// @file lib/features/anonymous/presentation/screens/anonymous_feed_screen.dart
/// @brief Anonymous feed screen for "Lucky Chat" feature
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file implements the anonymous feed screen where users can view and interact
/// with anonymous messages based on shared interests. It displays topic-tagged messages,
/// shows view/reply counts, and allows users to send connection requests to transition
/// from anonymous to regular chats. The screen includes premium features like unlimited
/// messages and advanced filtering for higher-tier users.

import 'package:chatly/core/constants/app_constants.dart';
import 'package:chatly/core/constants/route_constants.dart';
import 'package:chatly/core/constants/theme_constants.dart';
import 'package:chatly/core/providers/auth_provider.dart';
import 'package:chatly/core/utils/handlers/toast_handler.dart';
import 'package:chatly/core/widgets/common/custom_button.dart';
import 'package:chatly/features/anonymous/presentation/widgets/anonymous_card.dart';
import 'package:chatly/features/anonymous/presentation/widgets/topic_chip.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class AnonymousFeedScreen extends StatefulWidget {
  const AnonymousFeedScreen({super.key});

  @override
  State<AnonymousFeedScreen> createState() => _AnonymousFeedScreenState();
}

class _AnonymousFeedScreenState extends State<AnonymousFeedScreen> {
  final ScrollController _scrollController = ScrollController();
  bool _isLoading = false;
  bool _hasMore = true;
  int _currentPage = 1;
  List<AnonymousMessage> _messages = [];
  List<String> _selectedTopics = [];
  final List<String> _allTopics = [
    '#advice', '#fun', '#question', '#lonely', '#music', 
    '#movies', '#sports', '#technology', '#food', '#travel'
  ];
  
  @override
  void initState() {
    super.initState();
    _loadInitialData();
    _setupScrollListener();
  }
  
  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }
  
  void _setupScrollListener() {
    _scrollController.addListener(() {
      if (_scrollController.position.pixels == _scrollController.position.maxScrollExtent) {
        _loadMoreData();
      }
    });
  }
  
  Future<void> _loadInitialData() async {
    setState(() {
      _isLoading = true;
    });
    
    try {
      await Future.delayed(const Duration(milliseconds: 500));
      _loadMockData();
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }
  
  Future<void> _loadMoreData() async {
    if (_isLoading || !_hasMore) return;
    
    setState(() {
      _isLoading = true;
    });
    
    try {
      await Future.delayed(const Duration(milliseconds: 800));
      _loadMockData();
      _currentPage++;
      
      if (_currentPage > 3) {
        setState(() {
          _hasMore = false;
        });
      }
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }
  
  void _loadMockData() {
    final mockMessages = [
      AnonymousMessage(
        id: 'msg1',
        text: 'Feeling alone today. Anyone want to talk?',
        topics: ['#lonely', '#advice'],
        seenCount: 12,
        replyCount: 3,
        timeAgo: '2h ago',
        canConnect: true,
      ),
      AnonymousMessage(
        id: 'msg2',
        text: 'Any Bollywood fans here? Looking for movie recommendations!',
        topics: ['#music', '#movies'],
        seenCount: 8,
        replyCount: 0,
        timeAgo: '5h ago',
        canConnect: true,
      ),
      AnonymousMessage(
        id: 'msg3',
        text: 'Just moved to a new city. Any tips for making friends?',
        topics: ['#advice', '#question'],
        seenCount: 15,
        replyCount: 5,
        timeAgo: '1d ago',
        canConnect: true,
      ),
      AnonymousMessage(
        id: 'msg4',
        text: 'What\'s your favorite comfort food during stressful times?',
        topics: ['#food', '#question'],
        seenCount: 22,
        replyCount: 8,
        timeAgo: '3h ago',
        canConnect: true,
      ),
      AnonymousMessage(
        id: 'msg5',
        text: 'Anyone else struggling with work-life balance lately?',
        topics: ['#question', '#advice'],
        seenCount: 18,
        replyCount: 6,
        timeAgo: '6h ago',
        canConnect: true,
      ),
    ];
    
    setState(() {
      _messages.addAll(mockMessages);
    });
  }
  
  void _handleTopicTap(String topic) {
    setState(() {
      if (_selectedTopics.contains(topic)) {
        _selectedTopics.remove(topic);
      } else {
        _selectedTopics.add(topic);
      }
    });
  }
  
  List<AnonymousMessage> _getFilteredMessages() {
    if (_selectedTopics.isEmpty) return _messages;
    
    return _messages.where((message) {
      return _selectedTopics.any((topic) => message.topics.contains(topic));
    }).toList();
  }
  
  void _handleConnect(String messageId) {
    Navigator.pushNamed(
      context,
      RouteConstants.connectionRequest,
      arguments: {'anonymousId': messageId},
    );
  }
  
  void _handleRefresh() async {
    setState(() {
      _currentPage = 1;
      _hasMore = true;
      _messages.clear();
    });
    await _loadInitialData();
  }
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final authProvider = Provider.of<AuthProvider>(context);
    final screenSize = MediaQuery.of(context).size;
    
    final filteredMessages = _getFilteredMessages();
    final weeklyLimit = AppConstants.anonymousLimits[authProvider.userProfile?.tier ?? 'free']?['messagesPerWeek'] ?? 3;
    final messagesUsed = _messages.length > weeklyLimit ? weeklyLimit : _messages.length;
    final canPostMore = messagesUsed < weeklyLimit;
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('🎭 Lucky Chat'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () => _showFilterDialog(),
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _handleRefresh,
          ),
        ],
      ),
      body: Column(
        children: [
          // Usage indicator
          Container(
            padding: const EdgeInsets.all(12),
            color: theme.primaryColor.withOpacity(0.1),
            child: Row(
              children: [
                Icon(Icons.info, color: theme.primaryColor, size: 18),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '${canPostMore ? 'Messages' : 'Limit reached!'}: $messagesUsed/$weeklyLimit this week',
                    style: theme.textTheme.bodySmall!.copyWith(
                      color: canPostMore ? theme.primaryColor : ThemeConstants.errorRed,
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
          
          // Topic filters
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.all(8),
            child: Row(
              children: [
                TopicChip(
                  text: 'All',
                  isSelected: _selectedTopics.isEmpty,
                  onPressed: () {
                    setState(() {
                      _selectedTopics.clear();
                    });
                  },
                ),
                const SizedBox(width: 8),
                ..._allTopics.map((topic) {
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: TopicChip(
                      text: topic,
                      isSelected: _selectedTopics.contains(topic),
                      onPressed: canPostMore ? () => _handleTopicTap(topic) : null,
                      onLongPress: canPostMore ? () => _handleTopicTap(topic) : null,
                    ),
                  );
                }).toList(),
              ],
            ),
          ),
          
          // Messages list or empty state
          if (_isLoading && _messages.isEmpty)
            const Expanded(
              child: Center(child: CircularProgressIndicator()),
            ),
          
          if (!_isLoading && filteredMessages.isEmpty)
            Expanded(
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.masks,
                        size: 64,
                        color: theme.primaryColor.withOpacity(0.3),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'No anonymous messages yet',
                        style: theme.textTheme.headlineSmall!.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _selectedTopics.isEmpty
                            ? 'Be the first to share something anonymously!'
                            : 'No messages match your selected topics',
                        style: theme.textTheme.bodyMedium!.copyWith(
                          color: theme.textTheme.bodyMedium!.color!.withOpacity(0.7),
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 24),
                      if (canPostMore)
                        CustomButton(
                          text: 'Post Anonymous Message',
                          onPressed: () => Navigator.pushNamed(context, RouteConstants.postAnonymous),
                        ),
                    ],
                  ),
                ),
              ),
            ),
          
          if (filteredMessages.isNotEmpty)
            Expanded(
              child: RefreshIndicator(
                onRefresh: () async => _handleRefresh(),
                child: ListView.builder(
                  controller: _scrollController,
                  itemCount: filteredMessages.length + (_isLoading && _hasMore ? 1 : 0),
                  itemBuilder: (context, index) {
                    if (index < filteredMessages.length) {
                      return AnonymousCard(
                        message: filteredMessages[index],
                        onTap: () => _handleConnect(filteredMessages[index].id),
                        canInteract: canPostMore,
                      );
                    } else {
                      return const Padding(
                        padding: EdgeInsets.all(16),
                        child: Center(child: CircularProgressIndicator()),
                      );
                    }
                  },
                ),
              ),
            ),
        ],
      ),
      floatingActionButton: canPostMore
          ? FloatingActionButton(
              onPressed: () => Navigator.pushNamed(context, RouteConstants.postAnonymous),
              child: const Icon(Icons.add),
              backgroundColor: theme.primaryColor,
              elevation: 4,
            )
          : null,
    );
  }
  
  void _showFilterDialog() {
    showModalBottomSheet(
      context: context,
      builder: (context) {
        final theme = Theme.of(context);
        
        return Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Filter Topics',
                style: theme.textTheme.headlineSmall!.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _allTopics.map((topic) {
                  final isSelected = _selectedTopics.contains(topic);
                  return FilterChip(
                    label: Text(topic),
                    selected: isSelected,
                    onSelected: (selected) {
                      setState(() {
                        if (selected) {
                          _selectedTopics.add(topic);
                        } else {
                          _selectedTopics.remove(topic);
                        }
                      });
                    },
                    selectedColor: theme.primaryColor,
                    checkmarkColor: Colors.white,
                  );
                }).toList(),
              ),
              
              const SizedBox(height: 24),
              
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {
                        setState(() {
                          _selectedTopics.clear();
                        });
                        Navigator.pop(context);
                      },
                      child: const Text('Clear All'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Apply'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}

class AnonymousMessage {
  final String id;
  final String text;
  final List<String> topics;
  final int seenCount;
  final int replyCount;
  final String timeAgo;
  final bool canConnect;
  
  AnonymousMessage({
    required this.id,
    required this.text,
    required this.topics,
    required this.seenCount,
    required this.replyCount,
    required this.timeAgo,
    required this.canConnect,
  });
}
