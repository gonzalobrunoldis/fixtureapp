/**
 * Profile Avatar API Route
 *
 * Handles avatar image operations:
 * - POST /api/profile/avatar - Upload avatar image
 * - DELETE /api/profile/avatar - Delete avatar image
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { uploadAvatar, deleteAvatar } from '@/services/profile.service';

/**
 * POST /api/profile/avatar
 * Upload avatar image
 */
export async function POST(request: NextRequest) {
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

    // Get form data
    const formData = await request.formData();
    const file = formData.get('avatar') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Upload avatar
    const { data: avatarUrl, error } = await uploadAvatar(file, user.id);

    if (error) {
      if (
        error.code === 'INVALID_FILE_TYPE' ||
        error.code === 'FILE_TOO_LARGE'
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ avatar_url: avatarUrl });
  } catch (error) {
    console.error('Error in POST /api/profile/avatar:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/profile/avatar
 * Delete avatar image
 */
export async function DELETE() {
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

    // Delete avatar
    const { error } = await deleteAvatar(user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/profile/avatar:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
