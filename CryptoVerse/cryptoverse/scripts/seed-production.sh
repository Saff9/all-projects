#!/bin/bash

# ==========================================
# CryptoVerse Production Seeding Script
# ==========================================
# This script seeds the production database with initial data
# including character templates, achievement templates, and quest templates
#
# Usage: ./seed-production.sh [environment]
# Example: ./seed-production.sh production
# ==========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENVIRONMENT="${1:-staging}"

# ==========================================
# Helper Functions
# ==========================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_banner() {
    echo ""
    echo "=========================================="
    echo "  CryptoVerse Production Seeding Script"
    echo "=========================================="
    echo ""
}

confirm_seeding() {
    log_warning "You are about to seed the ${ENVIRONMENT} database."
    log_warning "This action will add initial data to the database."
    echo ""
    read -p "Are you sure you want to continue? (y/N) " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Seeding cancelled."
        exit 0
    fi
}

# ==========================================
# Seeding Functions
# ==========================================

seed_character_templates() {
    log_info "Seeding character templates..."
    
    # Character templates data
    cat <<EOF | kubectl exec -i deployment/cryptoverse-api -n cryptoverse -- npx prisma db execute --stdin
-- Character Templates
INSERT INTO character_templates (id, name, description, base_power, base_mining_rate, rarity, max_level, base_price, is_active, created_at)
VALUES 
    (gen_random_uuid(), 'Crypto Miner', 'A basic miner with steady mining capabilities', 100, 1.0, 'COMMON', 50, 100, true, NOW()),
    (gen_random_uuid(), 'Blockchain Builder', 'An engineer specialized in building blockchain infrastructure', 150, 1.5, 'COMMON', 50, 200, true, NOW()),
    (gen_random_uuid(), 'Token Trader', 'A skilled trader with bonus rewards from transactions', 200, 2.0, 'RARE', 50, 500, true, NOW()),
    (gen_random_uuid(), 'DeFi Master', 'Master of decentralized finance with high yields', 300, 3.0, 'RARE', 50, 1000, true, NOW()),
    (gen_random_uuid(), 'NFT Artist', 'Creative artist with unique mining abilities', 400, 4.0, 'EPIC', 50, 2500, true, NOW()),
    (gen_random_uuid(), 'Smart Contract Wizard', 'Wizard of smart contracts with magical powers', 500, 5.0, 'EPIC', 50, 5000, true, NOW()),
    (gen_random_uuid(), 'Crypto Whale', 'Legendary whale with massive influence', 750, 7.5, 'LEGENDARY', 50, 10000, true, NOW()),
    (gen_random_uuid(), 'Satoshi Heir', 'The mythical heir of Satoshi with ultimate power', 1000, 10.0, 'MYTHIC', 50, 50000, true, NOW())
ON CONFLICT DO NOTHING;
EOF
    
    log_success "Character templates seeded"
}

