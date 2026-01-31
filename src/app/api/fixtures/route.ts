import { NextResponse } from 'next/server';
import { getFixtures, getFixtureById } from '@/lib/api-football/endpoints';
import { getCachedFixtures, cacheFixtures } from '@/lib/api-football/cache';
import { ApiFootballError } from '@/lib/api-football/client';

/**
 * GET /api/fixtures
 *
 * Retrieves fixtures with caching support.
 *
 * Query Parameters:
 * - id: Fixture ID (single fixture)
 * - league: League ID
 * - season: Season year (e.g., 2024)
 * - date: Date in YYYY-MM-DD format
 * - from: Start date (YYYY-MM-DD)
 * - to: End date (YYYY-MM-DD)
 * - team: Team ID
 * - round: Round name
 * - status: Fixture status (NS, FT, etc.)
 * - timezone: Timezone (e.g., "America/New_York")
 *
 * Example:
 * - GET /api/fixtures?league=2&season=2024&date=2024-01-22
 * - GET /api/fixtures?id=12345
 */
export async function GET(request: Request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);

    const params = {
      id: searchParams.get('id')
        ? parseInt(searchParams.get('id')!, 10)
        : undefined,
      league: searchParams.get('league')
        ? parseInt(searchParams.get('league')!, 10)
        : undefined,
      season: searchParams.get('season')
        ? parseInt(searchParams.get('season')!, 10)
        : undefined,
      date: searchParams.get('date') || undefined,
      from: searchParams.get('from') || undefined,
      to: searchParams.get('to') || undefined,
      team: searchParams.get('team')
        ? parseInt(searchParams.get('team')!, 10)
        : undefined,
      round: searchParams.get('round') || undefined,
      status: searchParams.get('status') as any,
      timezone: searchParams.get('timezone') || undefined,
    };

    // Try cache first
    const cached = await getCachedFixtures({
      fixtureId: params.id,
      league: params.league,
      season: params.season,
      date: params.date,
      from: params.from,
      to: params.to,
    });

    if (cached) {
      return NextResponse.json(
        {
          data: cached,
          source: 'cache',
          count: cached.length,
        },
        { status: 200 }
      );
    }

    // Cache miss - fetch from API-Football
    let apiResponse;
    if (params.id) {
      apiResponse = await getFixtureById(params.id);
    } else {
      apiResponse = await getFixtures(params);
    }

    const fixtures = apiResponse.response;

    // Store in cache for future requests
    if (fixtures.length > 0) {
      await cacheFixtures(fixtures);
    }

    return NextResponse.json(
      {
        data: fixtures,
        source: 'api',
        count: fixtures.length,
        rateLimit: {
          // Note: In production, extract this from API response headers
          message: 'Rate limit info not implemented yet',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fixtures API error:', error);

    // Handle API-Football specific errors
    if (error instanceof ApiFootballError) {
      return NextResponse.json(
        {
          error: error.message,
          statusCode: error.statusCode,
          details: error.errors,
        },
        { status: error.statusCode || 500 }
      );
    }

    // Handle generic errors
    return NextResponse.json(
      {
        error: 'Failed to fetch fixtures',
        message:
          error instanceof Error ? error.message : 'An unknown error occurred',
      },
      { status: 500 }
    );
  }
}
