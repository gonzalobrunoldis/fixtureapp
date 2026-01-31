import { NextRequest, NextResponse } from 'next/server';
import { getTeams, searchTeams } from '@/lib/api-football/endpoints';

/**
 * GET /api/teams?search=<query>
 * GET /api/teams?id=<team_id>
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const searchQuery = searchParams.get('search');
  const teamId = searchParams.get('id');

  try {
    if (searchQuery) {
      // Search teams by name
      if (searchQuery.length < 3) {
        return NextResponse.json(
          { error: 'Search query must be at least 3 characters' },
          { status: 400 }
        );
      }

      const apiResponse = await searchTeams(searchQuery);

      if (apiResponse.errors) {
        return NextResponse.json(
          { error: 'Failed to search teams', details: apiResponse.errors },
          { status: 500 }
        );
      }

      return NextResponse.json({
        teams: apiResponse.response || [],
        source: 'api',
      });
    } else if (teamId) {
      // Get team by ID
      const apiResponse = await getTeams({ id: parseInt(teamId) });

      if (apiResponse.errors) {
        return NextResponse.json(
          { error: 'Failed to fetch team', details: apiResponse.errors },
          { status: 500 }
        );
      }

      return NextResponse.json({
        teams: apiResponse.response || [],
        source: 'api',
      });
    } else {
      return NextResponse.json(
        { error: 'Either search or id parameter is required' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Teams API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch teams',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
