/**
 * Profile Service
 *
 * Handles all profile-related operations including:
 * - Profile creation (auto-triggered on signup)
 * - Profile updates (display name, username, avatar)
 * - Profile retrieval
 */

// @ts-nocheck - Temporary bypass for Supabase type inference issues
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import type { ProfileUpdate, ProfileInsert } from '@/types/database.types';

export interface ProfileServiceError {
  message: string;
  code?: string;
}

export interface ProfileServiceResult<T> {
  data: T | null;
  error: ProfileServiceError | null;
}

/**
 * Get profile for the current authenticated user
 */
export async function getProfile(
  userId?: string
): Promise<ProfileServiceResult<any>> {
  try {
    const supabase = await createClient();

    // If no userId provided, get current user
    let profileUserId = userId;
    if (!profileUserId) {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return {
          data: null,
          error: { message: 'Not authenticated', code: 'UNAUTHENTICATED' },
        };
      }

      profileUserId = user.id;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileUserId)
      .single();

    if (error) {
      return {
        data: null,
        error: { message: error.message, code: error.code },
      };
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        message:
          error instanceof Error ? error.message : 'Failed to get profile',
      },
    };
  }
}

/**
 * Create a new profile (typically called via database trigger on signup)
 * This function uses admin client to bypass RLS
 */
export async function createProfile(
  userId: string,
  displayName?: string,
  username?: string
): Promise<ProfileServiceResult<any>> {
  try {
    const supabase = createAdminClient();

    const profileData: ProfileInsert = {
      id: userId,
      username: username || null,
      display_name: displayName || null,
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

    const { data, error } = await (supabase
      .from('profiles')
      .insert(profileData as any)
      .select()
      .single() as any);

    if (error) {
      return {
        data: null,
        error: { message: error.message, code: error.code },
      };
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        message:
          error instanceof Error ? error.message : 'Failed to create profile',
      },
    };
  }
}

/**
 * Update profile for the current authenticated user
 */
export async function updateProfile(
  updates: ProfileUpdate
): Promise<ProfileServiceResult<any>> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        data: null,
        error: { message: 'Not authenticated', code: 'UNAUTHENTICATED' },
      };
    }

    // Check if username is being updated and if it's already taken
    if (updates.username) {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', updates.username)
        .neq('id', user.id)
        .single();

      if (existingProfile) {
        return {
          data: null,
          error: {
            message: 'Username already taken',
            code: 'USERNAME_TAKEN',
          },
        };
      }
    }

    const { data, error } = await (supabase
      .from('profiles')
      .update(updates as any)
      .eq('id', user.id)
      .select()
      .single() as any);

    if (error) {
      return {
        data: null,
        error: { message: error.message, code: error.code },
      };
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        message:
          error instanceof Error ? error.message : 'Failed to update profile',
      },
    };
  }
}

/**
 * Upload avatar image to Supabase Storage
 */
export async function uploadAvatar(
  file: File,
  userId: string
): Promise<ProfileServiceResult<string>> {
  try {
    const supabase = await createClient();

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return {
        data: null,
        error: {
          message:
            'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.',
          code: 'INVALID_FILE_TYPE',
        },
      };
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return {
        data: null,
        error: {
          message: 'File size too large. Maximum size is 2MB.',
          code: 'FILE_TOO_LARGE',
        },
      };
    }

    // Generate unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      return {
        data: null,
        error: { message: uploadError.message, code: 'UPLOAD_ERROR' },
      };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('profiles').getPublicUrl(filePath);

    // Update profile with new avatar URL
    const { error: updateError } = await (supabase
      .from('profiles')
      .update({ avatar_url: publicUrl } as any)
      .eq('id', userId) as any);

    if (updateError) {
      return {
        data: null,
        error: { message: updateError.message, code: updateError.code },
      };
    }

    return { data: publicUrl, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        message:
          error instanceof Error ? error.message : 'Failed to upload avatar',
      },
    };
  }
}

/**
 * Delete avatar image from Supabase Storage
 */
export async function deleteAvatar(
  userId: string
): Promise<ProfileServiceResult<boolean>> {
  try {
    const supabase = await createClient();

    // Get current profile to find avatar URL
    const { data: profile } = (await (supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', userId)
      .single() as any)) as { data: { avatar_url?: string } | null };

    if (!profile?.avatar_url) {
      return { data: true, error: null }; // No avatar to delete
    }

    // Extract file path from URL
    const url = new URL(profile.avatar_url);
    const filePath = url.pathname.split('/').slice(-2).join('/'); // Get 'avatars/filename'

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from('profiles')
      .remove([filePath]);

    if (deleteError) {
      return {
        data: null,
        error: { message: deleteError.message, code: 'DELETE_ERROR' },
      };
    }

    // Update profile to remove avatar URL
    const { error: updateError } = await (supabase
      .from('profiles')
      .update({ avatar_url: null } as any)
      .eq('id', userId) as any);

    if (updateError) {
      return {
        data: null,
        error: { message: updateError.message, code: updateError.code },
      };
    }

    return { data: true, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        message:
          error instanceof Error ? error.message : 'Failed to delete avatar',
      },
    };
  }
}
