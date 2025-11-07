class Expedition {
  final String id;
  final String title;
  final String description;
  final Duration duration;
  final int requiredCreatures;
  
  // Rewards
  final int rewardGems;
  final int rewardShards;
  
  // State
  bool isActive;
  DateTime? startTime;
  List<String> deployedCreatureIds;
  bool isCompleted;

  Expedition({
    required this.id,
    required this.title,
    required this.description,
    required this.duration,
    required this.requiredCreatures,
    required this.rewardGems,
    required this.rewardShards,
    this.isActive = false,
    this.startTime,
    this.deployedCreatureIds = const [],
    this.isCompleted = false,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'isActive': isActive,
    'startTime': startTime?.toIso8601String(),
    'deployedCreatureIds': deployedCreatureIds,
    'isCompleted': isCompleted,
  };

  void loadFromJson(Map<String, dynamic> json) {
    if (json['isActive'] != null) isActive = json['isActive'];
    if (json['startTime'] != null) startTime = DateTime.parse(json['startTime']);
    if (json['deployedCreatureIds'] != null) {
      deployedCreatureIds = List<String>.from(json['deployedCreatureIds']);
    }
    if (json['isCompleted'] != null) isCompleted = json['isCompleted'];
  }
}

class ExpeditionData {
  static List<Expedition> getDefaultExpeditions() {
    return [
      Expedition(
        id: 'exp_1',
        title: 'Asteroid Belt Scavenge',
        description: 'Send creatures to scavenge for base resources.',
        duration: const Duration(hours: 4),
        requiredCreatures: 1,
        rewardGems: 10,
        rewardShards: 50,
      ),
      Expedition(
        id: 'exp_2',
        title: 'Deep Nebula Dive',
        description: 'A moderate risk journey into the quantum fog.',
        duration: const Duration(hours: 8),
        requiredCreatures: 2,
        rewardGems: 25,
        rewardShards: 150,
      ),
      Expedition(
        id: 'exp_3',
        title: 'Void Core Retrieval',
        description: 'Dangerous mission for massive payouts.',
        duration: const Duration(hours: 24),
        requiredCreatures: 3,
        rewardGems: 100,
        rewardShards: 500,
      ),
    ];
  }
}
