-- Migration: Fix RLS policies to work with Clerk JWT tokens
-- Run this in your Supabase SQL Editor

-- Drop existing policies that use current_setting()
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view other profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can create reports" ON user_reports;
DROP POLICY IF EXISTS "Users can block others" ON blocked_users;

-- Create new policies using auth.jwt() for Clerk integration
-- The JWT 'sub' claim contains the Clerk user ID

-- Users can INSERT their own profile (during onboarding)
CREATE POLICY "Users can insert own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (clerk_user_id = auth.jwt()->>'sub');

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON user_profiles FOR SELECT
    USING (clerk_user_id = auth.jwt()->>'sub');

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (clerk_user_id = auth.jwt()->>'sub');

-- Users can view other non-banned, non-blocked profiles
CREATE POLICY "Users can view other profiles"
    ON user_profiles FOR SELECT
    USING (
        is_banned = false AND
        id NOT IN (
            SELECT blocked_user_id FROM blocked_users
            WHERE blocker_id IN (
                SELECT id FROM user_profiles
                WHERE clerk_user_id = auth.jwt()->>'sub'
            )
        )
    );

-- Users can create reports
CREATE POLICY "Users can create reports"
    ON user_reports FOR INSERT
    WITH CHECK (
        reporter_id IN (
            SELECT id FROM user_profiles
            WHERE clerk_user_id = auth.jwt()->>'sub'
        )
    );

-- Users can view their own reports
CREATE POLICY "Users can view own reports"
    ON user_reports FOR SELECT
    USING (
        reporter_id IN (
            SELECT id FROM user_profiles
            WHERE clerk_user_id = auth.jwt()->>'sub'
        )
    );

-- Users can block others
CREATE POLICY "Users can block others"
    ON blocked_users FOR INSERT
    WITH CHECK (
        blocker_id IN (
            SELECT id FROM user_profiles
            WHERE clerk_user_id = auth.jwt()->>'sub'
        )
    );

-- Users can view their blocks
CREATE POLICY "Users can view own blocks"
    ON blocked_users FOR SELECT
    USING (
        blocker_id IN (
            SELECT id FROM user_profiles
            WHERE clerk_user_id = auth.jwt()->>'sub'
        )
    );

-- Users can unblock
CREATE POLICY "Users can delete own blocks"
    ON blocked_users FOR DELETE
    USING (
        blocker_id IN (
            SELECT id FROM user_profiles
            WHERE clerk_user_id = auth.jwt()->>'sub'
        )
    );

-- Messages policies
CREATE POLICY "Users can send messages"
    ON messages FOR INSERT
    WITH CHECK (
        from_user_id IN (
            SELECT id FROM user_profiles
            WHERE clerk_user_id = auth.jwt()->>'sub'
        )
    );

CREATE POLICY "Users can view own messages"
    ON messages FOR SELECT
    USING (
        from_user_id IN (SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt()->>'sub')
        OR
        to_user_id IN (SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt()->>'sub')
    );

-- Game events policies
CREATE POLICY "Users can insert own events"
    ON game_events FOR INSERT
    WITH CHECK (
        user_id IN (
            SELECT id FROM user_profiles
            WHERE clerk_user_id = auth.jwt()->>'sub'
        )
    );

CREATE POLICY "Users can view own events"
    ON game_events FOR SELECT
    USING (
        user_id IN (
            SELECT id FROM user_profiles
            WHERE clerk_user_id = auth.jwt()->>'sub'
        )
    );

-- Matches policies
CREATE POLICY "Users can view own matches"
    ON matches FOR SELECT
    USING (
        user1_id IN (SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt()->>'sub')
        OR
        user2_id IN (SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt()->>'sub')
    );
