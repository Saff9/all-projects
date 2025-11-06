import 'package:flutter/foundation.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';

class AdManager {
  static const String bannerAdUnitId = 'ca-app-pub-2054366626825410/5175918280';
  static const String interstitialAdUnitId = 'ca-app-pub-2054366626825410/5175918280'; // Reusing as requested

  static bool get isSupported => !kIsWeb && (defaultTargetPlatform == TargetPlatform.android || defaultTargetPlatform == TargetPlatform.iOS);

  // Interstitial State
  static InterstitialAd? _interstitialAd;
  static bool _isInterstitialAdReady = false;

  /// Call this once when the app starts
  static Future<void> init() async {
    if (!isSupported) return;
    try {
      await MobileAds.instance.initialize();
      _loadInterstitialAd();
    } catch (e) {
      debugPrint('AdMob Initialization failed: $e');
    }
  }

  /// Returns a configured BannerAd that is ready to be loaded and displayed.
  /// The caller must call `.load()` and `.dispose()` on it.
  static BannerAd createBannerAd({
    required VoidCallback onAdLoaded,
    required void Function(LoadAdError) onAdFailedToLoad,
  }) {
    return BannerAd(
      adUnitId: bannerAdUnitId,
      size: AdSize.banner,
      request: const AdRequest(),
      listener: BannerAdListener(
        onAdLoaded: (_) => onAdLoaded(),
        onAdFailedToLoad: (ad, error) {
          debugPrint('BannerAd failed to load: $error');
          ad.dispose();
          onAdFailedToLoad(error);
        },
      ),
    );
  }

  /// Preloads the interstitial ad in the background
  static void _loadInterstitialAd() {
    if (!isSupported) return;

    InterstitialAd.load(
      adUnitId: interstitialAdUnitId,
      request: const AdRequest(),
      adLoadCallback: InterstitialAdLoadCallback(
        onAdLoaded: (ad) {
          _interstitialAd = ad;
          _isInterstitialAdReady = true;

          // Set full screen content callbacks if necessary
          ad.fullScreenContentCallback = FullScreenContentCallback(
            onAdDismissedFullScreenContent: (ad) {
              ad.dispose();
              _isInterstitialAdReady = false;
              _loadInterstitialAd(); // Load next one
            },
            onAdFailedToShowFullScreenContent: (ad, error) {
              ad.dispose();
              _isInterstitialAdReady = false;
              _loadInterstitialAd();
            },
          );
        },
        onAdFailedToLoad: (error) {
          debugPrint('InterstitialAd failed to load: $error');
          _isInterstitialAdReady = false;
        },
      ),
    );
  }

  /// Show the interstitial ad if it's ready
  static void showInterstitialAd(VoidCallback onDismissed) {
    if (!isSupported || !_isInterstitialAdReady || _interstitialAd == null) {
      onDismissed();
      return;
    }

    // Override the callback temporarily to trigger our `onDismissed` logic
    final prevCallback = _interstitialAd!.fullScreenContentCallback;
    _interstitialAd!.fullScreenContentCallback = FullScreenContentCallback(
      onAdDismissedFullScreenContent: (ad) {
        prevCallback?.onAdDismissedFullScreenContent?.call(ad);
        onDismissed();
      },
      onAdFailedToShowFullScreenContent: (ad, error) {
        prevCallback?.onAdFailedToShowFullScreenContent?.call(ad, error);
        onDismissed();
      },
      onAdShowedFullScreenContent: prevCallback?.onAdShowedFullScreenContent,
      onAdImpression: prevCallback?.onAdImpression,
      onAdClicked: prevCallback?.onAdClicked,
    );

    _interstitialAd!.show();
    _interstitialAd = null;
    _isInterstitialAdReady = false;
  }
}