seed_achievement_templates() {
    log_info "Seeding achievement templates..."
    
    cat <<EOF | kubectl exec -i deployment/cryptoverse-api -n cryptoverse -- npx prisma db execute --stdin
-- Mining Achievements
INSERT INTO achievement_templates (id, name, description, category, requirement_type, requirement_value, reward_tokens, reward_xp, is_active, created_at)
VALUES 
    (gen_random_uuid(), 'First Tap', 'Complete your first mining tap', 'MINING', 'TAPS', 1, 10, 10, true, NOW()),
    (gen_random_uuid(), 'Mining Novice', 'Complete 100 mining taps', 'MINING', 'TAPS', 100, 50, 50, true, NOW()),
    (gen_random_uuid(), 'Mining Expert', 'Complete 1,000 mining taps', 'MINING', 'TAPS', 1000, 200, 200, true, NOW()),
    (gen_random_uuid(), 'Mining Master', 'Complete 10,000 mining taps', 'MINING', 'TAPS', 10000, 1000, 1000, true, NOW()),
    (gen_random_uuid(), 'Mining Legend', 'Complete 100,000 mining taps', 'MINING', 'TAPS', 100000, 10000, 5000, true, NOW()),
    
    -- Token Achievements
    (gen_random_uuid(), 'First Tokens', 'Earn your first 100 tokens', 'COLLECTION', 'TOKENS_EARNED', 100, 10, 10, true, NOW()),
    (gen_random_uuid(), 'Token Collector', 'Earn 10,000 tokens total', 'COLLECTION', 'TOKENS_EARNED', 10000, 500, 500, true, NOW()),
    (gen_random_uuid(), 'Token Hoarder', 'Earn 100,000 tokens total', 'COLLECTION', 'TOKENS_EARNED', 100000, 2000, 2000, true, NOW()),
    (gen_random_uuid(), 'Token Millionaire', 'Earn 1,000,000 tokens total', 'COLLECTION', 'TOKENS_EARNED', 1000000, 10000, 5000, true, NOW()),
    
    -- Social Achievements
    (gen_random_uuid(), 'First Friend', 'Invite your first friend', 'SOCIAL', 'REFERRALS', 1, 100, 50, true, NOW()),
    (gen_random_uuid(), 'Social Butterfly', 'Invite 10 friends', 'SOCIAL', 'REFERRALS', 10, 500, 200, true, NOW()),
    (gen_random_uuid(), 'Influencer', 'Invite 100 friends', 'SOCIAL', 'REFERRALS', 100, 5000, 2000, true, NOW()),
    (gen_random_uuid(), 'Crypto Evangelist', 'Invite 1,000 friends', 'SOCIAL', 'REFERRALS', 1000, 50000, 10000, true, NOW()),
    
    -- Character Achievements
    (gen_random_uuid(), 'Character Owner', 'Acquire your first character', 'COLLECTION', 'CHARACTERS', 1, 50, 25, true, NOW()),
    (gen_random_uuid(), 'Character Collector', 'Own 5 different characters', 'COLLECTION', 'CHARACTERS', 5, 200, 100, true, NOW()),
    (gen_random_uuid(), 'Character Enthusiast', 'Own 10 different characters', 'COLLECTION', 'CHARACTERS', 10, 1000, 500, true, NOW()),
    
    -- Level Achievements
    (gen_random_uuid(), 'Level 10', 'Reach level 10 with any character', 'COLLECTION', 'MAX_LEVEL', 10, 100, 100, true, NOW()),
    (gen_random_uuid(), 'Level 25', 'Reach level 25 with any character', 'COLLECTION', 'MAX_LEVEL', 25, 500, 500, true, NOW()),
    (gen_random_uuid(), 'Level 50', 'Reach max level with any character', 'COLLECTION', 'MAX_LEVEL', 50, 2000, 2000, true, NOW()),
    
    -- Daily Streak Achievements
    (gen_random_uuid(), 'Weekly Streak', 'Login for 7 consecutive days', 'SPECIAL', 'DAILY_STREAK', 7, 200, 100, true, NOW()),
    (gen_random_uuid(), 'Monthly Streak', 'Login for 30 consecutive days', 'SPECIAL', 'DAILY_STREAK', 30, 1000, 500, true, NOW()),
    (gen_random_uuid(), 'Dedicated Miner', 'Login for 100 consecutive days', 'SPECIAL', 'DAILY_STREAK', 100, 10000, 5000, true, NOW())
ON CONFLICT DO NOTHING;
EOF
    
    log_success "Achievement templates seeded"
}

