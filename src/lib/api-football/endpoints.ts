/**
 * API-Football Endpoints
 *
 * Defines all API endpoints and their TypeScript types.
 * Provides typed functions for making API requests.
 *
 * @see https://www.api-football.com/documentation-v3
 */

import { apiFootballGet, type ApiFootballResponse } from './client';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Fixture Status
 */
export type FixtureStatus =
  | 'TBD' // Time to be defined
  | 'NS' // Not started
  | '1H' // First half
  | 'HT' // Halftime
  | '2H' // Second half
  | 'ET' // Extra time
  | 'BT' // Break time (before extra time)
  | 'P' // Penalty in progress
  | 'SUSP' // Match suspended
  | 'INT' // Match interrupted
  | 'FT' // Finished
  | 'AET' // Finished after extra time
  | 'PEN' // Finished after penalties
  | 'PST' // Postponed
  | 'CANC' // Cancelled
  | 'ABD' // Abandoned
  | 'AWD' // Technical loss
  | 'WO'; // Walkover

/**
 * League/Competition Information
 */
export interface League {
  id: number;
  name: string;
  type: string;
  logo: string;
}

/**
 * Country Information
 */
export interface Country {
  name: string;
  code: string | null;
  flag: string | null;
}

/**
 * Season Information
 */
export interface Season {
  year: number;
  start: string;
  end: string;
  current: boolean;
}

/**
 * Team Information
 */
export interface Team {
  id: number;
  name: string;
  logo: string;
  winner: boolean | null;
}

/**
 * Venue Information
 */
export interface Venue {
  id: number | null;
  name: string | null;
  city: string | null;
}

/**
 * Fixture Information
 */
export interface Fixture {
  id: number;
  referee: string | null;
  timezone: string;
  date: string;
  timestamp: number;
  periods: {
    first: number | null;
    second: number | null;
  };
  venue: Venue;
  status: {
    long: string;
    short: FixtureStatus;
    elapsed: number | null;
  };
}

/**
 * Goals Information
 */
export interface Goals {
  home: number | null;
  away: number | null;
}

/**
 * Score Information
 */
export interface Score {
  halftime: Goals;
  fulltime: Goals;
  extratime: Goals;
  penalty: Goals;
}

/**
 * Complete Fixture Response
 */
export interface FixtureResponse {
  fixture: Fixture;
  league: League;
  teams: {
    home: Team;
    away: Team;
  };
  goals: Goals;
  score: Score;
}

/**
 * League Information Response
 */
export interface LeagueResponse {
  league: League;
  country: Country;
  seasons: Season[];
}

/**
 * Standings Team Information
 */
export interface StandingsTeam {
  id: number;
  name: string;
  logo: string;
}

/**
 * Standings Entry
 */
export interface StandingsEntry {
  rank: number;
  team: StandingsTeam;
  points: number;
  goalsDiff: number;
  group: string;
  form: string | null;
  status: string | null;
  description: string | null;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  home: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  away: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  update: string;
}

/**
 * Standings Response
 */
export interface StandingsResponse {
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string | null;
    season: number;
    standings: StandingsEntry[][];
  };
}

/**
 * Team Statistics
 */
export interface TeamStatistics {
  team: Team;
  statistics: Array<{
    type: string;
    value: number | string | null;
  }>;
}

// ============================================================================
// API ENDPOINT FUNCTIONS
// ============================================================================

/**
 * Get fixtures by various filters
 *
 * @param params - Filter parameters
 * @param params.league - League ID
 * @param params.season - Season year (e.g., 2024)
 * @param params.date - Date in YYYY-MM-DD format
 * @param params.from - Start date (YYYY-MM-DD)
 * @param params.to - End date (YYYY-MM-DD)
 * @param params.team - Team ID
 * @param params.round - Round name (e.g., "Regular Season - 1")
 * @param params.status - Fixture status (NS, FT, etc.)
 * @param params.timezone - Timezone (e.g., "America/New_York")
 */
export async function getFixtures(params: {
  league?: number;
  season?: number;
  date?: string;
  from?: string;
  to?: string;
  team?: number;
  round?: string;
  status?: FixtureStatus;
  timezone?: string;
}): Promise<ApiFootballResponse<FixtureResponse[]>> {
  return apiFootballGet<FixtureResponse[]>('/fixtures', params);
}

