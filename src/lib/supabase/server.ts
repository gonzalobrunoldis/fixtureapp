/**
 * Supabase Server Client
 *
 * This module provides Supabase clients for server-side usage in:
 * - Server Components
 * - Server Actions
 * - API Route Handlers
 *
 * There are two types of server clients:
 * 1. Standard Server Client - For Server Components and Server Actions
 * 2. Service Role Client - For admin operations that bypass RLS
 *
 * @see https://supabase.com/docs/guides/auth/auth-helpers/nextjs
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';

/**
 * Creates a Supabase client for use in Server Components and Server Actions
 *
 * This client:
 * - Runs on the server
 * - Respects Row Level Security (RLS) policies
 * - Uses cookies for authentication
 * - Automatically refreshes sessions
 *
 * Usage:
 * ```typescript
 * import { createClient } from '@/lib/supabase/server'
 *
 * export default async function MyServerComponent() {
 *   const supabase = await createClient()
 *   const { data } = await supabase.from('table').select()
 *   return <div>{data}</div>
 * }
 * ```
 *
 * @returns Supabase server client instance with cookie handling
 */
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env file.'
    );
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}

/**
 * Creates a Supabase admin client with service role key
 *
 * This client:
 * - Bypasses Row Level Security (RLS)
 * - Has full database access
 * - Should ONLY be used in server-side code
 * - NEVER expose the service role key to the client
 *
 * ⚠️ WARNING: Use with extreme caution!
 * Only use this client when you need to:
 * - Perform admin operations
 * - Bypass RLS for specific use cases
 * - Execute privileged database operations
 *
 * Usage:
 * ```typescript
 * import { createAdminClient } from '@/lib/supabase/server'
 *
 * export async function POST(request: Request) {
 *   const supabase = createAdminClient()
 *   // Perform admin operations
 * }
 * ```
 *
 * @returns Supabase admin client with service role privileges
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'Missing Supabase service role environment variables. Please check your .env file.'
    );
  }

  return createServerClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {
        // Service role client doesn't need cookie management
      },
    },
  });
}
