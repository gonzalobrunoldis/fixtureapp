// @ts-nocheck
/**
 * Unit Tests: API-Football Cache Service
 *
 * Tests for caching functionality including cache hits, misses,
 * TTL validation, and cache invalidation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { FixtureResponse } from '@/lib/api-football/endpoints';

// Import cache functions with type assertion
const { getCachedFixtures, cacheFixtures, invalidateFixtureCache, CACHE_TTL } =
  // @ts-expect-error - Mocked module
  await import('@/lib/api-football/cache');

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

const mockFixtureResponse: FixtureResponse = {
  fixture: {
    id: 12345,
    referee: 'Test Referee',
    timezone: 'UTC',
    date: '2024-01-22T20:00:00+00:00',
    timestamp: 1705953600,
    periods: {
      first: 1705953600,
      second: 1705957200,
    },
    venue: {
      id: 1,
      name: 'Test Stadium',
      city: 'Test City',
    },
    status: {
      long: 'Match Finished',
      short: 'FT',
      elapsed: 90,
    },
  },
  league: {
    id: 2,
    name: 'UEFA Champions League',
    type: 'Cup',
    logo: 'https://example.com/logo.png',
  },
  teams: {
    home: {
      id: 100,
      name: 'Home Team',
      logo: 'https://example.com/home.png',
      winner: true,
    },
    away: {
      id: 200,
      name: 'Away Team',
      logo: 'https://example.com/away.png',
      winner: false,
    },
  },
  goals: {
    home: 2,
    away: 1,
  },
  score: {
    halftime: { home: 1, away: 0 },
    fulltime: { home: 2, away: 1 },
    extratime: { home: null, away: null },
    penalty: { home: null, away: null },
  },
};

describe('Cache Service - Storing Fixtures', () => {
  it('should cache fixtures successfully', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockResolvedValue({ error: null }),
    };

    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    await cacheFixtures([mockFixtureResponse]);

    expect(mockSupabase.from).toHaveBeenCalledWith('cached_fixtures');
    expect(mockSupabase.upsert).toHaveBeenCalled();
  });

  it('should handle cache write errors gracefully', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      upsert: vi
        .fn()
        .mockResolvedValue({ error: { message: 'Database error' } }),
    };

    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    // Should not throw, just log error
    await expect(cacheFixtures([mockFixtureResponse])).resolves.toBeUndefined();
  });
});

describe('Cache Service - Retrieving Fixtures', () => {
  it('should retrieve cached fixtures with valid TTL', async () => {
    const cachedData = {
      id: 12345,
      league_id: 2,
      season: 2024,
      date: '2024-01-22',
      home_team_id: 100,
      home_team_name: 'Home Team',
      home_team_logo: 'https://example.com/home.png',
      away_team_id: 200,
      away_team_name: 'Away Team',
      away_team_logo: 'https://example.com/away.png',
      home_score: 2,
      away_score: 1,
      status: 'FT',
      round: 'Round 1',
      venue_name: 'Test Stadium',
      venue_city: 'Test City',
      data: mockFixtureResponse,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(), // Fresh cache
    };

    const mockQuery = {
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
    };

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [cachedData],
          error: null,
        }),
      }),
    };

    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const result = await getCachedFixtures({ fixtureId: 12345 });

    expect(result).toBeDefined();
    expect(result).toHaveLength(1);
    expect(result![0]).toEqual(mockFixtureResponse);
  });

  it('should filter out stale cache entries', async () => {
    const staleDate = new Date();
    staleDate.setHours(staleDate.getHours() - 25); // 25 hours ago

    const staleCachedData = {
      id: 12345,
      status: 'FT',
      updated_at: staleDate.toISOString(), // Stale cache (>24h for completed)
      data: mockFixtureResponse,
    };

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [staleCachedData],
          error: null,
        }),
      }),
    };

    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const result = await getCachedFixtures({ fixtureId: 12345 });

    // Should return null due to stale cache
    expect(result).toBeNull();
  });

  it('should handle cache read errors', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      }),
    };

    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const result = await getCachedFixtures({ fixtureId: 12345 });

    expect(result).toBeNull();
  });
});

describe('Cache Service - Cache Invalidation', () => {
  it('should invalidate cache for specific fixtures', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({ error: null }),
    };

    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    await invalidateFixtureCache([12345, 67890]);

    expect(mockSupabase.from).toHaveBeenCalledWith('cached_fixtures');
    expect(mockSupabase.delete).toHaveBeenCalled();
    expect(mockSupabase.in).toHaveBeenCalledWith('id', [12345, 67890]);
  });

  it('should handle invalidation errors gracefully', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } }),
    };

    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    // Should not throw
    await expect(invalidateFixtureCache([12345])).resolves.toBeUndefined();
  });
});

describe('Cache Service - TTL Configuration', () => {
  it('should have correct TTL values', () => {
    expect(CACHE_TTL.COMPLETED).toBe(24 * 60 * 60); // 24 hours
    expect(CACHE_TTL.LIVE).toBe(60); // 1 minute
    expect(CACHE_TTL.UPCOMING).toBe(60 * 60); // 1 hour
    expect(CACHE_TTL.STANDINGS).toBe(6 * 60 * 60); // 6 hours
    expect(CACHE_TTL.TEAMS).toBe(24 * 60 * 60); // 24 hours
  });
});