seed_quest_templates() {
    log_info "Seeding quest templates..."
    
    cat <<EOF | kubectl exec -i deployment/cryptoverse-api -n cryptoverse -- npx prisma db execute --stdin
-- Daily Quests
INSERT INTO quest_templates (id, name, description, type, requirements, rewards, duration_hours, is_active, created_at)
VALUES 
    (gen_random_uuid(), 'Daily Mining', 'Complete 50 mining taps today', 'DAILY', '{"type": "TAPS", "count": 50}', '{"tokens": 50, "xp": 25}', 24, true, NOW()),
    (gen_random_uuid(), 'Daily Earner', 'Earn 500 tokens today', 'DAILY', '{"type": "TOKENS_EARNED", "count": 500}', '{"tokens": 100, "xp": 50}', 24, true, NOW()),
    (gen_random_uuid(), 'Daily Social', 'Invite 1 friend today', 'DAILY', '{"type": "REFERRALS", "count": 1}', '{"tokens": 200, "xp": 100}', 24, true, NOW()),
    (gen_random_uuid(), 'Daily Upgrade', 'Upgrade your character once', 'DAILY', '{"type": "UPGRADES", "count": 1}', '{"tokens": 75, "xp": 40}', 24, true, NOW()),
    
    -- Weekly Quests
    (gen_random_uuid(), 'Weekly Miner', 'Complete 500 mining taps this week', 'WEEKLY', '{"type": "TAPS", "count": 500}', '{"tokens": 500, "xp": 250}', 168, true, NOW()),
    (gen_random_uuid(), 'Weekly Collector', 'Earn 5,000 tokens this week', 'WEEKLY', '{"type": "TOKENS_EARNED", "count": 5000}', '{"tokens": 1000, "xp": 500}', 168, true, NOW()),
    (gen_random_uuid(), 'Weekly Social', 'Invite 5 friends this week', 'WEEKLY', '{"type": "REFERRALS", "count": 5}', '{"tokens": 1000, "xp": 500}', 168, true, NOW()),
    (gen_random_uuid(), 'Weekly Champion', 'Reach top 100 on leaderboard', 'WEEKLY', '{"type": "LEADERBOARD_POSITION", "maxPosition": 100}', '{"tokens": 2000, "xp": 1000}', 168, true, NOW()),
    
    -- Special Quests
    (gen_random_uuid(), 'First Steps', 'Complete the tutorial', 'SPECIAL', '{"type": "TUTORIAL", "completed": true}', '{"tokens": 500, "xp": 250}', NULL, true, NOW()),
    (gen_random_uuid(), 'Character Quest', 'Acquire your first character', 'SPECIAL', '{"type": "CHARACTER_OWNED", "count": 1}', '{"tokens": 200, "xp": 100}', NULL, true, NOW()),
    (gen_random_uuid(), 'Power Up', 'Upgrade a character to level 10', 'SPECIAL', '{"type": "CHARACTER_LEVEL", "level": 10}', '{"tokens": 1000, "xp": 500}', NULL, true, NOW())
ON CONFLICT DO NOTHING;
EOF
    
    log_success "Quest templates seeded"
}

seed_airdrops() {
    log_info "Seeding initial airdrops..."
    
    cat <<EOF | kubectl exec -i deployment/cryptoverse-api -n cryptoverse -- npx prisma db execute --stdin
-- Initial Airdrops
INSERT INTO airdrops (id, name, description, total_amount, amount_per_user, eligibility_criteria, starts_at, status, created_at)
VALUES 
    (gen_random_uuid(), 'Launch Celebration', 'Celebrate the launch of CryptoVerse with bonus tokens!', 1000000, 100, '{"min_referrals": 0}', NOW(), 'ACTIVE', NOW()),
    (gen_random_uuid(), 'Early Adopter Bonus', 'Special bonus for early adopters', 500000, 250, '{"min_tokens_earned": 1000}', NOW() + INTERVAL '7 days', 'UPCOMING', NOW()),
    (gen_random_uuid(), 'Community Milestone', 'Reward for reaching 10,000 users', 2000000, 200, '{"min_referrals": 1}', NOW() + INTERVAL '14 days', 'UPCOMING', NOW())
ON CONFLICT DO NOTHING;
EOF
    
    log_success "Airdrops seeded"
}

seed_admin_user() {
    log_info "Creating admin user..."
    
    # Note: In production, this should be done through proper authentication
    # This is just a placeholder for the seeding script
    log_warning "Admin user creation should be done through proper authentication flow"
    log_info "Use the Telegram bot to create the first admin user"
}

verify_seeding() {
    log_info "Verifying seeded data..."
    
    # Count records in each table
    log_info "Character Templates: $(kubectl exec deployment/cryptoverse-api -n cryptoverse -- npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM character_templates;" 2>/dev/null || echo 'N/A')"
    log_info "Achievement Templates: $(kubectl exec deployment/cryptoverse-api -n cryptoverse -- npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM achievement_templates;" 2>/dev/null || echo 'N/A')"
    log_info "Quest Templates: $(kubectl exec deployment/cryptoverse-api -n cryptoverse -- npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM quest_templates;" 2>/dev/null || echo 'N/A')"
    log_info "Airdrops: $(kubectl exec deployment/cryptoverse-api -n cryptoverse -- npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM airdrops;" 2>/dev/null || echo 'N/A')"
    
    log_success "Seeding verification complete"
}

# ==========================================
# Main Seeding Flow
# ==========================================

main() {
    print_banner
    
    log_info "Starting production seeding..."
    log_info "Environment: ${ENVIRONMENT}"
    echo ""
    
    confirm_seeding
    
    # Seed in order
    seed_character_templates
    seed_achievement_templates
    seed_quest_templates
    seed_airdrops
    seed_admin_user
    
    # Verify
    verify_seeding
    
    echo ""
    echo "=========================================="
    log_success "Seeding Complete!"
    echo "=========================================="
    echo ""
}

# Run main function
main