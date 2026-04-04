/// @file lib/core/services/performance_service.dart
/// @brief Performance monitoring and optimization service
/// @author Chatly Development Team
/// @date 2026-01-13
///
/// This file implements a comprehensive performance monitoring service that tracks
/// app performance metrics, memory usage, rendering times, and provides optimization
/// recommendations. It helps maintain smooth user experience and identifies bottlenecks.

import 'dart:async';
import 'dart:developer';
import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';

class PerformanceService {
  static final PerformanceService _instance = PerformanceService._internal();

  factory PerformanceService() => _instance;

  static PerformanceService get instance => _instance;

  PerformanceService._internal();

  // Performance metrics
  final Map<String, PerformanceMetric> _metrics = {};
  final List<PerformanceEvent> _events = [];
  final StreamController<PerformanceMetric> _metricStream = StreamController.broadcast();

  // Memory tracking
  int _initialMemoryUsage = 0;
  bool _isMonitoring = false;

  Stream<PerformanceMetric> get metricStream => _metricStream.stream;

  /// Start performance monitoring
  void startMonitoring() {
    if (_isMonitoring) return;

    _isMonitoring = true;
    _initialMemoryUsage = _getCurrentMemoryUsage();

    // Start periodic monitoring
    Timer.periodic(const Duration(seconds: 30), _recordPeriodicMetrics);

    // Record startup time
    _recordMetric('app_startup', DateTime.now().millisecondsSinceEpoch.toDouble(),
        unit: 'ms', category: 'startup');
  }

  /// Stop performance monitoring
  void stopMonitoring() {
    _isMonitoring = false;
  }

  /// Record a performance metric
  void recordMetric(String name, double value,
      {String unit = 'ms', String category = 'general'}) {
    _recordMetric(name, value, unit: unit, category: category);
  }

  void _recordMetric(String name, double value,
      {String unit = 'ms', String category = 'general'}) {
    final metric = PerformanceMetric(
      name: name,
      value: value,
      timestamp: DateTime.now(),
      unit: unit,
      category: category,
    );

    _metrics[name] = metric;
    _events.add(PerformanceEvent.metric(metric));

    if (kDebugMode) {
      print('📊 Performance: $name = ${value.toStringAsFixed(2)} $unit');
    }

    _metricStream.add(metric);
  }

  /// Measure execution time of a function
  Future<T> measureExecution<T>(
    String operationName,
    Future<T> Function() function, {
    String category = 'operation',
  }) async {
    final stopwatch = Stopwatch()..start();

    try {
      final result = await function();
      stopwatch.stop();

      recordMetric(operationName, stopwatch.elapsedMilliseconds.toDouble(),
          unit: 'ms', category: category);

      return result;
    } catch (e) {
      stopwatch.stop();

      recordMetric('${operationName}_error', stopwatch.elapsedMilliseconds.toDouble(),
          unit: 'ms', category: '${category}_error');

      rethrow;
    }
  }

  /// Track widget build performance
  Widget trackWidgetBuild(String widgetName, Widget Function() builder) {
    return PerformanceTracker(
      name: widgetName,
      child: Builder(builder: (context) {
        final startTime = Timeline.now;

        WidgetsBinding.instance.addPostFrameCallback((_) {
          final buildTime = Timeline.now - startTime;
          recordMetric('widget_build_$widgetName', buildTime.toDouble(),
              unit: 'μs', category: 'ui');
        });

        return builder();
      }),
    );
  }

  /// Get performance report
  PerformanceReport getReport() {
    final memoryUsage = _getCurrentMemoryUsage() - _initialMemoryUsage;

    // Calculate averages
    final buildMetrics = _metrics.values.where((m) => m.category == 'ui').toList();
    final operationMetrics = _metrics.values.where((m) => m.category == 'operation').toList();

    final avgBuildTime = buildMetrics.isNotEmpty
        ? buildMetrics.map((m) => m.value).reduce((a, b) => a + b) / buildMetrics.length
        : 0.0;

    final avgOperationTime = operationMetrics.isNotEmpty
        ? operationMetrics.map((m) => m.value).reduce((a, b) => a + b) / operationMetrics.length
        : 0.0;

    // Identify bottlenecks
    final bottlenecks = _identifyBottlenecks();

    return PerformanceReport(
      totalMetrics: _metrics.length,
      memoryUsage: memoryUsage,
      averageBuildTime: avgBuildTime,
      averageOperationTime: avgOperationTime,
      bottlenecks: bottlenecks,
      recommendations: _generateRecommendations(bottlenecks),
    );
  }

  /// Clear all metrics
  void clearMetrics() {
    _metrics.clear();
    _events.clear();
  }

  /// Called when app goes to background - pause heavy operations
  void onBackground() {
    recordMetric('app_background', DateTime.now().millisecondsSinceEpoch.toDouble(),
        unit: 'timestamp', category: 'lifecycle');

    // In a real app, this would:
    // - Pause non-critical timers
    // - Reduce polling frequencies
    // - Cancel non-essential network requests
    // - Clear temporary caches if needed
    debugPrint('🔧 Performance: App moved to background');
  }

  /// Called when app comes to foreground - resume operations
  void onForeground() {
    recordMetric('app_foreground', DateTime.now().millisecondsSinceEpoch.toDouble(),
        unit: 'timestamp', category: 'lifecycle');

    // In a real app, this would:
    // - Resume timers
    // - Refresh data if needed
    // - Re-establish connections
    // - Check for updates
    debugPrint('🔧 Performance: App moved to foreground');
  }

