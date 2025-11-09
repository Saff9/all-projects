import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';

class _ToastData {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  _ToastData({required this.title, required this.subtitle, required this.icon, required this.color});
}

/// Global stream for triggering achievement toasts from anywhere.
class AchievementToastController {
  static final _controller = StreamController<_ToastData>.broadcast();
  static Stream<_ToastData> get stream => _controller.stream;

  static void show({
    required String title,
    required String subtitle,
    IconData icon = Icons.emoji_events_rounded,
    Color color = const Color(0xFFFFD700),
  }) {
    _controller.add(_ToastData(title: title, subtitle: subtitle, icon: icon, color: color));
  }
}

/// Wrap the top-level screen widget with this to receive achievement toasts.
class AchievementToastOverlay extends StatefulWidget {
  final Widget child;
  const AchievementToastOverlay({super.key, required this.child});

  @override
  State<AchievementToastOverlay> createState() => _AchievementToastOverlayState();
}

class _AchievementToastOverlayState extends State<AchievementToastOverlay>
    with TickerProviderStateMixin {
  final List<_ActiveToast> _toasts = [];
  StreamSubscription<_ToastData>? _sub;

  @override
  void initState() {
    super.initState();
    _sub = AchievementToastController.stream.listen(_addToast);
  }

  void _addToast(_ToastData data) {
    final controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    final toast = _ActiveToast(data: data, controller: controller);
    setState(() => _toasts.add(toast));
    controller.forward();

    Future.delayed(const Duration(milliseconds: 3200), () {
      controller.reverse().then((_) {
        if (mounted) setState(() => _toasts.remove(toast));
      });
    });
  }

  @override
  void dispose() {
    _sub?.cancel();
    for (final t in _toasts) {
      t.controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        widget.child,
        Positioned(
          bottom: 90,
          left: 16,
          right: 16,
          child: Column(
            children: _toasts.map((t) {
              return AnimatedBuilder(
                animation: t.controller,
                builder: (context, _) {
                  final curve = CurvedAnimation(
                      parent: t.controller, curve: Curves.easeOutBack);
                  return Transform.translate(
                    offset: Offset(0, 50 * (1 - curve.value)),
                    child: Opacity(
                      opacity: curve.value.clamp(0.0, 1.0),
                      child: _ToastWidget(data: t.data),
                    ),
                  );
                },
              );
            }).toList(),
          ),
        ),
      ],
    );
  }
}

class _ActiveToast {
  final _ToastData data;
  final AnimationController controller;
  _ActiveToast({required this.data, required this.controller});
}

class _ToastWidget extends StatelessWidget {
  final _ToastData data;
  const _ToastWidget({required this.data});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF0D1117).withValues(alpha: 0.97),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: data.color.withValues(alpha: 0.6), width: 1.5),
        boxShadow: [
          BoxShadow(
              color: data.color.withValues(alpha: 0.3),
              blurRadius: 20,
              spreadRadius: 1),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: data.color.withValues(alpha: 0.15),
              shape: BoxShape.circle,
              boxShadow: [BoxShadow(color: data.color.withValues(alpha: 0.4), blurRadius: 12)],
            ),
            child: Icon(data.icon, color: data.color, size: 22),
          )
              .animate(onPlay: (c) => c.repeat(reverse: true))
              .scale(begin: const Offset(1, 1), end: const Offset(1.1, 1.1), duration: 800.ms),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('🏆  ACHIEVEMENT',
                    style: GoogleFonts.outfit(
                        color: data.color,
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1.5)),
                const SizedBox(height: 2),
                Text(data.title,
                    style: GoogleFonts.outfit(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w900)),
                Text(data.subtitle,
                    style: GoogleFonts.inter(
                        color: Colors.white54, fontSize: 12)),
              ],
            ),
          ),
          const Icon(Icons.close_rounded, color: Colors.white30, size: 16),
        ],
      ),
    );
  }
}
