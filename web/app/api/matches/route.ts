import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

// GET - Get all matches for current user
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user profile
    const { data: currentUser } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Get all matches where user is either user1 or user2
    const { data: matches, error: matchError } = await supabase
      .from('matches')
      .select(
        `
        *,
        user1:user_profiles!matches_user1_id_fkey(id, display_name, age, gender, bio, interests, avatar_color),
        user2:user_profiles!matches_user2_id_fkey(id, display_name, age, gender, bio, interests, avatar_color)
      `
      )
      .or(`user1_id.eq.${currentUser.id},user2_id.eq.${currentUser.id}`)
      .order('matched_at', { ascending: false });

    if (matchError) {
      throw matchError;
    }

    // Transform matches to show the "other" user
    const transformedMatches = matches?.map((match: any) => {
      const isUser1 = match.user1_id === currentUser.id;
      const otherUser = isUser1 ? match.user2 : match.user1;

      return {
        id: match.id,
        status: match.status,
        matched_at: match.matched_at,
        encounter_location: match.encounter_location,
        otherUser,
      };
    });

    return NextResponse.json({ matches: transformedMatches }, { status: 200 });
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}

// POST - Create a new match (initiate encounter)
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { otherUserId, encounterLocation } = body;

    if (!otherUserId) {
      return NextResponse.json(
        { error: 'Missing other user ID' },
        { status: 400 }
      );
    }

    // Get current user profile
    const { data: currentUser } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Verify other user exists
    const { data: otherUser } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', otherUserId)
      .single();

    if (!otherUser) {
      return NextResponse.json(
        { error: 'Other user not found' },
        { status: 404 }
      );
    }

    // Prevent self-matching
    if (currentUser.id === otherUserId) {
      return NextResponse.json(
        { error: 'Cannot match with yourself' },
        { status: 400 }
      );
    }

    // Ensure user1_id < user2_id for consistency
    const user1_id =
      currentUser.id < otherUserId ? currentUser.id : otherUserId;
    const user2_id =
      currentUser.id < otherUserId ? otherUserId : currentUser.id;

    // Check if match already exists
    const { data: existingMatch } = await supabase
      .from('matches')
      .select('id, status')
      .eq('user1_id', user1_id)
      .eq('user2_id', user2_id)
      .single();

    if (existingMatch) {
      return NextResponse.json(
        { error: 'Match already exists', match: existingMatch },
        { status: 409 }
      );
    }

    // Create match
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .insert({
        user1_id,
        user2_id,
        status: 'pending',
        encounter_location: encounterLocation || 'starter_town',
      })
      .select()
      .single();

    if (matchError) {
      throw matchError;
    }

    // Log encounter event
    await supabase.from('game_events').insert({
      user_id: currentUser.id,
      event_type: 'encounter',
      event_data: {
        other_user_id: otherUserId,
        location: encounterLocation || 'starter_town',
      },
    });

    return NextResponse.json(
      { message: 'Match created successfully', match },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating match:', error);
    return NextResponse.json(
      { error: 'Failed to create match' },
      { status: 500 }
    );
  }
}

// PATCH - Update match status (accept/reject)
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { matchId, status } = body;

    if (!matchId || !status) {
      return NextResponse.json(
        { error: 'Missing match ID or status' },
        { status: 400 }
      );
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Get current user profile
    const { data: currentUser } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Verify match exists and user is part of it
    const { data: match } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    if (
      match.user1_id !== currentUser.id &&
      match.user2_id !== currentUser.id
    ) {
      return NextResponse.json(
        { error: 'Not authorized to update this match' },
        { status: 403 }
      );
    }

    // Update match status
    const { data: updatedMatch, error: updateError } = await supabase
      .from('matches')
      .update({ status })
      .eq('id', matchId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Log match event if accepted
    if (status === 'accepted') {
      await supabase.from('game_events').insert({
        user_id: currentUser.id,
        event_type: 'match',
        event_data: {
          match_id: matchId,
          other_user_id:
            match.user1_id === currentUser.id
              ? match.user2_id
              : match.user1_id,
        },
      });
    }

    return NextResponse.json(
      { message: 'Match updated successfully', match: updatedMatch },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating match:', error);
    return NextResponse.json(
      { error: 'Failed to update match' },
      { status: 500 }
    );
  }
}
