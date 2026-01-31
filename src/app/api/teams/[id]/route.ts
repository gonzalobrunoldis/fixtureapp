import { NextResponse } from 'next/server';
import { getTeams, getTeamStatistics } from '@/lib/api-football/endpoints';
import { ApiFootballError } from '@/lib/api-football/client';

/**
 * GET /api/teams/[id]
 *
 * Retrieves detailed information for a single team.
 *
 * Path Parameters:
 * - id: Team ID
 *
 * Query Parameters:
 * - league: League ID (required for statistics)
 * - season: Season year (required for statistics)
 * - stats: Include statistics (true/false, requires league and season)
 *
 * Examples:
 * - GET /api/teams/123
 * - GET /api/teams/123?league=2&season=2024&stats=true
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the team ID from params
    const { id } = await params;
    const teamId = parseInt(id, 10);

    if (isNaN(teamId)) {
      return NextResponse.json(
        {
          error: 'Invalid team ID',
          message: 'Team ID must be a valid number',
        },
        { status: 400 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const league = searchParams.get('league')
      ? parseInt(searchParams.get('league')!, 10)
      : undefined;
    const season = searchParams.get('season')
      ? parseInt(searchParams.get('season')!, 10)
      : undefined;
    const includeStats = searchParams.get('stats') === 'true';

    // Validate stats parameters
    if (includeStats && (!league || !season)) {
      return NextResponse.json(
        {
          error: 'Invalid parameters',
          message: 'League and season are required to fetch statistics',
        },
        { status: 400 }
      );
    }

    // Fetch team data
    const apiResponse = await getTeams({ id: teamId });
    const teams = apiResponse.response;

    if (!teams || teams.length === 0) {
      return NextResponse.json(
        {
          error: 'Team not found',
          message: `No team found with ID ${teamId}`,
        },
        { status: 404 }
      );
    }

    const team = teams[0];

    // If statistics requested, fetch them
    let statistics = null;
    if (includeStats && league && season) {
      try {
        const statsResponse = await getTeamStatistics(league, season, teamId);
        statistics = statsResponse.response;
      } catch (error) {
        console.warn('Failed to fetch team statistics:', error);
        // Continue without stats rather than failing the whole request
      }
    }

    // Return with cache headers (24 hours for team data)
    const response = NextResponse.json(
      {
        data: team,
        statistics,
        source: 'api',
      },
      { status: 200 }
    );

    // Set cache headers (24 hours for teams since they rarely change)
    response.headers.set(
      'Cache-Control',
      's-maxage=86400, stale-while-revalidate=43200'
    );

    return response;
  } catch (error) {
    console.error('Team detail API error:', error);

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
        error: 'Failed to fetch team',
        message:
          error instanceof Error ? error.message : 'An unknown error occurred',
      },
      { status: 500 }
    );
  }
}
