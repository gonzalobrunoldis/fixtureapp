-- Fixture App - Initial Database Schema
-- This migration creates all core tables for the application

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
-- Extends Supabase Auth users with app-specific profile data
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    notification_preferences JSONB DEFAULT '{}',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FOLLOWED TEAMS TABLE
-- ============================================================================
-- Stores teams that users follow for personalized content
CREATE TABLE followed_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    team_id INTEGER NOT NULL, -- API-Football team ID
    team_name TEXT NOT NULL,
    team_logo TEXT,
    sport TEXT DEFAULT 'football',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, team_id)
);

-- ============================================================================
-- USER FILTERS TABLE
-- ============================================================================
-- Stores user filter preferences for Home/Today screen
CREATE TABLE user_filters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    filter_type TEXT NOT NULL, -- 'sport', 'competition', 'country'
    filter_value TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, filter_type, filter_value)
);

-- ============================================================================
-- COMPETITION GROUPS TABLE
-- ============================================================================
-- Groups where users compete with predictions
CREATE TABLE competition_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    competition_id INTEGER NOT NULL, -- API-Football league ID
    competition_name TEXT NOT NULL,
    season INTEGER NOT NULL,
    sport TEXT DEFAULT 'football',
    max_members INTEGER NOT NULL,
    pricing_type TEXT NOT NULL, -- 'per_user', 'bucket', 'enterprise'
    price_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'USD',
    invite_code TEXT UNIQUE,
    status TEXT DEFAULT 'active', -- 'active', 'completed', 'cancelled'
    payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'failed'
    stripe_payment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- GROUP MEMBERS TABLE
-- ============================================================================
-- Links users to competition groups they've joined
CREATE TABLE group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES competition_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- 'admin', 'member'
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- ============================================================================
-- PREDICTIONS TABLE
-- ============================================================================
-- User predictions for matches within competition groups
CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    group_id UUID REFERENCES competition_groups(id) ON DELETE CASCADE,
    fixture_id INTEGER NOT NULL, -- API-Football fixture ID
    home_score INTEGER,
    away_score INTEGER,
    advancing_team_id INTEGER, -- For knockout matches
    points_awarded INTEGER DEFAULT 0,
    is_evaluated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, group_id, fixture_id)
);

-- ============================================================================
-- CACHED FIXTURES TABLE
-- ============================================================================
-- Caches fixture data from API-Football to reduce API calls
CREATE TABLE cached_fixtures (
    id INTEGER PRIMARY KEY, -- API-Football fixture ID
    league_id INTEGER NOT NULL,
    season INTEGER NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    home_team_id INTEGER NOT NULL,
    home_team_name TEXT NOT NULL,
    home_team_logo TEXT,
    away_team_id INTEGER NOT NULL,
    away_team_name TEXT NOT NULL,
    away_team_logo TEXT,
    home_score INTEGER,
    away_score INTEGER,
    status TEXT NOT NULL, -- NS, 1H, HT, 2H, FT, etc.
    round TEXT,
    venue_name TEXT,
    venue_city TEXT,
    data JSONB, -- Full API response for detailed views
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SCORING RULES TABLE
-- ============================================================================
-- Configurable scoring rules per group or global defaults
CREATE TABLE scoring_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES competition_groups(id) ON DELETE CASCADE, -- NULL for global rules
    rule_type TEXT NOT NULL, -- 'exact_score', 'correct_result', 'correct_goal_diff'
    points INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX idx_followed_teams_user ON followed_teams(user_id);
CREATE INDEX idx_user_filters_user ON user_filters(user_id);
CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_predictions_user_group ON predictions(user_id, group_id);
CREATE INDEX idx_predictions_fixture ON predictions(fixture_id);
CREATE INDEX idx_cached_fixtures_date ON cached_fixtures(date);
CREATE INDEX idx_cached_fixtures_league_season ON cached_fixtures(league_id, season);
CREATE INDEX idx_competition_groups_invite ON competition_groups(invite_code);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================
-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at column
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competition_groups_updated_at
    BEFORE UPDATE ON competition_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_predictions_updated_at
    BEFORE UPDATE ON predictions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cached_fixtures_updated_at
    BEFORE UPDATE ON cached_fixtures
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
