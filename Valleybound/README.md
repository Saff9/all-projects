# Valleybound

Valleybound is a third-person open-world survival adventure set in a fictional Himalayan valley inspired by Kashmir.

The project is planned as a C++ game with a desktop-first pipeline and a later mobile build. The first working target is a small playable slice: one valley, one human character, terrain collision, seasonal lighting, houses, animals, and simple survival tasks.

## Current state

- Design documents live in `docs/`.
- A browser concept preview lives in `preview/`.
- C++ source folders are scaffolded in `src/`.
- Asset folders are scaffolded in `assets/`.

## Preview

Open `preview/index.html` in a browser to try the current concept preview.

Controls:

- WASD or arrow keys to move
- 1, 2, 3, 4 to switch seasons
- F to interact with nearby markers

This preview is not the final engine. It is a fast visual/game-flow sketch used to test mood, map layout, and first interactions before heavy C++ implementation.

# وادئ کشمیر — Wadi-e-Kashmir

> *Born in the valley. Tested by the mountain.*

A **Survival + Action RPG** set in the Kashmir Valley, built with Godot 4.3 (GDScript) and exported as a signed Android APK via GitHub Actions.

---

## 🏔️ Game Overview

| Field | Value |
|-------|-------|
| **Title** | Wadi-e-Kashmir (وادئ کشمیر) |
| **Genre** | Survival + Action RPG |
| **Engine** | Godot 4.3 (GDScript only) |
| **Platform** | Android APK (portrait + landscape) |
| **Target** | Mid-range Android phones, 60fps |
| **Package** | `com.wadiekashmir.game` |
| **Min SDK** | 21 (Android 5.0+) |
| **Target SDK** | 33 |
| **Build** | GitHub Actions (no Google Play Console needed) |

---

## 📖 Story Summary

**Act 1 — The Last Shepherd (Spring)**
Aryan Lone, a 16-year-old shepherd boy from Gulmarg, tends his family's flock on the meadows. Life is peaceful — until wolf packs raid villages and an old man in Srinagar warns of a dark force awakening in the Himalayan caves.

**Act 2 — The Frozen Valley (Winter)**
An unnatural blizzard buries the valley. Aryan must survive avalanches, rescue villagers in Baramulla, keep his flock alive, and uncover that the wolves are being controlled by an ancient shaman.

**Act 3 — The Heart of the Mountain (Late Winter → Spring)**
Aryan fights through Budgam forest, reaches Pahalgam, and confronts the Shaman in a cave. Final boss battle. Spring returns to the valley.

---

## 🗺️ World Map — Real Kashmiri Locations

```
┌─────────────────────────────────────────────┐
│  NORTH:   Gulmarg (start) ── Baramulla       │
│           Sopore (orchards)                  │
│                                              │
│  CENTRE:  Srinagar (hub) ── Budgam (forest)  │
│           Dal Lake / Dal Lake (frozen)       │
│                                              │
│  SOUTH:   Pahalgam (final) ── Anantnag       │
│           Pampore (saffron fields)           │
└─────────────────────────────────────────────┘
```

Each location has:
- Unique biome (snow level, tree type, architecture)
- 2–3 NPCs with Kashmiri names and dialogue
- At least 1 quest or event
- Day/night cycle active

---

## 👤 Characters

### Player: Aryan Lone
- **Age:** 16, Shepherd from Gulmarg
- **Progression:** Shepherd → Hunter → Warrior → Valley Guardian
- **Skills:** Herding, slingshot, climbing, sword combat

### Key NPCs

| Name | Location | Role |
|------|----------|------|
| Dadi Zoona | Gulmarg | Grandmother, tutorial guide |
| Mushtaq Bhai | Srinagar | Merchant, gives quests |
| Rukhsana | Baramulla | Village girl, companion |
| Baba Noor | Pahalgam | Wise elder, lore keeper |
| The Shaman | Cave/Pahalgam | Final boss |

