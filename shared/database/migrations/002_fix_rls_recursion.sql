-- Migration: Fix RLS policies - avoid infinite recursion
-- Run this in your Supabase SQL Editor

-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view other profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can create reports" ON user_reports;
DROP POLICY IF EXISTS "Users can view own reports" ON user_reports;
DROP POLICY IF EXISTS "Users can block others" ON blocked_users;
DROP POLICY IF EXISTS "Users can view own blocks" ON blocked_users;
DROP POLICY IF EXISTS "Users can delete own blocks" ON blocked_users;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
DROP POLICY IF EXISTS "Users can insert own events" ON game_events;
DROP POLICY IF EXISTS "Users can view own events" ON game_events;
DROP POLICY IF EXISTS "Users can view own matches" ON matches;

-- USER_PROFILES policies (simple, no recursion)
-- Users can INSERT their own profile
CREATE POLICY "Users can insert own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (clerk_user_id = auth.jwt()->>'sub');

-- Users can SELECT their own profile
CREATE POLICY "Users can view own profile"
    ON user_profiles FOR SELECT
    USING (clerk_user_id = auth.jwt()->>'sub');

-- Users can UPDATE their own profile
CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (clerk_user_id = auth.jwt()->>'sub');

-- Users can view OTHER non-banned profiles (simpler version without block check for now)
CREATE POLICY "Users can view other profiles"
    ON user_profiles FOR SELECT
    USING (is_banned = false);

-- BLOCKED_USERS policies
CREATE POLICY "Users can block others"
    ON blocked_users FOR INSERT
    WITH CHECK (
        blocker_id IN (
            SELECT id FROM user_profiles
            WHERE clerk_user_id = auth.jwt()->>'sub'
        )
    );

CREATE POLICY "Users can view own blocks"
    ON blocked_users FOR SELECT
    USING (
        blocker_id IN (
            SELECT id FROM user_profiles
            WHERE clerk_user_id = auth.jwt()->>'sub'
        )
    );

CREATE POLICY "Users can delete own blocks"
    ON blocked_users FOR DELETE
    USING (
        blocker_id IN (
            SELECT id FROM user_profiles
            WHERE clerk_user_id = auth.jwt()->>'sub'
        )
    );

-- USER_REPORTS policies
CREATE POLICY "Users can create reports"
    ON user_reports FOR INSERT
    WITH CHECK (
        reporter_id IN (
            SELECT id FROM user_profiles
            WHERE clerk_user_id = auth.jwt()->>'sub'
        )
    );

CREATE POLICY "Users can view own reports"
    ON user_reports FOR SELECT
    USING (
        reporter_id IN (
            SELECT id FROM user_profiles
            WHERE clerk_user_id = auth.jwt()->>'sub'
        )
    );

-- MESSAGES policies
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

-- GAME_EVENTS policies
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

-- MATCHES policies
CREATE POLICY "Users can view own matches"
    ON matches FOR SELECT
    USING (
        user1_id IN (SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt()->>'sub')
        OR
        user2_id IN (SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt()->>'sub')
    );
