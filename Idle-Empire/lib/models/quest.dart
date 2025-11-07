import 'package:flutter/material.dart';

enum QuestType { 
  collectCoins, 
  unlockCreatures, 
  reachBusinessLevel, 
  prestigeTimes,
  totalBusinesses,
}

/// Represents a story mission given by the AI assistant E.C.H.O.
class Quest {
  final String id;
  final String title;
  final String echoMessage;
  final QuestType type;
  final double target;
  final String? targetId; // For specific business tracking
  final double gemsReward;
  final double shardsReward;
  bool isCompleted;
  bool isClaimed;

  Quest({
    required this.id,
    required this.title,
    required this.echoMessage,
    required this.type,
    required this.target,
    this.targetId,
    this.gemsReward = 0,
    this.shardsReward = 0,
    this.isCompleted = false,
    this.isClaimed = false,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'isCompleted': isCompleted,
        'isClaimed': isClaimed,
      };

  void loadFromJson(Map<String, dynamic> json) {
    isCompleted = json['isCompleted'] ?? false;
    isClaimed = json['isClaimed'] ?? false;
  }
}
