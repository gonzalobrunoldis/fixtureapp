# Supabase Client Configuration

This directory contains Supabase client configurations for the Fixture App.

## Files

- **`client.ts`** - Browser client for Client Components
- **`server.ts`** - Server clients for Server Components and API Routes
- **`README.md`** - This documentation file

## Quick Reference

### When to use which client?

| Context            | Client to Use                     | Import                                                      |
| ------------------ | --------------------------------- | ----------------------------------------------------------- |
| Client Components  | `createClient()` from client      | `import { createClient } from '@/lib/supabase/client'`      |
| Server Components  | `createClient()` from server      | `import { createClient } from '@/lib/supabase/server'`      |
| Server Actions     | `createClient()` from server      | `import { createClient } from '@/lib/supabase/server'`      |
| API Route Handlers | `createClient()` from server      | `import { createClient } from '@/lib/supabase/server'`      |
| Admin Operations   | `createAdminClient()` from server | `import { createAdminClient } from '@/lib/supabase/server'` |

## Usage Examples

### Client Components

Use the browser client for client-side operations, realtime subscriptions, and authentication flows.

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function MyClientComponent() {
  const supabase = createClient()
  const [data, setData] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('fixtures')
        .select('*')
        .limit(10)
      setData(data)
    }

    fetchData()
  }, [])

  return <div>{/* Render data */}</div>
}
```

### Server Components

Use the server client for server-side data fetching in Server Components.

```typescript
import { createClient } from '@/lib/supabase/server'

export default async function MyServerComponent() {
  const supabase = await createClient()

  const { data: fixtures } = await supabase
    .from('fixtures')
    .select('*')
    .order('date', { ascending: true })

  return (
    <div>
      {fixtures?.map((fixture) => (
        <div key={fixture.id}>{fixture.home_team} vs {fixture.away_team}</div>
      ))}
    </div>
  )
}
```

### Server Actions

Use the server client in Server Actions for mutations and form handling.

```typescript
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitPrediction(formData: FormData) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('predictions')
    .insert({
      fixture_id: formData.get('fixture_id'),
      home_score: formData.get('home_score'),
      away_score: formData.get('away_score'),
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/predictions');
  return data;
}
```

### API Route Handlers

Use the server client in API routes for handling requests.

```typescript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('standings')
    .select('*')
    .order('position', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
```

### Admin Operations (Service Role)

⚠️ **WARNING**: Only use the admin client when absolutely necessary. It bypasses Row Level Security.

```typescript
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = createAdminClient();

  // Admin operation that bypasses RLS
  const { data, error } = await supabase
    .from('users')
    .update({ role: 'admin' })
    .eq('id', userId);

  if (error) throw error;
  return data;
}
```

## Authentication

### Getting the current user

#### In Server Components:

```typescript
import { createClient } from '@/lib/supabase/server'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <div>Welcome, {user.email}</div>
}
```

#### In Client Components:

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function UserProfile() {
  const supabase = createClient()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return <div>{user?.email}</div>
}
```

### Sign In / Sign Out

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'

export function AuthButtons() {
  const supabase = createClient()

  const signIn = async () => {
    await supabase.auth.signInWithPassword({
      email: 'user@example.com',
      password: 'password',
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <>
      <button onClick={signIn}>Sign In</button>
      <button onClick={signOut}>Sign Out</button>
    </>
  )
}
```

## Realtime Subscriptions

Only available in Client Components using the browser client.

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function LiveFixtures() {
  const supabase = createClient()
  const [fixtures, setFixtures] = useState([])

  useEffect(() => {
    // Fetch initial data
    const fetchFixtures = async () => {
      const { data } = await supabase.from('fixtures').select('*')
      setFixtures(data || [])
    }

    fetchFixtures()

    // Subscribe to changes
    const subscription = supabase
      .channel('fixtures')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'fixtures' },
        (payload) => {
          console.log('Change received!', payload)
          fetchFixtures() // Refetch data
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return <div>{/* Render fixtures */}</div>
}
```

## Best Practices

### ✅ Do

- Use the browser client (`client.ts`) in Client Components
- Use the server client (`server.ts`) in Server Components, Server Actions, and API routes
- Always check for errors when making database queries
- Use TypeScript for type safety with the `Database` type
- Implement Row Level Security (RLS) policies in Supabase
- Keep the service role key secret and only use on the server

### ❌ Don't

- Don't use the server client in Client Components
- Don't use the browser client in Server Components or API routes
- Don't expose the service role key to the client
- Don't bypass RLS unless absolutely necessary
- Don't hardcode credentials in code files
- Don't commit .env files to version control

## Environment Variables

Required environment variables (add to `.env` and `.env.local`):

```env
# Public variables (safe to expose in browser)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Server-only variables (NEVER expose to browser)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Setting Up Supabase

1. **Create a Supabase project** at https://app.supabase.com
2. **Get your credentials** from Project Settings → API
3. **Add credentials to `.env`**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. **Set up database schema** (see `database.types.ts` for structure)
5. **Enable Row Level Security** on all tables
6. **Create RLS policies** for data access control

## Troubleshooting

### "Missing Supabase environment variables"

- Check that `.env` or `.env.local` exists
- Verify environment variables are properly set
- Restart the development server after adding variables

### Authentication not persisting

- Ensure cookies are enabled in the browser
- Check that middleware is configured for auth refresh
- Verify cookie settings in production environment

### RLS errors (permission denied)

- Check RLS policies are configured correctly
- Verify the user is authenticated
- Ensure the authenticated user has the right permissions
- Consider using the admin client for specific operations (with caution)

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Helpers for Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime Subscriptions](https://supabase.com/docs/guides/realtime)
