import { NextResponse } from 'next/server';
import { getFixtureById } from '@/lib/api-football/endpoints';
import { getCachedFixtures, cacheFixtures } from '@/lib/api-football/cache';
import { ApiFootballError } from '@/lib/api-football/client';

/**
 * GET /api/fixtures/[id]
 *
 * Retrieves a single fixture by ID with caching support.
 *
 * Path Parameters:
 * - id: Fixture ID
 *
 * Example:
 * - GET /api/fixtures/12345
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the fixture ID from params
    const { id } = await params;
    const fixtureId = parseInt(id, 10);

    if (isNaN(fixtureId)) {
      return NextResponse.json(
        {
          error: 'Invalid fixture ID',
          message: 'Fixture ID must be a valid number',
        },
        { status: 400 }
      );
    }

    // Try cache first
    const cached = await getCachedFixtures({ fixtureId });

    if (cached && cached.length > 0) {
      return NextResponse.json(
        {
          data: cached[0],
          source: 'cache',
        },
        { status: 200 }
      );
    }

    // Cache miss - fetch from API-Football
    const apiResponse = await getFixtureById(fixtureId);
    const fixtures = apiResponse.response;

    if (!fixtures || fixtures.length === 0) {
      return NextResponse.json(
        {
          error: 'Fixture not found',
          message: `No fixture found with ID ${fixtureId}`,
        },
        { status: 404 }
      );
    }

    const fixture = fixtures[0];

    // Store in cache for future requests
    await cacheFixtures([fixture]);

    return NextResponse.json(
      {
        data: fixture,
        source: 'api',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fixture detail API error:', error);

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
        error: 'Failed to fetch fixture',
        message:
          error instanceof Error ? error.message : 'An unknown error occurred',
      },
      { status: 500 }
    );
  }
}
