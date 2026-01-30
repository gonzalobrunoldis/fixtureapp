/**
 * Integration Tests: Profile Management
 *
 * Tests profile CRUD operations and avatar management
 *
 * NOTE: These tests require a Supabase project with test database
 * Configure test environment variables in .env.test
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Test configuration
const TEST_USER_EMAIL = `profile-test-${Date.now()}@example.com`;
const TEST_USER_PASSWORD = 'TestPassword123!';

let supabase: ReturnType<typeof createClient<Database>>;
let testUserId: string | null = null;

describe('Profile Management Integration Tests', () => {
  beforeAll(async () => {
    // Create Supabase client for testing
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables for testing');
    }

    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

    // Create test user
    const { data } = await supabase.auth.signUp({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
      options: {
        data: {
          display_name: 'Profile Test User',
        },
      },
    });

    if (data.user) {
      testUserId = data.user.id;
    }

    // Wait for profile creation trigger
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    // Cleanup: Delete test user if created
    if (testUserId && supabase) {
      try {
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (supabaseServiceKey) {
          const adminClient = createClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            supabaseServiceKey
          );

          // Delete test user profile
          await adminClient.from('profiles').delete().eq('id', testUserId);

          // Delete test user auth record
          await adminClient.auth.admin.deleteUser(testUserId);
        }
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    }
  });

  describe('Profile Retrieval', () => {
    it('should retrieve profile for authenticated user', async () => {
      if (!testUserId) throw new Error('Test user not created');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', testUserId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect((data as any)?.id).toBe(testUserId);
    });

    it('should include notification preferences in profile', async () => {
      if (!testUserId) throw new Error('Test user not created');

      const { data } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('id', testUserId)
        .single();

      expect((data as any)?.notification_preferences).toBeDefined();
      expect((data as any)?.notification_preferences).toHaveProperty(
        'match_reminders'
      );
      expect((data as any)?.notification_preferences).toHaveProperty(
        'prediction_reminders'
      );
      expect((data as any)?.notification_preferences).toHaveProperty(
        'group_updates'
      );
    });
  });

  describe('Profile Updates', () => {
    it('should update display name', async () => {
      if (!testUserId) throw new Error('Test user not created');

      const newDisplayName = 'Updated Test User';

      // @ts-ignore - Supabase type inference issue in tests
      const { data, error } = await supabase
        .from('profiles')
        .update({ display_name: newDisplayName })
        .eq('id', testUserId)
        .select()
        .single();

      expect(error).toBeNull();
      expect((data as any)?.display_name).toBe(newDisplayName);
    });

    it('should update username', async () => {
      if (!testUserId) throw new Error('Test user not created');

      const newUsername = `testuser_${Date.now()}`;

      // @ts-ignore - Supabase type inference issue in tests
      const { data, error } = await supabase
        .from('profiles')
        .update({ username: newUsername })
        .eq('id', testUserId)
        .select()
        .single();

      expect(error).toBeNull();
      expect((data as any)?.username).toBe(newUsername);
    });

    it('should enforce unique username constraint', async () => {
      if (!testUserId) throw new Error('Test user not created');

      // First, set a username
      const uniqueUsername = `unique_${Date.now()}`;
      // @ts-ignore - Supabase type inference issue in tests
      await supabase
        .from('profiles')
        .update({ username: uniqueUsername })
        .eq('id', testUserId);

      // Create another test user
      const { data: newUser } = await supabase.auth.signUp({
        email: `another-${Date.now()}@example.com`,
        password: TEST_USER_PASSWORD,
      });

      if (!newUser.user) throw new Error('Failed to create second test user');

      // Wait for profile creation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Try to use the same username
      // @ts-ignore - Supabase type inference issue in tests
      const { error } = await supabase
        .from('profiles')
        .update({ username: uniqueUsername })
        .eq('id', newUser.user.id);

      expect(error).toBeDefined();
      expect(error?.code).toBe('23505'); // Unique constraint violation

      // Cleanup second user
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (supabaseServiceKey) {
        const adminClient = createClient<Database>(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          supabaseServiceKey
        );
        await adminClient.from('profiles').delete().eq('id', newUser.user.id);
        await adminClient.auth.admin.deleteUser(newUser.user.id);
      }
    });

    it('should update notification preferences', async () => {
      if (!testUserId) throw new Error('Test user not created');

      const newPreferences = {
        match_reminders: false,
        prediction_reminders: true,
        group_updates: false,
        followed_teams: true,
        email_enabled: false,
        push_enabled: true,
      };

      // @ts-ignore - Supabase type inference issue in tests
      const { data, error } = await supabase
        .from('profiles')
        .update({ notification_preferences: newPreferences })
        .eq('id', testUserId)
        .select()
        .single();

      expect(error).toBeNull();
      expect((data as any)?.notification_preferences).toEqual(newPreferences);
    });

    it('should update onboarding_completed flag', async () => {
      if (!testUserId) throw new Error('Test user not created');

      // @ts-ignore - Supabase type inference issue in tests
      const { data, error } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', testUserId)
        .select()
        .single();

      expect(error).toBeNull();
      expect((data as any)?.onboarding_completed).toBe(true);
    });
  });

  describe('RLS Policies', () => {
    it('should prevent users from updating other users profiles', async () => {
      // Create a second test user
      const { data: newUser } = await supabase.auth.signUp({
        email: `rls-test-${Date.now()}@example.com`,
        password: TEST_USER_PASSWORD,
      });

      if (!newUser.user) throw new Error('Failed to create second test user');

      // Wait for profile creation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Login as the first user
      await supabase.auth.signInWithPassword({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
      });

      // Try to update the second user's profile
      // @ts-ignore - Supabase type inference issue in tests
      const { data, error } = await supabase
        .from('profiles')
        .update({ display_name: 'Hacked!' })
        .eq('id', newUser.user.id)
        .select();

      // Should either return error or empty array (no rows updated)
      expect(data?.length === 0 || error !== null).toBe(true);

      // Cleanup second user
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (supabaseServiceKey) {
        const adminClient = createClient<Database>(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          supabaseServiceKey
        );
        await adminClient.from('profiles').delete().eq('id', newUser.user.id);
        await adminClient.auth.admin.deleteUser(newUser.user.id);
      }
    });

    it('should allow users to read their own profile', async () => {
      if (!testUserId) throw new Error('Test user not created');

      // Login as the test user
      await supabase.auth.signInWithPassword({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
      });

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', testUserId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should allow users to read other users public profiles', async () => {
      // Create a second test user
      const { data: newUser } = await supabase.auth.signUp({
        email: `public-${Date.now()}@example.com`,
        password: TEST_USER_PASSWORD,
      });

      if (!newUser.user) throw new Error('Failed to create second test user');

      // Wait for profile creation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Login as the first user
      await supabase.auth.signInWithPassword({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
      });

      // Try to read the second user's profile
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .eq('id', newUser.user.id)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();

      // Cleanup second user
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (supabaseServiceKey) {
        const adminClient = createClient<Database>(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          supabaseServiceKey
        );
        await adminClient.from('profiles').delete().eq('id', newUser.user.id);
        await adminClient.auth.admin.deleteUser(newUser.user.id);
      }
    });
  });
});
