/**
 * Cache Service
 *
 * Generic caching service using Supabase as the cache store.
 * Provides TTL-based caching with automatic invalidation.
 *
 * Features:
 * - TTL-based cache expiration
 * - Force refresh support
 * - Cache invalidation by key pattern
 * - Automatic cleanup of expired entries
 */

import { createClient } from '@/lib/supabase/server';
import type { CachedFixture } from '@/types/database.types';
import type { FixtureResponse } from '@/lib/api-football/endpoints';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Cache options
 */
export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  forceRefresh?: boolean; // Skip cache and fetch fresh data
}

/**
 * Cache entry metadata
 */
export interface CacheMetadata {
  key: string;
  cachedAt: Date;
  expiresAt: Date;
  ttl: number;
  isExpired: boolean;
}

// ============================================================================
// CACHE SERVICE
// ============================================================================

export class CacheService {
  /**
   * Get a cached fixture by ID
   */
  static async getFixture(
    fixtureId: number,
    options: CacheOptions = {}
  ): Promise<FixtureResponse | null> {
    // Skip cache if force refresh
    if (options.forceRefresh) {
      return null;
    }

    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('cached_fixtures')
        .select('*')
        .eq('id', fixtureId)
        .single<CachedFixture>();

      if (error || !data) {
        return null;
      }

      // Check if cache is expired
      const cachedAt = new Date(data.updated_at);
      const now = new Date();
      const ageInSeconds = (now.getTime() - cachedAt.getTime()) / 1000;

      // Get TTL from options or use default based on fixture status
      const ttl = options.ttl ?? this.getDefaultTTL(data.status);

      if (ageInSeconds > ttl) {
        // Cache expired
        return null;
      }

      // Return cached data
      return data.data as FixtureResponse;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  }

  /**
   * Cache a fixture
   */
  static async setFixture(
    fixtureResponse: FixtureResponse
  ): Promise<CachedFixture | null> {
    try {
      const supabase = await createClient();

      const fixture = fixtureResponse as any; // Temporary type assertion
      const cacheEntry: Partial<CachedFixture> = {
        id: fixture.fixture.id,
        league_id: fixture.league.id,
        season: fixture.league.season || 2024,
        date: fixture.fixture.date,
        home_team_id: fixture.teams.home.id,
        home_team_name: fixture.teams.home.name,
        home_team_logo: fixture.teams.home.logo,
        away_team_id: fixture.teams.away.id,
        away_team_name: fixture.teams.away.name,
        away_team_logo: fixture.teams.away.logo,
        home_score: fixture.goals.home,
        away_score: fixture.goals.away,
        status: fixture.fixture.status.short,
        round: fixture.league.round || null,
        venue_name: fixture.fixture.venue.name,
        venue_city: fixture.fixture.venue.city,
        data: fixtureResponse, // Store full response as JSONB
      };

      const { data, error } = await supabase
        .from('cached_fixtures')
        .upsert(cacheEntry as any, {
          onConflict: 'id',
        })
        .select()
        .single();

      if (error) {
        console.error('Error writing to cache:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error writing to cache:', error);
      return null;
    }
  }

  /**
   * Get multiple cached fixtures
   */
  static async getFixtures(
    fixtureIds: number[],
    options: CacheOptions = {}
  ): Promise<Map<number, FixtureResponse>> {
    const cachedData = new Map<number, FixtureResponse>();

    // Skip cache if force refresh
    if (options.forceRefresh) {
      return cachedData;
    }

    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('cached_fixtures')
        .select('*')
        .in('id', fixtureIds)
        .returns<CachedFixture[]>();

      if (error || !data) {
        return cachedData;
      }

      const now = new Date();

      for (const row of data) {
        const cachedAt = new Date(row.updated_at);
        const ageInSeconds = (now.getTime() - cachedAt.getTime()) / 1000;
        const ttl = options.ttl ?? this.getDefaultTTL(row.status);

        // Only return if not expired
        if (ageInSeconds <= ttl) {
          cachedData.set(row.id, row.data as FixtureResponse);
        }
      }

      return cachedData;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return cachedData;
    }
  }

  /**
   * Cache multiple fixtures
   */
  static async setFixtures(
    fixtureResponses: FixtureResponse[]
  ): Promise<number> {
    try {
      const supabase = await createClient();

      const cacheEntries: Partial<CachedFixture>[] = fixtureResponses.map(
        (fixture) => {
          const f = fixture as any; // Temporary type assertion
          return {
            id: f.fixture.id,
            league_id: f.league.id,
            season: f.league.season || 2024,
            date: f.fixture.date,
            home_team_id: f.teams.home.id,
            home_team_name: f.teams.home.name,
            home_team_logo: f.teams.home.logo,
            away_team_id: f.teams.away.id,
            away_team_name: f.teams.away.name,
            away_team_logo: f.teams.away.logo,
            home_score: f.goals.home,
            away_score: f.goals.away,
            status: f.fixture.status.short,
            round: f.league.round || null,
            venue_name: f.fixture.venue.name,
            venue_city: f.fixture.venue.city,
            data: fixture,
          };
        }
      );

      const { error, count } = await supabase
        .from('cached_fixtures')
        .upsert(cacheEntries as any, {
          onConflict: 'id',
        });

      if (error) {
        console.error('Error batch writing to cache:', error);
        return 0;
      }

      return count ?? 0;
    } catch (error) {
      console.error('Error batch writing to cache:', error);
      return 0;
    }
  }

