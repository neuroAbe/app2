import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

// GET - Retrieve user profile
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
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

    // Age verification
    if (age < 18) {
      return NextResponse.json(
        { error: 'Must be 18 or older' },
        { status: 400 }
      );
    }

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

    // Create profile
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        clerk_user_id: userId,
        display_name: displayName,
        age: parseInt(age),
        gender,
        looking_for: lookingFor,
        bio: bio || '',
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
    const updates: any = {};

    // Only allow certain fields to be updated
    const allowedFields = [
      'display_name',
      'bio',
      'interests',
      'avatar_color',
      'current_town',
      'position_x',
      'position_y',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    // Update last_active timestamp
    updates.last_active = new Date().toISOString();

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
