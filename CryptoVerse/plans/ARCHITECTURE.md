# Crypto Telegram Mini App - System Architecture

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Technology Stack](#technology-stack)
4. [Database Design](#database-design)
5. [API Architecture](#api-architecture)
6. [Frontend Architecture](#frontend-architecture)
7. [Crypto Features Architecture](#crypto-features-architecture)
8. [Gamification System](#gamification-system)
9. [Security Considerations](#security-considerations)
10. [Deployment Architecture](#deployment-architecture)
11. [Project Structure](#project-structure)
12. [Scalability Strategy](#scalability-strategy)

---

## Executive Summary

This document outlines the comprehensive system architecture for a production-ready crypto-themed Telegram Mini App. The application combines virtual token economy mechanics with engaging gamification elements, designed to scale from thousands to millions of users.

### Key Features
- **Virtual Token Economy**: Internal wallet system with mining, staking, and rewards
- **Character System**: Upgradeable characters with unique abilities
- **Gamification**: Achievements, quests, leaderboards, and daily rewards
- **Real-time Updates**: WebSocket-based live data synchronization
- **Offline Support**: Progressive Web App capabilities for offline access

---

## System Overview

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              TELEGRAM MINI APP                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     Frontend - React/Next.js                        │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │    │
│  │  │  Home    │ │Character │ │  Wallet  │ │ Quests   │ │Leaderboard│  │    │
│  │  │  Screen  │ │  System  │ │  System  │ │  System  │ │  System   │  │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │    │
│  │  ┌──────────────────────────────────────────────────────────────┐   │    │
│  │  │              State Management - Zustand/Redux                │   │    │
│  │  └──────────────────────────────────────────────────────────────┘   │    │
│  │  ┌──────────────────────────────────────────────────────────────┐   │    │
│  │  │              Telegram WebApp SDK Integration                 │   │    │
│  │  └──────────────────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTPS / WSS
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY / LOAD BALANCER                     │
│                         - Rate Limiting                                      │
│                         - SSL Termination                                    │
│                         - Request Routing                                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
│   API Service         │ │   WebSocket Service   │ │   Background Jobs     │
│   - NestJS/Express    │ │   - Socket.io/WS      │ │   - Bull/BullMQ       │
│   - REST Endpoints    │ │   - Real-time sync    │ │   - Cron Jobs         │
│   - JWT Auth          │ │   - Live updates      │ │   - Queue Processing  │
└───────────────────────┘ └───────────────────────┘ └───────────────────────┘
          │                         │                         │
          └─────────────────────────┼─────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
          ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
          │  PostgreSQL  │ │    Redis     │ │   IPFS/      │
          │  - Users     │ │  - Cache     │ │   Storage    │
          │  - Wallets   │ │  - Sessions  │ │  - Assets    │
          │  - Game Data │ │  - Queues    │ │  - NFTs      │
          └──────────────┘ └──────────────┘ └──────────────┘
```

### Data Flow Diagram

```
┌─────────────┐     Telegram Login      ┌─────────────────┐
│   Telegram  │ ──────────────────────▶ │   API Gateway   │
│    Client   │                         └────────┬────────┘
└─────────────┘                                  │
      │                                          ▼
      │                                ┌─────────────────┐
      │         JWT Token              │   Auth Service  │
      │ ◀─────────────────────────────│ - Verify Hash   │
      │                                │ - Issue JWT     │
      │                                └─────────────────┘
      │
      │  Authenticated Requests
      ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Services                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ User Service│  │Game Service │  │Wallet Service│         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                 │
│         └────────────────┼────────────────┘                 │
│                          ▼                                  │
│                ┌─────────────────┐                          │
│                │  Event Bus/     │                          │
│                │  Message Queue  │                          │
│                └────────┬────────┘                          │
└─────────────────────────┼───────────────────────────────────┘
                          │
            ┌─────────────┼─────────────┐
            ▼             ▼             ▼
      ┌──────────┐ ┌──────────┐ ┌──────────┐
      │PostgreSQL│ │  Redis   │ │WebSocket │
      │   DB     │ │  Cache   │ │  Push    │
      └──────────┘ └──────────┘ └──────────┘
```

---

## Technology Stack

### Frontend Stack

| Technology | Version | Justification |
|------------|---------|---------------|
| **React** | 18.x | Component-based architecture, excellent for interactive UIs, large ecosystem |
| **Next.js** | 14.x | SSR/SSG support, optimized for Mini Apps, built-in routing, API routes |
| **TypeScript** | 5.x | Type safety, better IDE support, reduced runtime errors |
| **Zustand** | 4.x | Lightweight state management, minimal boilerplate, perfect for Mini Apps |
| **TailwindCSS** | 3.x | Utility-first CSS, rapid development, small bundle size |
| **Framer Motion** | 10.x | Smooth animations, gesture support, excellent performance |
| **Telegram WebApp SDK** | Latest | Official SDK for Mini App integration |

### Backend Stack

| Technology | Version | Justification |
|------------|---------|---------------|
| **NestJS** | 10.x | Modular architecture, built-in DI, excellent for microservices |
| **TypeORM** | 0.3.x | TypeScript-native ORM, migrations, active record pattern |
| **Socket.io** | 4.x | Reliable WebSocket, fallback support, room management |
| **BullMQ** | 4.x | Redis-based job queue, reliable, supports delayed jobs |
| **class-validator** | 0.14.x | DTO validation, decorator-based, integrates with NestJS |
| **Passport** | 0.6.x | Authentication middleware, strategy pattern |

### Data Layer

| Technology | Version | Justification |
|------------|---------|---------------|
| **PostgreSQL** | 15.x | ACID compliance, JSON support, excellent for game data |
| **Redis** | 7.x | Caching, sessions, leaderboards, pub/sub, job queues |
| **Prisma** | 5.x | Type-safe database client, migrations, introspection |

### Infrastructure

| Technology | Justification |
|------------|---------------|
| **Docker** | Containerization, consistent environments |
| **Kubernetes** | Orchestration, auto-scaling, self-healing |
| **Nginx** | Reverse proxy, load balancing, SSL termination |
| **GitHub Actions** | CI/CD pipeline, automated testing and deployment |
| **Sentry** | Error tracking and performance monitoring |
| **Prometheus/Grafana** | Metrics and visualization |

---

## Database Design

### PostgreSQL Schema

#### Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    photo_url VARCHAR(500),
    language_code VARCHAR(10) DEFAULT 'en',
    is_premium BOOLEAN DEFAULT FALSE,
    is_bot BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE,
    
    -- Indexes
    INDEX idx_users_telegram_id (telegram_id),
    INDEX idx_users_created_at (created_at)
);
```

#### Wallets Table

```sql
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(20, 8) DEFAULT 0,
    total_earned DECIMAL(20, 8) DEFAULT 0,
    total_spent DECIMAL(20, 8) DEFAULT 0,
    staked_amount DECIMAL(20, 8) DEFAULT 0,
    staking_reward_rate DECIMAL(5, 4) DEFAULT 0.01,
    staking_started_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT positive_balance CHECK (balance >= 0),
    CONSTRAINT positive_staked CHECK (staked_amount >= 0),
    
    INDEX idx_wallets_user_id (user_id)
);
```

#### Transactions Table

```sql
CREATE TYPE transaction_type AS ENUM (
    'MINING', 'STAKING_REWARD', 'REFERRAL_BONUS', 'DAILY_REWARD',
    'ACHIEVEMENT_REWARD', 'QUEST_REWARD', 'CHARACTER_PURCHASE',
    'CHARACTER_UPGRADE', 'AIRDROP', 'TRANSFER_IN', 'TRANSFER_OUT',
    'BATTLE_REWARD', 'PENALTY'
);

CREATE TYPE transaction_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    status transaction_status DEFAULT 'COMPLETED',
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_transactions_wallet_id (wallet_id),
    INDEX idx_transactions_type (type),
    INDEX idx_transactions_created_at (created_at)
);
```

#### Characters Table

```sql
CREATE TABLE character_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_power INTEGER DEFAULT 100,
    base_mining_rate DECIMAL(10, 6) DEFAULT 1.0,
    rarity VARCHAR(50) DEFAULT 'COMMON', -- COMMON, RARE, EPIC, LEGENDARY, MYTHIC
    max_level INTEGER DEFAULT 50,
    base_price DECIMAL(20, 8) DEFAULT 100,
    image_url VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_character_templates_rarity (rarity),
    INDEX idx_character_templates_active (is_active)
);

CREATE TABLE user_characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    character_template_id UUID NOT NULL REFERENCES character_templates(id),
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    current_power INTEGER,
    current_mining_rate DECIMAL(10, 6),
    is_equipped BOOLEAN DEFAULT FALSE,
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_mined_at TIMESTAMP WITH TIME ZONE,
    
    INDEX idx_user_characters_user_id (user_id),
    INDEX idx_user_characters_equipped (user_id, is_equipped)
);

CREATE TABLE character_upgrades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_character_id UUID NOT NULL REFERENCES user_characters(id) ON DELETE CASCADE,
    upgrade_type VARCHAR(50) NOT NULL, -- POWER, MINING_RATE, SPECIAL_ABILITY
    previous_value DECIMAL(20, 8),
    new_value DECIMAL(20, 8),
    cost DECIMAL(20, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Achievements Table

```sql
CREATE TABLE achievement_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- MINING, SOCIAL, COMBAT, COLLECTION, SPECIAL
    requirement_type VARCHAR(50) NOT NULL,
    requirement_value INTEGER NOT NULL,
    reward_tokens DECIMAL(20, 8) DEFAULT 0,
    reward_xp INTEGER DEFAULT 0,
    icon_url VARCHAR(500),
    is_secret BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_achievement_templates_category (category)
);

CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievement_templates(id),
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    claimed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, achievement_id),
    INDEX idx_user_achievements_user_id (user_id),
    INDEX idx_user_achievements_completed (user_id, completed)
);
```

#### Quests Table

```sql
CREATE TABLE quest_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- DAILY, WEEKLY, SPECIAL, STORY
    requirements JSONB NOT NULL, -- Flexible requirements structure
    rewards JSONB NOT NULL, -- Flexible rewards structure
    duration_hours INTEGER, -- NULL for unlimited
    prerequisite_quest_id UUID REFERENCES quest_templates(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_quest_templates_type (type),
    INDEX idx_quest_templates_active (is_active)
);

CREATE TABLE user_quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quest_id UUID NOT NULL REFERENCES quest_templates(id),
    progress JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, COMPLETED, CLAIMED, EXPIRED
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    claimed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(user_id, quest_id),
    INDEX idx_user_quests_user_id (user_id),
    INDEX idx_user_quests_status (user_id, status)
);
```

#### Referrals Table

```sql
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referral_code VARCHAR(20) NOT NULL,
    reward_amount DECIMAL(20, 8) DEFAULT 100,
    is_rewarded BOOLEAN DEFAULT FALSE,
    rewarded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(referee_id),
    INDEX idx_referrals_referrer (referrer_id),
    INDEX idx_referrals_code (referral_code)
);
```

#### Daily Rewards Table

```sql
CREATE TABLE daily_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    streak_count INTEGER DEFAULT 1,
    last_claim_date DATE NOT NULL,
    total_claimed INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id),
    INDEX idx_daily_rewards_user (user_id)
);
```

#### Leaderboards Table

```sql
CREATE TABLE leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    leaderboard_type VARCHAR(50) NOT NULL, -- TOKENS, POWER, REFERRALS, WINS
    period VARCHAR(50) NOT NULL, -- DAILY, WEEKLY, MONTHLY, ALL_TIME
    score DECIMAL(20, 8) NOT NULL,
    rank INTEGER,
    period_start_date DATE NOT NULL,
    period_end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, leaderboard_type, period, period_start_date),
    INDEX idx_leaderboard_ranking (leaderboard_type, period, period_start_date, score DESC)
);
```

#### Airdrops Table

```sql
CREATE TABLE airdrops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    total_amount DECIMAL(20, 8) NOT NULL,
    amount_per_user DECIMAL(20, 8),
    eligibility_criteria JSONB DEFAULT '{}',
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'UPCOMING', -- UPCOMING, ACTIVE, COMPLETED, CANCELLED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_airdrops_status (status),
    INDEX idx_airdrops_dates (starts_at, ends_at)
);

