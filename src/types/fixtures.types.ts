/**
 * Fixture Types
 *
 * Application-specific types for fixtures, matches, events, and related data.
 * Re-exports API types and adds custom application types.
 */

import {
  type Fixture,
  type FixtureResponse,
  type FixtureStatus,
  type Event,
  type Lineup,
  type LineupPlayer,
  type MatchStatistics,
  type PlayerGameStats,
  type PlayerStats,
  type TeamPlayersStats,
  type Goals,
  type Score,
  isFixtureLive,
  isFixtureFinished,
  isFixtureScheduled,
} from '@/lib/api-football/types';

// ============================================================================
// RE-EXPORT API TYPES
// ============================================================================

export type {
  Fixture,
  FixtureResponse,
  FixtureStatus,
  Event,
  Lineup,
  LineupPlayer,
  MatchStatistics,
  PlayerGameStats,
  PlayerStats,
  TeamPlayersStats,
  Goals,
  Score,
};

export { isFixtureLive, isFixtureFinished, isFixtureScheduled };

// ============================================================================
// APPLICATION-SPECIFIC TYPES
// ============================================================================

/**
 * Fixture with cached metadata for the application
 */
export interface CachedFixture extends FixtureResponse {
  cached_at: Date;
  cache_ttl: number;
  last_updated: Date;
}

/**
 * Fixture filter options for querying
 */
export interface FixtureFilters {
  league?: number;
  season?: number;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  team?: number;
  round?: string;
  status?: FixtureStatus | FixtureStatus[];
  live?: boolean;
}

/**
 * Fixture list item (minimal data for list views)
 */
export interface FixtureListItem {
  id: number;
  date: string;
  timestamp: number;
  status: FixtureStatus;
  homeTeam: {
    id: number;
    name: string;
    logo: string;
  };
  awayTeam: {
    id: number;
    name: string;
    logo: string;
  };
  score: {
    home: number | null;
    away: number | null;
  };
  league: {
    id: number;
    name: string;
    logo: string;
  };
  round: string;
  venue?: string;
}

/**
 * Live fixture update payload
 */
export interface LiveFixtureUpdate {
  fixtureId: number;
  status: FixtureStatus;
  elapsed: number | null;
  goals: Goals;
  events?: Event[];
  lastUpdated: string;
}

/**
 * Fixture grouping by date
 */
export interface FixturesByDate {
  date: string;
  fixtures: FixtureListItem[];
  count: number;
}

/**
 * Fixture statistics summary
 */
export interface FixtureStatsSummary {
  fixtureId: number;
  home: {
    teamId: number;
    teamName: string;
    possession: string | null;
    shots: number | null;
    shotsOnTarget: number | null;
    corners: number | null;
    fouls: number | null;
    yellowCards: number;
    redCards: number;
  };
  away: {
    teamId: number;
    teamName: string;
    possession: string | null;
    shots: number | null;
    shotsOnTarget: number | null;
    corners: number | null;
    fouls: number | null;
    yellowCards: number;
    redCards: number;
  };
}

/**
 * Event type classification
 */
export type EventType = 'goal' | 'card' | 'substitution' | 'var';

/**
 * Event type guards
 */
export function isGoalEvent(event: Event): boolean {
  return event.type === 'Goal';
}

export function isCardEvent(event: Event): boolean {
  return event.type === 'Card';
}

export function isSubstitutionEvent(event: Event): boolean {
  return event.type === 'subst';
}

export function isVarEvent(event: Event): boolean {
  return event.type === 'Var';
}

/**
 * Fixture timeline item (combines events and time markers)
 */
export interface FixtureTimelineItem {
  time: {
    elapsed: number;
    extra: number | null;
  };
  type: 'event' | 'period_start' | 'period_end';
  event?: Event;
  period?: 'first_half' | 'second_half' | 'extra_time' | 'penalties';
}

/**
 * Cache TTL configuration for different fixture statuses
 */