---

## 🐑 Animals & Creatures

### Friendly Flock
| Animal | Behavior | Resource |
|--------|----------|----------|
| Sheep (Gaddi) | Wander, follow player, flee from wolves | Wool |
| Goat | Faster, can climb rocks | — |
| Cow (Pashmina) | Stationary, interact for milk | Milk |
| Horse | Mount, Act 2 unlock | Travel speed |

### Enemies
| Creature | Type | Notes |
|----------|------|-------|
| Wolf | Pack hunter | Hunts sheep + player |
| Shadow Wolf | Shaman-controlled | Blue glow, 1.3× faster |
| Ice Wraith | Flying | Blizzard-only, splits on death |
| Cave Troll | Boss-level | Near Pahalgam |
| Brown Bear | Neutral→hostile | Attacks if provoked |
| Snow Leopard | Rare, deadly | Fast, high damage |

---

## 🌦️ Seasons System

| Season | In-Game Days | Real Time (testing) | Key Events |
|--------|-------------|---------------------|------------|
| Spring | Days 1–7 | 7 min | Tutorial, flock intro, wolves begin |
| Summer | Days 8–14 | 7 min | Exploration, Srinagar trading |
| Autumn | Days 15–21 | 7 min | Harvest quests, Baramulla mission |
| Winter | Days 22–30 | 7 min | Blizzard, avalanche, boss unlocked |

Each season changes: sky color, ambient light, ground texture, weather particles, enemy spawn rates, NPC dialogue.

---

## ⚔️ Gameplay Mechanics

### Core Loop
```
Explore → Quest/Survive → Earn Resources → Upgrade → Unlock Next Location → Repeat
```

### Survival Bars (HUD)
- ❤️ **Health** — reduced by enemies, cold, hunger
- 🍖 **Hunger** — drains 0.5/sec always; eat food to restore
- 🌡️ **Cold** — drains faster in winter/blizzard; wear Pheran to slow drain

### Combat Weapons
| Weapon | Type | Damage | Cooldown | Unlock |
|--------|------|--------|----------|--------|
| Slingshot | Ranged | 15 | 0.8s | Start |
| Crook Staff | Melee | 25 | 0.6s | Quest 02 |
| Iron Sword | Melee | 40 | 0.5s | Act 2 |
| Fire Torch | AOE | 20 | 1.0s | Shop |
| Enchanted Blade | Melee | 60 | 0.4s | Act 3 |

### Resources
| Resource | Source | Used For |
|----------|--------|----------|
| Wool | Shear sheep | Sell, craft clothes |
| Milk | Interact cow | Restore hunger |
| Wood | Chop trees | Shelter, fire |
| Saffron | Harvest fields | Trade for gold |
| Gold | Quests, trading | Buy upgrades |
| Herbs | Forest collect | Healing potions |
| Apples | Orchards | Restore hunger |

### Upgrade Tree
```
Aryan:   Health → Stamina → Combat Speed → Special Skill (Warrior Cry)
Flock:   Sheep count → Flock speed → Guard dog → Horse unlock
Gear:    Sling → Staff → Iron Sword → Enchanted Blade
Clothes: Thin shirt → Wool vest → Full Pheran → Warrior Pheran
```

---

## 📱 Mobile Controls (HUD Layout)

```
┌────────────────────────────────────────────┐
│ [❤️🍖🌡️ BARS]   [Spring — Day 3]  [MINIMAP]│
│                                            │
│                                            │
│                   GAME                    │
│                  WORLD                    │
│                                            │
│  [🕹️ JOYSTICK]        [⚔️] [🤝] [🔄] [✨] │
└────────────────────────────────────────────┘
```

- **Bottom-left:** Virtual joystick (movement)
- **Bottom-right:** Attack / Interact / Roll / Special
- **Swipe Up:** Inventory panel
- **Swipe Down:** Map screen
- **Back button / Swipe Down from top:** Pause menu