CREATE TABLE airdrop_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    airdrop_id UUID NOT NULL REFERENCES airdrops(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(20, 8) NOT NULL,
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(airdrop_id, user_id),
    INDEX idx_airdrop_claims_user (user_id)
);
```

### Redis Data Structures

#### Session Storage
```
Key: session:{user_id}
Type: Hash
TTL: 7 days
Fields: jwt_token, last_activity, device_info, ip_address
```

#### Rate Limiting
```
Key: ratelimit:{user_id}:{endpoint}
Type: String (counter)
TTL: 1 minute
```

#### Leaderboard Cache
```
Key: leaderboard:{type}:{period}:{date}
Type: Sorted Set
Members: user_ids
Scores: user_scores
TTL: 5 minutes
```

#### User Online Status
```
Key: online:users
Type: Set
Members: user_ids
```

#### Mining Cooldowns
```
Key: mining:cooldown:{user_id}
Type: String (timestamp)
TTL: Based on cooldown duration
```

#### Daily Cache
```
Key: daily:stats:{date}
Type: Hash
Fields: total_users, total_transactions, total_tokens_mined
TTL: 48 hours
```

---

## API Architecture

### RESTful API Endpoints

#### Authentication Module

```
POST   /api/v1/auth/telegram          - Telegram login verification
POST   /api/v1/auth/refresh           - Refresh JWT token
POST   /api/v1/auth/logout            - Logout user
GET    /api/v1/auth/me                - Get current user info
```

#### User Module

```
GET    /api/v1/users/profile          - Get user profile
PUT    /api/v1/users/profile          - Update user profile
GET    /api/v1/users/stats            - Get user statistics
GET    /api/v1/users/referral-code    - Get referral code
GET    /api/v1/users/referrals        - Get referral list
```

#### Wallet Module

```
GET    /api/v1/wallet                 - Get wallet info
GET    /api/v1/wallet/balance         - Get current balance
GET    /api/v1/wallet/transactions    - Get transaction history
POST   /api/v1/wallet/stake           - Stake tokens
POST   /api/v1/wallet/unstake         - Unstake tokens
GET    /api/v1/wallet/staking-info    - Get staking information
```

#### Mining Module

```
POST   /api/v1/mining/tap             - Perform tap/mining action
GET    /api/v1/mining/status          - Get mining status
GET    /api/v1/mining/stats           - Get mining statistics
POST   /api/v1/mining/claim           - Claim mining rewards
```

#### Character Module

```
GET    /api/v1/characters             - Get all character templates
GET    /api/v1/characters/:id         - Get character template details
GET    /api/v1/characters/user        - Get user characters
POST   /api/v1/characters/purchase    - Purchase character
POST   /api/v1/characters/upgrade     - Upgrade character level
PUT    /api/v1/characters/equip       - Equip character
```

#### Achievement Module

```
GET    /api/v1/achievements           - Get all achievements
GET    /api/v1/achievements/user      - Get user achievements
POST   /api/v1/achievements/:id/claim - Claim achievement reward
```

#### Quest Module

```
GET    /api/v1/quests                 - Get available quests
GET    /api/v1/quests/user            - Get user quests
POST   /api/v1/quests/:id/start       - Start a quest
POST   /api/v1/quests/:id/claim       - Claim quest reward
```

#### Leaderboard Module

```
GET    /api/v1/leaderboards           - Get all leaderboards
GET    /api/v1/leaderboards/:type     - Get specific leaderboard
GET    /api/v1/leaderboards/user      - Get user rankings
```

#### Daily Rewards Module

```
GET    /api/v1/daily-rewards/status   - Get daily reward status
POST   /api/v1/daily-rewards/claim    - Claim daily reward
```

#### Airdrop Module

```
GET    /api/v1/airdrops               - Get available airdrops
GET    /api/v1/airdrops/:id           - Get airdrop details
POST   /api/v1/airdrops/:id/claim     - Claim airdrop
GET    /api/v1/airdrops/eligibility   - Check eligibility
```

### WebSocket Events

#### Client to Server Events

```typescript
// Connection
'connection'           - Initial connection
'authenticate'         - Authenticate with JWT

