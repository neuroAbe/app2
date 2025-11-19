import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

    // CRITICAL: Validate reportedUserId is a valid UUID to prevent injection
    if (typeof reportedUserId !== 'string' || !UUID_REGEX.test(reportedUserId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
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

    // Validate description if provided
    if (description && (typeof description !== 'string' || description.length > 1000)) {
      return NextResponse.json(
        { error: 'Description must be 1000 characters or less' },
        { status: 400 }
      );
    }

    // Create authenticated Supabase client
    const supabase = await createServerSupabaseClient();

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

    // Prevent self-reporting
    if (reporterProfile.id === reportedUserId) {
      return NextResponse.json(
        { error: 'Cannot report yourself' },
        { status: 400 }
      );
    }

    // CRITICAL: Verify reported user exists and is accessible (RLS will prevent viewing blocked/banned users)
    const { data: reportedProfile, error: lookupError } = await supabase
      .from('user_profiles')
      .select('id, report_count, is_banned')
      .eq('id', reportedUserId)
      .single();

    if (lookupError || !reportedProfile) {
      return NextResponse.json(
        { error: 'Reported user not found or inaccessible' },
        { status: 404 }
      );
    }

    // Create report - RLS ensures reporter_id matches authenticated user
    const { data: report, error: reportError } = await supabase
      .from('user_reports')
      .insert({
        reporter_id: reporterProfile.id,
        reported_user_id: reportedUserId,
        reason,
        description: description ? description.trim() : '',
        status: 'pending',
      })
      .select()
      .single();

    if (reportError) {
      // Handle duplicate report within 24 hours
      if (reportError.code === '23505') {
        return NextResponse.json(
          { error: 'You have already reported this user recently' },
          { status: 409 }
        );
      }
      throw reportError;
    }

    // Increment report count on reported user
    const newReportCount = reportedProfile.report_count + 1;
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        report_count: newReportCount,
      })
      .eq('id', reportedUserId);

    if (updateError) {
      console.error('Error updating report count:', updateError);
    }

    // Auto-flag for moderation if threshold exceeded
    const REPORT_THRESHOLD = 5;
    if (newReportCount >= REPORT_THRESHOLD && !reportedProfile.is_banned) {
      // In production, this would trigger a moderation queue/webhook
      console.warn(`User ${reportedUserId} has ${newReportCount} reports - flagged for moderation`);

      // Could add to moderation queue here:
      // await supabase.from('moderation_queue').insert({
      //   user_id: reportedUserId,
      //   report_count: newReportCount,
      //   flagged_at: new Date().toISOString()
      // });
    }

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
