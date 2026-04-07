/// @file lib/features/premium/presentation/screens/premium_screen.dart
/// @brief Premium features screen showcasing subscription benefits
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file implements the premium features screen that showcases the benefits
/// of upgrading to Plus and Pro tiers. It displays feature comparisons, pricing
/// information, and allows users to subscribe to premium plans. The screen includes
/// animated premium badges, feature cards with detailed descriptions, and a clear
/// call-to-action for subscription.

import 'package:chatly/core/constants/app_constants.dart';
import 'package:chatly/core/constants/route_constants.dart';
import 'package:chatly/core/constants/theme_constants.dart';
import 'package:chatly/core/providers/auth_provider.dart';
import 'package:chatly/core/providers/theme_provider.dart';
import 'package:chatly/core/utils/handlers/toast_handler.dart';
import 'package:chatly/core/widgets/common/custom_button.dart';
import 'package:chatly/core/widgets/premium/premium_badge.dart';
import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import 'package:provider/provider.dart';

class PremiumScreen extends StatefulWidget {
  const PremiumScreen({super.key});

  @override
  State<PremiumScreen> createState() => _PremiumScreenState();
}

class _PremiumScreenState extends State<PremiumScreen> with TickerProviderStateMixin {
  late AnimationController _animationController;
  int _selectedPlanIndex = 1; // Default to Plus
  
  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
      lowerBound: 0,
      upperBound: 1,
    )..repeat();
  }
  
  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }
  
  void _handleSelectPlan(int index) {
    setState(() {
      _selectedPlanIndex = index;
    });
  }
  
  void _handleSubscribe() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final currentTier = authProvider.userProfile?.tier ?? 'free';
    final selectedTier = _selectedPlanIndex == 0 ? 'plus' : 'pro';
    
    if (currentTier == selectedTier) {
      ToastHandler.showInfo(context, 'You are already subscribed to this plan');
      return;
    }
    
    Navigator.pushNamed(
      context,
      RouteConstants.paymentScreen,
      arguments: {
        'tier': selectedTier,
        'amount': selectedTier == 'plus' ? AppConstants.plusAnnualPrice : AppConstants.proAnnualPrice,
      },
    );
  }
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final authProvider = Provider.of<AuthProvider>(context);
    final themeProvider = Provider.of<ThemeProvider>(context);
    final currentTier = authProvider.userProfile?.tier ?? 'free';
    final isDarkMode = themeProvider.isDarkMode;
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('💎 Chatly Pro'),
        actions: [
          IconButton(
            icon: const Icon(Icons.info_outline),
            onPressed: _showInfoDialog,
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Hero section
              _buildHeroSection(theme, isDarkMode),
              
              const SizedBox(height: 24),
              
              // Current plan info
              _buildCurrentPlanInfo(theme, currentTier),
              
              const SizedBox(height: 24),
              
              // Plan selector
              _buildPlanSelector(theme),
              
              const SizedBox(height: 24),
              
              // Feature comparison
              _buildFeatureComparison(theme, currentTier),
              
              const SizedBox(height: 24),
              
              // Testimonials
              _buildTestimonials(theme),
              
              const SizedBox(height: 32),
              
              // Subscribe button
              _buildSubscribeButton(theme, currentTier),
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildHeroSection(ThemeData theme, bool isDarkMode) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF8B5CF6), Color(0xFFEC4899)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: ThemeConstants.cardShadow,
      ),
      child: Column(
        children: [
          ScaleTransition(
            scale: _animationController,
            child: Lottie.asset(
              'assets/animations/unlock.json',
              width: 120,
              height: 120,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Upgrade Your Chat Experience',
            style: theme.textTheme.displaySmall!.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            'Get unlimited features, enhanced privacy, and smart algorithms',
            style: theme.textTheme.bodyLarge!.copyWith(
              color: Colors.white70,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
  
  Widget _buildCurrentPlanInfo(ThemeData theme, String currentTier) {
    String planName;
    String planDescription;
    Color planColor;
    
    switch (currentTier) {
      case 'free':
        planName = 'Free Plan';
        planDescription = 'Basic features with some limitations';
        planColor = Colors.grey;
        break;
      case 'plus':
        planName = 'Plus Plan';
        planDescription = 'Enhanced features and unlimited anonymous chats';
        planColor = ThemeConstants.plusGold;
        break;
      default:
        planName = 'Pro Plan';
        planDescription = 'All features unlocked with advanced algorithms';
        planColor = ThemeConstants.proDiamond;
    }
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: planColor.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: planColor.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              currentTier == 'free' ? Icons.star_border : Icons.star,
              color: planColor,
            ),
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Current Plan: $planName',
                style: theme.textTheme.titleMedium!.copyWith(
                  color: planColor,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                planDescription,
                style: theme.textTheme.bodyMedium,
              ),
            ],
          ),
          const Spacer(),
          ElevatedButton(
            onPressed: () {
              // Handle plan management
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: planColor.withOpacity(0.2),
              foregroundColor: planColor,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            ),
            child: const Text('Manage Plan'),
          ),
        ],
      ),
    );
  }
  
  Widget _buildPlanSelector(ThemeData theme) {
    return SegmentedButton<int>(
      segments: const [
        ButtonSegment(value: 0, label: Text('Plus\n₹199/year')),
        ButtonSegment(value: 1, label: Text('Pro\n₹299/year')),
      ],
      selected: {_selectedPlanIndex},
      onSelectionChanged: (Set<int> newSelection) {
        _handleSelectPlan(newSelection.first);
      },
      style: ButtonStyle(
        backgroundColor: WidgetStateProperty.all(theme.primaryColor),
        foregroundColor: WidgetStateProperty.all(Colors.white),
        padding: WidgetStateProperty.all(const EdgeInsets.symmetric(vertical: 12)),
      ),
    );
  }
  
  Widget _buildFeatureComparison(ThemeData theme, String currentTier) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Feature Comparison',
          style: theme.textTheme.headlineSmall!.copyWith(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        Container(
          decoration: BoxDecoration(
            color: theme.cardColor,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: theme.dividerColor),
          ),
          child: Column(
            children: [
              // Header row
              _buildComparisonHeader(theme),
              
              // Feature rows
              ..._getFeatureRows(theme, currentTier),
            ],
          ),
        ),
      ],
    );
  }
  
  Widget _buildComparisonHeader(ThemeData theme) {
    return Row(
      children: [
        Expanded(
          flex: 2,
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border(bottom: BorderSide(color: theme.dividerColor)),
            ),
            child: const Text('Feature', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ),
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border(
                bottom: BorderSide(color: theme.dividerColor),
                left: BorderSide(color: theme.dividerColor),
              ),
            ),
            child: const Center(child: Text('Free', style: TextStyle(fontWeight: FontWeight.bold))),
          ),
        ),
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border(
                bottom: BorderSide(color: theme.dividerColor),
                left: BorderSide(color: theme.dividerColor),
              ),
            ),
            child: const Center(child: Text('Plus', style: TextStyle(fontWeight: FontWeight.bold))),
          ),
        ),
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border(
                bottom: BorderSide(color: theme.dividerColor),
                left: BorderSide(color: theme.dividerColor),
              ),
            ),
            child: const Center(child: Text('Pro', style: TextStyle(fontWeight: FontWeight.bold))),
          ),
        ),
      ],
    );
  }
  
  List<Widget> _getFeatureRows(ThemeData theme, String currentTier) {
    final features = [
      {
        'name': 'Anonymous Messages',
        'free': '3/week (100 chars)',
        'plus': '10/week (250 chars)',
        'pro': 'Unlimited (500 chars)',
        'highlight': true,
      },
      {
        'name': 'Group Creation',
        'free': '0 groups',
        'plus': '1 group',
        'pro': '2 groups',
        'highlight': true,
      },
      {
        'name': 'Message Retention',
        'free': '7 days fixed',
        'plus': '2-7 days choice',
        'pro': '2-7 days + backup',
        'highlight': false,
      },
      {
        'name': 'Themes',
        'free': '3 themes',
        'plus': '15+ themes',
        'pro': 'Unlimited custom',
        'highlight': false,
      },
      {
        'name': 'Wallpapers',
        'free': '3 gradients',
        'plus': '50+ HD',
        'pro': 'Unlimited animated',
        'highlight': false,
      },
      {
        'name': 'Ads',
        'free': 'Banner ads',
        'plus': 'No ads',
        'pro': 'No ads + early access',
        'highlight': true,
      },
      {
        'name': 'Smart Algorithms',
        'free': 'Basic',
        'plus': 'Advanced',
        'pro': 'Advanced + analytics',
        'highlight': true,
      },
    ];
    
    return features.map((feature) {
      final isHighlighted = feature['highlight'] == true;
      
      return Column(
        children: [
          Row(
            children: [
              Expanded(
                flex: 2,
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    border: Border(
                      bottom: BorderSide(color: theme.dividerColor),
                      right: BorderSide(color: theme.dividerColor),
                    ),
                    color: isHighlighted ? ThemeConstants.primaryIndigo.withOpacity(0.05) : null,
                  ),
                  child: Text(feature['name'] as String),
                ),
              ),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    border: Border(
                      bottom: BorderSide(color: theme.dividerColor),
                      left: BorderSide(color: theme.dividerColor),
                      right: BorderSide(color: theme.dividerColor),
                    ),
                    color: isHighlighted ? ThemeConstants.primaryIndigo.withOpacity(0.05) : null,
                  ),
                  child: Center(child: Text(feature['free'] as String)),
                ),
              ),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    border: Border(
                      bottom: BorderSide(color: theme.dividerColor),
                      left: BorderSide(color: theme.dividerColor),
                      right: BorderSide(color: theme.dividerColor),
                    ),
                    color: isHighlighted ? ThemeConstants.primaryIndigo.withOpacity(0.05) : null,
                  ),
                  child: Center(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        if (_selectedPlanIndex == 0) const Icon(Icons.check, color: Colors.green),
                        Text(feature['plus'] as String),
                      ],
                    ),
                  ),
                ),
              ),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    border: Border(
                      bottom: BorderSide(color: theme.dividerColor),
                      left: BorderSide(color: theme.dividerColor),
                    ),
                    color: isHighlighted ? ThemeConstants.primaryIndigo.withOpacity(0.05) : null,
                  ),
                  child: Center(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        if (_selectedPlanIndex == 1) const Icon(Icons.check, color: Colors.green),
                        Text(feature['pro'] as String),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
          if (features.indexOf(feature) < features.length - 1)
            const Divider(height: 1),
        ],
      );
    }).toList();
  }
  
  Widget _buildTestimonials(ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'What Users Say',
          style: theme.textTheme.headlineSmall!.copyWith(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 120,
          child: ListView(
            scrollDirection: Axis.horizontal,
            children: [
              _buildTestimonialCard(
                theme,
                name: 'Rahul S.',
                text: 'The anonymous chat feature helped me connect with like-minded people without judgment.',
                rating: 5,
              ),
              const SizedBox(width: 16),
              _buildTestimonialCard(
                theme,
                name: 'Priya M.',
                text: 'Smart notifications reduced my screen time by 40%. Best decision to upgrade to Pro!',
                rating: 5,
              ),
              const SizedBox(width: 16),
              _buildTestimonialCard(
                theme,
                name: 'Amit K.',
                text: 'The conversation health score saved our work group from becoming inactive.',
                rating: 4,
              ),
            ],
          ),
        ),
      ],
    );
  }
  
  Widget _buildTestimonialCard(ThemeData theme, {required String name, required String text, required int rating}) {
    return Container(
      width: 300,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(16),
        boxShadow: ThemeConstants.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const CircleAvatar(
                radius: 16,
                backgroundColor: ThemeConstants.primaryIndigo,
                child: Text('U', style: TextStyle(color: Colors.white)),
              ),
              const SizedBox(width: 8),
              Text(
                name,
                style: theme.textTheme.titleMedium!.copyWith(fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            text,
            style: theme.textTheme.bodyMedium,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 8),
          Row(
            children: List.generate(rating, (index) {
              return const Icon(Icons.star, size: 16, color: Colors.amber);
            }),
          ),
        ],
      ),
    );
  }
  
  Widget _buildSubscribeButton(ThemeData theme, String currentTier) {
    final selectedTier = _selectedPlanIndex == 0 ? 'plus' : 'pro';
    final amount = selectedTier == 'plus' ? AppConstants.plusAnnualPrice : AppConstants.proAnnualPrice;
    final isCurrentTier = currentTier == selectedTier;
    
    return CustomButton(
      text: isCurrentTier
          ? 'Current Plan'
          : 'Subscribe to ${selectedTier == "plus" ? "Plus" : "Pro"} - ₹${amount.toStringAsFixed(0)}/year',
      onPressed: isCurrentTier ? null : _handleSubscribe,
      backgroundColor: isCurrentTier
          ? theme.dividerColor
          : (_selectedPlanIndex == 0 ? ThemeConstants.plusGold : ThemeConstants.proDiamond),
      isLoading: false,
    );
  }
  
  void _showInfoDialog() {
    showDialog(
      context: context,
      builder: (context) {
        final theme = Theme.of(context);
        
        return AlertDialog(
          title: const Text('About Premium Plans'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('All premium plans include:'),
              const SizedBox(height: 8),
              _buildInfoRow('✓ No banner advertisements'),
              _buildInfoRow('✓ Priority customer support'),
              _buildInfoRow('✓ Early access to new features'),
              _buildInfoRow('✓ Enhanced privacy controls'),
              const SizedBox(height: 16),
              Text(
                'Payment is processed securely through RevenueCat. You can cancel anytime.',
                style: theme.textTheme.bodySmall!.copyWith(
                  color: theme.textTheme.bodySmall!.color!.withOpacity(0.7),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: Navigator.of(context).pop,
              child: const Text('OK'),
            ),
          ],
        );
      },
    );
  }
  
  Widget _buildInfoRow(String text) {
    return Row(
      children: [
        Icon(Icons.check_circle, color: ThemeConstants.secondaryEmerald, size: 16),
        const SizedBox(width: 8),
        Text(text),
      ],
    );
  }
}
