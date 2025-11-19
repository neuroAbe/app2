import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/clerk-expo';
import { useMemo } from 'react';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Basic client for unauthenticated requests
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Hook to create authenticated Supabase client with Clerk JWT
export function useSupabaseClient() {
  const { getToken } = useAuth();

  const client = useMemo(() => {
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: async (url, options = {}) => {
          // Get Clerk token for Supabase
          // IMPORTANT: You must create a "supabase" JWT template in Clerk Dashboard
          // See: https://clerk.com/docs/integrations/databases/supabase
          const clerkToken = await getToken({ template: 'supabase' });

          const headers = new Headers(options.headers);
          if (clerkToken) {
            headers.set('Authorization', `Bearer ${clerkToken}`);
          }

          return fetch(url, {
            ...options,
            headers,
          });
        },
      },
    });
  }, [getToken]);

  return client;
}

// Type-safe database client (same types as web app)
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          clerk_user_id: string;
          display_name: string;
          age: number;
          gender: string;
          looking_for: string;
          bio: string;
          interests: string[];
          avatar_color: string;
          email_verified: boolean;
          phone_verified: boolean;
          photo_verified: boolean;
          id_verified: boolean;
          verification_level: 'none' | 'basic' | 'verified' | 'premium';
          is_banned: boolean;
          ban_reason: string | null;
          report_count: number;
          current_town: string;
          position_x: number;
          position_y: number;
          last_active: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clerk_user_id: string;
          display_name: string;
          age: number;
          gender: string;
          looking_for: string;
          bio: string;
          interests: string[];
          avatar_color: string;
          email_verified?: boolean;
          phone_verified?: boolean;
          photo_verified?: boolean;
          id_verified?: boolean;
          verification_level?: 'none' | 'basic' | 'verified' | 'premium';
          is_banned?: boolean;
          ban_reason?: string | null;
          report_count?: number;
          current_town?: string;
          position_x?: number;
          position_y?: number;
          last_active?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clerk_user_id?: string;
          display_name?: string;
          age?: number;
          gender?: string;
          looking_for?: string;
          bio?: string;
          interests?: string[];
          avatar_color?: string;
          email_verified?: boolean;
          phone_verified?: boolean;
          photo_verified?: boolean;
          id_verified?: boolean;
          verification_level?: 'none' | 'basic' | 'verified' | 'premium';
          is_banned?: boolean;
          ban_reason?: string | null;
          report_count?: number;
          current_town?: string;
          position_x?: number;
          position_y?: number;
          last_active?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
