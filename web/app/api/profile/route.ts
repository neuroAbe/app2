import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET - Retrieve user profile
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create authenticated Supabase client with Clerk JWT
    const supabase = await createServerSupabaseClient();

    // RLS policies will automatically filter by authenticated user
    const { data, error} = await supabase
      .from('user_profiles')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No profile found
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ profile: data }, { status: 200 });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// POST - Create user profile
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      displayName,
      age,
      gender,
      lookingFor,
      bio,
      interests,
      avatarColor,
    } = body;

    // Validate required fields
    if (!displayName || !age || !gender || !lookingFor) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate display name
    if (typeof displayName !== 'string' || displayName.trim().length === 0 || displayName.length > 100) {
      return NextResponse.json(
        { error: 'Display name must be between 1 and 100 characters' },
        { status: 400 }
      );
    }

    // Age verification
    const parsedAge = parseInt(age);
    if (isNaN(parsedAge) || parsedAge < 18 || parsedAge > 120) {
      return NextResponse.json(
        { error: 'Must be 18 or older (and under 120)' },
        { status: 400 }
      );
    }

    // Validate gender
    const validGenders = ['Male', 'Female', 'Non-binary'];
    if (!validGenders.includes(gender)) {
      return NextResponse.json(
        { error: 'Invalid gender value' },
        { status: 400 }
      );
    }

    // Validate lookingFor
    const validLookingFor = ['Men', 'Women', 'Everyone'];
    if (!validLookingFor.includes(lookingFor)) {
      return NextResponse.json(
        { error: 'Invalid lookingFor value' },
        { status: 400 }
      );
    }

    // Validate bio if provided
    if (bio && bio.length > 500) {
      return NextResponse.json(
        { error: 'Bio must be 500 characters or less' },
        { status: 400 }
      );
    }

    // Create authenticated Supabase client
    const supabase = await createServerSupabaseClient();

    // Check if profile already exists
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Profile already exists' },
        { status: 409 }
      );
    }

    // Create profile - RLS ensures clerk_user_id matches authenticated user
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        clerk_user_id: userId,
        display_name: displayName.trim(),
        age: parsedAge,
        gender,
        looking_for: lookingFor,
        bio: bio ? bio.trim() : '',
        interests: interests || [],
        avatar_color: avatarColor || '#00ff00',
        email_verified: true, // Clerk handles this
        phone_verified: false,
        verification_level: 'basic',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(
      { profile: data, message: 'Profile created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating profile:', error);
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    );
  }
}

// PATCH - Update user profile
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const updates: Partial<{
      display_name: string;
      bio: string;
      interests: string[];
      avatar_color: string;
      current_town: string;
      position_x: number;
      position_y: number;
      last_active: string;
    }> = {};

    // Validate and sanitize display_name if provided
    if (body.display_name !== undefined) {
      if (typeof body.display_name !== 'string' || body.display_name.trim().length === 0 || body.display_name.length > 100) {
        return NextResponse.json(
          { error: 'Display name must be between 1 and 100 characters' },
          { status: 400 }
        );
      }
      updates.display_name = body.display_name.trim();
    }

    // Validate and sanitize bio if provided
    if (body.bio !== undefined) {
      if (typeof body.bio !== 'string' || body.bio.length > 500) {
        return NextResponse.json(
          { error: 'Bio must be 500 characters or less' },
          { status: 400 }
        );
      }
      updates.bio = body.bio.trim();
    }

    // Validate interests if provided
    if (body.interests !== undefined) {
      if (!Array.isArray(body.interests) || !body.interests.every(i => typeof i === 'string')) {
        return NextResponse.json(
          { error: 'Interests must be an array of strings' },
          { status: 400 }
        );
      }
      updates.interests = body.interests;
    }

    // Validate avatar_color if provided
    if (body.avatar_color !== undefined) {
      if (typeof body.avatar_color !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(body.avatar_color)) {
        return NextResponse.json(
          { error: 'Avatar color must be a valid hex color (#RRGGBB)' },
          { status: 400 }
        );
      }
      updates.avatar_color = body.avatar_color;
    }

    // Validate game state fields if provided
    if (body.current_town !== undefined) {
      if (typeof body.current_town !== 'string' || body.current_town.length > 100) {
        return NextResponse.json(
          { error: 'Invalid town name' },
          { status: 400 }
        );
      }
      updates.current_town = body.current_town;
    }

    if (body.position_x !== undefined) {
      const x = Number(body.position_x);
      if (isNaN(x)) {
        return NextResponse.json(
          { error: 'Position X must be a number' },
          { status: 400 }
        );
      }
      updates.position_x = x;
    }

    if (body.position_y !== undefined) {
      const y = Number(body.position_y);
      if (isNaN(y)) {
        return NextResponse.json(
          { error: 'Position Y must be a number' },
          { status: 400 }
        );
      }
      updates.position_y = y;
    }

    // Update last_active timestamp
    updates.last_active = new Date().toISOString();

    // Create authenticated Supabase client
    const supabase = await createServerSupabaseClient();

    // RLS policy ensures user can only update their own profile
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('clerk_user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(
      { profile: data, message: 'Profile updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
