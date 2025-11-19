import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Creates an authenticated Supabase client for server-side use
 * Passes Clerk JWT token to Supabase for RLS policies
 *
 * @returns Authenticated Supabase client with user context
 */
export async function createServerSupabaseClient() {
  const { getToken, userId } = await auth();

  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Get Clerk session token - this will be validated by Supabase
  const token = await getToken({ template: 'supabase' });

  if (!token) {
    throw new Error('Failed to get session token');
  }

  // Create Supabase client with Clerk JWT token
  // Supabase will validate the token and populate auth.jwt() claims
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

/**
 * Creates an unauthenticated Supabase client (for public operations only)
 * Use createServerSupabaseClient() for authenticated operations
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
