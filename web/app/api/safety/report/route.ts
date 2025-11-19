import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

// POST - Report a user
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { reportedUserId, reason, description } = body;

    // Validate required fields
    if (!reportedUserId || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate reason
    const validReasons = [
      'harassment',
      'inappropriate_content',
      'spam',
      'fake_profile',
      'other',
    ];

    if (!validReasons.includes(reason)) {
      return NextResponse.json({ error: 'Invalid reason' }, { status: 400 });
    }

    // Get reporter profile
    const { data: reporterProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (!reporterProfile) {
      return NextResponse.json(
        { error: 'Reporter profile not found' },
        { status: 404 }
      );
    }

    // Get reported user profile
    const { data: reportedProfile } = await supabase
      .from('user_profiles')
      .select('id, report_count')
      .eq('id', reportedUserId)
      .single();

    if (!reportedProfile) {
      return NextResponse.json(
        { error: 'Reported user not found' },
        { status: 404 }
      );
    }

    // Create report
    const { data: report, error: reportError } = await supabase
      .from('user_reports')
      .insert({
        reporter_id: reporterProfile.id,
        reported_user_id: reportedUserId,
        reason,
        description: description || '',
        status: 'pending',
      })
      .select()
      .single();

    if (reportError) {
      throw reportError;
    }

    // Increment report count on reported user
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        report_count: reportedProfile.report_count + 1,
      })
      .eq('id', reportedUserId);

    if (updateError) {
      console.error('Error updating report count:', updateError);
    }

    // TODO: If report count exceeds threshold, auto-flag for moderation

    return NextResponse.json(
      { message: 'Report submitted successfully', report },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    );
  }
}