// Mining
'mining:tap'           - Tap action
'mining:start'         - Start mining session
'mining:stop'          - Stop mining session

// Real-time Updates
'subscribe:leaderboard' - Subscribe to leaderboard updates
'subscribe:friends'     - Subscribe to friends activity

// Battle (Optional)
'battle:join'          - Join battle queue
'battle:action'        - Perform battle action
'battle:leave'         - Leave battle
```

#### Server to Client Events

```typescript
// Authentication
'authenticated'        - Authentication success
'unauthorized'         - Authentication failed

// Mining
'mining:reward'        - Mining reward received
'mining:cooldown'      - Mining cooldown active
'mining:bonus'         - Bonus mining event

// Wallet
'wallet:update'        - Wallet balance updated
'wallet:transaction'   - New transaction

// Character
'character:levelup'    - Character leveled up
'character:unlocked'   - New character unlocked

// Achievements
'achievement:progress' - Achievement progress update
'achievement:unlocked' - Achievement unlocked

// Quests
'quest:progress'       - Quest progress update
'quest:completed'      - Quest completed

// Leaderboard
'leaderboard:update'   - Leaderboard position changed

// System
'system:maintenance'   - Maintenance notification
'system:announcement'  - Global announcement
```

### API Response Format

```typescript
// Success Response
interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

// Error Response
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

// Paginated Response
interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  timestamp: string;
}
```

---

## Frontend Architecture

### Application Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                        App Shell                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Navigation Bar                          │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │                    Main Content                           │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │              Page Components                         │  │  │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │  │  │
│  │  │  │  Home   │ │Character│ │  Wallet │ │ Settings│   │  │  │
│  │  │  │  Page   │ │  Page   │ │  Page   │ │  Page   │   │  │  │
│  │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Bottom Navigation                       │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### State Management Architecture

```typescript
// Store Structure using Zustand
interface AppStore {
  // User State
  user: User | null;
  isAuthenticated: boolean;
  
  // Wallet State
  wallet: WalletState;
  
  // Game State
  characters: Character[];
  activeCharacter: Character | null;
  achievements: Achievement[];
  quests: Quest[];
  
  // UI State
  isLoading: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
  
  // Actions
  actions: {
    setUser: (user: User) => void;
    logout: () => void;
    updateWallet: (wallet: Partial<WalletState>) => void;
    addCharacter: (character: Character) => void;
    // ... more actions
  };
}

// Persisted Storage
interface PersistedState {
  user: User | null;
  theme: 'light' | 'dark';
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  lastSync: string;
}
```

### Component Hierarchy

```
src/
├── components/
│   ├── common/
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Modal/
│   │   ├── Loading/
│   │   ├── Toast/
│   │   └── Avatar/
│   │
│   ├── layout/
│   │   ├── AppShell/
│   │   ├── NavigationBar/
│   │   ├── BottomNav/
│   │   └── Sidebar/
│   │
│   ├── features/
│   │   ├── mining/
│   │   │   ├── TapButton/
│   │   │   ├── MiningStats/
│   │   │   └── MiningAnimation/
│   │   │
│   │   ├── character/
│   │   │   ├── CharacterCard/
│   │   │   ├── CharacterList/
│   │   │   ├── UpgradeModal/
│   │   │   └── CharacterPreview/
│   │   │
│   │   ├── wallet/
│   │   │   ├── BalanceCard/
│   │   │   ├── TransactionList/
│   │   │   ├── StakingPanel/
│   │   │   └── TransferModal/
│   │   │
│   │   ├── achievements/
│   │   │   ├── AchievementCard/
│   │   │   ├── AchievementGrid/
│   │   │   └── AchievementProgress/
│   │   │
│   │   └── leaderboard/
│   │       ├── LeaderboardTable/
│   │       ├── RankBadge/
│   │       └── UserRank/
│   │
│   └── telegram/
│       ├── BackButton/
│       ├── MainButton/
│       ├── HapticFeedback/
│       └── ThemeWrapper/
│
├── hooks/
│   ├── useTelegram.ts
│   ├── useAuth.ts
│   ├── useWallet.ts
│   ├── useMining.ts
│   ├── useWebSocket.ts
│   └── useHaptic.ts
│
├── services/
│   ├── api/
│   │   ├── auth.api.ts
│   │   ├── wallet.api.ts
│   │   ├── character.api.ts
│   │   └── mining.api.ts
│   │
│   ├── websocket/
│   │   └── socket.service.ts
│   │
│   └── storage/
│       ├── local.storage.ts
│       └── session.storage.ts
│
└── utils/
    ├── telegram.ts
    ├── formatting.ts
    ├── validation.ts
    └── constants.ts
