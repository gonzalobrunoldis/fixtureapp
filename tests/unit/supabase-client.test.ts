/**
 * Unit Tests: Supabase Client
 *
 * Tests for Supabase browser and server client creation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Supabase Client Creation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Browser Client', () => {
    it('should create browser client with valid environment variables', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      const { createClient } = await import('@/lib/supabase/client');
      const client = createClient();

      expect(client).toBeDefined();
      expect(client.auth).toBeDefined();
      expect(client.from).toBeDefined();
    });

    it('should throw error when SUPABASE_URL is missing', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = '';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      const { createClient } = await import('@/lib/supabase/client');

      expect(() => createClient()).toThrow(
        'Missing Supabase environment variables'
      );
    });

    it('should throw error when SUPABASE_ANON_KEY is missing', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';

      const { createClient } = await import('@/lib/supabase/client');

      expect(() => createClient()).toThrow(
        'Missing Supabase environment variables'
      );
    });
  });

  describe('Server Client', () => {
    it('should create server client with valid environment variables', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      // Mock Next.js cookies
      vi.mock('next/headers', () => ({
        cookies: vi.fn().mockResolvedValue({
          getAll: () => [],
          set: vi.fn(),
        }),
      }));

      const { createClient } = await import('@/lib/supabase/server');
      const client = await createClient();

      expect(client).toBeDefined();
      expect(client.auth).toBeDefined();
      expect(client.from).toBeDefined();
    });

    it('should throw error when environment variables are missing', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = '';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';

      vi.mock('next/headers', () => ({
        cookies: vi.fn().mockResolvedValue({
          getAll: () => [],
          set: vi.fn(),
        }),
      }));

      const { createClient } = await import('@/lib/supabase/server');

      await expect(createClient()).rejects.toThrow(
        'Missing Supabase environment variables'
      );
    });
  });

  describe('Admin Client', () => {
    it('should create admin client with service role key', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

      const { createAdminClient } = await import('@/lib/supabase/server');
      const client = createAdminClient();

      expect(client).toBeDefined();
      expect(client.auth).toBeDefined();
      expect(client.from).toBeDefined();
    });

    it('should throw error when service role key is missing', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = '';

      const { createAdminClient } = await import('@/lib/supabase/server');

      expect(() => createAdminClient()).toThrow(
        'Missing Supabase service role environment variables'
      );
    });
  });
});
