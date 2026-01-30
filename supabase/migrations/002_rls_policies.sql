-- Fixture App - Row Level Security (RLS) Policies
-- This migration enables RLS and creates security policies for all tables

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE followed_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cached_fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_rules ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile (during signup)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users cannot delete their own profile (handled by auth.users cascade)
-- No DELETE policy needed

-- ============================================================================
-- FOLLOWED TEAMS TABLE POLICIES
-- ============================================================================
-- Users can view their own followed teams
CREATE POLICY "Users can view own followed teams"
  ON followed_teams FOR SELECT
  USING (auth.uid() = user_id);

-- Users can add teams to their followed list
CREATE POLICY "Users can insert own followed teams"
  ON followed_teams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete teams from their followed list
CREATE POLICY "Users can delete own followed teams"
  ON followed_teams FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- USER FILTERS TABLE POLICIES
-- ============================================================================
-- Users can view their own filters
CREATE POLICY "Users can view own filters"
  ON user_filters FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own filters
CREATE POLICY "Users can insert own filters"
  ON user_filters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own filters
CREATE POLICY "Users can update own filters"
  ON user_filters FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own filters
CREATE POLICY "Users can delete own filters"
  ON user_filters FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- COMPETITION GROUPS TABLE POLICIES
-- ============================================================================
-- Users can view groups they are members of
CREATE POLICY "Users can view groups they are members of"
  ON competition_groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = competition_groups.id
        AND group_members.user_id = auth.uid()
    )
  );

-- Users can view groups by invite code (for joining)
CREATE POLICY "Users can view groups by invite code"
  ON competition_groups FOR SELECT
  USING (invite_code IS NOT NULL);

-- Users can create new groups (becoming admin)
CREATE POLICY "Users can create groups"
  ON competition_groups FOR INSERT
  WITH CHECK (auth.uid() = admin_id);

-- Group admins can update their groups
CREATE POLICY "Admins can update their groups"
  ON competition_groups FOR UPDATE
  USING (auth.uid() = admin_id)
  WITH CHECK (auth.uid() = admin_id);

-- Group admins can delete their groups
CREATE POLICY "Admins can delete their groups"
  ON competition_groups FOR DELETE
  USING (auth.uid() = admin_id);

-- ============================================================================
-- GROUP MEMBERS TABLE POLICIES
-- ============================================================================
-- Users can view members of groups they belong to
CREATE POLICY "Users can view members of their groups"
  ON group_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
        AND gm.user_id = auth.uid()
    )
  );

-- Users can join groups (insert themselves as members)
CREATE POLICY "Users can join groups"
  ON group_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can leave groups they're in
CREATE POLICY "Users can leave groups"
  ON group_members FOR DELETE
  USING (auth.uid() = user_id);

-- Group admins can remove members from their groups
CREATE POLICY "Admins can remove members from their groups"
  ON group_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM competition_groups
      WHERE competition_groups.id = group_members.group_id
        AND competition_groups.admin_id = auth.uid()
    )
  );

-- Group admins can update member roles
CREATE POLICY "Admins can update member roles"
  ON group_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM competition_groups
      WHERE competition_groups.id = group_members.group_id
        AND competition_groups.admin_id = auth.uid()
    )
  );

-- ============================================================================
-- PREDICTIONS TABLE POLICIES
-- ============================================================================
-- Users can view predictions in groups they're members of
CREATE POLICY "Users can view predictions in their groups"
  ON predictions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = predictions.group_id
        AND group_members.user_id = auth.uid()
    )
  );

-- Users can create predictions for groups they're in
CREATE POLICY "Users can create predictions in their groups"
  ON predictions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = predictions.group_id
        AND group_members.user_id = auth.uid()
    )
  );

-- Users can update their own predictions (before match starts)
CREATE POLICY "Users can update their own predictions"
  ON predictions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own predictions
CREATE POLICY "Users can delete their own predictions"
  ON predictions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- CACHED FIXTURES TABLE POLICIES
-- ============================================================================
-- All authenticated users can view cached fixtures (read-only)
CREATE POLICY "Authenticated users can view cached fixtures"
  ON cached_fixtures FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can insert/update/delete cached fixtures (via API routes)
-- No policies needed - service role bypasses RLS

-- ============================================================================
-- SCORING RULES TABLE POLICIES
-- ============================================================================
-- Users can view global scoring rules
CREATE POLICY "Users can view global scoring rules"
  ON scoring_rules FOR SELECT
  USING (group_id IS NULL);

-- Users can view scoring rules for groups they're in
CREATE POLICY "Users can view their groups' scoring rules"
  ON scoring_rules FOR SELECT
  USING (
    group_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = scoring_rules.group_id
        AND group_members.user_id = auth.uid()
    )
  );

-- Group admins can create custom scoring rules for their groups
CREATE POLICY "Admins can create scoring rules for their groups"
  ON scoring_rules FOR INSERT
  WITH CHECK (
    group_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM competition_groups
      WHERE competition_groups.id = scoring_rules.group_id
        AND competition_groups.admin_id = auth.uid()
    )
  );

-- Group admins can update scoring rules for their groups
CREATE POLICY "Admins can update their groups' scoring rules"
  ON scoring_rules FOR UPDATE
  USING (
    group_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM competition_groups
      WHERE competition_groups.id = scoring_rules.group_id
        AND competition_groups.admin_id = auth.uid()
    )
  );

-- Group admins can delete scoring rules for their groups
CREATE POLICY "Admins can delete their groups' scoring rules"
  ON scoring_rules FOR DELETE
  USING (
    group_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM competition_groups
      WHERE competition_groups.id = scoring_rules.group_id
        AND competition_groups.admin_id = auth.uid()
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================================================

-- Function to check if user is group admin
CREATE OR REPLACE FUNCTION is_group_admin(group_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM competition_groups
    WHERE id = group_uuid
      AND admin_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is group member
CREATE OR REPLACE FUNCTION is_group_member(group_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = group_uuid
      AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Users can view own profile" ON profiles IS
  'Users can only view their own profile data';

COMMENT ON POLICY "Users can view groups they are members of" ON competition_groups IS
  'Users can only see competition groups they have joined';

COMMENT ON POLICY "Users can view predictions in their groups" ON predictions IS
  'Users can view all predictions within groups they belong to (for leaderboards)';

COMMENT ON FUNCTION is_group_admin IS
  'Helper function to check if the current user is admin of a specific group';

COMMENT ON FUNCTION is_group_member IS
  'Helper function to check if the current user is a member of a specific group';