```

### Telegram Mini App Integration

```typescript
// Telegram SDK Integration Service
class TelegramService {
  private webApp: WebApp;
  
  constructor() {
    this.webApp = window.Telegram.WebApp;
    this.initialize();
  }
  
  private initialize(): void {
    // Ready signal
    this.webApp.ready();
    
    // Enable closing confirmation
    this.webApp.enableClosingConfirmation();
    
    // Expand to full height
    this.webApp.expand();
    
    // Apply Telegram theme
    this.applyTheme();
  }
  
  // Authentication
  getInitData(): string {
    return this.webApp.initData;
  }
  
  getUser(): TelegramUser | null {
    return this.webApp.initDataUnsafe.user;
  }
  
  // Haptic Feedback
  haptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'): void {
    switch (type) {
      case 'light':
      case 'medium':
      case 'heavy':
        this.webApp.HapticFeedback.impactOccurred(type);
        break;
      case 'success':
      case 'warning':
      case 'error':
        this.webApp.HapticFeedback.notificationOccurred(type);
        break;
    }
  }
  
  // Main Button
  showMainButton(text: string, onClick: () => void): void {
    this.webApp.MainButton.setText(text);
    this.webApp.MainButton.onClick(onClick);
    this.webApp.MainButton.show();
  }
  
  // Back Button
  showBackButton(onClick: () => void): void {
    this.webApp.BackButton.onClick(onClick);
    this.webApp.BackButton.show();
  }
  
  // Theme
  private applyTheme(): void {
    const theme = this.webApp.themeParams;
    document.documentElement.style.setProperty('--tg-bg-color', theme.bg_color);
    document.documentElement.style.setProperty('--tg-text-color', theme.text_color);
    document.documentElement.style.setProperty('--tg-button-color', theme.button_color);
    document.documentElement.style.setProperty('--tg-button-text-color', theme.button_text_color);
  }
}
```

---

## Crypto Features Architecture

### Token Economy Model

```
┌─────────────────────────────────────────────────────────────────┐
│                     TOKEN ECONOMY FLOW                           │
│                                                                   │
│  ┌─────────────┐     Mining      ┌─────────────┐                │
│  │   Users     │ ───────────────▶│   Tokens    │                │
│  │  Tapping    │                 │   Minted    │                │
│  └─────────────┘                 └──────┬──────┘                │
│         │                               │                        │
│         │                               ▼                        │
│         │                        ┌─────────────┐                │
│         │                        │   Wallet    │                │
│         │                        │   Balance   │                │
│         │                        └──────┬──────┘                │
│         │                               │                        │
│         │          ┌────────────────────┼────────────────────┐  │
│         │          │                    │                    │  │
│         │          ▼                    ▼                    ▼  │
│         │   ┌─────────────┐     ┌─────────────┐     ┌─────────┐│
│         │   │   Staking   │     │  Character  │     │ Airdrop ││
│         │   │   Rewards   │     │  Upgrades   │     │ Claims  ││
│         │   └─────────────┘     └─────────────┘     └─────────┘│
│         │                                                     │
│         │                                                     │
│         ▼                                                     │
│  ┌─────────────┐                                             │
│  │  Referral   │                                             │
│  │   Bonus     │                                             │
│  └─────────────┘                                             │
│                                                               │
└─────────────────────────────────────────────────────────────────┘
```

### Mining/Tapping System

```typescript
// Mining Configuration
interface MiningConfig {
  baseRate: number;           // Base tokens per tap
  energyCost: number;         // Energy cost per tap
  maxEnergy: number;          // Maximum energy capacity
  energyRegenRate: number;    // Energy regeneration per second
  comboMultiplier: number;    // Combo multiplier for consecutive taps
  comboTimeout: number;       // Time window for combo (ms)
  criticalChance: number;     // Critical hit chance (0-1)
  criticalMultiplier: number; // Critical hit multiplier
}

// Mining Service Logic
class MiningService {
  async processTap(userId: string): Promise<MiningResult> {
    // 1. Check cooldown/energy
    // 2. Calculate rewards based on:
    //    - Character bonuses
    //    - Combo multiplier
    //    - Critical hit chance
    //    - Active boosts
    // 3. Update user balance
    // 4. Record transaction
    // 5. Emit real-time update
    // 6. Return result with animation data
  }
  
  calculateReward(user: User, character: Character): number {
    const baseReward = this.config.baseRate;
    const characterBonus = character.miningRate;
    const levelBonus = 1 + (character.level * 0.1);
    const comboBonus = this.getComboMultiplier(user.id);
    
    let reward = baseReward * characterBonus * levelBonus * comboBonus;
    
    // Critical hit check
    if (Math.random() < this.config.criticalChance) {
      reward *= this.config.criticalMultiplier;
    }
    
    return reward;
  }
}
```

### Staking Mechanism

```typescript
// Staking Configuration
interface StakingConfig {
  minimumStake: number;
  maximumStake: number;
  lockPeriods: {
    FLEXIBLE: { days: 0; apy: number };
    THIRTY_DAYS: { days: 30; apy: number };
    NINETY_DAYS: { days: 90; apy: number };
    ONE_EIGHTY_DAYS: { days: 180; apy: number };
  };
  earlyWithdrawalPenalty: number; // Percentage
}

// Staking Service
class StakingService {
  async stake(userId: string, amount: number, lockPeriod: string): Promise<StakingResult> {
    // 1. Validate user balance
    // 2. Create staking record
    // 3. Lock tokens
    // 4. Schedule reward distribution
    // 5. Return staking details
  }
  
  async calculateRewards(stake: Stake): Promise<number> {
    const duration = Date.now() - stake.startedAt.getTime();
    const apy = this.config.lockPeriods[stake.lockPeriod].apy;
    const dailyRate = apy / 365;
    const daysStaked = duration / (1000 * 60 * 60 * 24);
    
    return stake.amount * dailyRate * daysStaked;
  }
  
  async distributeRewards(): Promise<void> {
    // Cron job to distribute staking rewards
    // Runs every hour
  }
}
```

### Referral System

```typescript
// Referral Configuration
interface ReferralConfig {
  referrerReward: number;     // Tokens for referrer
  refereeReward: number;      // Tokens for new user
  bonusThresholds: {
    referrals: number;
    bonus: number;
  }[];
  maxReferrals: number;       // Maximum tracked referrals
}

// Referral Service
class ReferralService {
  generateReferralCode(userId: string): string {
    // Generate unique, short, readable code
    return `REF-${userId.slice(0, 8).toUpperCase()}`;
  }
  
  async processReferral(referrerId: string, refereeId: string): Promise<void> {
    // 1. Validate referral (new user only)
    // 2. Create referral record
    // 3. Credit both parties
    // 4. Check for bonus thresholds
    // 5. Emit notifications
  }
  
