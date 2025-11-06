/// Utility class for formatting large numbers in idle game style.
class BigNumber {
  static const List<String> _suffixes = [
    '', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc',
    'UDc', 'DDc', 'TDc', 'QaDc', 'QiDc', 'SxDc', 'SpDc', 'OcDc', 'NoDc',
    'Vg', 'UVg',
  ];

  /// Format a double into a short human-readable string.
  /// e.g., 1234 -> "1.23K", 1500000 -> "1.50M"
  static String format(double value) {
    if (value < 0) return '-${format(-value)}';
    if (value < 1000) {
      if (value == value.roundToDouble()) {
        return value.toInt().toString();
      }
      return value.toStringAsFixed(value < 10 ? 2 : 1);
    }

    int tier = 0;
    double scaled = value;
    while (scaled >= 1000 && tier < _suffixes.length - 1) {
      scaled /= 1000;
      tier++;
    }

    if (scaled >= 100) {
      return '${scaled.toStringAsFixed(0)}${_suffixes[tier]}';
    } else if (scaled >= 10) {
      return '${scaled.toStringAsFixed(1)}${_suffixes[tier]}';
    } else {
      return '${scaled.toStringAsFixed(2)}${_suffixes[tier]}';
    }
  }

  /// Format as currency with $ prefix.
  static String formatCurrency(double value) {
    return '\$${format(value)}';
  }

  /// Format time duration from seconds to human readable.
  static String formatDuration(int totalSeconds) {
    if (totalSeconds < 60) return '${totalSeconds}s';
    if (totalSeconds < 3600) {
      final min = totalSeconds ~/ 60;
      final sec = totalSeconds % 60;
      return '${min}m ${sec}s';
    }
    final hours = totalSeconds ~/ 3600;
    final min = (totalSeconds % 3600) ~/ 60;
    return '${hours}h ${min}m';
  }
}
