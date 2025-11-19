import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

// Proximity threshold in pixels (adjust based on game world scale)
const ENCOUNTER_RADIUS = 150;

// GET - Find nearby users for potential encounters
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user profile
    const { data: currentUser, error: userError } = await supabase
      .from('user_profiles')
      .select('id, position_x, position_y, current_town')
      .eq('clerk_user_id', userId)
      .single();

    if (userError || !currentUser) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Get all users blocked by current user
    const { data: blockedUsers } = await supabase
      .from('blocked_users')
      .select('blocked_user_id')
      .eq('blocker_id', currentUser.id);

    const blockedUserIds = blockedUsers?.map((b) => b.blocked_user_id) || [];

    // Get all users who blocked current user
    const { data: blockingUsers } = await supabase
      .from('blocked_users')
      .select('blocker_id')
      .eq('blocked_user_id', currentUser.id);

    const blockingUserIds = blockingUsers?.map((b) => b.blocker_id) || [];

    // Combine all blocked user IDs
    const excludedUserIds = [
      currentUser.id,
      ...blockedUserIds,
      ...blockingUserIds,
    ];

    // Get all users in same town who are active
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { data: potentialMatches, error: matchError } = await supabase
      .from('user_profiles')
      .select(
        'id, clerk_user_id, display_name, age, gender, bio, interests, avatar_color, position_x, position_y, current_town'
      )
      .eq('current_town', currentUser.current_town)
      .eq('is_banned', false)
      .gte('last_active', fiveMinutesAgo)
      .not('id', 'in', `(${excludedUserIds.join(',')})`);

    if (matchError) {
      throw matchError;
    }

    if (!potentialMatches || potentialMatches.length === 0) {
      return NextResponse.json({ nearbyUsers: [] }, { status: 200 });
    }

    // Calculate distances and filter by proximity
    const nearbyUsers = potentialMatches
      .map((user) => {
        const dx = user.position_x - currentUser.position_x;
        const dy = user.position_y - currentUser.position_y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return {
          ...user,
          distance,
        };
      })
      .filter((user) => user.distance <= ENCOUNTER_RADIUS)
      .sort((a, b) => a.distance - b.distance);

    // Check if users have already matched
    const nearbyUserIds = nearbyUsers.map((u) => u.id);

    if (nearbyUserIds.length > 0) {
      // Get existing matches (both directions)
      const { data: existingMatches } = await supabase
        .from('matches')
        .select('user1_id, user2_id, status')
        .or(
          `and(user1_id.eq.${currentUser.id},user2_id.in.(${nearbyUserIds.join(',')})),and(user2_id.eq.${currentUser.id},user1_id.in.(${nearbyUserIds.join(',')}))`
        );

      // Create a set of already matched user IDs
      const alreadyMatchedIds = new Set(
        existingMatches?.map((m) =>
          m.user1_id === currentUser.id ? m.user2_id : m.user1_id
        ) || []
      );

      // Filter out already matched users
      const filteredUsers = nearbyUsers.filter(
        (user) => !alreadyMatchedIds.has(user.id)
      );

      return NextResponse.json({ nearbyUsers: filteredUsers }, { status: 200 });
    }

    return NextResponse.json({ nearbyUsers }, { status: 200 });
  } catch (error) {
    console.error('Error finding nearby users:', error);
    return NextResponse.json(
      { error: 'Failed to find nearby users' },
      { status: 500 }
    );
  }
}