export const FIXTURE_CACHE_TTL: Record<FixtureStatus, number> = {
  TBD: 7200, // 2 hours
  NS: 3600, // 1 hour
  '1H': 15, // 15 seconds (live)
  HT: 300, // 5 minutes
  '2H': 15, // 15 seconds (live)
  ET: 15, // 15 seconds (live)
  BT: 300, // 5 minutes
  P: 15, // 15 seconds (live)
  SUSP: 300, // 5 minutes
  INT: 300, // 5 minutes
  FT: 31536000, // 1 year (finished)
  AET: 31536000, // 1 year (finished)
  PEN: 31536000, // 1 year (finished)
  PST: 1800, // 30 minutes
  CANC: 31536000, // 1 year (cancelled)
  ABD: 31536000, // 1 year (abandoned)
  AWD: 31536000, // 1 year (technical loss)
  WO: 31536000, // 1 year (walkover)
};

/**
 * Get appropriate cache TTL for a fixture based on its status
 */
export function getFixtureCacheTTL(status: FixtureStatus): number {
  return FIXTURE_CACHE_TTL[status];
}

/**
 * Fixture display helpers
 */
export function getFixtureStatusDisplay(status: FixtureStatus): string {
  const statusMap: Record<FixtureStatus, string> = {
    TBD: 'Time TBD',
    NS: 'Not Started',
    '1H': 'First Half',
    HT: 'Half Time',
    '2H': 'Second Half',
    ET: 'Extra Time',
    BT: 'Break',
    P: 'Penalties',
    SUSP: 'Suspended',
    INT: 'Interrupted',
    FT: 'Full Time',
    AET: 'Full Time (AET)',
    PEN: 'Full Time (Pens)',
    PST: 'Postponed',
    CANC: 'Cancelled',
    ABD: 'Abandoned',
    AWD: 'Technical Loss',
    WO: 'Walkover',
  };

  return statusMap[status] || status;
}

/**
 * Get fixture score display
 */
export function getScoreDisplay(goals: Goals): string {
  if (goals.home === null || goals.away === null) {
    return '-';
  }
  return `${goals.home} - ${goals.away}`;
}

/**
 * Extract key statistics from match statistics array
 */
export function extractKeyStatistics(
  statistics: MatchStatistics[]
): FixtureStatsSummary | null {
  if (statistics.length < 2) return null;

  const homeStats = statistics[0];
  const awayStats = statistics[1];

  const getStat = (stats: MatchStatistics, type: string) => {
    const stat = stats.statistics.find((s) => s.type === type);
    return stat?.value ?? null;
  };

  return {
    fixtureId: 0, // Will be set by caller
    home: {
      teamId: homeStats.team.id,
      teamName: homeStats.team.name,
      possession: getStat(homeStats, 'Ball Possession') as string | null,
      shots: getStat(homeStats, 'Total Shots') as number | null,
      shotsOnTarget: getStat(homeStats, 'Shots on Goal') as number | null,
      corners: getStat(homeStats, 'Corner Kicks') as number | null,
      fouls: getStat(homeStats, 'Fouls') as number | null,
      yellowCards: (getStat(homeStats, 'Yellow Cards') as number) || 0,
      redCards: (getStat(homeStats, 'Red Cards') as number) || 0,
    },
    away: {
      teamId: awayStats.team.id,
      teamName: awayStats.team.name,
      possession: getStat(awayStats, 'Ball Possession') as string | null,
      shots: getStat(awayStats, 'Total Shots') as number | null,
      shotsOnTarget: getStat(awayStats, 'Shots on Goal') as number | null,
      corners: getStat(awayStats, 'Corner Kicks') as number | null,
      fouls: getStat(awayStats, 'Fouls') as number | null,
      yellowCards: (getStat(awayStats, 'Yellow Cards') as number) || 0,
      redCards: (getStat(awayStats, 'Red Cards') as number) || 0,
    },
  };
}
