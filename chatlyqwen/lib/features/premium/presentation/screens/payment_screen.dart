/// @file lib/features/premium/presentation/screens/payment_screen.dart
/// @brief Payment screen for premium subscription using RevenueCat
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file implements the payment screen for premium subscriptions using
/// RevenueCat for payment processing. It displays subscription options, pricing,
/// features, and handles the payment flow with proper error handling and
/// security considerations. The screen supports both Plus and Pro tiers with
/// different pricing and feature sets.

import 'dart:async';
import 'package:chatly/core/constants/app_constants.dart';
import 'package:chatly/core/constants/route_constants.dart';
import 'package:chatly/core/constants/theme_constants.dart';
import 'package:chatly/core/providers/auth_provider.dart';
import 'package:chatly/core/utils/handlers/toast_handler.dart';
import 'package:chatly/core/widgets/common/custom_button.dart';
import 'package:chatly/core/widgets/premium/premium_badge.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:revenuecat/revenuecat.dart';

class PaymentScreen extends StatefulWidget {
  const PaymentScreen({super.key});

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  final String _apiKey = 'YOUR_REVENUECAT_API_KEY'; // This would be in .env in production
  bool _isLoading = true;
  bool _isPurchasing = false;
  List<Package> _packages = [];
  Package? _selectedPackage;
  String? _tier;
  double? _amount;
  Offerings? _offerings;
  final RevenueCat _revenueCat = RevenueCat();

  @override
  void initState() {
    super.initState();
    _setupRevenueCat();
  }

