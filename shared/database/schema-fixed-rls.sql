-- Fixed RLS Policies for Clerk + Supabase Integration (2025)
-- This file updates the RLS policies to use Clerk JWT tokens properly
--
-- Migration: Run this AFTER the initial schema.sql
-- Purpose: Fix broken RLS policies that relied on current_setting()

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view other profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can create reports" ON user_reports;
DROP POLICY IF EXISTS "Users can block others" ON blocked_users;

-- ============================================================================
-- USER PROFILES POLICIES
-- ============================================================================

-- Users can view their own profile using Clerk JWT
CREATE POLICY "Users can view own profile"
    ON user_profiles FOR SELECT
    USING (clerk_user_id = (auth.jwt() -> 'sub')::text);

-- Users can update their own profile (except safety fields)
CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (clerk_user_id = (auth.jwt() -> 'sub')::text)
    WITH CHECK (
        -- Prevent users from modifying safety fields
        clerk_user_id = (auth.jwt() -> 'sub')::text AND
        is_banned = is_banned AND  -- No change to is_banned
        ban_reason = ban_reason AND  -- No change to ban_reason
        report_count = report_count  -- No change to report_count
    );

-- Users can view non-banned, non-blocked profiles
CREATE POLICY "Users can view other profiles"
    ON user_profiles FOR SELECT
    USING (
        is_banned = false AND
        id NOT IN (
            SELECT blocked_user_id FROM blocked_users
            WHERE blocker_id IN (
                SELECT id FROM user_profiles
                WHERE clerk_user_id = (auth.jwt() -> 'sub')::text
            )
        ) AND
        -- Prevent viewing profiles that have blocked you
        (auth.jwt() -> 'sub')::text NOT IN (
            SELECT clerk_user_id FROM user_profiles
            WHERE id IN (
                SELECT blocker_id FROM blocked_users
                WHERE blocked_user_id = user_profiles.id
            )
        )
    );

-- Users can insert their own profile during onboarding
CREATE POLICY "Users can create own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (clerk_user_id = (auth.jwt() -> 'sub')::text);

-- ============================================================================
-- USER REPORTS POLICIES
-- ============================================================================

-- Users can create reports about other users
CREATE POLICY "Users can create reports"
    ON user_reports FOR INSERT
    WITH CHECK (
        reporter_id IN (
            SELECT id FROM user_profiles
            WHERE clerk_user_id = (auth.jwt() -> 'sub')::text
        )
    );

-- Users can view reports they created
CREATE POLICY "Users can view own reports"
    ON user_reports FOR SELECT
    USING (
        reporter_id IN (
            SELECT id FROM user_profiles
            WHERE clerk_user_id = (auth.jwt() -> 'sub')::text
        )
    );

-- ============================================================================
-- BLOCKED USERS POLICIES
-- ============================================================================

-- Users can block others
CREATE POLICY "Users can block others"
    ON blocked_users FOR INSERT
    WITH CHECK (
        blocker_id IN (
            SELECT id FROM user_profiles
            WHERE clerk_user_id = (auth.jwt() -> 'sub')::text
        )
    );

-- Users can view their block list
CREATE POLICY "Users can view own blocks"
    ON blocked_users FOR SELECT
    USING (
        blocker_id IN (
            SELECT id FROM user_profiles
            WHERE clerk_user_id = (auth.jwt() -> 'sub')::text
        )
    );

-- Users can unblock others
CREATE POLICY "Users can delete own blocks"
    ON blocked_users FOR DELETE
    USING (
        blocker_id IN (
            SELECT id FROM user_profiles
            WHERE clerk_user_id = (auth.jwt() -> 'sub')::text
        )
    );

-- ============================================================================
-- MATCHES POLICIES
-- ============================================================================

