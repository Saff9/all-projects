import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../providers/game_provider.dart';
import '../theme/app_theme.dart';
import '../models/expedition.dart';
import '../models/creature.dart';

class ExpeditionScreen extends StatelessWidget {
  const ExpeditionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<GameProvider>(
      builder: (context, game, _) {
        return CustomScrollView(
          slivers: [
            // Hero
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [AppTheme.accentPurple, AppTheme.accentTeal],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(color: AppTheme.accentPurple.withValues(alpha: 0.3), blurRadius: 20, offset: const Offset(0, 10)),
                    ],
                  ),
                  child: Column(
                    children: [
                      const Icon(Icons.explore_rounded, color: Colors.white, size: 48)
                          .animate(onPlay: (c) => c.repeat(reverse: true))
                          .scale(begin: const Offset(0.9, 0.9), end: const Offset(1.1, 1.1), duration: 2.seconds),
                      const SizedBox(height: 12),
                      Text(
                        'VOID EXPEDITIONS',
                        style: GoogleFonts.outfit(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900, letterSpacing: 2),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Command your creatures to gather rare Evolution Shards and Aeon Gems from the unknown.',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.inter(color: Colors.white.withValues(alpha: 0.8), fontSize: 13, height: 1.5),
                      ),
                    ],
                  ),
                ).animate().fadeIn(duration: 500.ms).slideY(begin: -0.1, end: 0),
              ),
            ),

            // Expedition List
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final exp = game.expeditions[index];
                    return _ExpeditionCard(expedition: exp, game: game)
                        .animate(delay: Duration(milliseconds: 100 * index))
                        .fadeIn()
                        .slideX(begin: 0.1, end: 0);
                  },
                  childCount: game.expeditions.length,
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}

class _ExpeditionCard extends StatefulWidget {
  final Expedition expedition;
  final GameProvider game;

  const _ExpeditionCard({required this.expedition, required this.game});

  @override
  State<_ExpeditionCard> createState() => _ExpeditionCardState();
}

class _ExpeditionCardState extends State<_ExpeditionCard> {
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    if (widget.expedition.isActive && !widget.expedition.isCompleted) {
      _startTimer();
    }
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() {});
      if (widget.expedition.isCompleted) {
        _timer?.cancel();
      }
    });
  }

  @override
  void didUpdateWidget(covariant _ExpeditionCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.expedition.isActive && !widget.expedition.isCompleted && _timer == null) {
      _startTimer();
    } else if (!widget.expedition.isActive || widget.expedition.isCompleted) {
      _timer?.cancel();
      _timer = null;
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final exp = widget.expedition;
    final bool isActive = exp.isActive;
    final bool isCompleted = exp.isCompleted;

    Duration remaining = Duration.zero;
    double progress = 0.0;

    if (isActive && exp.startTime != null && !isCompleted) {
      final elapsed = DateTime.now().difference(exp.startTime!);
      remaining = exp.duration - elapsed;
      if (remaining.isNegative) remaining = Duration.zero;
      progress = (elapsed.inMilliseconds / exp.duration.inMilliseconds).clamp(0.0, 1.0);
    } else if (isCompleted) {
      progress = 1.0;
    }

    // Format remaining time
    String timeStr = '';
    if (remaining.inHours > 0) {
      timeStr = '${remaining.inHours}h ${remaining.inMinutes.remainder(60)}m';
    } else if (remaining.inMinutes > 0) {
      timeStr = '${remaining.inMinutes}m ${remaining.inSeconds.remainder(60)}s';
    } else {
      timeStr = '${remaining.inSeconds}s';
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: AppTheme.glowDecoration(
        glowColor: isCompleted ? AppTheme.accentGreen : (isActive ? AppTheme.accentBlue : Colors.transparent),
        glowIntensity: isCompleted ? 0.3 : 0.1,
        borderRadius: 20,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  exp.title,
                  style: GoogleFonts.outfit(color: AppTheme.textPrimary, fontSize: 18, fontWeight: FontWeight.w800),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.timer_outlined, color: Colors.white, size: 14),
                    const SizedBox(width: 4),
                    Text(
                      '${exp.duration.inHours}H',
                      style: GoogleFonts.outfit(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(exp.description, style: GoogleFonts.inter(color: AppTheme.textSecondary, fontSize: 13, height: 1.4)),
          
          const SizedBox(height: 16),
          
          // Rewards
          Row(
            children: [
              Text('REWARDS:', style: GoogleFonts.outfit(color: AppTheme.textMuted, fontSize: 10, fontWeight: FontWeight.w800)),
              const Spacer(),
              _RewardTag(icon: '💎', value: '${exp.rewardGems}', color: AppTheme.accentBlue),
              const SizedBox(width: 8),
              _RewardTag(icon: '🧬', value: '${exp.rewardShards}', color: AppTheme.accentPurple),
            ],
          ),
          
          const SizedBox(height: 20),
          
          // Action Button / Progress
          if (!isActive && !isCompleted)
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton.icon(
                onPressed: () => _openDeployDialog(context),
                icon: const Icon(Icons.rocket_launch_rounded, size: 18),
                label: Text('DEPLOY SQUAD (${exp.requiredCreatures})', style: GoogleFonts.outfit(fontWeight: FontWeight.w800)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.accentBlue,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
              ),
            ),
            
          if (isActive && !isCompleted)
            Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('IN PROGRESS...', style: GoogleFonts.outfit(color: AppTheme.accentBlue, fontSize: 12, fontWeight: FontWeight.w800)),
                    Text(timeStr, style: GoogleFonts.outfit(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
                  ],
                ),
                const SizedBox(height: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: LinearProgressIndicator(
                    value: progress,
                    minHeight: 8,
                    backgroundColor: Colors.white.withValues(alpha: 0.05),
                    color: AppTheme.accentBlue,
                  ),
                ),
              ],
            ),
            
          if (isCompleted)
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton.icon(
                onPressed: () {
                  widget.game.claimExpedition(exp);
                },
                icon: const Icon(Icons.check_circle_rounded, size: 18),
                label: Text('CLAIM REWARDS', style: GoogleFonts.outfit(fontWeight: FontWeight.w900)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.accentGreen,
                  foregroundColor: AppTheme.bgDark,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
              ).animate(onPlay: (c) => c.repeat()).shimmer(duration: 2.seconds, color: Colors.white54),
            ),
        ],
      ),
    );
  }

  void _openDeployDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _DeploySquadDialog(expedition: widget.expedition, game: widget.game),
    );
  }
}

