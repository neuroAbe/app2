import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// POST - Block a user
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { blockedUserId } = body;

    if (!blockedUserId) {
      return NextResponse.json(
        { error: 'Missing blocked user ID' },
        { status: 400 }
      );
    }

    // CRITICAL: Validate blockedUserId is a valid UUID
    if (typeof blockedUserId !== 'string' || !UUID_REGEX.test(blockedUserId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // Create authenticated Supabase client
    const supabase = await createServerSupabaseClient();

    // Get blocker profile
    const { data: blockerProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (!blockerProfile) {
      return NextResponse.json(
        { error: 'Your profile not found' },
        { status: 404 }
      );
    }

    // Prevent blocking yourself
    if (blockerProfile.id === blockedUserId) {
      return NextResponse.json(
        { error: 'Cannot block yourself' },
        { status: 400 }
      );
    }

    // Verify blocked user exists and is accessible
    const { data: blockedProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', blockedUserId)
      .single();

    if (!blockedProfile) {
      return NextResponse.json(
        { error: 'User to block not found or inaccessible' },
        { status: 404 }
      );
    }

    // Check if already blocked (RLS will filter to blocker's blocks only)
    const { data: existing } = await supabase
      .from('blocked_users')
      .select('id')
      .eq('blocker_id', blockerProfile.id)
      .eq('blocked_user_id', blockedUserId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'User already blocked' },
        { status: 409 }
      );
    }

    // Create block - RLS ensures blocker_id matches authenticated user
    const { data: block, error: blockError } = await supabase
      .from('blocked_users')
      .insert({
        blocker_id: blockerProfile.id,
        blocked_user_id: blockedUserId,
      })
      .select()
      .single();

    if (blockError) {
      // Handle database constraint violations
      if (blockError.code === '23505') {
        return NextResponse.json(
          { error: 'User already blocked' },
          { status: 409 }
        );
      }
      throw blockError;
    }

    return NextResponse.json(
      { message: 'User blocked successfully', block },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error blocking user:', error);
    return NextResponse.json(
      { error: 'Failed to block user' },
      { status: 500 }
    );
  }
}

// DELETE - Unblock a user
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { blockedUserId } = body;

    if (!blockedUserId) {
      return NextResponse.json(
        { error: 'Missing blocked user ID' },
        { status: 400 }
      );
    }

    // CRITICAL: Validate blockedUserId is a valid UUID
    if (typeof blockedUserId !== 'string' || !UUID_REGEX.test(blockedUserId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // Create authenticated Supabase client
    const supabase = await createServerSupabaseClient();

    // Get blocker profile
    const { data: blockerProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (!blockerProfile) {
      return NextResponse.json(
        { error: 'Your profile not found' },
        { status: 404 }
      );
    }

    // Delete block
    const { error } = await supabase
      .from('blocked_users')
      .delete()
      .eq('blocker_id', blockerProfile.id)
      .eq('blocked_user_id', blockedUserId);

    if (error) {
      throw error;
    }

    return NextResponse.json(
      { message: 'User unblocked successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error unblocking user:', error);
    return NextResponse.json(
      { error: 'Failed to unblock user' },
      { status: 500 }
    );
  }
}
