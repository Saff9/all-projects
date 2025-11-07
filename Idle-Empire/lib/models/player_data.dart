/// Tracks all player-level data: currencies, stats, progression.
class PlayerData {
  double coins;
  double gems;
  double evolutionShards;
  double techPoints;
  double prestigePoints;
  double lifetimeEarnings;
  int prestigeCount;
  double prestigeMultiplier;
  int loginStreak;
  DateTime? lastLoginDate;
  DateTime? lastDailyClaimDate;
  List<String> claimedAchievements;
  List<String> completedQuests;
  List<String> dismissedHints;
  double adBoostMultiplier;
  DateTime? adBoostExpiry;
  Map<String, int> techUpgradesPurchased; // e.g. {'neural': 2, 'warp': 0, 'genetic': 1}

  PlayerData({
    this.coins = 0,
    this.gems = 0,
    this.evolutionShards = 0,
    this.techPoints = 0,
    this.prestigePoints = 0,
    this.lifetimeEarnings = 0,
    this.prestigeCount = 0,
    this.prestigeMultiplier = 1.0,
    this.loginStreak = 0,
    this.lastLoginDate,
    this.lastDailyClaimDate,
    List<String>? claimedAchievements,
    List<String>? completedQuests,
    List<String>? dismissedHints,
    this.adBoostMultiplier = 1.0,
    this.adBoostExpiry,
    Map<String, int>? techUpgradesPurchased,
  })  : claimedAchievements = claimedAchievements ?? [],
        completedQuests = completedQuests ?? [],
        dismissedHints = dismissedHints ?? [],
        techUpgradesPurchased = techUpgradesPurchased ?? {'neural': 0, 'warp': 0, 'genetic': 0};

  /// Total income multiplier from prestige + ad boost + tech upgrades.
  double get totalMultiplier {
    double mult = prestigeMultiplier;
    if (adBoostExpiry != null && DateTime.now().isBefore(adBoostExpiry!)) {
      mult *= adBoostMultiplier;
    }
    mult *= techIncomeMultiplier;
    return mult;
  }

  /// Bonus income multiplier from Neural Augment tech upgrades.
  double get techIncomeMultiplier {
    const bonuses = [1.0, 1.05, 1.15, 1.50, 3.0];
    return bonuses[(techUpgradesPurchased['neural'] ?? 0).clamp(0, 4)];
  }

  /// Cost reduction from Warp Logistics tech upgrades.
  double get techCostDiscount {
    const discounts = [0.0, 0.05, 0.15, 0.30, 0.50];
    return discounts[(techUpgradesPurchased['warp'] ?? 0).clamp(0, 4)];
  }

  /// XP gain multiplier from Genetic Boost tech upgrades.
  double get techXpMultiplier {
    const bonuses = [1.0, 1.10, 1.30, 1.75, 3.0];
    return bonuses[(techUpgradesPurchased['genetic'] ?? 0).clamp(0, 4)];
  }

  /// Calculate prestige points earned from lifetime earnings.
  double get potentialPrestigePoints {
    if (lifetimeEarnings < 10000) return 0;
    return (lifetimeEarnings / 10000).floorToDouble();
  }

  /// Check if daily reward can be claimed.
  bool get canClaimDaily {
    if (lastDailyClaimDate == null) return true;
    final now = DateTime.now();
    return !_isSameDay(now, lastDailyClaimDate!);
  }

  bool _isSameDay(DateTime a, DateTime b) {
    return a.year == b.year && a.month == b.month && a.day == b.day;
  }

  Map<String, dynamic> toJson() => {
        'coins': coins,
        'gems': gems,
        'evolutionShards': evolutionShards,
        'techPoints': techPoints,
        'prestigePoints': prestigePoints,
        'lifetimeEarnings': lifetimeEarnings,
        'prestigeCount': prestigeCount,
        'prestigeMultiplier': prestigeMultiplier,
        'loginStreak': loginStreak,
        'lastLoginDate': lastLoginDate?.toIso8601String(),
        'lastDailyClaimDate': lastDailyClaimDate?.toIso8601String(),
        'claimedAchievements': claimedAchievements,
        'completedQuests': completedQuests,
        'dismissedHints': dismissedHints,
        'adBoostMultiplier': adBoostMultiplier,
        'adBoostExpiry': adBoostExpiry?.toIso8601String(),
        'techUpgradesPurchased': techUpgradesPurchased,
      };

  static PlayerData fromJson(Map<String, dynamic> json) {
    return PlayerData(
      coins: (json['coins'] ?? 0).toDouble(),
      gems: (json['gems'] ?? 0).toDouble(),
      evolutionShards: (json['evolutionShards'] ?? 0).toDouble(),
      techPoints: (json['techPoints'] ?? 0).toDouble(),
      prestigePoints: (json['prestigePoints'] ?? 0).toDouble(),
      lifetimeEarnings: (json['lifetimeEarnings'] ?? 0).toDouble(),
      prestigeCount: json['prestigeCount'] ?? 0,
      prestigeMultiplier: (json['prestigeMultiplier'] ?? 1.0).toDouble(),
      loginStreak: json['loginStreak'] ?? 0,
      lastLoginDate: json['lastLoginDate'] != null
          ? DateTime.tryParse(json['lastLoginDate'])
          : null,
      lastDailyClaimDate: json['lastDailyClaimDate'] != null
          ? DateTime.tryParse(json['lastDailyClaimDate'])
          : null,
      claimedAchievements:
          List<String>.from(json['claimedAchievements'] ?? []),
      completedQuests: List<String>.from(json['completedQuests'] ?? []),
      dismissedHints: List<String>.from(json['dismissedHints'] ?? []),
      adBoostMultiplier: (json['adBoostMultiplier'] ?? 1.0).toDouble(),
      adBoostExpiry: json['adBoostExpiry'] != null
          ? DateTime.tryParse(json['adBoostExpiry'])
          : null,
      techUpgradesPurchased: json['techUpgradesPurchased'] != null
          ? Map<String, int>.from(json['techUpgradesPurchased'])
          : {'neural': 0, 'warp': 0, 'genetic': 0},
    );
  }
}
