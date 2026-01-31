/**
 * API-Football Cache Layer
 *
 * Integrates caching with the API-Football client to minimize API calls.
 * Uses Supabase as the cache store with intelligent TTL based on fixture status.
 *
 * Features:
 * - Automatic cache-first strategy
 * - Intelligent TTL based on fixture status (live matches: 15s, finished: 1 year)
 * - Force refresh support
 * - Batch caching for multiple fixtures
 * - Cache invalidation strategies
 */

import { CacheService } from '@/services/cache.service';
import type { FixtureResponse, FixtureStatus } from './endpoints';
import {
  getFixtures as apiGetFixtures,
  getFixtureById as apiGetFixtureById,
  getFixturesByIds as apiGetFixturesByIds,
} from './endpoints';
import type { ApiFootballResponse } from './client';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Cache fetch options
 */
export interface CacheFetchOptions {
  forceRefresh?: boolean;
  ttl?: number;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  hit: number;
  miss: number;
  total: number;
  hitRate: number;
}

// ============================================================================
// CACHED API FUNCTIONS
// ============================================================================

/**
 * Get a single fixture with caching
 */
export async function getCachedFixture(
  fixtureId: number,
  options: CacheFetchOptions = {}
): Promise<FixtureResponse | null> {
  try {
    // Try cache first
    const cached = await CacheService.getFixture(fixtureId, options);

    if (cached && !options.forceRefresh) {
      console.log(`[Cache HIT] Fixture ${fixtureId}`);
      return cached;
    }

    // Cache miss or force refresh - fetch from API
    console.log(`[Cache MISS] Fetching fixture ${fixtureId} from API`);
    const response = await apiGetFixtureById(fixtureId);

    if (response.results === 0 || !response.response[0]) {
      return null;
    }

    const fixture = response.response[0];

    // Cache the result
    await CacheService.setFixture(fixture);

    return fixture;
  } catch (error) {
    console.error('Error in getCachedFixture:', error);
    throw error;
  }
}

/**
 * Get multiple fixtures with caching
 */
export async function getCachedFixtures(
  fixtureIds: number[],
  options: CacheFetchOptions = {}
): Promise<FixtureResponse[]> {
  try {
    // Try cache first for all fixtures
    const cached = await CacheService.getFixtures(fixtureIds, options);

    // Find which fixtures need to be fetched
    const missingIds = fixtureIds.filter((id) => !cached.has(id));

    if (missingIds.length === 0) {
      console.log(`[Cache HIT] All ${fixtureIds.length} fixtures cached`);
      return fixtureIds.map((id) => cached.get(id)!);
    }

    console.log(
      `[Cache PARTIAL] ${cached.size}/${fixtureIds.length} fixtures cached, fetching ${missingIds.length} from API`
    );

    // Fetch missing fixtures from API (in batches of 20)
    const missingFixtures: FixtureResponse[] = [];

    for (let i = 0; i < missingIds.length; i += 20) {
      const batch = missingIds.slice(i, i + 20);
      const response = await apiGetFixturesByIds(batch);

      if (response.results > 0) {
        missingFixtures.push(...response.response);
      }
    }

    // Cache the newly fetched fixtures
    if (missingFixtures.length > 0) {
      await CacheService.setFixtures(missingFixtures);
    }

    // Combine cached and newly fetched
    const allFixtures = Array.from(cached.values()).concat(missingFixtures);

    // Sort by fixture ID to maintain order
    return allFixtures.sort((a, b) => a.fixture.id - b.fixture.id);
  } catch (error) {
    console.error('Error in getCachedFixtures:', error);
    throw error;
  }
}

/**
 * Get fixtures by filters with caching
 *
 * Note: This function uses a simplified caching strategy.
 * For complex queries, it fetches from API and caches results.
 */
