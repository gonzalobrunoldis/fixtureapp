import { NextRequest, NextResponse } from 'next/server';
import {
  getFixtures,
  type FixtureResponse,
  type FixtureStatus,
} from '@/lib/api-football/endpoints';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';

type CachedFixture = Database['public']['Tables']['cached_fixtures']['Row'];

/**
 * Get cache TTL in milliseconds based on fixture status
 */
function getCacheTTL(status: FixtureStatus): number {
  const TTL_MAP: Record<FixtureStatus, number> = {
    // Upcoming
    NS: 60 * 60 * 1000, // 1 hour
    TBD: 2 * 60 * 60 * 1000, // 2 hours

    // Live (refresh frequently)
    '1H': 15 * 1000, // 15 seconds
    '2H': 15 * 1000, // 15 seconds
    ET: 15 * 1000, // 15 seconds
    P: 15 * 1000, // 15 seconds

    // Breaks (less frequent)
    HT: 5 * 60 * 1000, // 5 minutes
    BT: 5 * 60 * 1000, // 5 minutes

    // Suspended/Interrupted
    SUSP: 30 * 60 * 1000, // 30 minutes
    INT: 30 * 60 * 1000, // 30 minutes

    // Finished (cache forever)
    FT: Infinity,
    AET: Infinity,
    PEN: Infinity,

    // Cancelled/Postponed
    PST: 30 * 60 * 1000, // 30 minutes
    CANC: Infinity,
    ABD: Infinity,
    AWD: Infinity,
    WO: Infinity,
  };

  return TTL_MAP[status] ?? 60 * 60 * 1000; // Default 1 hour
}

/**
 * Check if cached fixture is stale
 */
function isCacheStale(
  cachedFixture: CachedFixture,
  currentTime: number
): boolean {
  const updatedAt = new Date(cachedFixture.updated_at).getTime();
  const ttl = getCacheTTL(cachedFixture.status as FixtureStatus);

  if (ttl === Infinity) {
    return false; // Never stale
  }

  return currentTime - updatedAt > ttl;
}

/**
 * Transform API response to cached fixture format
 */
function transformToCachedFixture(
  fixture: FixtureResponse
): Omit<CachedFixture, 'created_at' | 'updated_at'> {
  return {
    id: fixture.fixture.id,
    league_id: fixture.league.id,
    season: 2024, // TODO: Make this dynamic based on current season
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
    round: null, // TODO: Extract round from fixture response
    venue_name: fixture.fixture.venue.name,
    venue_city: fixture.fixture.venue.city,
    data: fixture as any, // Store full response for detail views
  };
}

/**
 * GET /api/fixtures?date=YYYY-MM-DD
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get('date');

  if (!date) {
    return NextResponse.json(
      { error: 'Date parameter required (format: YYYY-MM-DD)' },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();
    const currentTime = Date.now();

    // 1. Check cache first
    const { data: cachedFixtures, error: cacheError } = await supabase
      .from('cached_fixtures')
      .select('*')
      .gte('date', `${date}T00:00:00`)
      .lt('date', `${date}T23:59:59`);

    if (cacheError) {
      console.error('Cache error:', cacheError);
      // Continue to API fetch on cache error
    }

    // 2. Determine if we need to refresh from API
    const needsRefresh =
      !cachedFixtures ||
      cachedFixtures.length === 0 ||
      cachedFixtures.some((f) => isCacheStale(f, currentTime));

    if (needsRefresh) {
      console.log(`Fetching fixtures from API for date: ${date}`);

      // 3. Fetch from API-Football
      const apiResponse = await getFixtures({ date });

      if (!apiResponse.response || apiResponse.response.length === 0) {
        // No fixtures for this date
        return NextResponse.json({ fixtures: [] });
      }

      // 4. Upsert to cache
      const fixturesToCache = apiResponse.response.map(
        transformToCachedFixture
      );

      const { error: upsertError } = await supabase
        .from('cached_fixtures')
        .upsert(fixturesToCache as any, {
          onConflict: 'id',
        });

      if (upsertError) {
        console.error('Cache upsert error:', upsertError);
        // Continue even if cache fails
      }

      // 5. Return fresh data
      return NextResponse.json({
        fixtures: apiResponse.response,
        source: 'api',
      });
    }

    // 6. Return cached data (transform back to API format)
    const fixtures: FixtureResponse[] = (cachedFixtures as any[]).map(
      (cached) => cached.data as FixtureResponse
    );

    return NextResponse.json({
      fixtures,
      source: 'cache',
    });
  } catch (error) {
    console.error('Fixtures API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch fixtures',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