---

## 🎵 Audio Plan

### Music Tracks
| Track | Scene | Style |
|-------|-------|-------|
| `spring_village` | Gulmarg, Spring | Soft Santoor |
| `summer_srinagar` | Srinagar hub | Upbeat, market |
| `autumn_tension` | Autumn quests | Minor key tabla |
| `winter_survival` | Winter scenes | Sparse, cold wind |
| `combat` | Any fight | Fast tabla drums |
| `boss_fight` | Shaman cave | Orchestral + tabla |
| `ending` | Credits | Full Santoor |

### Sound Effects (28 total)
```
footstep_grass    footstep_snow     footstep_stone
sheep_baa         wolf_growl        wolf_howl
sword_swing       stone_hit         player_hurt       player_dodge
blizzard_wind     snowfall_ambient  river_flow
item_pickup       quest_complete    level_up
avalanche_rumble  cave_drip         ice_crack
npc_talk          door_open         fire_crackle
wraith_shriek     troll_roar        horse_gallop
shaman_laugh      crystal_shatter   cave_collapse
```

---

## 🗂️ Project Folder Structure

```
wadi-e-kashmir/
├── .github/
│   └── workflows/
│       └── build-apk.yml          ← Auto-build APK on push to main
│
├── project/
│   ├── project.godot              ← Main Godot project file
│   ├── export_presets.cfg         ← Android export config
│   │
│   ├── scenes/
│   │   ├── main/
│   │   │   ├── Main.tscn          ← Entry point scene
│   │   │   ├── MainMenu.tscn      ← Title screen
│   │   │   ├── GameWorld.tscn     ← Root game scene
│   │   │   ├── PauseMenu.tscn
│   │   │   ├── GameOver.tscn
│   │   │   └── Credits.tscn
│   │   │
│   │   ├── world/
│   │   │   ├── Gulmarg.tscn       ← Starting village
│   │   │   ├── Srinagar.tscn      ← Main hub
│   │   │   ├── Budgam.tscn        ← Dark forest
│   │   │   ├── Baramulla.tscn     ← River town
│   │   │   ├── Pahalgam.tscn      ← Mountain pass
│   │   │   └── ShamanCave.tscn    ← Final dungeon
│   │   │
│   │   ├── player/
│   │   │   └── Player.tscn
│   │   │
│   │   ├── enemies/
│   │   │   ├── Wolf.tscn
│   │   │   ├── ShadowWolf.tscn
│   │   │   ├── IceWraith.tscn
│   │   │   ├── CaveTroll.tscn
│   │   │   └── Shaman.tscn        ← Final boss
│   │   │
│   │   ├── animals/
│   │   │   ├── Animal.tscn        ← Base class
│   │   │   ├── Sheep.tscn
│   │   │   ├── Goat.tscn
│   │   │   ├── Cow.tscn
│   │   │   └── Horse.tscn
│   │   │
│   │   ├── npcs/
│   │   │   ├── NPC.tscn           ← Base class
│   │   │   ├── DadiZoona.tscn
│   │   │   ├── MushtaqBhai.tscn
│   │   │   ├── Rukhsana.tscn
│   │   │   └── BabaNoor.tscn
│   │   │
│   │   ├── ui/
│   │   │   ├── HUD.tscn
│   │   │   ├── DialogueBox.tscn
│   │   │   ├── InventoryUI.tscn
│   │   │   ├── QuestLog.tscn
│   │   │   ├── ShopUI.tscn
│   │   │   ├── LoadingScreen.tscn
│   │   │   └── EventTitleCard.tscn
│   │   │
│   │   └── effects/
│   │       ├── Projectile.tscn
│   │       ├── DamageNumber.tscn
│   │       ├── AvalancheBoulder.tscn
│   │       └── Footprint.tscn
│   │
│   ├── scripts/
│   │   ├── autoloads/
│   │   │   ├── GameManager.gd     ← Global state, season, survival bars
│   │   │   ├── QuestManager.gd    ← Quest tracking
│   │   │   ├── InventoryManager.gd← Item management
│   │   │   ├── AudioManager.gd    ← Music + SFX
│   │   │   └── SaveManager.gd     ← Save/load JSON
│   │   │
│   │   ├── player/
│   │   │   └── Player.gd
│   │   │
│   │   ├── enemies/
│   │   │   ├── Wolf.gd
│   │   │   ├── ShadowWolf.gd
│   │   │   ├── IceWraith.gd
│   │   │   ├── CaveTroll.gd
│   │   │   ├── Shaman.gd
│   │   │   ├── WolfPack.gd
│   │   │   └── WolfSpawner.gd
│   │   │
│   │   ├── animals/
│   │   │   ├── Animal.gd
│   │   │   ├── Sheep.gd
│   │   │   ├── Goat.gd
│   │   │   └── Cow.gd
│   │   │
│   │   ├── npcs/
│   │   │   ├── NPC.gd
│   │   │   ├── DadiZoona.gd
│   │   │   ├── MushtaqBhai.gd
│   │   │   ├── Rukhsana.gd
│   │   │   └── BabaNoor.gd
│   │   │
│   │   ├── world/
│   │   │   ├── SceneTransition.gd
│   │   │   ├── SeasonWeather.gd
│   │   │   ├── AvalancheEvent.gd
│   │   │   ├── BlizzardEvent.gd
│   │   │   └── ObjectPool.gd
│   │   │
│   │   ├── ui/
│   │   │   ├── HUD.gd
│   │   │   ├── DialogueBox.gd
│   │   │   ├── InventoryUI.gd
│   │   │   ├── QuestLog.gd
│   │   │   ├── ShopUI.gd
│   │   │   └── LoadingScreen.gd
│   │   │
│   │   └── effects/
│   │       ├── Projectile.gd
│   │       ├── DamageNumber.gd
│   │       └── ScreenShake.gd
│   │
│   └── assets/
│       ├── sprites/
│       │   ├── player/
│       │   ├── enemies/
│       │   ├── animals/
│       │   ├── npcs/
│       │   ├── world/
│       │   │   ├── tiles/
│       │   │   ├── objects/
│       │   │   └── effects/
│       │   └── ui/
│       │
│       ├── audio/
│       │   ├── music/           ← .ogg files
│       │   └── sfx/             ← .ogg files
│       │
│       └── fonts/
│           ├── main_font.ttf
│           └── urdu_font.ttf    ← RTL Urdu font
│
├── keystore/
│   └── release.keystore         ← Generated locally, stored as GitHub Secret
│
└── README.md                    ← This file
```

