/**
 * Database Types - Generated from Supabase Schema
 *
 * This file defines TypeScript types for all database tables.
 * Keep this in sync with supabase/migrations/001_initial_schema.sql
 */

// ============================================================================
// ENUMS
// ============================================================================

export type FilterType = 'sport' | 'competition' | 'country';

export type GroupRole = 'admin' | 'member';

export type PricingType = 'per_user' | 'bucket' | 'enterprise';

export type GroupStatus = 'active' | 'completed' | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed';

export type FixtureStatus =
  | 'TBD' // Time to be defined
  | 'NS' // Not started
  | '1H' // First half
  | 'HT' // Halftime
  | '2H' // Second half
  | 'ET' // Extra time
  | 'BT' // Break time (before extra time)
  | 'P' // Penalty in progress
  | 'SUSP' // Match suspended
  | 'INT' // Match interrupted
  | 'FT' // Finished
  | 'AET' // Finished after extra time
  | 'PEN' // Finished after penalties
  | 'PST' // Postponed
  | 'CANC' // Cancelled
  | 'ABD' // Abandoned
  | 'AWD' // Technical loss
  | 'WO'; // Walkover

export type RuleType = 'exact_score' | 'correct_result' | 'correct_goal_diff';

export type Sport = 'football' | 'basketball' | 'hockey' | 'handball';

// ============================================================================
// DATABASE TABLES
// ============================================================================

export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  notification_preferences: NotificationPreferences;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  match_reminders?: boolean;
  prediction_reminders?: boolean;
  group_updates?: boolean;
  followed_teams?: boolean;
  email_enabled?: boolean;
  push_enabled?: boolean;
}

export interface FollowedTeam {
  id: string;
  user_id: string;
  team_id: number;
  team_name: string;
  team_logo: string | null;
  sport: Sport;
  created_at: string;
}

export interface UserFilter {
  id: string;
  user_id: string;
  filter_type: FilterType;
  filter_value: string;
  is_hidden: boolean;
  created_at: string;
}

export interface CompetitionGroup {
  id: string;
  name: string;
  description: string | null;
  admin_id: string | null;
  competition_id: number;
  competition_name: string;
  season: number;
  sport: Sport;
  max_members: number;
  pricing_type: PricingType;
  price_cents: number;
  currency: string;
  invite_code: string | null;
  status: GroupStatus;
  payment_status: PaymentStatus;
  stripe_payment_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: GroupRole;
  joined_at: string;
}

export interface Prediction {
  id: string;
  user_id: string;
  group_id: string;
  fixture_id: number;
  home_score: number | null;
  away_score: number | null;
  advancing_team_id: number | null;
  points_awarded: number;
  is_evaluated: boolean;
  created_at: string;
  updated_at: string;
}

export interface CachedFixture {
  id: number;
  league_id: number;
  season: number;
  date: string;
  home_team_id: number;
  home_team_name: string;
  home_team_logo: string | null;
  away_team_id: number;
  away_team_name: string;
  away_team_logo: string | null;
  home_score: number | null;
  away_score: number | null;
  status: FixtureStatus;
  round: string | null;
  venue_name: string | null;
  venue_city: string | null;
  data: any; // Full API response stored as JSONB
  created_at: string;
  updated_at: string;
}

export interface ScoringRule {
  id: string;
  group_id: string | null; // NULL for global rules
  rule_type: RuleType;
  points: number;
  description: string | null;
  created_at: string;
}

// ============================================================================
// INSERT TYPES (for creating new records)
// ============================================================================

export type ProfileInsert = Omit<
  Profile,
  'id' | 'created_at' | 'updated_at'
> & {
  id: string; // Required on insert (from auth.users)
};

export type FollowedTeamInsert = Omit<FollowedTeam, 'id' | 'created_at'>;

export type UserFilterInsert = Omit<UserFilter, 'id' | 'created_at'>;

export type CompetitionGroupInsert = Omit<
  CompetitionGroup,
  'id' | 'created_at' | 'updated_at'
>;

export type GroupMemberInsert = Omit<GroupMember, 'id' | 'joined_at'>;

export type PredictionInsert = Omit<
  Prediction,
  'id' | 'points_awarded' | 'is_evaluated' | 'created_at' | 'updated_at'
>;

export type CachedFixtureInsert = Omit<
  CachedFixture,
  'created_at' | 'updated_at'
>;

export type ScoringRuleInsert = Omit<ScoringRule, 'id' | 'created_at'>;

// ============================================================================
// UPDATE TYPES (for updating existing records)
// ============================================================================

export type ProfileUpdate = Partial<
  Omit<Profile, 'id' | 'created_at' | 'updated_at'>
>;

export type FollowedTeamUpdate = Partial<
  Omit<FollowedTeam, 'id' | 'user_id' | 'created_at'>
>;

export type UserFilterUpdate = Partial<
  Omit<UserFilter, 'id' | 'user_id' | 'created_at'>
>;

export type CompetitionGroupUpdate = Partial<
  Omit<CompetitionGroup, 'id' | 'created_at' | 'updated_at'>
>;

export type GroupMemberUpdate = Partial<
  Omit<GroupMember, 'id' | 'group_id' | 'user_id' | 'joined_at'>
>;

export type PredictionUpdate = Partial<
  Omit<
    Prediction,
    'id' | 'user_id' | 'group_id' | 'fixture_id' | 'created_at' | 'updated_at'
  >
>;

export type CachedFixtureUpdate = Partial<
  Omit<CachedFixture, 'id' | 'created_at' | 'updated_at'>
>;

export type ScoringRuleUpdate = Partial<Omit<ScoringRule, 'id' | 'created_at'>>;

// ============================================================================
// DATABASE TYPE (for Supabase client)
// ============================================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      followed_teams: {
        Row: FollowedTeam;
        Insert: FollowedTeamInsert;
        Update: FollowedTeamUpdate;
      };
      user_filters: {
        Row: UserFilter;
        Insert: UserFilterInsert;
        Update: UserFilterUpdate;
      };
      competition_groups: {
        Row: CompetitionGroup;
        Insert: CompetitionGroupInsert;
        Update: CompetitionGroupUpdate;
      };
      group_members: {
        Row: GroupMember;
        Insert: GroupMemberInsert;
        Update: GroupMemberUpdate;
      };
      predictions: {
        Row: Prediction;
        Insert: PredictionInsert;
        Update: PredictionUpdate;
      };
      cached_fixtures: {
        Row: CachedFixture;
        Insert: CachedFixtureInsert;
        Update: CachedFixtureUpdate;
      };
      scoring_rules: {
        Row: ScoringRule;
        Insert: ScoringRuleInsert;
        Update: ScoringRuleUpdate;
      };
    };
  };
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