  /// Dispose of resources
  void dispose() {
    _metricStream.close();
    stopMonitoring();
    debugPrint('🔧 Performance: Service disposed');
  }

  void _recordPeriodicMetrics(Timer timer) {
    if (!_isMonitoring) {
      timer.cancel();
      return;
    }

    final memoryUsage = _getCurrentMemoryUsage();
    recordMetric('memory_usage', memoryUsage.toDouble(),
        unit: 'bytes', category: 'memory');

    // Record frame rate if available
    WidgetsBinding.instance.addPostFrameCallback((_) {
      // This would integrate with frame timing in a real implementation
    });
  }

  int _getCurrentMemoryUsage() {
    // In a real implementation, this would use dart:developer or platform channels
    // to get actual memory usage. For now, return a simulated value.
    return (_metrics.length * 1024) + (_events.length * 256);
  }

  List<String> _identifyBottlenecks() {
    final bottlenecks = <String>[];

    // Check for slow widget builds (>16ms for 60fps)
    final slowBuilds = _metrics.values.where((m) =>
        m.category == 'ui' && m.value > 16000).toList(); // 16ms in microseconds

    if (slowBuilds.isNotEmpty) {
      bottlenecks.add('${slowBuilds.length} widgets building slower than 16ms');
    }

    // Check for slow operations (>1000ms)
    final slowOperations = _metrics.values.where((m) =>
        m.category == 'operation' && m.value > 1000).toList();

    if (slowOperations.isNotEmpty) {
      bottlenecks.add('${slowOperations.length} operations taking >1 second');
    }

    // Check memory usage
    final currentMemory = _getCurrentMemoryUsage();
    if (currentMemory > 50 * 1024 * 1024) { // 50MB
      bottlenecks.add('High memory usage: ${(currentMemory / (1024 * 1024)).toStringAsFixed(1)} MB');
    }

    return bottlenecks;
  }

  List<String> _generateRecommendations(List<String> bottlenecks) {
    final recommendations = <String>[];

    for (final bottleneck in bottlenecks) {
      if (bottleneck.contains('widgets building slower')) {
        recommendations.addAll([
          'Optimize widget builds by using const constructors where possible',
          'Consider using ListView.builder for large lists instead of ListView',
          'Implement proper keys for list items to avoid unnecessary rebuilds',
          'Use Selector or Consumer selectively instead of Provider.of everywhere',
        ]);
      } else if (bottleneck.contains('operations taking')) {
        recommendations.addAll([
          'Move heavy computations to background isolates',
          'Implement caching for expensive operations',
          'Consider pagination for large data sets',
          'Optimize database queries and use indexes',
        ]);
      } else if (bottleneck.contains('memory usage')) {
        recommendations.addAll([
          'Implement proper disposal of controllers and subscriptions',
          'Use image caching and compression for large images',
          'Clear unused caches periodically',
          'Consider using weak references for large objects',
        ]);
      }
    }

    if (recommendations.isEmpty) {
      recommendations.add('Performance looks good! Keep monitoring for any regressions.');
    }

    return recommendations;
  }
}

class PerformanceMetric {
  final String name;
  final double value;
  final DateTime timestamp;
  final String unit;
  final String category;

  const PerformanceMetric({
    required this.name,
    required this.value,
    required this.timestamp,
    required this.unit,
    required this.category,
  });

  @override
  String toString() => '$name: ${value.toStringAsFixed(2)} $unit';
}

class PerformanceReport {
  final int totalMetrics;
  final int memoryUsage;
  final double averageBuildTime;
  final double averageOperationTime;
  final List<String> bottlenecks;
  final List<String> recommendations;

  const PerformanceReport({
    required this.totalMetrics,
    required this.memoryUsage,
    required this.averageBuildTime,
    required this.averageOperationTime,
    required this.bottlenecks,
    required this.recommendations,
  });

  @override
  String toString() {
    final buffer = StringBuffer();
    buffer.writeln('📊 Performance Report');
    buffer.writeln('Total Metrics: $totalMetrics');
    buffer.writeln('Memory Usage: ${(memoryUsage / 1024).toStringAsFixed(1)} KB');
    buffer.writeln('Avg Build Time: ${averageBuildTime.toStringAsFixed(2)} μs');
    buffer.writeln('Avg Operation Time: ${averageOperationTime.toStringAsFixed(2)} ms');

    if (bottlenecks.isNotEmpty) {
      buffer.writeln('\n🚨 Bottlenecks:');
      for (final bottleneck in bottlenecks) {
        buffer.writeln('• $bottleneck');
      }
    }

    buffer.writeln('\n💡 Recommendations:');
    for (final rec in recommendations) {
      buffer.writeln('• $rec');
    }

    return buffer.toString();
  }
}

enum PerformanceEventType { metric, error, warning }

class PerformanceEvent {
  final PerformanceEventType type;
  final dynamic data;
  final DateTime timestamp;

  PerformanceEvent.metric(PerformanceMetric metric)
      : type = PerformanceEventType.metric,
        data = metric,
        timestamp = DateTime.now();

  PerformanceEvent.error(String error)
      : type = PerformanceEventType.error,
        data = error,
        timestamp = DateTime.now();

  PerformanceEvent.warning(String warning)
      : type = PerformanceEventType.warning,
        data = warning,
        timestamp = DateTime.now();
}

class PerformanceTracker extends StatelessWidget {
  final String name;
  final Widget child;

  const PerformanceTracker({
    super.key,
    required this.name,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return child;
  }
}