---

## 🚀 GitHub Actions — APK Build (No Google Play Needed)

### Setup Steps

**Step 1 — Generate your keystore locally:**
```bash
keytool -genkey -v \
  -keystore release.keystore \
  -alias wadi-kashmir \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass YOUR_STORE_PASSWORD \
  -keypass YOUR_KEY_PASSWORD \
  -dname "CN=WadiKashmir, OU=Game, O=Dev, L=Kashmir, S=JK, C=IN"
```

**Step 2 — Add GitHub Secrets (Settings → Secrets → Actions):**
| Secret Name | Value |
|-------------|-------|
| `KEYSTORE_BASE64` | `base64 -w 0 release.keystore` output |
| `KEY_ALIAS` | `wadi-kashmir` |
| `KEY_PASSWORD` | Your key password |
| `STORE_PASSWORD` | Your store password |

**Step 3 — Push to `main` branch** → Actions tab → Download `wadi-e-kashmir-apk` artifact

**Step 4 — Install on phone:**
1. Enable **Unknown Sources** (Settings → Security)
2. Transfer APK to phone via USB or share link
3. Tap APK file → Install

---

## 📋 4-Week Build Checklist

### Week 1 — Foundation
- [ ] Godot project created, runs on phone
- [ ] Player moves with virtual joystick
- [ ] Gulmarg scene loads with houses and trees
- [ ] Season system changes sky colour
- [ ] HUD shows 3 bars, season, day number

