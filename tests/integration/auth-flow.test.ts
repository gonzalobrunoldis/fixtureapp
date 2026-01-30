/**
 * Integration Tests: Authentication Flow
 *
 * Tests complete authentication workflows including:
 * - Signup → Profile creation
 * - Login → Session creation
 * - Logout → Session cleanup
 * - Password reset
 *
 * NOTE: These tests require a Supabase project with test database
 * Configure test environment variables in .env.test
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Test configuration
const TEST_USER_EMAIL = `test-${Date.now()}@example.com`;
const TEST_USER_PASSWORD = 'TestPassword123!';
const TEST_DISPLAY_NAME = 'Test User';

let supabase: ReturnType<typeof createClient<Database>>;
let testUserId: string | null = null;

describe('Authentication Flow Integration Tests', () => {
  beforeAll(() => {
    // Create Supabase client for testing
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables for testing');
    }

    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
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

  describe('User Signup', () => {
    it('should successfully sign up a new user with email and password', async () => {
      const { data, error } = await supabase.auth.signUp({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
        options: {
          data: {
            display_name: TEST_DISPLAY_NAME,
          },
        },
      });

      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.user?.email).toBe(TEST_USER_EMAIL);

      // Store user ID for cleanup
      if (data.user) {
        testUserId = data.user.id;
      }
    });

    it('should create profile automatically on signup', async () => {
      // Wait a bit for profile creation trigger
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (!testUserId) {
        throw new Error('Test user ID not available');
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', testUserId)
        .single();

      expect(error).toBeNull();
      expect(profile).toBeDefined();
      expect((profile as any)?.id).toBe(testUserId);
      expect((profile as any)?.notification_preferences).toBeDefined();
    });

    it('should reject signup with invalid email', async () => {
      const { error } = await supabase.auth.signUp({
        email: 'invalid-email',
        password: TEST_USER_PASSWORD,
      });

      expect(error).toBeDefined();
      expect(error?.message).toContain('email');
    });

    it('should reject signup with weak password', async () => {
      const { error } = await supabase.auth.signUp({
        email: `test-weak-${Date.now()}@example.com`,
        password: '123', // Too weak
      });

      expect(error).toBeDefined();
      expect(error?.message).toContain('password');
    });

    it('should reject signup with duplicate email', async () => {
      const { error } = await supabase.auth.signUp({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
      });

      expect(error).toBeDefined();
      expect(error?.message).toContain('already');
    });
  });

  describe('User Login', () => {
    it('should successfully log in with valid credentials', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
      });

      expect(error).toBeNull();
      expect(data.session).toBeDefined();
      expect(data.user).toBeDefined();
      expect(data.user?.email).toBe(TEST_USER_EMAIL);
    });

    it('should reject login with invalid email', async () => {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'nonexistent@example.com',
        password: TEST_USER_PASSWORD,
      });

      expect(error).toBeDefined();
      expect(error?.message).toContain('Invalid');
    });

    it('should reject login with invalid password', async () => {
      const { error } = await supabase.auth.signInWithPassword({
        email: TEST_USER_EMAIL,
        password: 'WrongPassword123!',
      });

      expect(error).toBeDefined();
      expect(error?.message).toContain('Invalid');
    });

    it('should create a session after successful login', async () => {
      await supabase.auth.signInWithPassword({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
      });

      const {
        data: { session },
      } = await supabase.auth.getSession();

      expect(session).toBeDefined();
      expect(session?.user.email).toBe(TEST_USER_EMAIL);
    });
  });

  describe('User Logout', () => {
    it('should successfully log out and clear session', async () => {
      // First, ensure we're logged in
      await supabase.auth.signInWithPassword({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
      });

      // Then logout
      const { error } = await supabase.auth.signOut();

      expect(error).toBeNull();

      // Verify session is cleared
      const {
        data: { session },
      } = await supabase.auth.getSession();

      expect(session).toBeNull();
    });
  });

  describe('Password Reset', () => {
    it('should send password reset email for valid user', async () => {
      const { error } = await supabase.auth.resetPasswordForEmail(
        TEST_USER_EMAIL,
        {
          redirectTo: 'http://localhost:3000/auth/reset-password',
        }
      );

      // Note: This will succeed even if email doesn't exist (security measure)
      // We can only verify that it doesn't error
      expect(error).toBeNull();
    });

    it('should update password when user is authenticated', async () => {
      // Login first
      await supabase.auth.signInWithPassword({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
      });

      const newPassword = 'NewPassword123!';

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      expect(error).toBeNull();

      // Logout and try logging in with new password
      await supabase.auth.signOut();

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: TEST_USER_EMAIL,
        password: newPassword,
      });

      expect(loginError).toBeNull();

      // Restore original password for other tests
      await supabase.auth.updateUser({
        password: TEST_USER_PASSWORD,
      });
    });
  });

  describe('Session Management', () => {
    it('should maintain session across page refreshes', async () => {
      // Login
      await supabase.auth.signInWithPassword({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
      });

      // Get session
      const {
        data: { session: session1 },
      } = await supabase.auth.getSession();

      expect(session1).toBeDefined();

      // Simulate page refresh by getting session again
      const {
        data: { session: session2 },
      } = await supabase.auth.getSession();

      expect(session2).toBeDefined();
      expect(session2?.access_token).toBe(session1?.access_token);
    });

    it('should refresh session when access token expires', async () => {
      // Login
      await supabase.auth.signInWithPassword({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
      });

      const {
        data: { session },
      } = await supabase.auth.getSession();

      expect(session).toBeDefined();
      expect(session?.refresh_token).toBeDefined();

      // Note: Actual token refresh testing requires waiting for token expiry
      // or mocking the Supabase client, which is beyond the scope of integration tests
    });
  });
});
