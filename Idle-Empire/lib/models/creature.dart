import 'package:flutter/material.dart';

/// Elemental type for creatures.
enum CreatureElement { fire, water, earth, air, shadow }

/// Rarity tier for creatures.
enum CreatureRarity { common, uncommon, rare, epic, legendary, mythic }

extension CreatureElementExt on CreatureElement {
  String get displayName {
    switch (this) {
      case CreatureElement.fire: return 'Fire';
      case CreatureElement.water: return 'Water';
      case CreatureElement.earth: return 'Earth';
      case CreatureElement.air: return 'Air';
      case CreatureElement.shadow: return 'Shadow';
    }
  }

  Color get color {
    switch (this) {
      case CreatureElement.fire: return const Color(0xFFFF6B35);
      case CreatureElement.water: return const Color(0xFF4FC3F7);
      case CreatureElement.earth: return const Color(0xFF66BB6A);
      case CreatureElement.air: return const Color(0xFFCE93D8);
      case CreatureElement.shadow: return const Color(0xFF7E57C2);
    }
  }

  String get emoji {
    switch (this) {
      case CreatureElement.fire: return '🔥';
      case CreatureElement.water: return '💧';
      case CreatureElement.earth: return '🌿';
      case CreatureElement.air: return '💨';
      case CreatureElement.shadow: return '🌑';
    }
  }
}

extension CreatureRarityExt on CreatureRarity {
  String get displayName {
    switch (this) {
      case CreatureRarity.common: return 'Common';
      case CreatureRarity.uncommon: return 'Uncommon';
      case CreatureRarity.rare: return 'Rare';
      case CreatureRarity.epic: return 'Epic';
      case CreatureRarity.legendary: return 'Legendary';
      case CreatureRarity.mythic: return 'Mythic';
    }
  }

  Color get color {
    switch (this) {
      case CreatureRarity.common: return const Color(0xFF9E9E9E);
      case CreatureRarity.uncommon: return const Color(0xFF81C784);
      case CreatureRarity.rare: return const Color(0xFF42A5F5);
      case CreatureRarity.epic: return const Color(0xFFAB47BC);
      case CreatureRarity.legendary: return const Color(0xFFFFB300);
      case CreatureRarity.mythic: return const Color(0xFFFF1744);
    }
  }

  int get stars {
    switch (this) {
      case CreatureRarity.common: return 1;
      case CreatureRarity.uncommon: return 2;
      case CreatureRarity.rare: return 3;
      case CreatureRarity.epic: return 4;
      case CreatureRarity.legendary: return 5;
      case CreatureRarity.mythic: return 6;
    }
  }
}

/// Represents a creature the player can own, evolve, and merge.
class Creature {
  final String id;
  final String name;
  final String emoji;
  final CreatureElement element;
  final CreatureRarity rarity;
  final int tier; // 1-5
  final double synergyMultiplier; // multiplier bonus to matching business
  final String? synergyBusiness; // which business this creature boosts (Id)
  final String? evolvesTo; // creature id it evolves into
  double xp;
  double xpRequired;
  bool discovered;

  Creature({
    required this.id,
    required this.name,
    required this.emoji,
    required this.element,
    required this.rarity,
    required this.tier,
    required this.synergyMultiplier,
    this.synergyBusiness,
    this.evolvesTo,
    this.xp = 0,
    this.xpRequired = 100,
    this.discovered = false,
  });

  double get xpProgress => (xp / xpRequired).clamp(0.0, 1.0);
  bool get canEvolve => xp >= xpRequired && evolvesTo != null;

  Map<String, dynamic> toJson() => {
        'id': id,
        'xp': xp,
        'discovered': discovered,
      };

  void loadFromJson(Map<String, dynamic> json) {
    xp = (json['xp'] ?? 0.0).toDouble();
    discovered = json['discovered'] ?? false;
  }
}
