import { NextResponse } from 'next/server';
import { getStandings } from '@/lib/api-football/endpoints';
import { ApiFootballError } from '@/lib/api-football/client';
import { createClient } from '@/lib/supabase/server';

// Cache TTL for standings (6 hours)
const STANDINGS_CACHE_TTL = 6 * 60 * 60 * 1000; // milliseconds

/**
 * GET /api/standings
 *
 * Retrieves league standings with caching support.
 *
 * Query Parameters:
 * - league: League ID (required)
 * - season: Season year (required, e.g., 2024)
 *
 * Example:
 * - GET /api/standings?league=2&season=2024
 */
export async function GET(request: Request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);

    const league = searchParams.get('league');
    const season = searchParams.get('season');

    // Validate required parameters
    if (!league || !season) {
      return NextResponse.json(
        {
          error: 'Missing required parameters',
          message: 'Both league and season parameters are required',
        },
        { status: 400 }
      );
    }

    const leagueId = parseInt(league, 10);
    const seasonYear = parseInt(season, 10);

    if (isNaN(leagueId) || isNaN(seasonYear)) {
      return NextResponse.json(
        {
          error: 'Invalid parameters',
          message: 'League and season must be valid numbers',
        },
        { status: 400 }
      );
    }

    // Try cache first using Supabase
    const supabase = await createClient();
    const cacheKey = `standings_${leagueId}_${seasonYear}`;

    // Check if we have a standings cache table or use a generic cache
    // For now, we'll use Next.js response caching headers
    // In production, you might want to create a dedicated standings cache table

    // Fetch from API-Football
    const apiResponse = await getStandings(leagueId, seasonYear);
    const standings = apiResponse.response;

    if (!standings || standings.length === 0) {
      return NextResponse.json(
        {
          error: 'No standings found',
          message: `No standings data available for league ${leagueId} in season ${seasonYear}`,
        },
        { status: 404 }
      );
    }

    // Return with cache headers
    const response = NextResponse.json(
      {
        data: standings,
        source: 'api',
        league: leagueId,
        season: seasonYear,
      },
      { status: 200 }
    );

    // Set cache headers (6 hours)
    response.headers.set(
      'Cache-Control',
      's-maxage=21600, stale-while-revalidate=3600'
    );

    return response;
  } catch (error) {
    console.error('Standings API error:', error);

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
        error: 'Failed to fetch standings',
        message:
          error instanceof Error ? error.message : 'An unknown error occurred',
      },
      { status: 500 }
    );
  }
}