  Future<void> _setupRevenueCat() async {
    try {
      await _revenueCat.setup(
        _apiKey,
        appUserID: Provider.of<AuthProvider>(context, listen: false).currentUser?.uid,
      );
      
      await _loadPackages();
    } catch (e) {
      if (mounted) {
        ToastHandler.showError(context, 'Failed to initialize payments: ${e.toString()}');
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _loadPackages() async {
    try {
      _offerings = await _revenueCat.getOfferings();
      
      if (_offerings != null && _offerings!.current != null) {
        final currentOffering = _offerings!.current!;
        
        setState(() {
          _packages = currentOffering.availablePackages;
          _selectedPackage = _packages.firstWhere(
            (p) => p.identifier == (widget.tier == 'plus' ? 'plus_annual' : 'pro_annual'),
            orElse: () => _packages.first,
          );
        });
      }
    } catch (e) {
      ToastHandler.showError(context, 'Failed to load subscription packages: ${e.toString()}');
    }
  }

  Future<void> _handlePurchase() async {
    if (_selectedPackage == null || _isPurchasing) return;
    
    setState(() {
      _isPurchasing = true;
    });
    
    try {
      final customerInfo = await _revenueCat.purchasePackage(_selectedPackage!);
      
      if (customerInfo.entitlements.all[widget.tier ?? 'plus']?.isActive ?? false) {
        // Update user tier
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        final updatedProfile = authProvider.userProfile!.copyWith(
          tier: widget.tier ?? 'plus',
          settings: {
            ...authProvider.userProfile!.settings,
            'subscriptionExpiry': customerInfo.entitlements.all[widget.tier ?? 'plus']?.expirationDate?.toIso8601String() ?? '',
          }
        );
        
        await authProvider.updateUserProfile(updatedProfile);
        
        ToastHandler.showSuccess(context, 'Subscription successful! Welcome to Chatly ${widget.tier?.toUpperCase()}');
        await Future.delayed(const Duration(seconds: 2));
        Navigator.pushNamedAndRemoveUntil(context, RouteConstants.home, (route) => false);
      } else {
        throw Exception('Purchase was successful but subscription was not activated');
      }
    } catch (e) {
      ToastHandler.showError(context, 'Purchase failed: ${e.toString()}');
    } finally {
      if (mounted) {
        setState(() {
          _isPurchasing = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final arguments = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
    
    _tier = arguments?['tier'] ?? 'plus';
    _amount = arguments?['amount'] ?? (_tier == 'plus' ? AppConstants.plusAnnualPrice : AppConstants.proAnnualPrice);
    
    return Scaffold(
      appBar: AppBar(
        title: Text('Payment - ${_tier?.toUpperCase()}'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _buildBody(theme),
    );
  }

  Widget _buildBody(ThemeData theme) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Plan header
          _buildPlanHeader(theme),
          
          const SizedBox(height: 24),
          
          // Features list
          _buildFeaturesList(theme),
          
          const SizedBox(height: 24),
          
          // Price and purchase button
          _buildPurchaseSection(theme),
          
          const SizedBox(height: 16),
          
          // Terms and conditions
          _buildTermsSection(theme),
        ],
      ),
    );
  }

  Widget _buildPlanHeader(ThemeData theme) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: _tier == 'pro'
            ? ThemeConstants.proDiamond.withOpacity(0.1)
            : ThemeConstants.plusGold.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: _tier == 'pro'
              ? ThemeConstants.proDiamond.withOpacity(0.3)
              : ThemeConstants.plusGold.withOpacity(0.3),
        ),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                _tier == 'pro' ? Icons.star : Icons.heart_broken,
                size: 32,
                color: _tier == 'pro' ? ThemeConstants.proDiamond : ThemeConstants.plusGold,
              ),
              const SizedBox(width: 8),
              Text(
                'Chatly ${_tier?.toUpperCase()}',
                style: theme.textTheme.displaySmall!.copyWith(
                  fontWeight: FontWeight.bold,
                  color: _tier == 'pro' ? ThemeConstants.proDiamond : ThemeConstants.plusGold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Annual Subscription',
            style: theme.textTheme.bodyMedium!.copyWith(
              color: theme.textTheme.bodyMedium!.color!.withOpacity(0.8),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '₹${_amount?.toStringAsFixed(0)}/year',
            style: theme.textTheme.headlineMedium!.copyWith(
              fontWeight: FontWeight.bold,
              color: _tier == 'pro' ? ThemeConstants.proDiamond : ThemeConstants.plusGold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeaturesList(ThemeData theme) {
    final features = _tier == 'plus'
        ? [
            '✅ 10 anonymous messages/week (250 chars)',
            '✅ 1 group creation limit',
            '✅ 15+ themes & 50+ HD wallpapers',
            '✅ Custom message retention (2-7 days)',
            '✅ No banner advertisements',
            '✅ Smart algorithms & analytics',
          ]
        : [
            '✅ Unlimited anonymous messages (500 chars)',
            '✅ 2 group creation limits',
            '✅ Unlimited custom themes & animated wallpapers',
            '✅ Custom message retention + .txt backup',
            '✅ No advertisements + early feature access',
            '✅ Advanced algorithms + conversation health analytics',
          ];
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'What you get:',
          style: theme.textTheme.headlineSmall!.copyWith(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        ...features.map((feature) {
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Row(
              children: [
                Icon(
                  Icons.check_circle,
                  color: _tier == 'pro' ? ThemeConstants.proDiamond : ThemeConstants.plusGold,
                  size: 18,
                ),
                const SizedBox(width: 8),
                Text(
                  feature.substring(2), // Remove checkmark emoji
                  style: theme.textTheme.bodyMedium,
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildPurchaseSection(ThemeData theme) {
    return Column(
      children: [
        CustomButton(
          text: _isPurchasing
              ? 'Processing payment...'
              : 'Pay ₹${_amount?.toStringAsFixed(0)}',
          onPressed: _isPurchasing ? null : _handlePurchase,
          backgroundColor: _tier == 'pro'
              ? ThemeConstants.proDiamond
              : ThemeConstants.plusGold,
          icon: Icons.payment,
          isLoading: _isPurchasing,
        ),
        const SizedBox(height: 8),
        Text(
          '7-day money back guarantee',
          style: theme.textTheme.bodySmall!.copyWith(
            color: theme.textTheme.bodySmall!.color!.withOpacity(0.7),
          ),
        ),
      ],
    );
  }

  Widget _buildTermsSection(ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Payment Details',
          style: theme.textTheme.headlineSmall!.copyWith(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        Text(
          '• Payment processed securely through RevenueCat\n'
          '• Subscription renews automatically annually\n'
          '• Cancel anytime through app settings\n'
          '• No hidden fees or charges',
          style: theme.textTheme.bodyMedium!.copyWith(
            color: theme.textTheme.bodyMedium!.color!.withOpacity(0.8),
          ),
        ),
        const SizedBox(height: 16),
        Text.rich(
          TextSpan(
            children: [
              TextSpan(text: 'By proceeding, you agree to our '),
              TextSpan(
                text: 'Terms of Service',
                style: TextStyle(color: theme.primaryColor, fontWeight: FontWeight.w600),
                recognizer: TapGestureRecognizer()..onTap = () => _handleTerms(),
              ),
              TextSpan(text: ' and '),
              TextSpan(
                text: 'Privacy Policy',
                style: TextStyle(color: theme.primaryColor, fontWeight: FontWeight.w600),
                recognizer: TapGestureRecognizer()..onTap = () => _handlePrivacy(),
              ),
            ],
          ),
          style: theme.textTheme.bodySmall!.copyWith(
            color: theme.textTheme.bodySmall!.color!.withOpacity(0.8),
          ),
        ),
      ],
    );
  }

  void _handleTerms() {
    ToastHandler.showInfo(context, 'Terms of service coming soon');
  }

  void _handlePrivacy() {
    ToastHandler.showInfo(context, 'Privacy policy coming soon');
  }
}