class _RewardTag extends StatelessWidget {
  final String icon;
  final String value;
  final Color color;
  
  const _RewardTag({required this.icon, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(icon, style: const TextStyle(fontSize: 12)),
          const SizedBox(width: 4),
          Text(value, style: GoogleFonts.outfit(color: color, fontSize: 12, fontWeight: FontWeight.w800)),
        ],
      ),
    );
  }
}

class _DeploySquadDialog extends StatefulWidget {
  final Expedition expedition;
  final GameProvider game;

  const _DeploySquadDialog({required this.expedition, required this.game});

  @override
  State<_DeploySquadDialog> createState() => _DeploySquadDialogState();
}

class _DeploySquadDialogState extends State<_DeploySquadDialog> {
  final List<String> _selectedIds = [];

  @override
  Widget build(BuildContext context) {
    // Only show discovered creatures not currently on an expedition
    final availableCreatures = widget.game.creatures.where((c) {
      if (!c.discovered) return false;
      for (final exp in widget.game.expeditions) {
        if (exp.isActive && exp.deployedCreatureIds.contains(c.id)) return false;
      }
      return true;
    }).toList();

    return Container(
      height: MediaQuery.of(context).size.height * 0.7,
      decoration: const BoxDecoration(
        color: AppTheme.bgDark,
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(2)),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'DEPLOY SQUAD',
            style: GoogleFonts.outfit(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900),
          ),
          Text(
            'Select ${widget.expedition.requiredCreatures} creatures',
            style: GoogleFonts.inter(color: AppTheme.textMuted, fontSize: 14),
          ),
          const SizedBox(height: 20),
          
          if (availableCreatures.isEmpty)
            Expanded(
              child: Center(
                child: Text('No available creatures. Complete other expeditions or unlock more!', textAlign: TextAlign.center, style: GoogleFonts.inter(color: AppTheme.textMuted)),
              ),
            )
          else
            Expanded(
              child: ListView.builder(
                itemCount: availableCreatures.length,
                itemBuilder: (context, index) {
                  final c = availableCreatures[index];
                  final isSelected = _selectedIds.contains(c.id);
                  return GestureDetector(
                    onTap: () {
                      setState(() {
                        if (isSelected) {
                          _selectedIds.remove(c.id);
                        } else if (_selectedIds.length < widget.expedition.requiredCreatures) {
                          _selectedIds.add(c.id);
                        }
                      });
                    },
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: isSelected ? AppTheme.accentTeal.withValues(alpha: 0.15) : AppTheme.bgCard,
                        border: Border.all(color: isSelected ? AppTheme.accentTeal : Colors.transparent),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        children: [
                          Text(c.emoji, style: const TextStyle(fontSize: 32)),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(c.name, style: GoogleFonts.outfit(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
                                Text('Tier ${c.tier} • ${c.element.name}', style: GoogleFonts.inter(color: AppTheme.textMuted, fontSize: 12)),
                              ],
                            ),
                          ),
                          if (isSelected)
                            const Icon(Icons.check_circle_rounded, color: AppTheme.accentTeal),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 56,
            child: ElevatedButton(
              onPressed: _selectedIds.length == widget.expedition.requiredCreatures
                  ? () {
                      widget.game.startExpedition(widget.expedition, _selectedIds);
                      Navigator.pop(context);
                    }
                  : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.accentBlue,
                disabledBackgroundColor: Colors.white12,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: Text(
                'LAUNCH EXPEDITION',
                style: GoogleFonts.outfit(fontWeight: FontWeight.w900, fontSize: 16, color: _selectedIds.length == widget.expedition.requiredCreatures ? Colors.white : Colors.white54),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