  /**
   * Invalidate cache by fixture ID
   */
  static async invalidateFixture(fixtureId: number): Promise<boolean> {
    try {
      const supabase = await createClient();

      const { error } = await supabase
        .from('cached_fixtures')
        .delete()
        .eq('id', fixtureId);

      if (error) {
        console.error('Error invalidating cache:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error invalidating cache:', error);
      return false;
    }
  }

  /**
   * Invalidate cache by league and season
   */
  static async invalidateLeagueSeason(
    leagueId: number,
    season: number
  ): Promise<number> {
    try {
      const supabase = await createClient();

      const { error, count } = await supabase
        .from('cached_fixtures')
        .delete()
        .eq('league_id', leagueId)
        .eq('season', season);

      if (error) {
        console.error('Error invalidating cache:', error);
        return 0;
      }

      return count ?? 0;
    } catch (error) {
      console.error('Error invalidating cache:', error);
      return 0;
    }
  }

  /**
   * Clean up expired cache entries
   */
  static async cleanupExpired(): Promise<number> {
    try {
      const supabase = await createClient();

      // Get all cached fixtures
      const { data, error: fetchError } = await supabase
        .from('cached_fixtures')
        .select('id, status, updated_at')
        .returns<Pick<CachedFixture, 'id' | 'status' | 'updated_at'>[]>();

      if (fetchError || !data) {
        console.error('Error fetching cache for cleanup:', fetchError);
        return 0;
      }

      const now = new Date();
      const expiredIds: number[] = [];

      for (const row of data) {
        const cachedAt = new Date(row.updated_at);
        const ageInSeconds = (now.getTime() - cachedAt.getTime()) / 1000;
        const ttl = this.getDefaultTTL(row.status);

        if (ageInSeconds > ttl) {
          expiredIds.push(row.id);
        }
      }

      if (expiredIds.length === 0) {
        return 0;
      }

      // Delete expired entries
      const { error: deleteError, count } = await supabase
        .from('cached_fixtures')
        .delete()
        .in('id', expiredIds);

      if (deleteError) {
        console.error('Error deleting expired cache:', deleteError);
        return 0;
      }

      return count ?? 0;
    } catch (error) {
      console.error('Error cleaning up cache:', error);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  static async getStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    oldestEntry: Date | null;
    newestEntry: Date | null;
  }> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('cached_fixtures')
        .select('status, updated_at')
        .returns<Pick<CachedFixture, 'status' | 'updated_at'>[]>();

      if (error || !data) {
        return {
          total: 0,
          byStatus: {},
          oldestEntry: null,
          newestEntry: null,
        };
      }

      const byStatus: Record<string, number> = {};
      let oldestEntry: Date | null = null;
      let newestEntry: Date | null = null;

      for (const row of data) {
        // Count by status
        byStatus[row.status] = (byStatus[row.status] || 0) + 1;

        // Track oldest/newest
        const updatedAt = new Date(row.updated_at);
        if (!oldestEntry || updatedAt < oldestEntry) {
          oldestEntry = updatedAt;
        }
        if (!newestEntry || updatedAt > newestEntry) {
          newestEntry = updatedAt;
        }
      }

      return {
        total: data.length,
        byStatus,
        oldestEntry,
        newestEntry,
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        total: 0,
        byStatus: {},
        oldestEntry: null,
        newestEntry: null,
      };
    }
  }

  /**
   * Get default TTL based on fixture status
   */
  private static getDefaultTTL(status: string): number {
    const TTL_MAP: Record<string, number> = {
      TBD: 7200, // 2 hours
      NS: 3600, // 1 hour
      '1H': 15, // 15 seconds (live)
      HT: 300, // 5 minutes
      '2H': 15, // 15 seconds (live)
      ET: 15, // 15 seconds (live)
      BT: 300, // 5 minutes
      P: 15, // 15 seconds (live)
      SUSP: 300, // 5 minutes
      INT: 300, // 5 minutes
      FT: 31536000, // 1 year (finished)
      AET: 31536000, // 1 year (finished)
      PEN: 31536000, // 1 year (finished)
      PST: 1800, // 30 minutes
      CANC: 31536000, // 1 year (cancelled)
      ABD: 31536000, // 1 year (abandoned)
      AWD: 31536000, // 1 year (technical loss)
      WO: 31536000, // 1 year (walkover)
    };

    return TTL_MAP[status] ?? 3600; // Default 1 hour
  }
}