### Week 2 — Gameplay Core
- [ ] Sheep flock wanders and flees from wolves
- [ ] Wolf AI hunts sheep and player
- [ ] Player can attack with slingshot and staff
- [ ] NPCs have dialogue boxes (typewriter effect)
- [ ] Srinagar hub scene accessible from Gulmarg

### Week 3 — Content & Story
- [ ] 3 main quests working end to end
- [ ] Inventory with 10+ item types
- [ ] Budgam forest and Baramulla scenes complete
- [ ] Avalanche and blizzard events trigger correctly
- [ ] Pahalgam + Shaman boss fight complete

### Week 4 — Polish & Ship
- [ ] All sprites replaced (pixel art)
- [ ] Audio system with music + 28 sound effects
- [ ] Stable 60fps on test phone
- [ ] GitHub Actions successfully builds APK
- [ ] Save/load system working
- [ ] Main menu, pause menu, game over screen done
- [ ] APK installed and playable on phone

---

## 🗣️ Kashmiri Phrases Reference

| English | Kashmiri (transliterated) | Where Used |
|---------|--------------------------|------------|
| Be careful | Khabardar reh | Dadi Zoona warning |
| The valley is ours | Wadi hamaari chhe | Battle cry |
| May God protect you | Khuda hafiz | NPC farewell |
| The snow is coming | Baraf aav chhe | Winter warning |
| A shepherd never leaves his flock | Gadir khanis chhui wafadar | Quest dialogue |
| Spring will return | Bahar aayi chhe wapas | Ending text |
| Where are you going? | Kati wanav chhe? | Random NPC |
| Stay warm | Garm reh | Dadi Zoona |

---

## 🎨 Kashmiri Colour Palette

```
Sky blue:      #87CEEB   Mountain white:  #F0F0F0
Forest green:  #2D5A27   Earthy brown:    #8B6914
Chinar red:    #C0392B   Stone grey:      #7F8C8D
Snow white:    #ECF0F1   Water blue:      #3498DB
Saffron gold:  #F39C12   Night dark:      #1A1A2E
Cave purple:   #4A0E8F   Shadow blue:     #1E3A5F
```

---

## ⚙️ Godot 4.3 — Technical Notes

- **Renderer:** Forward+ (Mobile profile for Android)
- **Physics:** Godot Physics 2D
- **Navigation:** NavigationAgent2D for enemy pathfinding
- **Particles:** GPUParticles2D (not CPUParticles2D — faster on mobile)
- **Audio:** AudioStreamPlayer / AudioStreamPlayer2D with AudioBus
- **Saving:** JSON via `FileAccess` to `user://savegame.json`
- **Input:** TouchScreenButton + InputEventScreenTouch for mobile
- **Shaders:** VisualShader for blur (pause menu), light mask (blizzard)
- **Object Pooling:** Manual pool for wolves (8), projectiles (10), particles (5)
- **LOD:** Simplified AI beyond 400px from player
- **Target FPS:** 60fps primary, 30fps fallback mode

---

## 🧭 Development Rules (IMPORTANT)

1. **One prompt at a time** — never combine two build steps
2. **Test on phone** after every single step via Godot USB remote debug
3. **Keep full file copies** — always ask AI for complete files, not diffs
4. **Godot 4.3 only** — if AI suggests a Godot 3 node/method, reject it
5. **No plugins** — use only built-in Godot 4 nodes and APIs
6. **GDScript only** — no C#, no third-party SDKs

---

*Wadi-e-Kashmir — Built with love for the valley. وادئ کشمیر*
*Made in Godot 4.3 | Android | GitHub Actions*
