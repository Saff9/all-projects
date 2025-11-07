import 'package:flutter/material.dart';

/// Represents a business the player can own and upgrade.
class Business {
  final String id;
  final String name;
  final IconData icon;
  final Color color;
  final double baseCost;
  final double baseIncome;
  final double costMultiplier;
  final double incomePerLevel;
  int level;
  bool hasManager;
  double managerCost;
  List<BusinessUpgrade> upgrades;
  double _progress; // 0.0 to 1.0 for production cycle

  Business({
    required this.id,
    required this.name,
    required this.icon,
    required this.color,
    required this.baseCost,
    required this.baseIncome,
    required this.costMultiplier,
    required this.incomePerLevel,
    this.level = 0,
    this.hasManager = false,
    required this.managerCost,
    List<BusinessUpgrade>? upgrades,
  })  : upgrades = upgrades ?? [],
        _progress = 0.0;

  double get progress => _progress;
  set progress(double v) => _progress = v.clamp(0.0, 1.0);

  /// Cost to buy next level.
  double get currentCost => baseCost * _pow(costMultiplier, level);

  /// Income per production cycle at current level.
  double get currentIncome {
    double upgradeMultiplier = 1.0;
    for (final u in upgrades) {
      if (u.purchased) upgradeMultiplier *= u.multiplier;
    }
    return baseIncome + (incomePerLevel * level * upgradeMultiplier);
  }

  /// Production cycle duration in seconds (gets faster with levels).
  double get cycleDuration {
    double base = 3.0;
    double reduction = (level * 0.02).clamp(0.0, 2.5);
    return (base - reduction).clamp(0.5, 3.0);
  }

  /// Income per second when fully automated.
  double get incomePerSecond {
    if (level == 0) return 0;
    return currentIncome / cycleDuration;
  }

  bool get isUnlocked => level > 0;

  Map<String, dynamic> toJson() => {
        'id': id,
        'level': level,
        'hasManager': hasManager,
        'progress': _progress,
        'upgrades': upgrades.map((u) => u.toJson()).toList(),
      };

  void loadFromJson(Map<String, dynamic> json) {
    level = json['level'] ?? 0;
    hasManager = json['hasManager'] ?? false;
    _progress = (json['progress'] ?? 0.0).toDouble();
    if (json['upgrades'] != null) {
      final savedUpgrades = json['upgrades'] as List;
      for (int i = 0; i < savedUpgrades.length && i < upgrades.length; i++) {
        upgrades[i].purchased = savedUpgrades[i]['purchased'] ?? false;
      }
    }
  }

  static double _pow(double base, int exp) {
    double result = 1.0;
    for (int i = 0; i < exp; i++) {
      result *= base;
    }
    return result;
  }
}

/// An upgrade that can be purchased for a specific business.
class BusinessUpgrade {
  final String id;
  final String name;
  final String description;
  final double cost;
  final double multiplier;
  bool purchased;

  BusinessUpgrade({
    required this.id,
    required this.name,
    required this.description,
    required this.cost,
    required this.multiplier,
    this.purchased = false,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'purchased': purchased,
      };
}
