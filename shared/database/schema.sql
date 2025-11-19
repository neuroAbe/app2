-- PixelMatch Database Schema
-- PostgreSQL Database Structure

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 18),
    gender VARCHAR(50) NOT NULL,
    looking_for VARCHAR(50) NOT NULL,
    bio TEXT,
    interests TEXT[] DEFAULT '{}',
    avatar_color VARCHAR(7) DEFAULT '#00ff00',

    -- Verification Status
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    photo_verified BOOLEAN DEFAULT false,
    id_verified BOOLEAN DEFAULT false,
    verification_level VARCHAR(20) DEFAULT 'none' CHECK (
        verification_level IN ('none', 'basic', 'verified', 'premium')
    ),

    -- Safety Flags
    is_banned BOOLEAN DEFAULT false,
    ban_reason TEXT,
    report_count INTEGER DEFAULT 0,

    -- Game State
    current_town VARCHAR(100) DEFAULT 'starter_town',
    position_x FLOAT DEFAULT 400,
    position_y FLOAT DEFAULT 300,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports Table
CREATE TABLE user_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    reported_user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    reason VARCHAR(50) NOT NULL CHECK (
        reason IN ('harassment', 'inappropriate_content', 'spam', 'fake_profile', 'other')
    ),
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN ('pending', 'reviewed', 'action_taken', 'dismissed')
    ),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by VARCHAR(255),

    -- Prevent duplicate reports within 24 hours
    CONSTRAINT unique_report_per_day UNIQUE (reporter_id, reported_user_id, created_at)
);

-- Blocked Users Table
CREATE TABLE blocked_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blocker_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    blocked_user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Prevent blocking yourself
    CHECK (blocker_id != blocked_user_id),
    -- Ensure unique blocks
    UNIQUE (blocker_id, blocked_user_id)
);

-- Matches Table
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN ('pending', 'accepted', 'rejected')
    ),
    matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    encounter_location VARCHAR(100),

    -- Ensure unique matches
    CHECK (user1_id < user2_id)
);

-- Messages Table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_flagged BOOLEAN DEFAULT false,
    toxicity_score FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,

    -- Prevent sending to yourself
    CHECK (from_user_id != to_user_id)
);

-- Game Events Table
CREATE TABLE game_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (
        event_type IN ('encounter', 'match', 'message', 'quest_complete', 'badge_earned', 'town_visit')
    ),
    event_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_user_profiles_clerk_id ON user_profiles(clerk_user_id);
CREATE INDEX idx_user_profiles_last_active ON user_profiles(last_active);
CREATE INDEX idx_user_profiles_current_town ON user_profiles(current_town);
CREATE INDEX idx_user_reports_status ON user_reports(status);
CREATE INDEX idx_user_reports_reported_user ON user_reports(reported_user_id);
CREATE INDEX idx_blocked_users_blocker ON blocked_users(blocker_id);
CREATE INDEX idx_blocked_users_blocked ON blocked_users(blocked_user_id);
CREATE INDEX idx_matches_users ON matches(user1_id, user2_id);
CREATE INDEX idx_messages_from_user ON messages(from_user_id);
CREATE INDEX idx_messages_to_user ON messages(to_user_id);
CREATE INDEX idx_game_events_user ON game_events(user_id);
CREATE INDEX idx_game_events_type ON game_events(event_type);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;

-- User can read their own profile
CREATE POLICY "Users can view own profile"
    ON user_profiles FOR SELECT
    USING (clerk_user_id = current_setting('app.current_user_id', true));

-- User can update their own profile (except safety fields)
CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (clerk_user_id = current_setting('app.current_user_id', true));

-- Users can view non-banned, non-blocked profiles
CREATE POLICY "Users can view other profiles"
    ON user_profiles FOR SELECT
    USING (
        is_banned = false AND
        id NOT IN (
            SELECT blocked_user_id FROM blocked_users
            WHERE blocker_id IN (
                SELECT id FROM user_profiles
                WHERE clerk_user_id = current_setting('app.current_user_id', true)
            )
        )
    );

-- Users can create reports
CREATE POLICY "Users can create reports"
    ON user_reports FOR INSERT
    WITH CHECK (
        reporter_id IN (
            SELECT id FROM user_profiles
            WHERE clerk_user_id = current_setting('app.current_user_id', true)
        )
    );

-- Users can block others
CREATE POLICY "Users can block others"
    ON blocked_users FOR INSERT
    WITH CHECK (
        blocker_id IN (
            SELECT id FROM user_profiles
            WHERE clerk_user_id = current_setting('app.current_user_id', true)
        )
    );

-- Comments for documentation
COMMENT ON TABLE user_profiles IS 'Core user profile data including verification status and game state';
COMMENT ON TABLE user_reports IS 'User-submitted safety reports for moderation review';
COMMENT ON TABLE blocked_users IS 'User blocking relationships for privacy';
COMMENT ON TABLE matches IS 'Successful encounters between users';
COMMENT ON TABLE messages IS 'In-game messaging between matched users';
COMMENT ON TABLE game_events IS 'Audit log of user activities in the game';
