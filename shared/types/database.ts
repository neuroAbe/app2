// Database Types for PixelMatch

export interface UserProfile {
  id: string;
  clerk_user_id: string;
  display_name: string;
  age: number;
  gender: string;
  looking_for: string;
  bio: string;
  interests: string[];
  avatar_color: string;

  // Verification
  email_verified: boolean;
  phone_verified: boolean;
  photo_verified: boolean;
  id_verified: boolean;
  verification_level: 'none' | 'basic' | 'verified' | 'premium';

  // Safety
  is_banned: boolean;
  ban_reason?: string;
  report_count: number;

  // Game State
  current_town: string;
  position_x: number;
  position_y: number;
  last_active: Date;

  // Timestamps
  created_at: Date;
  updated_at: Date;
}

export interface UserReport {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  reason: 'harassment' | 'inappropriate_content' | 'spam' | 'fake_profile' | 'other';
  description: string;
  status: 'pending' | 'reviewed' | 'action_taken' | 'dismissed';
  created_at: Date;
  reviewed_at?: Date;
  reviewed_by?: string;
}

export interface BlockedUser {
  id: string;
  blocker_id: string;
  blocked_user_id: string;
  created_at: Date;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  matched_at: Date;
  encounter_location: string;
}

export interface Message {
  id: string;
  from_user_id: string;
  to_user_id: string;
  content: string;
  is_flagged: boolean;
  toxicity_score?: number;
  created_at: Date;
  read_at?: Date;
}

export interface GameEvent {
  id: string;
  user_id: string;
  event_type: 'encounter' | 'match' | 'message' | 'quest_complete' | 'badge_earned';
  event_data: Record<string, any>;
  created_at: Date;
}