export async function getCachedFixturesByFilters(
  params: {
    league?: number;
    season?: number;
    date?: string;
    from?: string;
    to?: string;
    team?: number;
    round?: string;
    status?: FixtureStatus;
  },
  options: CacheFetchOptions = {}
): Promise<ApiFootballResponse<FixtureResponse[]>> {
  try {
    // For complex queries, always fetch from API
    // (Could be improved with query-based caching in the future)
    console.log('[Cache] Fetching fixtures by filters from API');
    const response = await apiGetFixtures(params);

    // Cache all returned fixtures
    if (response.results > 0) {
      await CacheService.setFixtures(response.response);
    }

    return response;
  } catch (error) {
    console.error('Error in getCachedFixturesByFilters:', error);
    throw error;
  }
}

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

/**
 * Invalidate cache for a specific fixture
 */
export async function invalidateFixtureCache(
  fixtureId: number
): Promise<boolean> {
  try {
    return await CacheService.invalidateFixture(fixtureId);
  } catch (error) {
    console.error('Error invalidating fixture cache:', error);
    return false;
  }
}

/**
 * Invalidate cache for an entire league/season
 */
export async function invalidateLeagueCache(
  leagueId: number,
  season: number
): Promise<number> {
  try {
    return await CacheService.invalidateLeagueSeason(leagueId, season);
  } catch (error) {
    console.error('Error invalidating league cache:', error);
    return 0;
  }
}

/**
 * Clean up expired cache entries
 *
 * This should be run periodically (e.g., via cron job)
 */
export async function cleanupExpiredCache(): Promise<number> {
  try {
    return await CacheService.cleanupExpired();
  } catch (error) {
    console.error('Error cleaning up cache:', error);
    return 0;
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats() {
  try {
    return await CacheService.getStats();
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

// ============================================================================
// SMART CACHING STRATEGIES
// ============================================================================

/**
 * Determine if a fixture should be refreshed based on its status
 */
export function shouldRefreshFixture(
  fixture: FixtureResponse,
  lastUpdated: Date
): boolean {
  const status = fixture.fixture.status.short;
  const now = new Date();
  const ageInSeconds = (now.getTime() - lastUpdated.getTime()) / 1000;

  // Live matches - refresh every 15 seconds
  if (['1H', '2H', 'ET', 'P'].includes(status)) {
    return ageInSeconds > 15;
  }

  // Halftime/Break - refresh every 5 minutes
  if (['HT', 'BT'].includes(status)) {
    return ageInSeconds > 300;
  }

  // Upcoming matches - refresh every hour
  if (['TBD', 'NS'].includes(status)) {
    return ageInSeconds > 3600;
  }

  // Finished matches - never refresh (cached for 1 year)
  if (['FT', 'AET', 'PEN', 'CANC', 'ABD', 'AWD', 'WO'].includes(status)) {
    return false;
  }

  // Default - refresh every hour
  return ageInSeconds > 3600;
}

/**
 * Pre-fetch and cache upcoming fixtures
 *
 * This can be used to warm up the cache before users request the data
 */
export async function prefetchUpcomingFixtures(
  leagueId: number,
  season: number
): Promise<number> {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 7); // Next 7 days

    const response = await apiGetFixtures({
      league: leagueId,
      season,
      from: today.toISOString().split('T')[0],
      to: tomorrow.toISOString().split('T')[0],
    });

    if (response.results > 0) {
      await CacheService.setFixtures(response.response);
      return response.results;
    }

    return 0;
  } catch (error) {
    console.error('Error prefetching fixtures:', error);
    return 0;
  }
}

/**
 * Refresh live matches cache
 *
 * This should be called periodically to keep live match data fresh
 */
export async function refreshLiveMatches(
  leagueId: number,
  season: number
): Promise<number> {
  try {
    // Get all live fixtures from API
    const response = await apiGetFixtures({
      league: leagueId,
      season,
      status: '1H', // Can be expanded to include all live statuses
    });

    if (response.results > 0) {
      await CacheService.setFixtures(response.response);
      return response.results;
    }

    return 0;
  } catch (error) {
    console.error('Error refreshing live matches:', error);
    return 0;
  }
}