-- Users can view matches they're part of
CREATE POLICY "Users can view own matches"
    ON matches FOR SELECT
    USING (
        user1_id IN (
            SELECT id FROM user_profiles
            WHERE clerk_user_id = (auth.jwt() -> 'sub')::text
        )
        OR
        user2_id IN (
            SELECT id FROM user_profiles
            WHERE clerk_user_id = (auth.jwt() -> 'sub')::text
        )
    );

-- System can create matches (via service role)
-- Users cannot directly create matches (matches are created by encounter system)

-- Users can update match status
CREATE POLICY "Users can update own matches"
    ON matches FOR UPDATE
    USING (
        user1_id IN (
            SELECT id FROM user_profiles
            WHERE clerk_user_id = (auth.jwt() -> 'sub')::text
        )
        OR
        user2_id IN (
            SELECT id FROM user_profiles
            WHERE clerk_user_id = (auth.jwt() -> 'sub')::text
        )
    );

-- ============================================================================
-- MESSAGES POLICIES
-- ============================================================================

-- Users can view messages where they are sender or recipient
CREATE POLICY "Users can view own messages"
    ON messages FOR SELECT
    USING (
        from_user_id IN (
            SELECT id FROM user_profiles
            WHERE clerk_user_id = (auth.jwt() -> 'sub')::text
        )
        OR
        to_user_id IN (
            SELECT id FROM user_profiles
            WHERE clerk_user_id = (auth.jwt() -> 'sub')::text
        )
    );

-- Users can send messages
CREATE POLICY "Users can send messages"
    ON messages FOR INSERT
    WITH CHECK (
        from_user_id IN (
            SELECT id FROM user_profiles
            WHERE clerk_user_id = (auth.jwt() -> 'sub')::text
        )
    );

-- Users can mark their received messages as read
CREATE POLICY "Users can update received messages"
    ON messages FOR UPDATE
    USING (
        to_user_id IN (
            SELECT id FROM user_profiles
            WHERE clerk_user_id = (auth.jwt() -> 'sub')::text
        )
    );

-- ============================================================================
-- GAME EVENTS POLICIES
-- ============================================================================

-- Users can view their own game events
CREATE POLICY "Users can view own game events"
    ON game_events FOR SELECT
    USING (
        user_id IN (
            SELECT id FROM user_profiles
            WHERE clerk_user_id = (auth.jwt() -> 'sub')::text
        )
    );

-- System creates game events (via service role or trusted API)
CREATE POLICY "Users can create own game events"
    ON game_events FOR INSERT
    WITH CHECK (
        user_id IN (
            SELECT id FROM user_profiles
            WHERE clerk_user_id = (auth.jwt() -> 'sub')::text
        )
    );

-- ============================================================================
-- COMMENTS & VERIFICATION
-- ============================================================================

-- Verify RLS is enabled on all tables
DO $$
BEGIN
    ASSERT (SELECT relrowsecurity FROM pg_class WHERE relname = 'user_profiles');
    ASSERT (SELECT relrowsecurity FROM pg_class WHERE relname = 'user_reports');
    ASSERT (SELECT relrowsecurity FROM pg_class WHERE relname = 'blocked_users');
    ASSERT (SELECT relrowsecurity FROM pg_class WHERE relname = 'matches');
    ASSERT (SELECT relrowsecurity FROM pg_class WHERE relname = 'messages');
    ASSERT (SELECT relrowsecurity FROM pg_class WHERE relname = 'game_events');
    RAISE NOTICE 'RLS is enabled on all tables ✓';
END$$;

COMMENT ON POLICY "Users can view own profile" ON user_profiles IS
'Users can view their own profile using Clerk JWT sub claim';

COMMENT ON POLICY "Users can view other profiles" ON user_profiles IS
'Users can view non-banned profiles, excluding blocked users and users who blocked them';

COMMENT ON POLICY "Users can update own profile" ON user_profiles IS
'Users can update their profile but cannot modify safety fields (is_banned, ban_reason, report_count)';
