-- Auto-Create Profile on Signup
-- This migration creates a trigger to automatically create a profile when a user signs up

-- ============================================================================
-- FUNCTION: Create Profile on Signup
-- ============================================================================
-- This function is triggered when a new user is created in auth.users
-- It automatically creates a corresponding profile with default values
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    username,
    display_name,
    avatar_url,
    notification_preferences,
    onboarding_completed
  )
  VALUES (
    NEW.id,
    NULL, -- Username set later by user
    COALESCE(NEW.raw_user_meta_data->>'display_name', NULL), -- Get from signup metadata if provided
    NEW.raw_user_meta_data->>'avatar_url', -- Get avatar from OAuth providers
    jsonb_build_object(
      'match_reminders', true,
      'prediction_reminders', true,
      'group_updates', true,
      'followed_teams', true,
      'email_enabled', true,
      'push_enabled', false
    ),
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER: Auto-create profile on user signup
-- ============================================================================
-- This trigger fires after a new user is inserted into auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
-- Grant execute permission on the function to the authenticated role
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
