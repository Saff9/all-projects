import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../models/creature.dart';
import '../providers/game_provider.dart';
import '../theme/app_theme.dart';

class CreatureScreen extends StatefulWidget {
  const CreatureScreen({super.key});

  @override
  State<CreatureScreen> createState() => _CreatureScreenState();
}

class _CreatureScreenState extends State<CreatureScreen> {
  CreatureElement? _filterElement;

  @override
  Widget build(BuildContext context) {
    return Consumer<GameProvider>(
      builder: (context, game, _) {
        final discovered = game.creatures.where((c) => c.discovered).toList();
        final filtered = _filterElement == null
            ? discovered
            : discovered.where((c) => c.element == _filterElement).toList();

        final legendaryCount = discovered.where((c) => c.rarity == CreatureRarity.legendary).length;
        final synergyCount = discovered.where((c) => c.synergyMultiplier > 1.0).length;

        return CustomScrollView(
          slivers: [
            // Stats Row
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  children: [
                    Expanded(
                      child: _StatBadge(
                        label: 'Discovered',
                        value: '${discovered.length}/${game.creatures.length}',
                        icon: Icons.explore_rounded,
                        color: AppTheme.accentBlue,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _StatBadge(
                        label: 'Legendary',
                        value: '$legendaryCount',
                        icon: Icons.auto_awesome_rounded,
                        color: AppTheme.accentGold,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _StatBadge(
                        label: 'Synergies',
                        value: '$synergyCount',
                        icon: Icons.bolt_rounded,
                        color: AppTheme.accentPurple,
                      ),
                    ),
                  ],
                ).animate().fadeIn(duration: 400.ms).slideY(begin: -0.1, end: 0),
              ),
            ),

            // Element Filter
            SliverToBoxAdapter(
              child: SizedBox(
                height: 52,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  children: [
                    _ElementChip(
                      label: '🌐 All',
                      isSelected: _filterElement == null,
                      onTap: () => setState(() => _filterElement = null),
                      color: Colors.white70,
                    ),
                    ...CreatureElement.values.map((e) => _ElementChip(
                          label: '${e.emoji} ${e.displayName}',
                          isSelected: _filterElement == e,
                          onTap: () => setState(() => _filterElement = e),
                          color: e.color,
                        )),
                  ],
                ),
              ),
            ),

            // Creature Grid
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
              sliver: SliverGrid(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 0.82,
                  crossAxisSpacing: 14,
                  mainAxisSpacing: 14,
                ),
                delegate: SliverChildBuilderDelegate(
                  (context, index) => _CreatureCard(
                    creature: filtered[index],
                    index: index,
                    onTap: () => _showCreatureDetail(context, filtered[index]),
                  ),
                  childCount: filtered.length,
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  void _showCreatureDetail(BuildContext context, Creature creature) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _CreatureDetailSheet(creature: creature),
    );
  }
}

class _StatBadge extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _StatBadge({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
      decoration: AppTheme.glowDecoration(glowColor: color, borderRadius: 16, glowIntensity: 0.12),
      child: Column(
        children: [
          Icon(icon, color: color, size: 22),
          const SizedBox(height: 6),
          Text(
            value,
            style: GoogleFonts.outfit(color: color, fontWeight: FontWeight.w900, fontSize: 16),
          ),
          Text(
            label,
            style: GoogleFonts.inter(color: AppTheme.textMuted, fontSize: 10),
          ),
        ],
      ),
    );
  }
}

class _ElementChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;
  final Color color;

  const _ElementChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(right: 8, bottom: 4),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          gradient: isSelected
              ? LinearGradient(colors: [color.withValues(alpha: 0.25), color.withValues(alpha: 0.1)])
              : null,
          color: isSelected ? null : AppTheme.bgCard,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? color.withValues(alpha: 0.6) : Colors.white.withValues(alpha: 0.1),
            width: isSelected ? 1.5 : 1,
          ),
          boxShadow: isSelected
              ? [BoxShadow(color: color.withValues(alpha: 0.25), blurRadius: 10)]
              : null,
        ),
        child: Text(
          label,
          style: GoogleFonts.outfit(
            color: isSelected ? color : AppTheme.textMuted,
            fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
            fontSize: 12,
          ),
        ),
      ),
    );
  }
}

class _CreatureCard extends StatelessWidget {
  final Creature creature;
  final int index;
  final VoidCallback onTap;

