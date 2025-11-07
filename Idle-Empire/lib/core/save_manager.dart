import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

/// Handles save/load of game state to SharedPreferences.
class SaveManager {
  static const String _saveKey = 'idle_empire_save';
  static const String _lastSaveTimeKey = 'idle_empire_last_save';

  /// Save game state as JSON string.
  static Future<void> saveGame(Map<String, dynamic> gameState) async {
    final prefs = await SharedPreferences.getInstance();
    final jsonString = jsonEncode(gameState);
    await prefs.setString(_saveKey, jsonString);
    await prefs.setInt(_lastSaveTimeKey, DateTime.now().millisecondsSinceEpoch);
  }

  /// Load game state from JSON. Returns null if no save exists.
  static Future<Map<String, dynamic>?> loadGame() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonString = prefs.getString(_saveKey);
    if (jsonString == null) return null;
    try {
      return jsonDecode(jsonString) as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }

  /// Get seconds elapsed since last save (for offline earnings).
  static Future<int> getOfflineSeconds() async {
    final prefs = await SharedPreferences.getInstance();
    final lastSave = prefs.getInt(_lastSaveTimeKey);
    if (lastSave == null) return 0;
    final now = DateTime.now().millisecondsSinceEpoch;
    return ((now - lastSave) / 1000).floor().clamp(0, 86400); // Max 24h
  }

  /// Clear all saved data.
  static Future<void> clearSave() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_saveKey);
    await prefs.remove(_lastSaveTimeKey);
  }
}
