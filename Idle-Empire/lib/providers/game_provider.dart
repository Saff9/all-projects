import 'dart:async';
import 'package:flutter/material.dart';
import '../core/game_engine.dart';
import '../core/save_manager.dart';
import '../data/business_data.dart';
import '../data/creature_data.dart';
import '../models/business.dart';
import '../models/creature.dart';
import '../models/player_data.dart';
import '../models/quest.dart';
import '../models/expedition.dart';
import '../data/quest_data.dart';

/// Master game provider that orchestrates all game systems.
class GameProvider extends ChangeNotifier {
  late GameEngine _engine;
  late PlayerData playerData;
  late List<Business> businesses;
  late List<Creature> creatures;
  late List<Quest> quests;
  late List<Expedition> expeditions;

  bool _initialized = false;
  bool get isInitialized => _initialized;

  // Offline earnings to show in popup
  double offlineEarnings = 0;
  bool showOfflinePopup = false;

  // Auto-save timer
  Timer? _autoSaveTimer;

  GameProvider() {
    playerData = PlayerData();
    businesses = BusinessData.getAllBusinesses();
    creatures = CreatureData.getAllCreatures();
    quests = QuestData.getAllQuests();
    expeditions = ExpeditionData.getDefaultExpeditions();
    _engine = GameEngine(onTick: _onTick);
  }

  /// Initialize game: load save, calculate offline, start engine.
  Future<void> initialize() async {
    if (_initialized) return;

    // Load saved data
    final saveData = await SaveManager.loadGame();
    if (saveData != null) {
      _loadFromSave(saveData);
    } else {
      // New game: give starting coins
      playerData.coins = 10;
      // Discover first creature
      creatures.first.discovered = true;
    }

    // Calculate offline earnings
    final offlineSeconds = await SaveManager.getOfflineSeconds();
    if (offlineSeconds > 10) {
      _calculateOfflineEarnings(offlineSeconds);
    }

    // Check daily login
    _checkDailyLogin();

    _initialized = true;
    _engine.start();

    // Auto-save every 30 seconds
    _autoSaveTimer = Timer.periodic(
      const Duration(seconds: 30),
      (_) => saveGame(),
    );

    notifyListeners();
  }

  /// Main game tick — runs 10x per second.
  void _onTick() {
    bool changed = false;

    for (final biz in businesses) {
      if (biz.level == 0) continue;

      if (biz.hasManager) {
        // Auto-produce
        biz.progress += (1.0 / (biz.cycleDuration * 10)); // 10 ticks/sec
        if (biz.progress >= 1.0) {
          biz.progress = 0.0;
          _collectIncome(biz);
          changed = true;
        }
      }
    }

    // Passive XP to discovered creatures
    for (final creature in creatures) {
      if (creature.discovered && creature.tier < 5) {
        creature.xp += 0.01 * playerData.totalMultiplier; // Passive XP gain
      }
    }

    if (_checkQuests()) changed = true;
    if (_checkExpeditions()) changed = true;

    if (changed) notifyListeners();
  }

  /// Tap a business to manually produce.
  void tapBusiness(Business biz) {
    if (biz.level == 0) return;

    biz.progress += 0.34; // Each tap = 34% of cycle
    if (biz.progress >= 1.0) {
      biz.progress = 0.0;
      _collectIncome(biz);
    }
    notifyListeners();
  }

  void _collectIncome(Business biz) {
    double income = biz.currentIncome * playerData.totalMultiplier;

    // Apply creature synergy
    for (final creature in creatures) {
      if (creature.discovered && creature.synergyBusiness == biz.id) {
        income *= creature.synergyMultiplier;
      }
    }

    playerData.coins += income;
    playerData.lifetimeEarnings += income;
  }

  /// Purchase a business level.
  bool buyBusiness(Business biz) {
    if (playerData.coins < biz.currentCost) return false;
    playerData.coins -= biz.currentCost;
    biz.level++;
    // Discover a new creature when buying a new business
    _tryDiscoverCreature();
    _checkQuests();
    notifyListeners();
    return true;
  }