  const _CreatureCard({required this.creature, required this.index, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: AppTheme.glowDecoration(
          glowColor: creature.rarity.color,
          borderRadius: 22,
          glowIntensity: 0.18,
        ),
        child: Column(
          children: [
            // Rarity Stars + Element badge
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: List.generate(
                    creature.rarity.stars,
                    (_) => Icon(Icons.star_rounded, size: 11, color: creature.rarity.color),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: creature.element.color.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: creature.element.color.withValues(alpha: 0.35)),
                  ),
                  child: Text(
                    creature.element.emoji,
                    style: const TextStyle(fontSize: 10),
                  ),
                ),
              ],
            ),

            // Avatar with floating animation
            Expanded(
              child: Center(
                child: Container(
                  width: 72,
                  height: 72,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(
                      colors: [creature.element.color.withValues(alpha: 0.35), Colors.transparent],
                    ),
                  ),
                  child: Center(
                    child: Text(creature.emoji, style: const TextStyle(fontSize: 40)),
                  ),
                )
                    .animate(onPlay: (c) => c.repeat())
                    .moveY(
                      begin: 0,
                      end: -5,
                      duration: Duration(milliseconds: 1600 + index * 150),
                      curve: Curves.easeInOut,
                    )
                    .then()
                    .moveY(
                      begin: -5,
                      end: 0,
                      duration: Duration(milliseconds: 1600 + index * 150),
                      curve: Curves.easeInOut,
                    ),
              ),
            ),

            // Rarity pill
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
              decoration: BoxDecoration(
                color: creature.rarity.color.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: creature.rarity.color.withValues(alpha: 0.4)),
              ),
              child: Text(
                creature.rarity.displayName.toUpperCase(),
                style: GoogleFonts.outfit(
                  color: creature.rarity.color,
                  fontWeight: FontWeight.w800,
                  fontSize: 9,
                  letterSpacing: 1,
                ),
              ),
            ),

            const SizedBox(height: 6),
            Text(
              creature.name,
              style: GoogleFonts.outfit(
                color: creature.rarity.color,
                fontWeight: FontWeight.w800,
                fontSize: 13,
              ),
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),

            const SizedBox(height: 6),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: creature.xpProgress,
                backgroundColor: Colors.white.withValues(alpha: 0.05),
                color: creature.element.color,
                minHeight: 4,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'T${creature.tier}',
              style: GoogleFonts.inter(color: AppTheme.textMuted, fontSize: 10, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      )
          .animate(delay: Duration(milliseconds: 50 * index))
          .fadeIn(duration: 350.ms)
          .scale(begin: const Offset(0.85, 0.85), curve: Curves.easeOut),
    );
  }
}

