/**
 * Profile API Route
 *
 * Handles profile CRUD operations:
 * - GET /api/profile - Get current user's profile
 * - PATCH /api/profile - Update current user's profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProfile, updateProfile } from '@/services/profile.service';
import type { ProfileUpdate } from '@/types/database.types';

/**
 * GET /api/profile
 * Get the current user's profile
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get profile
    const { data: profile, error } = await getProfile(user.id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === 'UNAUTHENTICATED' ? 401 : 500 }
      );
    }

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error in GET /api/profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/profile
 * Update the current user's profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const updates: ProfileUpdate = {};

    // Validate and sanitize updates
    if (body.username !== undefined) {
      if (typeof body.username !== 'string' || body.username.length < 3) {
        return NextResponse.json(
          { error: 'Username must be at least 3 characters long' },
          { status: 400 }
        );
      }
      // Basic username validation: alphanumeric and underscores only
      if (!/^[a-zA-Z0-9_]+$/.test(body.username)) {
        return NextResponse.json(
          {
            error:
              'Username can only contain letters, numbers, and underscores',
          },
          { status: 400 }
        );
      }
      updates.username = body.username;
    }

    if (body.display_name !== undefined) {
      if (
        typeof body.display_name !== 'string' ||
        body.display_name.length < 2
      ) {
        return NextResponse.json(
          { error: 'Display name must be at least 2 characters long' },
          { status: 400 }
        );
      }
      updates.display_name = body.display_name;
    }

    if (body.notification_preferences !== undefined) {
      if (typeof body.notification_preferences !== 'object') {
        return NextResponse.json(
          { error: 'Invalid notification preferences format' },
          { status: 400 }
        );
      }
      updates.notification_preferences = body.notification_preferences;
    }

    if (body.onboarding_completed !== undefined) {
      if (typeof body.onboarding_completed !== 'boolean') {
        return NextResponse.json(
          { error: 'Onboarding completed must be a boolean' },
          { status: 400 }
        );
      }
      updates.onboarding_completed = body.onboarding_completed;
    }

    // Check if there are any valid updates
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid updates provided' },
        { status: 400 }
      );
    }

    // Update profile
    const { data: profile, error } = await updateProfile(updates);

    if (error) {
      if (error.code === 'USERNAME_TAKEN') {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error in PATCH /api/profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