  /// Buy multiple levels at once.
  int buyBusinessMax(Business biz) {
    int bought = 0;
    while (playerData.coins >= biz.currentCost) {
      playerData.coins -= biz.currentCost;
      biz.level++;
      bought++;
    }
    if (bought > 0) {
      _tryDiscoverCreature();
      _checkQuests();
      notifyListeners();
    }
    return bought;
  }

  /// Hire a manager for auto-production.
  bool hireManager(Business biz) {
    if (biz.hasManager) return false;
    if (playerData.coins < biz.managerCost) return false;
    playerData.coins -= biz.managerCost;
    biz.hasManager = true;
    notifyListeners();
    return true;
  }

  /// Purchase a business upgrade.
  bool buyUpgrade(Business biz, BusinessUpgrade upgrade) {
    if (upgrade.purchased) return false;
    if (playerData.coins < upgrade.cost) return false;
    playerData.coins -= upgrade.cost;
    upgrade.purchased = true;
    notifyListeners();
    return true;
  }

  /// Try to discover a random undiscovered creature.
  void _tryDiscoverCreature() {
    final undiscovered = creatures.where((c) => !c.discovered).toList();
    if (undiscovered.isEmpty) return;

    // Higher chance based on total business levels
    int totalLevels = businesses.fold(0, (sum, b) => sum + b.level);
    if (totalLevels % 5 == 0) {
      // Discover every 5 total levels
      // Prefer lower tier creatures first
      undiscovered.sort((a, b) => a.tier.compareTo(b.tier));
      undiscovered.first.discovered = true;
    }
  }

  /// Feed XP to a creature.
  void feedCreature(Creature creature, double xpAmount) {
    if (!creature.discovered) return;
    creature.xp += xpAmount;
    notifyListeners();
  }

  /// Evolve a creature to its next form.
  Creature? evolveCreature(Creature creature) {
    if (!creature.canEvolve) return null;

    final nextId = creature.evolvesTo;
    if (nextId == null) return null;

    final nextCreature = creatures.firstWhere(
      (c) => c.id == nextId,
      orElse: () => creature,
    );

    if (nextCreature.id == creature.id) return null;

    nextCreature.discovered = true;
    creature.xp = 0;
    notifyListeners();
    return nextCreature;
  }

  /// Merge two same-element, same-tier creatures for bonus XP.
  bool mergeCreatures(Creature c1, Creature c2) {
    if (c1.element != c2.element) return false;
    if (c1.tier != c2.tier) return false;
    if (!c1.discovered || !c2.discovered) return false;

    // Merging gives massive XP to the first creature
    double mergeXp = c1.xpRequired * 0.5;
    c1.xp += mergeXp;
    notifyListeners();
    return true;
  }

  /// Prestige: reset businesses for permanent multiplier.
  bool prestige() {
    final points = playerData.potentialPrestigePoints;
    if (points <= 0) return false;

    // Reset businesses
    for (final biz in businesses) {
      biz.level = 0;
      biz.hasManager = false;
      biz.progress = 0;
      for (final u in biz.upgrades) {
        u.purchased = false;
      }
    }

    // Apply prestige rewards
    playerData.prestigePoints += points;
    playerData.prestigeCount++;
    playerData.prestigeMultiplier = 1.0 + (playerData.prestigePoints * 0.01);
    playerData.coins = 10; // Starting coins after prestige
    playerData.lifetimeEarnings = 0;

    _checkQuests();
    notifyListeners();
    return true;
  }

  /// Activate 2x ad boost for 2 minutes.
  void activateAdBoost() {
    playerData.adBoostMultiplier = 2.0;
    playerData.adBoostExpiry = DateTime.now().add(const Duration(minutes: 2));
    notifyListeners();
  }

