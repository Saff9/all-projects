import 'dart:math';
import 'package:flutter/material.dart';

class _Particle {
  double x, y, vx, vy, radius, opacity, phase;
  _Particle({
    required this.x,
    required this.y,
    required this.vx,
    required this.vy,
    required this.radius,
    required this.opacity,
    required this.phase,
  });
}

class AnimatedBackground extends StatefulWidget {
  final Widget child;
  const AnimatedBackground({super.key, required this.child});

  @override
  State<AnimatedBackground> createState() => _AnimatedBackgroundState();
}

class _AnimatedBackgroundState extends State<AnimatedBackground>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  final List<_Particle> _particles = [];
  final Random _rng = Random();

  @override
  void initState() {
    super.initState();
    for (int i = 0; i < 80; i++) {
      _particles.add(_Particle(
        x: _rng.nextDouble(),
        y: _rng.nextDouble(),
        vx: (_rng.nextDouble() - 0.5) * 0.00012,
        vy: (_rng.nextDouble() - 0.5) * 0.00012,
        radius: _rng.nextDouble() * 1.8 + 0.4,
        opacity: _rng.nextDouble() * 0.6 + 0.15,
        phase: _rng.nextDouble() * 2 * pi,
      ));
    }

    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 10),
    )..repeat();

    _controller.addListener(() {
      for (final p in _particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = 1.0;
        if (p.x > 1) p.x = 0.0;
        if (p.y < 0) p.y = 1.0;
        if (p.y > 1) p.y = 0.0;
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        AnimatedBuilder(
          animation: _controller,
          builder: (context, _) {
            return CustomPaint(
              painter: _StarfieldPainter(
                  particles: _particles, tick: _controller.value),
              child: const SizedBox.expand(),
            );
          },
        ),
        widget.child,
      ],
    );
  }
}

class _StarfieldPainter extends CustomPainter {
  final List<_Particle> particles;
  final double tick;

  const _StarfieldPainter({required this.particles, required this.tick});

  @override
  void paint(Canvas canvas, Size size) {
    // Background gradient
    final bgPaint = Paint();
    final bgGradient = LinearGradient(
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
      colors: [
        const Color(0xFF050A18),
        const Color(0xFF0A0D1A),
        const Color(0xFF070B17),
      ],
    );
    canvas.drawRect(
      Rect.fromLTWH(0, 0, size.width, size.height),
      bgPaint
        ..shader = bgGradient.createShader(
            Rect.fromLTWH(0, 0, size.width, size.height)),
    );

    // Nebula glow blobs
    _drawNebula(canvas, size, Offset(size.width * 0.2, size.height * 0.3),
        const Color(0xFF6B21A8), 120, 0.04 + 0.02 * sin(tick * 2 * pi));
    _drawNebula(canvas, size, Offset(size.width * 0.8, size.height * 0.7),
        const Color(0xFF0EA5E9), 90, 0.03 + 0.02 * sin(tick * 2 * pi + 1));
    _drawNebula(canvas, size, Offset(size.width * 0.5, size.height * 0.1),
        const Color(0xFF7C3AED), 70, 0.02 + 0.01 * cos(tick * 2 * pi));

    // Stars
    final paint = Paint()..style = PaintingStyle.fill;
    for (final p in particles) {
      final twinkle = (sin(p.phase + tick * 2 * pi * 3) + 1) / 2;
      final alpha = (p.opacity * (0.5 + 0.5 * twinkle) * 255).toInt().clamp(0, 255);

      paint.color = Color.fromARGB(alpha, 200, 215, 255);
      canvas.drawCircle(
        Offset(p.x * size.width, p.y * size.height),
        p.radius,
        paint,
      );
    }
  }

  void _drawNebula(
      Canvas canvas, Size size, Offset center, Color color, double radius, double opacity) {
    final paint = Paint()
      ..shader = RadialGradient(
        colors: [
          color.withValues(alpha: opacity),
          Colors.transparent,
        ],
      ).createShader(Rect.fromCircle(center: center, radius: radius * 3));
    canvas.drawCircle(center, radius * 3, paint);
  }

  @override
  bool shouldRepaint(covariant _StarfieldPainter oldDelegate) =>
      oldDelegate.tick != tick;
}
