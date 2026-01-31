/**
 * Standings Types
 *
 * Application-specific types for league standings, tables, and team rankings.
 * Re-exports API types and adds custom application types.
 */

import {
  type StandingEntry,
  type StandingsResponse,
  type TeamRecord,
} from '@/lib/api-football/types';

// ============================================================================
// RE-EXPORT API TYPES
// ============================================================================

export type { StandingEntry, StandingsResponse, TeamRecord };

// ============================================================================
// APPLICATION-SPECIFIC TYPES
// ============================================================================

/**
 * Cached standings with metadata
 */
export interface CachedStandings extends StandingsResponse {
  cached_at: Date;
  cache_ttl: number;
  last_updated: Date;
}

/**
 * Standings table view (simplified for display)
 */
export interface StandingsTableRow {
  rank: number;
  teamId: number;
  teamName: string;
  teamLogo: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string | null;
  description: string | null;
}

/**
 * Standings group (for competitions with multiple groups)
 */
export interface StandingsGroup {
  groupName: string;
  teams: StandingsTableRow[];
}

/**
 * Standings display configuration
 */
export interface StandingsDisplayConfig {
  showForm: boolean;
  showHomeAway: boolean;
  showDescription: boolean;
  highlightedTeamId?: number;
  compactMode: boolean;
}

/**
 * Team form analysis
 */
export interface TeamFormAnalysis {
  teamId: number;
  teamName: string;
  form: string | null;
  last5: {
    wins: number;
    draws: number;
    losses: number;
    points: number;
  };
  streak: {
    type: 'win' | 'draw' | 'loss';
    count: number;
  } | null;
}

/**
 * Position change indicator
 */
export type PositionChange = 'up' | 'down' | 'same';

/**
 * Extended standings entry with position change
 */
export interface StandingEntryWithChange extends StandingEntry {
  positionChange?: PositionChange;
  positionDelta?: number;
}

/**
 * Standings comparison between two time periods
 */
export interface StandingsComparison {
  current: StandingEntry[];
  previous: StandingEntry[];
  changes: {
    teamId: number;
    teamName: string;
    currentRank: number;
    previousRank: number;
    rankChange: number;
    pointsChange: number;
  }[];
}

/**
 * Standings filter options
 */
export interface StandingsFilters {
  league: number;
  season: number;
  team?: number;
  group?: string;
}

/**
 * Standing zone classification (promotion, relegation, etc.)
 */
export interface StandingZone {
  name: string;
  description: string;
  color: string;
  startRank: number;
  endRank: number;
}

/**
 * Champions League standing zones (2024/25 format)
 */
export const CHAMPIONS_LEAGUE_ZONES: StandingZone[] = [
  {
    name: 'Direct Round of 16',
    description: 'Automatic qualification to Round of 16',
    color: 'green',
    startRank: 1,
    endRank: 8,
  },
  {
    name: 'Playoff Round',
    description: 'Qualification to Playoff Round',
    color: 'blue',
    startRank: 9,
    endRank: 24,
  },
  {
    name: 'Elimination',
    description: 'Eliminated from competition',
    color: 'red',
    startRank: 25,
    endRank: 36,
  },
];

/**
 * Get the zone for a given rank in Champions League
 */
export function getChampionsLeagueZone(rank: number): StandingZone | null {
  return (
    CHAMPIONS_LEAGUE_ZONES.find(
      (zone) => rank >= zone.startRank && rank <= zone.endRank
    ) || null
  );
}

/**
 * Convert API standings to table rows
 */
export function convertToTableRows(
  standings: StandingEntry[]
): StandingsTableRow[] {
  return standings.map((entry) => ({
    rank: entry.rank,
    teamId: entry.team.id,
    teamName: entry.team.name,
    teamLogo: entry.team.logo,
    played: entry.all.played,
    won: entry.all.win,
    drawn: entry.all.draw,
    lost: entry.all.lose,
    goalsFor: entry.all.goals.for,
    goalsAgainst: entry.all.goals.against,
    goalDifference: entry.goalsDiff,
    points: entry.points,
    form: entry.form,
    description: entry.description,
  }));
}