  async checkBonusThresholds(userId: string): Promise<void> {
    const referralCount = await this.getReferralCount(userId);
    const thresholds = this.config.bonusThresholds;
    
    for (const threshold of thresholds) {
      if (referralCount >= threshold.referrals) {
        await this.awardBonus(userId, threshold.bonus);
      }
    }
  }
}
```

### Airdrop System

```typescript
// Airdrop Configuration
interface AirdropConfig {
  maxParticipants: number;
  eligibilityCriteria: {
    minAccountAge: number;     // Days
    minTransactions: number;
    minLevel: number;
    requiredAchievements: string[];
  };
  distributionMethod: 'EQUAL' | 'PROPORTIONAL' | 'LOTTERY';
}

// Airdrop Service
class AirdropService {
  async checkEligibility(userId: string, airdropId: string): Promise<EligibilityResult> {
    const user = await this.getUser(userId);
    const airdrop = await this.getAirdrop(airdropId);
    
    const criteria = airdrop.eligibilityCriteria;
    
    return {
      isEligible: true,
      checks: {
        accountAge: user.accountAge >= criteria.minAccountAge,
        transactions: user.transactionCount >= criteria.minTransactions,
        level: user.level >= criteria.minLevel,
        achievements: this.hasRequiredAchievements(user, criteria.requiredAchievements)
      }
    };
  }
  
  async distributeAirdrop(airdropId: string): Promise<void> {
    // 1. Get all eligible users
    // 2. Calculate distribution amounts
    // 3. Create transactions
    // 4. Send notifications
    // 5. Update airdrop status
  }
}
```

---

## Gamification System

### Character System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CHARACTER SYSTEM                              │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   Character Template                      │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │  Base Stats:                                     │    │    │
│  │  │  - Power: 100-1000                               │    │    │
│  │  │  - Mining Rate: 1.0x - 5.0x                      │    │    │
│  │  │  - Special Ability: Unique per character         │    │    │
│  │  │  - Rarity: Common → Rare → Epic → Legendary      │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   User Character                         │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │  Instance Stats:                                 │    │    │
│  │  │  - Level: 1-50                                   │    │    │
│  │  │  - Experience: 0-10000                           │    │    │
│  │  │  - Current Power: Base * Level Multiplier        │    │    │
│  │  │  - Upgrades: Applied modifications               │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   Upgrade System                         │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │  Upgrade Types:                                  │    │    │
│  │  │  - Level Up: Increase base stats                 │    │    │
│  │  │  - Power Boost: Temporary/Permanent power boost  │    │    │
│  │  │  - Mining Boost: Increase mining rate            │    │    │
│  │  │  - Special Ability: Unlock/upgrade abilities     │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Achievement System

```typescript
// Achievement Categories
enum AchievementCategory {
  MINING = 'MINING',           // Mining-related achievements
  SOCIAL = 'SOCIAL',           // Referrals, friends
  COMBAT = 'COMBAT',           // Battle achievements
  COLLECTION = 'COLLECTION',   // Character collection
  SPECIAL = 'SPECIAL'          // Special/hidden achievements
}

// Achievement Types
interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  requirement: {
    type: 'COUNT' | 'STREAK' | 'THRESHOLD' | 'COLLECTION';
    target: number;
    metadata?: Record<string, unknown>;
  };
  rewards: {
    tokens: number;
    xp: number;
    special?: string;
  };
  tiers?: {
    bronze: AchievementTier;
    silver: AchievementTier;
    gold: AchievementTier;
  };
}

// Example Achievements
const achievements: AchievementDefinition[] = [
  {
    id: 'first_tap',
    name: 'First Steps',
    description: 'Perform your first tap',
    category: AchievementCategory.MINING,
    requirement: { type: 'COUNT', target: 1 },
    rewards: { tokens: 10, xp: 5 }
  },
  {
    id: 'mining_master',
    name: 'Mining Master',
    description: 'Mine 1,000,000 tokens total',
    category: AchievementCategory.MINING,
    requirement: { type: 'THRESHOLD', target: 1000000 },
    rewards: { tokens: 10000, xp: 500 }
  },
  {
    id: 'referral_king',
    name: 'Referral King',
    description: 'Invite 100 friends',
    category: AchievementCategory.SOCIAL,
    requirement: { type: 'COUNT', target: 100 },
    rewards: { tokens: 50000, xp: 1000 }
  }
];
```

### Quest System

```typescript
// Quest Types
enum QuestType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  SPECIAL = 'SPECIAL',
  STORY = 'STORY'
}

// Quest Definition
interface QuestDefinition {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  duration: number | null; // Hours, null for unlimited
  requirements: QuestRequirement[];
  rewards: QuestReward[];
  prerequisites?: string[]; // Quest IDs
}

interface QuestRequirement {
  type: 'TAP' | 'MINE' | 'REFER' | 'LEVEL_UP' | 'UPGRADE' | 'WIN_BATTLE';
  count: number;
  metadata?: Record<string, unknown>;
}

interface QuestReward {
  type: 'TOKENS' | 'XP' | 'CHARACTER' | 'ITEM';
  amount: number;
  itemId?: string;
}

// Example Quests
const quests: QuestDefinition[] = [
  {
    id: 'daily_tapper',
    name: 'Daily Tapper',
    description: 'Perform 100 taps today',
    type: QuestType.DAILY,
    duration: 24,
    requirements: [
      { type: 'TAP', count: 100 }
    ],
    rewards: [
      { type: 'TOKENS', amount: 500 },
      { type: 'XP', amount: 50 }
    ]
  },
  {
    id: 'weekly_miner',
    name: 'Weekly Mining Spree',
    description: 'Mine 50,000 tokens this week',
    type: QuestType.WEEKLY,
    duration: 168,
    requirements: [
      { type: 'MINE', count: 50000 }
    ],
    rewards: [
      { type: 'TOKENS', amount: 5000 },
      { type: 'XP', amount: 200 }
    ]
  }
];
```

### Leaderboard System

```typescript
// Leaderboard Types
enum LeaderboardType {
  TOKENS = 'TOKENS',           // Total tokens earned
  POWER = 'POWER',             // Total character power
  REFERRALS = 'REFERRALS',     // Total referrals
  WINS = 'WINS',               // Battle wins
  STREAK = 'STREAK'            // Daily login streak
}

// Leaderboard Period
enum LeaderboardPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  ALL_TIME = 'ALL_TIME'
}

// Leaderboard Service
class LeaderboardService {
  async updateLeaderboard(
    userId: string,
    type: LeaderboardType,
    score: number
  ): Promise<void> {
    // Update Redis sorted set
    // Update PostgreSQL for persistence
    // Emit WebSocket update if rank changed significantly
  }
  
  async getLeaderboard(
    type: LeaderboardType,
    period: LeaderboardPeriod,
    limit: number = 100
  ): Promise<LeaderboardEntry[]> {
    // Check Redis cache first
    // Fall back to PostgreSQL
    // Include user rank context
  }
  
  async getUserRank(
    userId: string,
    type: LeaderboardType,
    period: LeaderboardPeriod
  ): Promise<number> {
    // Get user's rank from Redis sorted set
  }
}
```

### Daily Rewards System

```typescript
// Daily Reward Configuration
interface DailyRewardConfig {
  baseReward: number;
  streakMultipliers: {
    1: 1.0,
    7: 1.5,
    14: 2.0,
    30: 3.0,
    60: 5.0,
    90: 7.0
  };
  bonusDays: number[]; // Days with special bonuses
  maxStreak: number;
}

