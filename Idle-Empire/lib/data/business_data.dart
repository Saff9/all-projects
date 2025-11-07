import 'package:flutter/material.dart';
import '../models/business.dart';

/// All business definitions for the game — 10 unique businesses
/// with progressively richer content and iconic visuals.
class BusinessData {
  static List<Business> getAllBusinesses() {
    return [
      Business(
        id: 'lemonade',
        name: 'Lemonade Stand',
        icon: Icons.emoji_food_beverage_rounded,
        color: const Color(0xFFFDD835),
        baseCost: 4,
        baseIncome: 1,
        costMultiplier: 1.07,
        incomePerLevel: 0.5,
        managerCost: 100,
        upgrades: [
          BusinessUpgrade(id: 'lem_1', name: '🍋 Fresh Lemons', description: 'Organic lemons! +100%', cost: 50, multiplier: 2.0),
          BusinessUpgrade(id: 'lem_2', name: '🍬 Sugar Rush', description: 'Secret recipe! +150%', cost: 500, multiplier: 2.5),
          BusinessUpgrade(id: 'lem_3', name: '🏪 Franchise Deal', description: 'Go national! +200%', cost: 5000, multiplier: 3.0),
        ],
      ),
      Business(
        id: 'newspaper',
        name: 'News Network',
        icon: Icons.feed_rounded,
        color: const Color(0xFF78909C),
        baseCost: 60,
        baseIncome: 5,
        costMultiplier: 1.15,
        incomePerLevel: 3,
        managerCost: 1000,
        upgrades: [
          BusinessUpgrade(id: 'news_1', name: '📰 Extra Edition', description: 'Breaking scoops! +100%', cost: 500, multiplier: 2.0),
          BusinessUpgrade(id: 'news_2', name: '📱 Digital Platform', description: 'Go viral! +200%', cost: 10000, multiplier: 3.0),
        ],
      ),
      Business(
        id: 'car_wash',
        name: 'Auto Spa',
        icon: Icons.local_car_wash_rounded,
        color: const Color(0xFF42A5F5),
        baseCost: 720,
        baseIncome: 30,
        costMultiplier: 1.15,
        incomePerLevel: 18,
        managerCost: 10000,
        upgrades: [
          BusinessUpgrade(id: 'cw_1', name: '✨ Premium Wax', description: 'Luxury package! +100%', cost: 5000, multiplier: 2.0),
          BusinessUpgrade(id: 'cw_2', name: '🏎️ Full Detail', description: 'Celebrity clients! +200%', cost: 100000, multiplier: 3.0),
        ],
      ),
      Business(
        id: 'pizza_shop',
        name: 'Pizza Empire',
        icon: Icons.local_pizza_rounded,
        color: const Color(0xFFFF7043),
        baseCost: 8640,
        baseIncome: 180,
        costMultiplier: 1.15,
        incomePerLevel: 100,
        managerCost: 100000,
        upgrades: [
          BusinessUpgrade(id: 'pz_1', name: '🍕 Secret Sauce', description: 'Italian master recipe! +100%', cost: 50000, multiplier: 2.0),
          BusinessUpgrade(id: 'pz_2', name: '🚗 Delivery Fleet', description: '30 min or free! +250%', cost: 500000, multiplier: 3.5),
        ],
      ),
      Business(
        id: 'donut_shop',
        name: 'Donut Kingdom',
        icon: Icons.donut_large_rounded,
        color: const Color(0xFFEC407A),
        baseCost: 103680,
        baseIncome: 1080,
        costMultiplier: 1.15,
        incomePerLevel: 600,
        managerCost: 1000000,
        upgrades: [
          BusinessUpgrade(id: 'dt_1', name: '🍩 Glazed Gold', description: '24k gold flakes! +150%', cost: 500000, multiplier: 2.5),
          BusinessUpgrade(id: 'dt_2', name: '👑 Royal Donuts', description: 'Crown franchise! +300%', cost: 5000000, multiplier: 4.0),
        ],
      ),
      Business(
        id: 'shrimp_boat',
        name: 'Ocean Fleet',
        icon: Icons.sailing_rounded,
        color: const Color(0xFF26C6DA),
        baseCost: 1244160,
        baseIncome: 6480,
        costMultiplier: 1.15,
        incomePerLevel: 3500,
        managerCost: 10000000,
        upgrades: [
          BusinessUpgrade(id: 'sb_1', name: '🌊 Deep Sea Tech', description: 'Sonar nets! +200%', cost: 5000000, multiplier: 3.0),
          BusinessUpgrade(id: 'sb_2', name: '⚓ Fleet Admiral', description: 'Command the seas! +300%', cost: 50000000, multiplier: 4.0),
        ],
      ),
      Business(
        id: 'hockey_team',
        name: 'Sports Dynasty',
        icon: Icons.sports_esports_rounded,
        color: const Color(0xFF5C6BC0),
        baseCost: 14929920,
        baseIncome: 38880,
        costMultiplier: 1.15,
        incomePerLevel: 20000,
        managerCost: 100000000,
        upgrades: [
          BusinessUpgrade(id: 'ht_1', name: '⭐ Star Player', description: 'MVP contract! +200%', cost: 50000000, multiplier: 3.0),
          BusinessUpgrade(id: 'ht_2', name: '🏆 Championship', description: 'Win it all! +400%', cost: 500000000, multiplier: 5.0),
        ],
      ),
      Business(
        id: 'movie_studio',
        name: 'Dream Studios',
        icon: Icons.movie_filter_rounded,
        color: const Color(0xFFAB47BC),
        baseCost: 179159040,
        baseIncome: 233280,
        costMultiplier: 1.15,
        incomePerLevel: 120000,
        managerCost: 1000000000,
        upgrades: [
          BusinessUpgrade(id: 'ms_1', name: '🎬 Blockbuster', description: '\$1B box office! +250%', cost: 500000000, multiplier: 3.5),
          BusinessUpgrade(id: 'ms_2', name: '🏅 Oscar Winner', description: 'Best Picture! +500%', cost: 5000000000, multiplier: 6.0),
        ],
      ),
      Business(
        id: 'bank',
        name: 'Quantum Bank',
        icon: Icons.account_balance_rounded,
        color: const Color(0xFF66BB6A),
        baseCost: 2149908480,
        baseIncome: 1399680,
        costMultiplier: 1.15,
        incomePerLevel: 700000,
        managerCost: 10000000000,
        upgrades: [
          BusinessUpgrade(id: 'bk_1', name: '📈 Hedge Fund', description: 'Wall Street power! +300%', cost: 5000000000, multiplier: 4.0),
          BusinessUpgrade(id: 'bk_2', name: '🏛️ Central Bank', description: 'Print money! +500%', cost: 50000000000, multiplier: 6.0),
        ],
      ),
      Business(
        id: 'space_station',
        name: 'Galactic Corp',
        icon: Icons.rocket_launch_rounded,
        color: const Color(0xFFFF8F00),
        baseCost: 25798901760,
        baseIncome: 8398080,
        costMultiplier: 1.15,
        incomePerLevel: 4000000,
        managerCost: 100000000000,
        upgrades: [
          BusinessUpgrade(id: 'ss_1', name: '🚀 Mars Colony', description: 'Terraform Mars! +400%', cost: 50000000000, multiplier: 5.0),
          BusinessUpgrade(id: 'ss_2', name: '🌌 Galaxy Corp', description: 'Rule the cosmos! +1000%', cost: 500000000000, multiplier: 11.0),
        ],
      ),
      Business(
        id: 'asteroid_mine',
        name: 'Asteroid Mine',
        icon: Icons.public_rounded,
        color: const Color(0xFF6D4C41),
        baseCost: 309586821120, // ~300B
        baseIncome: 100776960, // ~100M
        costMultiplier: 1.15,
        incomePerLevel: 45000000,
        managerCost: 1000000000000, // 1T
        upgrades: [
          BusinessUpgrade(id: 'am_1', name: '🪨 Deep Core Drill', description: 'Titanium drills! +300%', cost: 500000000000, multiplier: 4.0),
          BusinessUpgrade(id: 'am_2', name: '☄️ Comet Trawler', description: 'Ice and gold! +500%', cost: 5000000000000, multiplier: 6.0),
        ],
      ),
      Business(
        id: 'neon_syndicate',
        name: 'Neon Syndicate',
        icon: Icons.local_activity_rounded,
        color: const Color(0xFFE040FB),
        baseCost: 3715041853440, // ~3.7T
        baseIncome: 1209323520, // ~1.2B
        costMultiplier: 1.15,
        incomePerLevel: 500000000,
        managerCost: 10000000000000, // 10T
        upgrades: [
          BusinessUpgrade(id: 'ns_1', name: '🌃 Shadow Network', description: 'Control the undercity! +400%', cost: 5000000000000, multiplier: 5.0),
          BusinessUpgrade(id: 'ns_2', name: '🕹️ Arcade Casinos', description: 'Infinite loops! +600%', cost: 50000000000000, multiplier: 7.0),
        ],
      ),
      Business(
        id: 'quantum_lab',
        name: 'Quantum Lab',
        icon: Icons.biotech_rounded,
        color: const Color(0xFF00B0FF),
        baseCost: 44580502241280, // ~44T
        baseIncome: 14511882240, // ~14B
        costMultiplier: 1.15,
        incomePerLevel: 6000000000,
        managerCost: 100000000000000, // 100T
        upgrades: [
          BusinessUpgrade(id: 'ql_1', name: '⚛️ Entanglement', description: 'Zero latency! +500%', cost: 50000000000000, multiplier: 6.0),
          BusinessUpgrade(id: 'ql_2', name: '🧠 Singularity AI', description: 'Beyond human limits! +1000%', cost: 500000000000000, multiplier: 11.0),
        ],
      ),
      Business(
        id: 'dyson_sphere',
        name: 'Dyson Sphere',
        icon: Icons.wb_sunny_rounded,
        color: const Color(0xFFFFD54F),
        baseCost: 534966026895360, // ~534T
        baseIncome: 174142586880, // ~174B
        costMultiplier: 1.15,
        incomePerLevel: 75000000000,
        managerCost: 1000000000000000, // 1Qa
        upgrades: [
          BusinessUpgrade(id: 'ds_1', name: '☀️ Stellar Panels', description: 'Capture 100% output! +600%', cost: 500000000000000, multiplier: 7.0),
          BusinessUpgrade(id: 'ds_2', name: '⚡ Plasma Lenses', description: 'Focus the beam! +1200%', cost: 5000000000000000, multiplier: 13.0),
        ],
      ),
      Business(
        id: 'holo_park',
        name: 'Holo Theme Park',
        icon: Icons.attractions_rounded,
        color: const Color(0xFFF06292),
        baseCost: 6419592322744320, // ~6.4Qa
        baseIncome: 2089711042560, // ~2T
        costMultiplier: 1.15,
        incomePerLevel: 900000000000,
        managerCost: 10000000000000000, // 10Qa
        upgrades: [
          BusinessUpgrade(id: 'hp_1', name: '🎢 Neural Coasters', description: 'Feel the 8G force! +700%', cost: 5000000000000000, multiplier: 8.0),
          BusinessUpgrade(id: 'hp_2', name: '🦖 Dino Safaris', description: 'Extinct no more! +1500%', cost: 50000000000000000, multiplier: 16.0),
        ],
      ),
      Business(
        id: 'dark_matter',
        name: 'Dark Matter Forge',
        icon: Icons.lens_blur_rounded,
        color: const Color(0xFF212121),
        baseCost: 77035107872931840, // ~77Qa
        baseIncome: 25076532510720, // ~25T
        costMultiplier: 1.15,
        incomePerLevel: 11000000000000,
        managerCost: 100000000000000000, // 100Qa
        upgrades: [
          BusinessUpgrade(id: 'dm_1', name: '⬛ Anti-Gravity Core', description: 'Mass is an illusion! +800%', cost: 50000000000000000, multiplier: 9.0),
          BusinessUpgrade(id: 'dm_2', name: '🔮 Void Containment', description: 'Harvest the abyss! +2000%', cost: 500000000000000000, multiplier: 21.0),
        ],
      ),
      Business(
        id: 'time_travel',
        name: 'Time Agency',
        icon: Icons.hourglass_bottom_rounded,
        color: const Color(0xFF00E676),
        baseCost: 924421294475182080, // ~924Qa
        baseIncome: 300918390128640, // ~300T
        costMultiplier: 1.15,
        incomePerLevel: 135000000000000,
        managerCost: 1000000000000000000, // 1Qi
        upgrades: [
          BusinessUpgrade(id: 'tt_1', name: '⏳ Retro-Compounding', description: 'Interest from the past! +1000%', cost: 500000000000000000, multiplier: 11.0),
          BusinessUpgrade(id: 'tt_2', name: '🕰️ Future Arbitrage', description: 'Buy low tomorrow! +2500%', cost: 5000000000000000000, multiplier: 26.0),
        ],
      ),
      Business(
        id: 'interdimensional',
        name: 'Dimension Portal',
        icon: Icons.all_inclusive_rounded,
        color: const Color(0xFFE040FB),
        baseCost: 11093055533702184960, // ~11Qi
        baseIncome: 3611020681543680, // ~3.6Qa
        costMultiplier: 1.15,
        incomePerLevel: 1600000000000000,
        managerCost: 10000000000000000000, // 10Qi
        upgrades: [
          BusinessUpgrade(id: 'id_1', name: '🌀 Tesseract Nexus', description: '4D shipping lanes! +1200%', cost: 5000000000000000000, multiplier: 13.0),
          BusinessUpgrade(id: 'id_2', name: '🌌 Multiverse Franchise', description: 'Infinite stores! +3000%', cost: 50000000000000000000, multiplier: 31.0),
        ],
      ),
      Business(
        id: 'galactic_senate',
        name: 'Galactic Senate',
        icon: Icons.gavel_rounded,
        color: const Color(0xFFF44336),
        baseCost: 133116666404426219520.0, // ~133Qi
        baseIncome: 43332248178524160.0, // ~43Qa
        costMultiplier: 1.15,
        incomePerLevel: 19000000000000000.0,
        managerCost: 100000000000000000000.0, // 100Qi
        upgrades: [
          BusinessUpgrade(id: 'gs_1', name: '📜 Cosmic Tax Laws', description: 'Legal monopoly! +1500%', cost: 50000000000000000000.0, multiplier: 16.0),
          BusinessUpgrade(id: 'gs_2', name: '👑 Supreme Chancellor', description: 'Total dominion! +5000%', cost: 500000000000000000000.0, multiplier: 51.0),
        ],
      ),
      Business(
        id: 'universal_engine',
        name: 'Universal Engine',
        icon: Icons.auto_awesome_rounded,
        color: const Color(0xFFFBC02D),
        baseCost: 1597399996853114634240.0, // ~1.5Sx
        baseIncome: 519986978142289920.0, // ~519Qa
        costMultiplier: 1.15,
        incomePerLevel: 230000000000000000.0,
        managerCost: 1000000000000000000000.0, // 1Sx
        upgrades: [
          BusinessUpgrade(id: 'ue_1', name: '✨ Reality Code', description: 'Rewrite the laws of physics! +2000%', cost: 500000000000000000000.0, multiplier: 21.0),
          BusinessUpgrade(id: 'ue_2', name: '🌐 The Architect', description: 'Aegis is everything. +10000%', cost: 5000000000000000000000.0, multiplier: 101.0),
        ],
      ),
    ];
  }
}
