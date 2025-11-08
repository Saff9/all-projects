import 'package:flutter/foundation.dart';

/// Handles all ad-related functionality.
/// On web/unsupported platforms, ads are silently disabled.
class AdService {
  static final AdService _instance = AdService._internal();
  factory AdService() => _instance;
  AdService._internal();

  bool _isInitialized = false;

  /// Initialize ads — only works on mobile platforms.
  Future<void> initialize() async {
    if (_isInitialized) return;
    if (kIsWeb) {
      debugPrint('Ads disabled on web platform');
      _isInitialized = true;
      return;
    }
    // On mobile, you'd call MobileAds.instance.initialize() here
    _isInitialized = true;
  }

  bool get isRewardedAdReady => !kIsWeb;
  bool get isInterstitialAdReady => !kIsWeb;

  /// Show rewarded ad (stub — integrate real ads on mobile).
  void showRewardedAd({required Function(double amount) onRewarded}) {
    if (kIsWeb) {
      // On web, just grant the reward for testing
      onRewarded(1.0);
      return;
    }
    // Mobile ad logic would go here
    onRewarded(1.0);
  }

  /// Show interstitial ad.
  void showInterstitialAd() {
    if (kIsWeb) return;
    // Mobile ad logic would go here
  }

  void dispose() {}
}
