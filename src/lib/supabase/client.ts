/**
 * Supabase Browser Client
 *
 * This client is used in Client Components (components with "use client" directive).
 * It automatically handles authentication state and can be used for:
 * - Realtime subscriptions
 * - Client-side data fetching
 * - Authentication flows
 *
 * IMPORTANT: Only use environment variables prefixed with NEXT_PUBLIC_
 * as they are safe to expose in the browser.
 *
 * @see https://supabase.com/docs/guides/auth/auth-helpers/nextjs
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

/**
 * Creates a Supabase client for use in Client Components
 *
 * This client:
 * - Runs in the browser
 * - Handles authentication state automatically
 * - Uses cookies for session management
 * - Supports realtime subscriptions
 *
 * @returns Supabase browser client instance
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env file.'
    );
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