/**
 * Get a specific fixture by ID
 *
 * @param fixtureId - Fixture ID
 */
export async function getFixtureById(
  fixtureId: number
): Promise<ApiFootballResponse<FixtureResponse[]>> {
  return apiFootballGet<FixtureResponse[]>('/fixtures', { id: fixtureId });
}

/**
 * Get multiple fixtures by IDs (batch request)
 *
 * @param fixtureIds - Array of fixture IDs (max 20)
 */
export async function getFixturesByIds(
  fixtureIds: number[]
): Promise<ApiFootballResponse<FixtureResponse[]>> {
  if (fixtureIds.length > 20) {
    throw new Error('Maximum 20 fixture IDs allowed per request');
  }
  return apiFootballGet<FixtureResponse[]>('/fixtures', {
    ids: fixtureIds.join('-'),
  });
}

/**
 * Get leagues/competitions
 *
 * @param params - Filter parameters
 * @param params.id - League ID
 * @param params.name - League name
 * @param params.country - Country name
 * @param params.season - Season year
 */
export async function getLeagues(params?: {
  id?: number;
  name?: string;
  country?: string;
  season?: number;
}): Promise<ApiFootballResponse<LeagueResponse[]>> {
  return apiFootballGet<LeagueResponse[]>('/leagues', params || {});
}

/**
 * Get standings for a league
 *
 * @param league - League ID
 * @param season - Season year
 */
export async function getStandings(
  league: number,
  season: number
): Promise<ApiFootballResponse<StandingsResponse[]>> {
  return apiFootballGet<StandingsResponse[]>('/standings', {
    league,
    season,
  });
}

/**
 * Get team information
 *
 * @param params - Filter parameters
 * @param params.id - Team ID
 * @param params.name - Team name
 * @param params.league - League ID
 * @param params.season - Season year
 */
export async function getTeams(params: {
  id?: number;
  name?: string;
  league?: number;
  season?: number;
}): Promise<ApiFootballResponse<{ team: Team; venue: Venue }[]>> {
  return apiFootballGet<{ team: Team; venue: Venue }[]>('/teams', params);
}

/**
 * Get team statistics
 *
 * @param league - League ID
 * @param season - Season year
 * @param team - Team ID
 */
export async function getTeamStatistics(
  league: number,
  season: number,
  team: number
): Promise<ApiFootballResponse<TeamStatistics>> {
  return apiFootballGet<TeamStatistics>('/teams/statistics', {
    league,
    season,
    team,
  });
}

/**
 * Get available timezones
 */
export async function getTimezones(): Promise<ApiFootballResponse<string[]>> {
  return apiFootballGet<string[]>('/timezone');
}

// ============================================================================
// CHAMPIONS LEAGUE HELPERS
// ============================================================================

/**
 * Champions League ID constant
 */
export const CHAMPIONS_LEAGUE_ID = 2;

/**
 * Get Champions League fixtures
 *
 * @param season - Season year (e.g., 2024)
 * @param params - Optional additional filters
 */
export async function getChampionsLeagueFixtures(
  season: number,
  params?: {
    date?: string;
    from?: string;
    to?: string;
    round?: string;
    status?: FixtureStatus;
  }
): Promise<ApiFootballResponse<FixtureResponse[]>> {
  return getFixtures({
    league: CHAMPIONS_LEAGUE_ID,
    season,
    ...params,
  });
}

/**
 * Get Champions League standings
 *
 * @param season - Season year (e.g., 2024)
 */
export async function getChampionsLeagueStandings(
  season: number
): Promise<ApiFootballResponse<StandingsResponse[]>> {
  return getStandings(CHAMPIONS_LEAGUE_ID, season);
}

/**
 * Get Champions League information
 */
export async function getChampionsLeagueInfo(
  season?: number
): Promise<ApiFootballResponse<LeagueResponse[]>> {
  return getLeagues({
    id: CHAMPIONS_LEAGUE_ID,
    ...(season && { season }),
  });
}
