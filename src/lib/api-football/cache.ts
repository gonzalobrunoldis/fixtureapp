/**
 * API-Football Cache Service
 *
 * Provides caching functionality for API-Football responses using Supabase.
 * Reduces API calls by storing responses in the database with TTL.
 *
 * Features:
 * - Automatic cache invalidation based on fixture status
 * - TTL-based expiration
 * - Efficient database queries
 */

import { createClient } from '@/lib/supabase/server';
import type { FixtureResponse } from './endpoints';
import type { Database } from '@/types/database.types';

/**
 * Cache TTL constants (in seconds)
 */
export const CACHE_TTL = {
  // Completed fixtures - cache for 24 hours (rarely change)
  COMPLETED: 24 * 60 * 60,
  // Live fixtures - cache for 1 minute (updating frequently)
  LIVE: 60,
  // Upcoming fixtures - cache for 1 hour (may have lineup changes)
  UPCOMING: 60 * 60,
  // Standings - cache for 6 hours
  STANDINGS: 6 * 60 * 60,
  // Teams - cache for 24 hours (rarely change)
  TEAMS: 24 * 60 * 60,
} as const;

/**
 * Check if a cache entry is still valid
 */
function isCacheValid(updatedAt: string, ttl: number): boolean {
  const cacheTime = new Date(updatedAt).getTime();
  const now = Date.now();
  const age = (now - cacheTime) / 1000; // Convert to seconds
  return age < ttl;
}

/**
 * Get TTL for a fixture based on its status
 */
function getFixtureTTL(status: string): number {
  const liveStatuses = ['1H', '2H', 'HT', 'ET', 'BT', 'P'];
  const completedStatuses = ['FT', 'AET', 'PEN', 'CANC', 'ABD', 'PST'];

  if (completedStatuses.includes(status)) {
    return CACHE_TTL.COMPLETED;
  } else if (liveStatuses.includes(status)) {
    return CACHE_TTL.LIVE;
  } else {
    return CACHE_TTL.UPCOMING;
  }
}

/**
 * Get cached fixtures from the database
 *
 * @param params - Filter parameters
 * @returns Array of cached fixtures (with API response data)
 */
export async function getCachedFixtures(params: {
  league?: number;
  season?: number;
  date?: string;
  from?: string;
  to?: string;
  fixtureId?: number;
}): Promise<FixtureResponse[] | null> {
  try {
    const supabase = await createClient();

    // Build query
    let query = supabase
      .from('cached_fixtures')
      .select<'*', Database['public']['Tables']['cached_fixtures']['Row']>('*');

    if (params.fixtureId) {
      query = query.eq('id', params.fixtureId);
    }
    if (params.league) {
      query = query.eq('league_id', params.league);
    }
    if (params.season) {
      query = query.eq('season', params.season);
    }
    if (params.date) {
      query = query.eq('date', params.date);
    }
    if (params.from && params.to) {
      query = query.gte('date', params.from).lte('date', params.to);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Cache read error:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    // Filter out stale cache entries
    const validCachedFixtures = data.filter((cached) => {
      const ttl = getFixtureTTL(cached.status);
      return isCacheValid(cached.updated_at, ttl);
    });

    if (validCachedFixtures.length === 0) {
      return null;
    }

    // Return the full API response data from JSONB field
    return validCachedFixtures.map((cached) => cached.data as FixtureResponse);
  } catch (error) {
    console.error('Unexpected cache error:', error);
    return null;
  }
}

/**
 * Store fixtures in the cache
 *
 * @param fixtures - Array of fixture responses from API-Football
 */
export async function cacheFixtures(
  fixtures: FixtureResponse[]
): Promise<void> {
  try {
    const supabase = await createClient();

    // Transform fixtures into database records
    const records: Database['public']['Tables']['cached_fixtures']['Insert'][] =
      fixtures.map((fixture) => ({
        id: fixture.fixture.id,
        league_id: fixture.league.id,
        season: fixture.league.id, // Assuming season is part of league context
        date: fixture.fixture.date.split('T')[0], // Extract date only (YYYY-MM-DD)
        home_team_id: fixture.teams.home.id,
        home_team_name: fixture.teams.home.name,
        home_team_logo: fixture.teams.home.logo,
        away_team_id: fixture.teams.away.id,
        away_team_name: fixture.teams.away.name,
        away_team_logo: fixture.teams.away.logo,
        home_score: fixture.goals.home,
        away_score: fixture.goals.away,
        status: fixture.fixture.status.short,
        round: (fixture.league as any).round || null,
        venue_name: fixture.fixture.venue.name,
        venue_city: fixture.fixture.venue.city,
        data: fixture, // Store full API response as JSONB
      }));

    // Upsert records (insert or update if exists)
    const { error } = await supabase
      .from('cached_fixtures')
      .upsert(records as any, { onConflict: 'id' });

    if (error) {
      console.error('Cache write error:', error);
    }
  } catch (error) {
    console.error('Unexpected cache write error:', error);
  }
}

/**
 * Invalidate cache for specific fixtures
 *
 * @param fixtureIds - Array of fixture IDs to invalidate
 */
export async function invalidateFixtureCache(
  fixtureIds: number[]
): Promise<void> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('cached_fixtures')
      .delete()
      .in('id', fixtureIds);

    if (error) {
      console.error('Cache invalidation error:', error);
    }
  } catch (error) {
    console.error('Unexpected cache invalidation error:', error);
  }
}

/**
 * Clear all cached fixtures older than a certain date
 *
 * Useful for cleanup jobs to prevent database bloat
 *
 * @param olderThanDays - Remove cache entries older than this many days
 */
export async function clearOldCache(olderThanDays: number = 30): Promise<void> {
  try {
    const supabase = await createClient();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const { error } = await supabase
      .from('cached_fixtures')
      .delete()
      .lt('updated_at', cutoffDate.toISOString());

    if (error) {
      console.error('Cache cleanup error:', error);
    } else {
      console.log(
        `✅ Cleaned up cache entries older than ${olderThanDays} days`
      );
    }
  } catch (error) {
    console.error('Unexpected cache cleanup error:', error);
  }
}
