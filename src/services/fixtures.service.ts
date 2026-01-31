/**
 * Fixtures Service
 *
 * Service layer for fixture-related operations.
 * Handles data transformation from API responses to UI models.
 */

import { type FixtureResponse } from '@/lib/api-football/endpoints';
import { parseApiDate } from '@/lib/utils/date';
import { type FixtureDisplay } from '@/types/fixtures.types';

/**
 * Service result type
 */
export interface FixturesServiceResult<T> {
  data: T | null;
  error: Error | null;
}

/**
 * Transform API-Football fixture response to FixtureDisplay
 */
export function transformFixtureResponse(
  apiFixture: FixtureResponse
): FixtureDisplay {
  return {
    id: apiFixture.fixture.id,
    homeTeam: {
      id: apiFixture.teams.home.id,
      name: apiFixture.teams.home.name,
      logo: apiFixture.teams.home.logo,
      isWinner: apiFixture.teams.home.winner,
    },
    awayTeam: {
      id: apiFixture.teams.away.id,
      name: apiFixture.teams.away.name,
      logo: apiFixture.teams.away.logo,
      isWinner: apiFixture.teams.away.winner,
    },
    status: apiFixture.fixture.status.short,
    statusLong: apiFixture.fixture.status.long,
    elapsed: apiFixture.fixture.status.elapsed,
    startTime: parseApiDate(apiFixture.fixture.date),
    score: {
      home: apiFixture.goals.home,
      away: apiFixture.goals.away,
      halftime: {
        home: apiFixture.score.halftime.home,
        away: apiFixture.score.halftime.away,
      },
      fulltime: {
        home: apiFixture.score.fulltime.home,
        away: apiFixture.score.fulltime.away,
      },
    },
    league: {
      id: apiFixture.league.id,
      name: apiFixture.league.name,
      logo: apiFixture.league.logo,
    },
    venue: apiFixture.fixture.venue.name
      ? {
          name: apiFixture.fixture.venue.name,
          city: apiFixture.fixture.venue.city || '',
        }
      : undefined,
    referee: apiFixture.fixture.referee || undefined,
  };
}

/**
 * Get fixtures by date from the API route
 */
export async function getFixturesByDate(
  date: string
): Promise<FixturesServiceResult<FixtureDisplay[]>> {
  try {
    const response = await fetch(`/api/fixtures?date=${date}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch fixtures: ${response.statusText}`);
    }

    const data = await response.json();

    // Transform API responses to FixtureDisplay
    const fixtures = data.fixtures.map(transformFixtureResponse);

    return { data: fixtures, error: null };
  } catch (error) {
    console.error('Error fetching fixtures:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Get fixture by ID
 */
export async function getFixtureById(
  id: number
): Promise<FixturesServiceResult<FixtureDisplay>> {
  try {
    const response = await fetch(`/api/fixtures/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch fixture: ${response.statusText}`);
    }

    const data = await response.json();
    const fixture = transformFixtureResponse(data.fixture);

    return { data: fixture, error: null };
  } catch (error) {
    console.error('Error fetching fixture:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Group fixtures by league
 */
export function groupFixturesByLeague(
  fixtures: FixtureDisplay[]
): Map<number, FixtureDisplay[]> {
  const grouped = new Map<number, FixtureDisplay[]>();

  fixtures.forEach((fixture) => {
    const leagueId = fixture.league.id;
    const existing = grouped.get(leagueId) || [];
    grouped.set(leagueId, [...existing, fixture]);
  });

  // Sort fixtures within each league by start time
  grouped.forEach((fixturesList, leagueId) => {
    grouped.set(
      leagueId,
      fixturesList.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    );
  });

  return grouped;
}