// Daily Reward Service
class DailyRewardService {
  async claimDailyReward(userId: string): Promise<DailyRewardResult> {
    const currentStreak = await this.getCurrentStreak(userId);
    const lastClaim = await this.getLastClaim(userId);
    
    // Check if already claimed today
    if (this.isSameDay(lastClaim, new Date())) {
      throw new Error('Already claimed today');
    }
    
    // Calculate new streak
    const newStreak = this.calculateNewStreak(lastClaim, currentStreak);
    
    // Calculate reward
    const multiplier = this.getStreakMultiplier(newStreak);
    const baseReward = this.config.baseReward;
    const finalReward = baseReward * multiplier;
    
    // Update streak and credit reward
    await this.updateStreak(userId, newStreak);
    await this.creditReward(userId, finalReward);
    
    return {
      reward: finalReward,
      streak: newStreak,
      multiplier,
      nextReward: baseReward * this.getStreakMultiplier(newStreak + 1)
    };
  }
  
  private calculateNewStreak(lastClaim: Date, currentStreak: number): number {
    const hoursSinceLastClaim = this.getHoursSince(lastClaim);
    
    if (hoursSinceLastClaim > 48) {
      // Streak broken
      return 1;
    } else if (hoursSinceLastClaim > 24) {
      // Still within grace period
      return currentStreak + 1;
    }
    
    return currentStreak + 1;
  }
}
```

---

## Security Considerations

### Authentication Security

```
┌─────────────────────────────────────────────────────────────────┐
│                  AUTHENTICATION FLOW                             │
│                                                                   │
│  ┌─────────────┐                         ┌─────────────────┐   │
│  │   Telegram  │   1. Init Data          │   API Server    │   │
│  │   Client    │ ───────────────────────▶│                 │   │
│  └─────────────┘                         │  2. Verify Hash │   │
│                                          │     with Bot    │   │
│                                          │     Token       │   │
│                                          │                 │   │
│                                          │  3. Validate    │   │
│                                          │     Auth Date   │   │
│                                          │     (24h max)   │   │
│                                          │                 │   │
│                                          │  4. Generate    │   │
│                                          │     JWT Token   │   │
│                                          │                 │   │
│  ┌─────────────┐   5. JWT Token          │                 │   │
│  │   Client    │ ◀───────────────────────│                 │   │
│  │   Storage   │                         └─────────────────┘   │
│  └─────────────┘                                                │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Security Measures

#### 1. Telegram Authentication Verification

```typescript
class TelegramAuthService {
  async verifyInitData(initData: string): Promise<TelegramUser> {
    // Parse init data
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    params.delete('hash');
    
    // Sort and create data check string
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    // Create secret key
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(process.env.TELEGRAM_BOT_TOKEN)
      .digest();
    
    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    // Verify hash
    if (calculatedHash !== hash) {
      throw new Error('Invalid init data');
    }
    
    // Check auth_date (must be within 24 hours)
    const authDate = parseInt(params.get('auth_date') || '0');
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime - authDate > 86400) {
      throw new Error('Init data expired');
    }
    
    return JSON.parse(params.get('user') || '{}');
  }
}
```

#### 2. Rate Limiting Strategy

```typescript
// Rate Limit Configuration
const rateLimitConfig = {
  // Global limits
  global: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000 // requests per window
  },
  
  // Per-endpoint limits
  endpoints: {
    'POST /api/v1/mining/tap': {
      windowMs: 1000, // 1 second
      max: 10 // taps per second
    },
    'POST /api/v1/wallet/stake': {
      windowMs: 60 * 1000, // 1 minute
      max: 5 // requests per minute
    },
    'POST /api/v1/auth/telegram': {
      windowMs: 60 * 1000, // 1 minute
      max: 10 // attempts per minute
    }
  },
  
  // Progressive delays for repeated violations
  progressive: {
    enabled: true,
    baseDelay: 1000, // 1 second
    maxDelay: 60000, // 1 minute
    multiplier: 2
  }
};
```

#### 3. Input Validation

```typescript
// DTO Validation Examples
import { IsString, IsNumber, IsOptional, Min, Max, IsUUID, IsEnum } from 'class-validator';

class TapRequestDto {
  @IsNumber()
  @Min(1)
  @Max(100)
  tapCount: number;
  
  @IsOptional()
  @IsString()
  sessionId?: string;
}

class StakeRequestDto {
  @IsNumber()
  @Min(100) // Minimum stake
  amount: number;
  
  @IsEnum(['FLEXIBLE', 'THIRTY_DAYS', 'NINETY_DAYS', 'ONE_EIGHTY_DAYS'])
  lockPeriod: string;
}

class CharacterUpgradeDto {
  @IsUUID()
  characterId: string;
  
  @IsEnum(['POWER', 'MINING_RATE', 'SPECIAL_ABILITY'])
  upgradeType: string;
  
  @IsNumber()
  @Min(1)
  @Max(10)
  levels: number;
}
```

#### 4. Anti-Cheating Measures

```typescript
class AntiCheatService {
  // Detect suspicious patterns
  async analyzeUserBehavior(userId: string): Promise<RiskScore> {
    const signals = await Promise.all([
      this.checkTapFrequency(userId),
      this.checkSessionPatterns(userId),
      this.checkDeviceFingerprint(userId),
      this.checkReferralPatterns(userId),
      this.checkTransactionPatterns(userId)
    ]);
    
    return this.calculateRiskScore(signals);
  }
  
  private async checkTapFrequency(userId: string): Promise<Signal> {
    const taps = await this.getRecentTaps(userId, { minutes: 5 });
    const avgInterval = this.calculateAverageInterval(taps);
    
    // Suspicious if too regular (bot-like)
    const variance = this.calculateIntervalVariance(taps);
    
    return {
      type: 'TAP_FREQUENCY',
      risk: variance < 10 ? 'HIGH' : 'LOW',
      details: { avgInterval, variance }
    };
  }
  
  // Apply restrictions based on risk
  async applyRestrictions(userId: string, riskScore: RiskScore): Promise<void> {
    if (riskScore.score > 80) {
      // High risk - temporary ban
      await this.temporaryBan(userId, { hours: 24 });
    } else if (riskScore.score > 50) {
      // Medium risk - reduce rewards
      await this.applyRewardPenalty(userId, 0.5);
    } else if (riskScore.score > 30) {
      // Low risk - flag for review
      await this.flagForReview(userId);
    }
  }
}
```

#### 5. Data Encryption