  /// Claim daily reward.
  double? claimDailyReward() {
    if (!playerData.canClaimDaily) return null;

    final now = DateTime.now();

    // Check streak
    if (playerData.lastLoginDate != null) {
      final diff = now.difference(playerData.lastLoginDate!).inDays;
      if (diff == 1) {
        playerData.loginStreak++;
      } else if (diff > 1) {
        playerData.loginStreak = 1;
      }
    } else {
      playerData.loginStreak = 1;
    }

    playerData.lastLoginDate = now;
    playerData.lastDailyClaimDate = now;

    // Reward scales with streak
    double reward = 100 * playerData.loginStreak.toDouble();
    playerData.coins += reward;

    notifyListeners();
    return reward;
  }

  /// Total income per second across all businesses.
  double get totalIncomePerSecond {
    double total = 0;
    for (final biz in businesses) {
      if (biz.level > 0 && biz.hasManager) {
        double income = biz.incomePerSecond * playerData.totalMultiplier;
        for (final creature in creatures) {
          if (creature.discovered && creature.synergyBusiness == biz.id) {
            income *= creature.synergyMultiplier;
          }
        }
        total += income;
      }
    }
    return total;
  }

  /// Count discovered creatures.
  int get discoveredCreatureCount =>
      creatures.where((c) => c.discovered).length;

  void _calculateOfflineEarnings(int seconds) {
    double earnings = totalIncomePerSecond * seconds * 0.5; // 50% efficiency offline
    if (earnings > 0) {
      offlineEarnings = earnings;
      playerData.coins += earnings;
      playerData.lifetimeEarnings += earnings;
      showOfflinePopup = true;
    }
  }

  void dismissOfflinePopup() {
    showOfflinePopup = false;
    notifyListeners();
  }

  void _checkDailyLogin() {
    // This just sets up the state; UI will show the daily popup
  }

  /// Check all active quests for completion.
  bool _checkQuests() {
    bool changed = false;
    for (final q in quests) {
      if (q.isCompleted) continue;

      bool completed = false;
      switch (q.type) {
        case QuestType.collectCoins:
          if (playerData.coins >= q.target) completed = true;
          break;
        case QuestType.unlockCreatures:
          if (discoveredCreatureCount >= q.target) completed = true;
          break;
        case QuestType.reachBusinessLevel:
          if (q.targetId != null) {
            final biz = businesses.firstWhere((b) => b.id == q.targetId, orElse: () => businesses.first);
            if (biz.level >= q.target) completed = true;
          }
          break;
        case QuestType.prestigeTimes:
          if (playerData.prestigeCount >= q.target) completed = true;
          break;
        case QuestType.totalBusinesses:
          if (businesses.where((b) => b.level > 0).length >= q.target) completed = true;
          break;
      }

      if (completed) {
        q.isCompleted = true;
        changed = true;
      }
    }
    return changed;
  }

  /// Claim a completed quest reward.
  bool claimQuest(Quest quest) {
    if (!quest.isCompleted || quest.isClaimed) return false;

    quest.isClaimed = true;
    playerData.gems += quest.gemsReward;
    playerData.evolutionShards += quest.shardsReward;

    notifyListeners();
    return true;
  }

  /// Dismiss an onboarding hint.
  void dismissHint(String hintId) {
    if (!playerData.dismissedHints.contains(hintId)) {
      playerData.dismissedHints.add(hintId);
      notifyListeners();
    }
  }

  /// Get the current active quest (first uncompleted or un-claimed one)
  Quest? get currentQuest {
    try {
      return quests.firstWhere((q) => !q.isClaimed);
    } catch (_) {
      return null;
    }
  }

  /// Check active expeditions for completion
  bool _checkExpeditions() {
    bool changed = false;
    final now = DateTime.now();
    for (final exp in expeditions) {
      if (exp.isActive && !exp.isCompleted && exp.startTime != null) {
        if (now.difference(exp.startTime!) >= exp.duration) {
          exp.isCompleted = true;
          changed = true;
        }
      }
    }
    return changed;
  }