class _CreatureDetailSheet extends StatelessWidget {
  final Creature creature;
  const _CreatureDetailSheet({required this.creature});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            creature.element.color.withValues(alpha: 0.08),
            AppTheme.bgDark,
            AppTheme.bgDark,
          ],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
        border: Border.all(color: creature.element.color.withValues(alpha: 0.2), width: 1),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag handle
          Container(
            width: 40,
            height: 4,
            margin: const EdgeInsets.only(bottom: 24),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Header
          Stack(
            alignment: Alignment.center,
            children: [
              // Glow ring
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: creature.element.color.withValues(alpha: 0.3),
                      blurRadius: 50,
                      spreadRadius: 10,
                    ),
                  ],
                ),
              ),
              Container(
                width: 110,
                height: 110,
                decoration: AppTheme.glowDecoration(glowColor: creature.element.color, borderRadius: 55),
                child: Center(
                  child: Text(creature.emoji, style: const TextStyle(fontSize: 56))
                      .animate(onPlay: (c) => c.repeat())
                      .moveY(begin: 0, end: -6, duration: const Duration(milliseconds: 1500), curve: Curves.easeInOut)
                      .then()
                      .moveY(begin: -6, end: 0, duration: const Duration(milliseconds: 1500), curve: Curves.easeInOut),
                ),
              ),
              // Particles
              ...List.generate(6, (i) {
                return TweenAnimationBuilder<double>(
                  tween: Tween(begin: 0, end: 1),
                  duration: const Duration(milliseconds: 800),
                  curve: Curves.easeOutQuint,
                  builder: (context, val, _) {
                    final angle = i * 60 * 3.14159 / 180;
                    final distance = 60 + (val * 40);
                    final dx = distance * 1.0 * (1 - (angle % 3.14159 == 0 ? 0 : (angle > 3.14159 ? -1 : 1))); // simplistic offset
                    return Transform.translate(
                      offset: Offset(distance * (i % 2 == 0 ? 1 : -1), distance * (i % 3 == 0 ? 1 : -1)),
                      child: Opacity(
                        opacity: 1 - val,
                        child: Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: creature.element.color,
                            shape: BoxShape.circle,
                            boxShadow: [BoxShadow(color: creature.element.color, blurRadius: 4)],
                          ),
                        ),
                      ),
                    );
                  },
                );
              }),
            ],
          ),
          const SizedBox(height: 20),
          Text(creature.name, style: GoogleFonts.outfit(color: AppTheme.textPrimary, fontSize: 28, fontWeight: FontWeight.w900)),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: creature.rarity.color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: creature.rarity.color.withValues(alpha: 0.3)),
                ),
                child: Text(
                  creature.rarity.displayName.toUpperCase(),
                  style: GoogleFonts.outfit(color: creature.rarity.color, fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 1),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: creature.element.color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: creature.element.color.withValues(alpha: 0.3)),
                ),
                child: Row(
                  children: [
                    Text(creature.element.emoji, style: const TextStyle(fontSize: 12)),
                    const SizedBox(width: 4),
                    Text(
                      creature.element.displayName.toUpperCase(),
                      style: GoogleFonts.outfit(color: creature.element.color, fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 1),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 32),

          // Stats Section
          Row(
            children: [
              Expanded(
                child: _DetailStatRow(
                  label: 'Synergy Bonus',
                  value: '${creature.synergyMultiplier.toStringAsFixed(1)}x',
                  subtitle: 'Boosts income',
                  icon: Icons.auto_graph_rounded,
                  color: AppTheme.accentGreen,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: _DetailStatRow(
                  label: 'Current Tier',
                  value: 'Tier ${creature.tier}',
                  subtitle: 'Evolution stage',
                  icon: Icons.military_tech_rounded,
                  color: AppTheme.accentBlue,
                ),
              ),
            ],
          ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.2, end: 0),

          const SizedBox(height: 32),

          // XP Progress
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('XP PROGRESS', style: GoogleFonts.inter(color: AppTheme.textMuted, fontSize: 12, fontWeight: FontWeight.w800)),
                  Text('${creature.xp.toInt()} / ${creature.xpRequired.toInt()}', 
                       style: GoogleFonts.inter(color: creature.element.color, fontSize: 12, fontWeight: FontWeight.bold)),
                ],
              ),
              const SizedBox(height: 10),
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: TweenAnimationBuilder<double>(
                  tween: Tween(begin: 0, end: creature.xpProgress),
                  duration: const Duration(milliseconds: 800),
                  curve: Curves.easeOutQuint,
                  builder: (ctx, val, _) => LinearProgressIndicator(
                    value: val,
                    minHeight: 12,
                    backgroundColor: Colors.white.withValues(alpha: 0.05),
                    color: creature.element.color,
                  ),
                ),
              ),
            ],
          ).animate().fadeIn(delay: 100.ms, duration: 400.ms).slideY(begin: 0.2, end: 0),

          const SizedBox(height: 40),

          // Evolution Button
          SizedBox(
            width: double.infinity,
            child: GestureDetector(
              onTap: creature.canEvolve ? () {
                context.read<GameProvider>().evolveCreature(creature);
                Navigator.pop(context);
              } : null,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                padding: const EdgeInsets.symmetric(vertical: 18),
                decoration: creature.canEvolve 
                  ? AppTheme.shimmerDecoration(color1: AppTheme.accentPurple, color2: AppTheme.accentCyan)
                  : BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.05),
                      borderRadius: BorderRadius.circular(20),
                    ),
                child: Center(
                  child: Text(
                    creature.canEvolve ? 'EVOLVE NOW!' : 'MAX XP TO EVOLVE',
                    style: GoogleFonts.outfit(
                      color: creature.canEvolve ? Colors.white : AppTheme.textMuted,
                      fontWeight: FontWeight.w900,
                      fontSize: 16,
                      letterSpacing: 1,
                    ),
                  ),
                ),
              ),
            ),
          ).animate().fadeIn(delay: 200.ms, duration: 400.ms).slideY(begin: 0.2, end: 0),
        ],
      ),
    );
  }
}

class _DetailStatRow extends StatelessWidget {
  final String label;
  final String value;
  final String subtitle;
  final IconData icon;
  final Color color;

  const _DetailStatRow({
    required this.label,
    required this.value,
    required this.subtitle,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: AppTheme.cardDecoration(borderColor: color.withValues(alpha: 0.15)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 12),
          Text(value, style: GoogleFonts.outfit(color: color, fontWeight: FontWeight.w900, fontSize: 20)),
          const SizedBox(height: 4),
          Text(label, style: GoogleFonts.inter(color: AppTheme.textPrimary, fontSize: 13, fontWeight: FontWeight.bold)),
          Text(subtitle, style: GoogleFonts.inter(color: AppTheme.textMuted, fontSize: 11)),
        ],
      ),
    );
  }
}