```typescript
// Sensitive Data Encryption
class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private key: Buffer;
  
  constructor() {
    this.key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  }
  
  encrypt(text: string): EncryptedData {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }
  
  decrypt(data: EncryptedData): string {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(data.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(data.authTag, 'hex'));
    
    let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

### Security Headers

```typescript
// Security Headers Configuration
const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://telegram.org; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' wss: https:;",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};
```

---

## Deployment Architecture

### Infrastructure Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRODUCTION ENVIRONMENT                             │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                          CDN - CloudFlare                            │    │
│  │                    - Static Assets Delivery                          │    │
│  │                    - DDoS Protection                                 │    │
│  │                    - SSL/TLS Termination                             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Load Balancer - Nginx                           │    │
│  │                    - SSL Termination                                 │    │
│  │                    - Request Routing                                 │    │
│  │                    - Rate Limiting                                   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                        │
│            ┌─────────────────────────┼─────────────────────────┐            │
│            │                         │                         │            │
│            ▼                         ▼                         ▼            │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐       │
│  │   API Server    │     │ WebSocket Server│     │  Worker Nodes   │       │
│  │   (Pod 1-N)     │     │   (Pod 1-N)     │     │   (Pod 1-N)     │       │
│  │                 │     │                 │     │                 │       │
│  │  - NestJS       │     │  - Socket.io    │     │  - BullMQ       │       │
│  │  - REST API     │     │  - Real-time    │     │  - Cron Jobs    │       │
│  │                 │     │                 │     │  - Background   │       │
│  └────────┬────────┘     └────────┬────────┘     └────────┬────────┘       │
│           │                       │                       │                 │
│           └───────────────────────┼───────────────────────┘                 │
│                                   │                                          │
│            ┌──────────────────────┼──────────────────────┐                  │
│            │                      │                      │                  │
│            ▼                      ▼                      ▼                  │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐          │
│  │   PostgreSQL    │   │     Redis       │   │   Monitoring    │          │
│  │   (Primary +    │   │   (Cluster)     │   │   Stack         │          │
│  │    Replicas)    │   │                 │   │                 │          │
│  │                 │   │  - Cache        │   │  - Prometheus   │          │
│  │  - Users        │   │  - Sessions     │   │  - Grafana      │          │
│  │  - Wallets      │   │  - Queues       │   │  - Sentry       │          │
│  │  - Game Data    │   │  - Leaderboards │   │  - Logs         │          │
│  └─────────────────┘   └─────────────────┘   └─────────────────┘          │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Kubernetes Deployment

```yaml
# API Server Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-server
  namespace: crypto-mini-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-server
  template:
    metadata:
      labels:
        app: api-server
    spec:
      containers:
        - name: api
          image: crypto-mini-app/api:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: production
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: database-url
            - name: REDIS_URL
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: redis-url
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
---
# Horizontal Pod Autoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-server-hpa
  namespace: crypto-mini-app
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-server
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

### CI/CD Pipeline

```yaml
# GitHub Actions Workflow
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Run linting
        run: npm run lint
      
      - name: Build
        run: npm run build

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          push: true
          tags: ${{ secrets.REGISTRY }}/crypto-mini-app:${{ github.sha }}
      
      - name: Update Kubernetes deployment
        run: |
          kubectl set image deployment/api-server \
            api=${{ secrets.REGISTRY }}/crypto-mini-app:${{ github.sha }} \
            -n crypto-mini-app
```

### Environment Configuration

```typescript
// Environment Variables
interface EnvironmentConfig {
  // Application
  NODE_ENV: 'development' | 'staging' | 'production';
  PORT: number;
  API_VERSION: string;
  
  // Telegram
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_WEB_APP_URL: string;
  
  // Database
  DATABASE_URL: string;
  DATABASE_POOL_SIZE: number;
  DATABASE_SSL: boolean;
  
  // Redis
  REDIS_URL: string;
  REDIS_CLUSTER_ENABLED: boolean;
  
  // JWT
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  
  // Encryption
  ENCRYPTION_KEY: string;
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  
  // Monitoring
  SENTRY_DSN: string;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  
  // Features
  FEATURES_BATTLE_ARENA: boolean;
  FEATURES_NFT_INTEGRATION: boolean;
}
```

---

## Project Structure

### Monorepo Structure

```
crypto-mini-app/
├── apps/
│   ├── frontend/                    # Telegram Mini App
│   │   ├── src/
│   │   │   ├── app/                 # Next.js app directory
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── characters/
│   │   │   │   ├── wallet/
│   │   │   │   ├── quests/
│   │   │   │   └── leaderboard/
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── common/
│   │   │   │   ├── features/
│   │   │   │   ├── layout/
│   │   │   │   └── telegram/
│   │   │   │
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── stores/
│   │   │   ├── utils/
│   │   │   └── types/
│   │   │
│   │   ├── public/
│   │   │   ├── icons/
│   │   │   ├── images/
│   │   │   └── sounds/
│   │   │
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── api/                         # Backend API
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   │
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── auth.module.ts
│   │   │   │   │   ├── strategies/
│   │   │   │   │   └── dto/
│   │   │   │   │
│   │   │   │   ├── users/
│   │   │   │   ├── wallet/
│   │   │   │   ├── mining/
│   │   │   │   ├── characters/
│   │   │   │   ├── achievements/
│   │   │   │   ├── quests/
│   │   │   │   ├── leaderboard/
│   │   │   │   ├── referrals/
│   │   │   │   ├── airdrops/
│   │   │   │   └── daily-rewards/
│   │   │   │
│   │   │   ├── common/
│   │   │   │   ├── decorators/
│   │   │   │   ├── filters/
│   │   │   │   ├── guards/
│   │   │   │   ├── interceptors/
│   │   │   │   ├── middleware/
│   │   │   │   └── pipes/
│   │   │   │
│   │   │   ├── config/
│   │   │   ├── database/
│   │   │   │   ├── migrations/
│   │   │   │   ├── seeds/
│   │   │   │   └── data-source.ts
│   │   │   │
│   │   │   ├── entities/
│   │   │   ├── events/
│   │   │   └── workers/
│   │   │
│   │   ├── nest-cli.json
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── websocket/                   # WebSocket Server
│       ├── src/
│       │   ├── gateway/
│       │   ├── handlers/
│       │   ├── rooms/
│       │   └── events/
│       │
│       └── package.json
│
├── packages/
│   ├── shared/                      # Shared code
│   │   ├── src/
│   │   │   ├── types/
│   │   │   ├── constants/
│   │   │   ├── utils/
│   │   │   └── validators/
│   │   │
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── database/                    # Database package
│   │   ├── src/
│   │   │   ├── schema/
│   │   │   ├── repositories/
│   │   │   └── index.ts
│   │   │
│   │   └── package.json
│   │
│   └── config/                      # Configuration package
│       ├── src/
│       │   ├── app.config.ts
│       │   ├── database.config.ts
│       │   └── redis.config.ts
│       │
│       └── package.json
│
├── infrastructure/
│   ├── docker/
│   │   ├── Dockerfile.api
│   │   ├── Dockerfile.frontend
│   │   └── docker-compose.yml
│   │
│   ├── kubernetes/
│   │   ├── base/
│   │   │   ├── deployment.yaml
│   │   │   ├── service.yaml
│   │   │   └── configmap.yaml
│   │   │
│   │   └── overlays/
│   │       ├── development/
│   │       ├── staging/
│   │       └── production/
│   │
│   └── terraform/
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
│
├── scripts/
│   ├── setup.sh
│   ├── seed-data.ts
│   └── deploy.sh
│
├── docs/
│   ├── api/
│   │   └── openapi.yaml
│   │
│   ├── architecture/
│   │   └── diagrams/
│   │
│   └── guides/
│       ├── development.md
│       ├── deployment.md
│       └── contributing.md
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   └── deploy.yml
│   │
│   └── ISSUE_TEMPLATE/
│
├── turbo.json                       # Turborepo config
├── package.json                     # Root package.json
├── pnpm-workspace.yaml             # pnpm workspace config
├── .eslintrc.js
├── .prettierrc
├── .gitignore
└── README.md
```

