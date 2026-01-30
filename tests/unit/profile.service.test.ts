/**
 * Unit Tests: Profile Service
 *
 * Tests for profile CRUD operations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ProfileUpdate } from '@/types/database.types';

// Mock Supabase clients
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
  storage: {
    from: vi.fn(),
  },
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(mockSupabaseClient),
  createAdminClient: vi.fn().mockReturnValue(mockSupabaseClient),
}));

describe('Profile Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return profile for authenticated user', async () => {
      const mockProfile = {
        id: 'user-123',
        username: 'testuser',
        display_name: 'Test User',
        avatar_url: null,
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      });

      const { getProfile } = await import('@/services/profile.service');
      const result = await getProfile();

      expect(result.data).toEqual(mockProfile);
      expect(result.error).toBeNull();
    });

    it('should return error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const { getProfile } = await import('@/services/profile.service');
      const result = await getProfile();

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('UNAUTHENTICATED');
    });

    it('should return profile for specific user ID', async () => {
      const mockProfile = {
        id: 'user-456',
        username: 'otheruser',
        display_name: 'Other User',
        avatar_url: null,
      };

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      });

      const { getProfile } = await import('@/services/profile.service');
      const result = await getProfile('user-456');

      expect(result.data).toEqual(mockProfile);
      expect(result.error).toBeNull();
    });
  });

  describe('createProfile', () => {
    it('should create profile with display name', async () => {
      const mockProfile = {
        id: 'user-123',
        username: null,
        display_name: 'Test User',
        avatar_url: null,
        notification_preferences: {
          match_reminders: true,
          prediction_reminders: true,
          group_updates: true,
          followed_teams: true,
          email_enabled: true,
          push_enabled: false,
        },
        onboarding_completed: false,
      };

      mockSupabaseClient.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      });

      const { createProfile } = await import('@/services/profile.service');
      const result = await createProfile('user-123', 'Test User');

      expect(result.data).toEqual(mockProfile);
      expect(result.error).toBeNull();
    });

    it('should handle database error during profile creation', async () => {
      const mockError = {
        message: 'Database error',
        code: 'DB_ERROR',
      };

      mockSupabaseClient.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });

      const { createProfile } = await import('@/services/profile.service');
      const result = await createProfile('user-123');

      expect(result.data).toBeNull();
      expect(result.error?.message).toBe('Database error');
    });
  });

  describe('updateProfile', () => {
    it('should update profile for authenticated user', async () => {
      const updates: ProfileUpdate = {
        display_name: 'Updated Name',
      };

      const mockUpdatedProfile = {
        id: 'user-123',
        username: 'testuser',
        display_name: 'Updated Name',
        avatar_url: null,
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockUpdatedProfile,
                error: null,
              }),
            }),
          }),
        }),
      });

      const { updateProfile } = await import('@/services/profile.service');
      const result = await updateProfile(updates);

      expect(result.data).toEqual(mockUpdatedProfile);
      expect(result.error).toBeNull();
    });

    it('should return error when username is already taken', async () => {
      const updates: ProfileUpdate = {
        username: 'existinguser',
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            neq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'other-user' },
                error: null,
              }),
            }),
          }),
        }),
      });

      const { updateProfile } = await import('@/services/profile.service');
      const result = await updateProfile(updates);

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('USERNAME_TAKEN');
    });
  });

  describe('uploadAvatar', () => {
    it('should reject invalid file type', async () => {
      const invalidFile = new File(['content'], 'test.txt', {
        type: 'text/plain',
      });

      const { uploadAvatar } = await import('@/services/profile.service');
      const result = await uploadAvatar(invalidFile, 'user-123');

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('INVALID_FILE_TYPE');
    });

    it('should reject file larger than 2MB', async () => {
      // Create a 3MB file
      const largeFile = new File(
        [new ArrayBuffer(3 * 1024 * 1024)],
        'large.jpg',
        {
          type: 'image/jpeg',
        }
      );

      const { uploadAvatar } = await import('@/services/profile.service');
      const result = await uploadAvatar(largeFile, 'user-123');

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('FILE_TOO_LARGE');
    });

    it('should upload valid image file', async () => {
      const validFile = new File(['content'], 'avatar.jpg', {
        type: 'image/jpeg',
      });

      const mockPublicUrl = 'https://storage.supabase.co/avatars/user-123.jpg';

      mockSupabaseClient.storage.from.mockReturnValue({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: mockPublicUrl },
        }),
      });

      mockSupabaseClient.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      const { uploadAvatar } = await import('@/services/profile.service');
      const result = await uploadAvatar(validFile, 'user-123');

      expect(result.data).toBe(mockPublicUrl);
      expect(result.error).toBeNull();
    });
  });

  describe('deleteAvatar', () => {
    it('should delete avatar and update profile', async () => {
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                avatar_url: 'https://storage.supabase.co/avatars/user-123.jpg',
              },
              error: null,
            }),
          }),
        }),
      });

      mockSupabaseClient.storage.from.mockReturnValue({
        remove: vi.fn().mockResolvedValue({ error: null }),
      });

      mockSupabaseClient.from.mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      const { deleteAvatar } = await import('@/services/profile.service');
      const result = await deleteAvatar('user-123');

      expect(result.data).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should handle case when no avatar exists', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { avatar_url: null },
              error: null,
            }),
          }),
        }),
      });

      const { deleteAvatar } = await import('@/services/profile.service');
      const result = await deleteAvatar('user-123');

      expect(result.data).toBe(true);
      expect(result.error).toBeNull();
    });
  });
});