  /// Start an expedition with selected creatures
  bool startExpedition(Expedition exp, List<String> creatureIds) {
    if (exp.isActive || creatureIds.length != exp.requiredCreatures) return false;
    
    // Validate creature availability (not already on an expedition)
    for (final id in creatureIds) {
      for (final e in expeditions) {
        if (e.isActive && e.deployedCreatureIds.contains(id)) return false;
      }
    }

    exp.isActive = true;
    exp.isCompleted = false;
    exp.startTime = DateTime.now();
    exp.deployedCreatureIds = List.from(creatureIds);
    notifyListeners();
    return true;
  }

  /// Claim a completed expedition
  bool claimExpedition(Expedition exp) {
    if (!exp.isActive || !exp.isCompleted) return false;

    playerData.gems += exp.rewardGems;
    playerData.evolutionShards += exp.rewardShards;
    
    // Reset the expedition so it can be played again
    exp.isActive = false;
    exp.isCompleted = false;
    exp.startTime = null;
    exp.deployedCreatureIds.clear();
    
    notifyListeners();
    return true;
  }

  /// Add Tech Points from Void Tap (Aether Harvest).
  double claimVoidTapReward(double techPointsEarned) {
    playerData.techPoints += techPointsEarned;
    notifyListeners();
    return techPointsEarned;
  }

  /// Massive burst of base capital from Gem Crafter (Mineral Synthesis).
  /// Generates 10 minutes of total empire income scaled by combo score.
  double claimGemCrafterReward(double comboScore) {
    double baseIncome = totalIncomePerSecond;
    if (baseIncome < 1) baseIncome = 1; // Minimum baseline
    
    // Every 100 points = 10 minutes (600s) of income
    double burstCoins = baseIncome * 600 * (comboScore / 100); 
    playerData.coins += burstCoins;
    notifyListeners();
    return burstCoins;
  }

  /// Add Evolution Shards from Aura Blast (Dark Matter Defense).
  double claimAuraBlastReward(double shards) {
    playerData.evolutionShards += shards;
    notifyListeners();
    return shards;
  }

  Future<void> saveGame() async {
    final data = <String, dynamic>{
      'player': playerData.toJson(),
      'businesses': businesses.map((b) => b.toJson()).toList(),
      'creatures': creatures.map((c) => c.toJson()).toList(),
      'quests': quests.map((q) => q.toJson()).toList(),
      'expeditions': expeditions.map((e) => e.toJson()).toList(),
    };
    await SaveManager.saveGame(data);
  }

  void _loadFromSave(Map<String, dynamic> data) {
    if (data['player'] != null) {
      playerData = PlayerData.fromJson(data['player']);
    }
    if (data['businesses'] != null) {
      final bizList = data['businesses'] as List;
      for (int i = 0; i < bizList.length && i < businesses.length; i++) {
        businesses[i].loadFromJson(bizList[i]);
      }
    }
    if (data['creatures'] != null) {
      final cList = data['creatures'] as List;
      for (int i = 0; i < cList.length && i < creatures.length; i++) {
        creatures[i].loadFromJson(cList[i]);
      }
    }
    if (data['quests'] != null) {
      final qList = data['quests'] as List;
      for (int i = 0; i < qList.length && i < quests.length; i++) {
        quests[i].loadFromJson(qList[i]);
      }
    }
    if (data['expeditions'] != null) {
      final eList = data['expeditions'] as List;
      for (int i = 0; i < eList.length && i < expeditions.length; i++) {
        expeditions[i].loadFromJson(eList[i]);
      }
    }
  }

  /// Reset all game data.
  Future<void> resetGame() async {
    _engine.stop();
    await SaveManager.clearSave();
    playerData = PlayerData(coins: 10);
    businesses = BusinessData.getAllBusinesses();
    creatures = CreatureData.getAllCreatures();
    quests = QuestData.getAllQuests();
    expeditions = ExpeditionData.getDefaultExpeditions();
    creatures.first.discovered = true;
    offlineEarnings = 0;
    showOfflinePopup = false;
    _engine.start();
    notifyListeners();
  }

  @override
  void dispose() {
    _engine.dispose();
    _autoSaveTimer?.cancel();
    saveGame();
    super.dispose();
  }
}
