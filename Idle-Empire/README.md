# 🏙️ Idle Empire - Business Tycoon & Creature Evolution

<div align="center">

[![Flutter](https://img.shields.io/badge/Flutter-3.10.3-blue.svg)](https://flutter.dev)
[![Dart](https://img.shields.io/badge/Dart-3.10.3-blue.svg)](https://dart.dev)
[![Version](https://img.shields.io/badge/version-1.2.0-green.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()

**A captivating idle tycoon game with creature collection and evolution mechanics**

[Features](#-features) • [Screenshots](#-screenshots) • [Getting Started](#-getting-started) • [Gameplay](#-gameplay) • [Architecture](#-architecture)

</div>

---

## 📖 Overview

**Idle Empire** is a feature-rich idle business tycoon game built with Flutter. Build and expand your business empire across multiple industries, discover and evolve mystical creatures, complete quests, send creatures on expeditions, and prestige to unlock permanent bonuses.

The game combines classic idle game mechanics with creature collection, creating a unique gameplay experience where your business success directly influences your creature discovery and evolution progress.

---

## ✨ Features

### 🏢 Business Management
- **8 Unique Businesses** - From small shops to massive corporations
- **Level Up System** - Purchase levels to increase income
- **Auto-Managers** - Hire managers for passive income generation
- **Business Upgrades** - Special upgrades that enhance specific business mechanics
- **Tap-to-Earn** - Manual tapping for immediate income

### 🐉 Creature Collection & Evolution
- **Discover Creatures** - Unlock creatures as you expand your empire
- **5 Evolution Tiers** - Evolve creatures through multiple forms
- **Element System** - Creatures belong to different elements
- **Synergy Bonuses** - Creatures boost income from specific businesses
- **Creature Merging** - Combine same-element creatures for bonus XP
- **Passive XP Gain** - Discovered creatures gain XP over time

### ⚔️ Expeditions
- **Deploy Creatures** - Send creatures on timed expeditions
- **Earn Rewards** - Collect gems and evolution shards
- **Multiple Expeditions** - Various expedition types with different requirements
- **Auto-Completion** - Expeditions complete automatically over time

### 🎮 Arcade Minigames
- **Aether Harvest (Void Tap)** - Tap-based game earning Tech Points
- **Mineral Synthesis (Gem Crafter)** - Combo-based game earning massive coins
- **Dark Matter Defense (Aura Blast)** - Defense game earning Evolution Shards

### 🏆 Progression Systems
- **Quest System** - Complete objectives for gems and shards
- **Prestige System** - Reset progress for permanent income multipliers
- **Tech Tree** - Spend Tech Points on permanent upgrades
- **Daily Rewards** - Login streaks for increasing rewards
- **Achievement System** - Toast notifications for milestones

### 💎 Premium Features
- **Ad Integration** - Watch ads to double offline earnings or activate 2x boost
- **Gem Currency** - Premium currency for special purchases
- **Evolution Shards** - Special currency for creature enhancements

---

## 📱 Screenshots

<div align="center">

| Dashboard | Business | Creatures |
|:---------:|:--------:|:---------:|
| 📊 Main hub with income overview | 🏢 Manage & upgrade businesses | 🐉 Collect & evolve creatures |

| Prestige | Expeditions | Arcade |
|:--------:|:-----------:|:------:|
| 🔄 Reset for bonuses | ⚔️ Send creatures on missions | 🎮 Play minigames |

</div>

---

## 🚀 Getting Started

### Prerequisites

- **Flutter SDK** >= 3.10.3
- **Dart SDK** >= 3.10.3
- **Android Studio** / **VS Code** / **Xcode** (for mobile development)
- **Android SDK** (for Android builds)
- **Xcode** (for iOS builds, macOS only)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd idle_city_flutter
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Run the app**
   ```bash
   flutter run
   ```

### Building for Production

```bash
# Android APK
flutter build apk --release

# Android App Bundle (for Play Store)
flutter build appbundle --release

# iOS (macOS only)
flutter build ios --release
```

---

## 🎮 Gameplay

### Starting Out
1. You begin with **10 coins** and your first discovered creature
2. Tap businesses to earn income manually
3. Purchase business levels to increase earning potential
4. Hire managers to automate income collection

### Expanding Your Empire
- Each business has a **cycle duration** - the time it takes to generate income
- **Upgrades** provide special bonuses like increased efficiency or new mechanics
- As you level up businesses, you'll **discover new creatures**

### Creature System
- **Discover** creatures by progressing through business levels
- **Feed XP** to creatures to help them level up
- **Evolve** creatures when they reach maximum XP for their tier
- **Merge** two creatures of the same element and tier for bonus XP
- Creatures provide **synergy bonuses** to specific businesses

### Prestige
When you've maximized your progress:
1. Go to the **Boost** tab
2. Prestige to reset businesses and gain **Prestige Points**
3. Each point gives a **+1% permanent income multiplier**
4. Keep your creatures, gems, and shards!

---

## 🏗️ Architecture

### Project Structure

```
lib/
├── main.dart                    # App entry point with splash screen
├── core/                        # Core game systems
│   ├── ad_manager.dart          # AdMob integration
│   ├── audio_controller.dart    # Sound effects & music
│   ├── big_number.dart          # Number formatting (1.2M, 3.5B, etc.)
│   ├── game_engine.dart         # Main game loop (10 ticks/sec)
│   └── save_manager.dart        # Save/load game data
├── data/                        # Static game data
│   ├── business_data.dart       # Business definitions
│   ├── creature_data.dart       # Creature definitions
│   └── quest_data.dart          # Quest definitions
├── models/                      # Data models
│   ├── business.dart            # Business model
│   ├── creature.dart            # Creature model
│   ├── expedition.dart          # Expedition model
│   ├── player_data.dart         # Player progress
│   └── quest.dart               # Quest model
├── providers/                   # State management
│   └── game_provider.dart       # Main game state (ChangeNotifier)
├── screens/                     # UI screens
│   ├── home_screen.dart         # Main navigation hub
│   ├── dashboard_screen.dart    # Overview & stats
│   ├── business_screen.dart     # Business management
│   ├── creature_screen.dart     # Creature collection
│   ├── prestige_screen.dart     # Prestige system
│   ├── expedition_screen.dart   # Expeditions
│   ├── arcade_screen.dart       # Minigames
│   ├── tech_screen.dart         # Tech tree
│   ├── aether_market_screen.dart # Shop
│   └── settings_screen.dart     # Settings & data
├── services/                    # Business logic services
│   └── ad_service.dart          # Ad operations
├── theme/                       # Theming
│   └── app_theme.dart           # Dark theme with neon accents
├── widgets/                     # Reusable UI components
│   ├── achievement_toast.dart   # Achievement notifications
│   ├── animated_background.dart # Particle effects
│   ├── daily_reward_dialog.dart # Daily login popup
│   └── offline_earnings_dialog.dart # Offline earnings popup
└── games/                       # Arcade minigame implementations
```

### Key Design Patterns

- **Provider Pattern** - State management using `ChangeNotifier`
- **Singleton Pattern** - `AdManager` for ad operations
- **Observer Pattern** - Reactive UI updates via Provider
- **MVC Architecture** - Separation of data, logic, and presentation

### Core Systems

#### Game Engine
The `GameEngine` runs at **10 ticks per second** and handles:
- Auto-production for managed businesses
- Passive creature XP gain
- Quest progress checking
- Expedition completion

#### Save System
`SaveManager` handles:
- Automatic saving every 30 seconds
- Offline earnings calculation
- Data persistence using `shared_preferences`
- JSON serialization for all game models

---

## 📦 Dependencies

### Production Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `provider` | ^6.1.2 | State management |
| `shared_preferences` | ^2.3.5 | Local data persistence |
| `uuid` | ^4.5.1 | Unique ID generation |
| `intl` | ^0.20.1 | Internationalization & formatting |
| `google_fonts` | ^6.2.1 | Custom typography |
| `flutter_animate` | ^4.5.0 | Animation utilities |
| `google_mobile_ads` | ^7.0.0 | AdMob integration |
| `audioplayers` | ^6.5.1 | Audio playback |

### Development Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `flutter_test` | SDK | Testing framework |
| `flutter_lints` | ^6.0.0 | Linting rules |

---

## 🎨 Theme & Design

The game features a **premium dark theme** with:

- **Primary Background**: Deep navy (#07091A to #0E1535 gradient)
- **Accent Colors**:
  - 🟡 Gold (#FFD700) - Coins, primary currency
  - 🔵 Blue (#4FC3F7) - Income, tech elements
  - 🟣 Purple (#B388FF) - Prestige, rare items
  - 🟠 Orange (#FF8A65) - Boosts, warnings
  - 🟢 Green (#81C784) - Success, growth
  - 🔷 Teal (#4DB6AC) - Expeditions

- **Typography**: 
  - Headings: `Outfit` (bold, modern)
  - Body: `Inter` (clean, readable)

- **Effects**:
  - Neon glow decorations
  - Animated particle backgrounds
  - Smooth transitions and micro-interactions

---

## 🔧 Configuration

### AdMob Setup

1. Update `android/app/src/main/AndroidManifest.xml` with your AdMob App ID:
   ```xml
   <meta-data
       android:name="com.google.android.gms.ads.APPLICATION_ID"
       android:value="ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"/>
   ```

2. Configure ad unit IDs in `lib/core/ad_manager.dart`

### Audio Assets

Place audio files in `assets/audio/`:
- `tap.mp3` - Tap sound effect
- `purchase.mp3` - Purchase sound
- `evolution.mp3` - Evolution sound
- `background.mp3` - Background music (optional)

---

## 🧪 Testing

Run the test suite:
```bash
flutter test
```

Run with coverage:
```bash
flutter test --coverage
```

---

## 📱 Supported Platforms

| Platform | Status | Minimum Version |
|----------|--------|-----------------|
| Android | ✅ Fully Supported | API 21+ |
| iOS | ✅ Fully Supported | iOS 12+ |
| Web | ✅ Supported | Modern browsers |
| Windows | ✅ Supported | Windows 10+ |
| macOS | ✅ Supported | macOS 10.15+ |
| Linux | ✅ Supported | Ubuntu 18.04+ |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Follow [Dart style guide](https://dart.dev/guides/language/effective-dart/style)
- Run `flutter analyze` before committing
- Format code with `dart format .`

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Flutter Team** - For the amazing Flutter framework
- **Google Fonts** - For beautiful typography
- **Material Design** - For design system inspiration

---

## 📞 Support

- **Issues**: [GitHub Issues](link-to-issues)
- **Email**: your-email@example.com

---

<div align="center">

**Built with ❤️ using Flutter**

⭐ Star this repo if you find it helpful!

</div>