/**
 * Group standings by group name
 */
export function groupStandings(
  standingsResponse: StandingsResponse
): StandingsGroup[] {
  return standingsResponse.league.standings.map((groupStandings, index) => ({
    groupName:
      groupStandings[0]?.group || `Group ${String.fromCharCode(65 + index)}`,
    teams: convertToTableRows(groupStandings),
  }));
}

/**
 * Parse form string into array of results
 */
export function parseForm(form: string | null): Array<'W' | 'D' | 'L'> | null {
  if (!form) return null;
  return form.split('').filter((r) => ['W', 'D', 'L'].includes(r)) as Array<
    'W' | 'D' | 'L'
  >;
}

/**
 * Analyze team form from form string
 */
export function analyzeTeamForm(
  teamId: number,
  teamName: string,
  form: string | null
): TeamFormAnalysis {
  const formArray = parseForm(form);

  if (!formArray || formArray.length === 0) {
    return {
      teamId,
      teamName,
      form,
      last5: { wins: 0, draws: 0, losses: 0, points: 0 },
      streak: null,
    };
  }

  // Calculate last 5 games stats
  const last5Results = formArray.slice(-5);
  const wins = last5Results.filter((r) => r === 'W').length;
  const draws = last5Results.filter((r) => r === 'D').length;
  const losses = last5Results.filter((r) => r === 'L').length;
  const points = wins * 3 + draws;

  // Calculate current streak
  let streak: TeamFormAnalysis['streak'] = null;
  if (formArray.length > 0) {
    const lastResult = formArray[formArray.length - 1];
    let count = 1;

    for (let i = formArray.length - 2; i >= 0; i--) {
      if (formArray[i] === lastResult) {
        count++;
      } else {
        break;
      }
    }

    const streakType =
      lastResult === 'W' ? 'win' : lastResult === 'D' ? 'draw' : 'loss';
    streak = { type: streakType, count };
  }

  return {
    teamId,
    teamName,
    form,
    last5: { wins, draws, losses, points },
    streak,
  };
}

/**
 * Get form display color
 */
export function getFormColor(result: 'W' | 'D' | 'L'): string {
  switch (result) {
    case 'W':
      return 'green';
    case 'D':
      return 'gray';
    case 'L':
      return 'red';
  }
}

/**
 * Sort standings by rank
 */
export function sortStandings(standings: StandingEntry[]): StandingEntry[] {
  return [...standings].sort((a, b) => a.rank - b.rank);
}

/**
 * Find team in standings
 */
export function findTeamInStandings(
  standings: StandingEntry[],
  teamId: number
): StandingEntry | null {
  return standings.find((entry) => entry.team.id === teamId) || null;
}

/**
 * Get teams in a specific zone
 */
export function getTeamsInZone(
  standings: StandingEntry[],
  zone: StandingZone
): StandingEntry[] {
  return standings.filter(
    (entry) => entry.rank >= zone.startRank && entry.rank <= zone.endRank
  );
}

/**
 * Calculate position change between two standings
 */
export function calculatePositionChanges(
  currentStandings: StandingEntry[],
  previousStandings: StandingEntry[]
): StandingEntryWithChange[] {
  return currentStandings.map((current) => {
    const previous = previousStandings.find(
      (p) => p.team.id === current.team.id
    );

    if (!previous) {
      return current;
    }

    const rankChange = previous.rank - current.rank;
    let positionChange: PositionChange = 'same';

    if (rankChange > 0) {
      positionChange = 'up';
    } else if (rankChange < 0) {
      positionChange = 'down';
    }

    return {
      ...current,
      positionChange,
      positionDelta: rankChange,
    };
  });
}