---

## Scalability Strategy

### Horizontal Scaling

```
┌─────────────────────────────────────────────────────────────────┐
│                    SCALING ARCHITECTURE                          │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Load Balancer                         │    │
│  │              (Round Robin / Least Conn)                  │    │
│  └───────────────────────────┬─────────────────────────────┘    │
│                              │                                   │
│         ┌────────────────────┼────────────────────┐             │
│         │                    │                    │             │
│         ▼                    ▼                    ▼             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐       │
│  │   Node 1    │     │   Node 2    │     │   Node N    │       │
│  │   API       │     │   API       │     │   API       │       │
│  └─────────────┘     └─────────────┘     └─────────────┘       │
│                                                                   │
│  Auto-scaling Triggers:                                          │
│  - CPU > 70% for 2 minutes → Scale Up                           │
│  - Memory > 80% for 2 minutes → Scale Up                        │
│  - Request Queue > 100 → Scale Up                               │
│  - CPU < 30% for 10 minutes → Scale Down                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Database Scaling Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                  DATABASE SCALING                                │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   Primary Database                       │    │
│  │                    (Write Operations)                     │    │
│  └───────────────────────────┬─────────────────────────────┘    │
│                              │                                   │
│              ┌───────────────┼───────────────┐                  │
│              │               │               │                  │
│              ▼               ▼               ▼                  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   Read Replica  │ │   Read Replica  │ │   Read Replica  │   │
│  │       1         │ │       2         │ │       N         │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│                                                                   │
│  Sharding Strategy (Future):                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Shard by User ID:                                       │    │
│  │  - Shard 1: Users 00000000-3fffffff                      │    │
│  │  - Shard 2: Users 40000000-7fffffff                      │    │
│  │  - Shard 3: Users 80000000-bfffffff                      │    │
│  │  - Shard 4: Users cfffffff-ffffffff                      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Caching Strategy

```typescript
// Cache Layers
interface CacheStrategy {
  // Layer 1: In-Memory Cache (Fastest)
  memory: {
    ttl: 60, // seconds
    maxSize: 1000, // items
    useCases: [
      'User session data',
      'Frequently accessed user profile',
      'Active mining session'
    ]
  };
  
  // Layer 2: Redis Cache (Fast)
  redis: {
    ttl: 300, // seconds
    useCases: [
      'Leaderboard data',
      'User wallet balance',
      'Character templates',
      'Achievement definitions',
      'Quest templates'
    ]
  };
  
  // Layer 3: CDN Cache (Global)
  cdn: {
    ttl: 3600, // seconds
    useCases: [
      'Static assets',
      'Character images',
      'Achievement icons',
      'API responses for public data'
    ]
  };
}

// Cache Invalidation Strategy
class CacheInvalidationService {
  // Event-driven invalidation
  @OnEvent('wallet.updated')
  async invalidateWalletCache(userId: string): Promise<void> {
    await this.redis.del(`wallet:${userId}`);
    await this.redis.del(`leaderboard:tokens:*`);
  }
  
  @OnEvent('character.upgraded')
  async invalidateCharacterCache(userId: string): Promise<void> {
    await this.redis.del(`characters:${userId}`);
    await this.redis.del(`leaderboard:power:*`);
  }
}
```

### Performance Optimization

```typescript
// Database Query Optimization
class OptimizedQueries {
  // Use indexes effectively
  async getUserWithWallet(userId: string): Promise<UserWithWallet> {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.wallet', 'wallet')
      .where('user.id = :userId', { userId })
      .cache(`user:wallet:${userId}`, 300000) // 5 minutes
      .getOne();
  }
  
  // Batch operations
  async batchUpdateLeaderboard(entries: LeaderboardEntry[]): Promise<void> {
    await this.leaderboardRepository
      .createQueryBuilder()
      .insert()
      .values(entries)
      .onConflict('(user_id, leaderboard_type, period, period_start_date) DO UPDATE SET score = EXCLUDED.score')
      .execute();
  }
  
  // Pagination with cursor
  async getTransactionsCursor(
    walletId: string,
    cursor: string | null,
    limit: number
  ): Promise<PaginatedResult<Transaction>> {
    const query = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.walletId = :walletId', { walletId })
      .orderBy('transaction.createdAt', 'DESC')
      .take(limit + 1);
    
    if (cursor) {
      query.andWhere('transaction.createdAt < :cursor', { cursor });
    }
    
    const results = await query.getMany();
    return this.toCursorPaginatedResult(results, limit);
  }
}
```

---

## Appendix

### A. Technology Decision Matrix

| Decision | Options Considered | Chosen | Reasoning |
|----------|-------------------|--------|-----------|
| Frontend Framework | React, Vue, Svelte | React | Largest ecosystem, best for Mini Apps |
| Backend Framework | Express, NestJS, Fastify | NestJS | Built-in DI, modular, TypeScript-first |
| Database | MySQL, PostgreSQL, MongoDB | PostgreSQL | ACID, JSON support, proven reliability |
| Cache | Redis, Memcached | Redis | More features, pub/sub, sorted sets |
| State Management | Redux, Zustand, Jotai | Zustand | Lightweight, minimal boilerplate |
| ORM | TypeORM, Prisma, MikroORM | Prisma | Type-safe, great DX, migrations |

### B. Performance Benchmarks (Target)

| Metric | Target | Notes |
|--------|--------|-------|
| API Response Time | < 100ms | P95 latency |
| WebSocket Latency | < 50ms | Message delivery |
| Time to Interactive | < 3s | Initial load |
| Database Query Time | < 50ms | Average query |
| Cache Hit Rate | > 90% | For hot data |

### C. Monitoring Metrics

```yaml
# Key Metrics to Monitor
metrics:
  application:
    - request_rate
    - error_rate
    - response_time_p50
    - response_time_p95
    - response_time_p99
  
  business:
    - daily_active_users
    - total_transactions
    - tokens_mined_24h
    - new_users_24h
    - retention_rate_d1
    - retention_rate_d7
  
  infrastructure:
    - cpu_utilization
    - memory_utilization
    - disk_io
    - network_io
    - database_connections
    - redis_memory
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-15 | Architecture Team | Initial architecture design |

---

*This document serves as the foundation for the Crypto Telegram Mini App development. All implementation decisions should reference this architecture document for consistency and maintainability.*
