/**
 * Teams Types
 *
 * Application-specific types for teams, venues, players, and team statistics.
 * Re-exports API types and adds custom application types.
 */

import {
  type Team,
  type TeamResponse,
  type Venue,
  type TeamSeasonStatistics,
  type Player,
  type PlayerSeasonStats,
  type SquadPlayer,
  type TeamSquadResponse,
} from '@/lib/api-football/types';

// ============================================================================
// RE-EXPORT API TYPES
// ============================================================================

export type {
  Team,
  TeamResponse,
  Venue,
  TeamSeasonStatistics,
  Player,
  PlayerSeasonStats,
  SquadPlayer,
  TeamSquadResponse,
};

// ============================================================================
// APPLICATION-SPECIFIC TYPES
// ============================================================================

/**
 * Cached team data
 */
export interface CachedTeam extends TeamResponse {
  cached_at: Date;
  cache_ttl: number;
  last_updated: Date;
}

/**
 * Team list item (minimal data for display)
 */
export interface TeamListItem {
  id: number;
  name: string;
  code?: string;
  logo: string;
  country?: string;
}

/**
 * Team filter options
 */
export interface TeamFilters {
  league?: number;
  season?: number;
  country?: string;
  search?: string;
}

/**
 * Team with current season statistics
 */
export interface TeamWithStats {
  team: Team;
  venue: Venue;
  statistics?: TeamSeasonStatistics;
  standing?: {
    rank: number;
    points: number;
    played: number;
    form: string | null;
  };
}

/**
 * User's followed teams
 */
export interface FollowedTeam {
  teamId: number;
  teamName: string;
  teamLogo: string;
  followedAt: Date;
  notificationsEnabled: boolean;
}

/**
 * Team comparison data
 */
export interface TeamComparison {
  homeTeam: {
    id: number;
    name: string;
    logo: string;
    stats: {
      played: number;
      wins: number;
      draws: number;
      losses: number;
      goalsFor: number;
      goalsAgainst: number;
      form: string | null;
    };
  };
  awayTeam: {
    id: number;
    name: string;
    logo: string;
    stats: {
      played: number;
      wins: number;
      draws: number;
      losses: number;
      goalsFor: number;
      goalsAgainst: number;
      form: string | null;
    };
  };
  headToHead?: {
    total: number;
    homeWins: number;
    awayWins: number;
    draws: number;
  };
}

/**
 * Team performance metrics
 */
export interface TeamPerformanceMetrics {
  teamId: number;
  teamName: string;
  season: number;
  league: {
    id: number;
    name: string;
  };
  overall: {
    played: number;
    wins: number;
    draws: number;
    losses: number;
    winRate: number;
    goalsPerGame: number;
    goalsAgainstPerGame: number;
    cleanSheets: number;
  };
  home: {
    played: number;
    wins: number;
    draws: number;
    losses: number;
    winRate: number;
    goalsPerGame: number;
  };
  away: {
    played: number;
    wins: number;
    draws: number;
    losses: number;
    winRate: number;
    goalsPerGame: number;
  };
}

/**
 * Squad position groups
 */
export type SquadPosition =
  | 'Goalkeeper'
  | 'Defender'
  | 'Midfielder'
  | 'Attacker';

/**
 * Squad grouped by position
 */
export interface SquadByPosition {
  position: SquadPosition;
  players: SquadPlayer[];
  count: number;
}

/**
 * Player position classification
 */
export function classifyPlayerPosition(position: string): SquadPosition {
  const pos = position.toLowerCase();

  if (pos.includes('goal')) return 'Goalkeeper';
  if (pos.includes('defend') || pos.includes('back')) return 'Defender';
  if (pos.includes('mid')) return 'Midfielder';
  if (
    pos.includes('forward') ||
    pos.includes('attack') ||
    pos.includes('striker') ||
    pos.includes('wing')
  )
    return 'Attacker';

  // Default fallback
  return 'Midfielder';
}

/**
 * Group squad by position
 */
export function groupSquadByPosition(
  players: SquadPlayer[]
): SquadByPosition[] {
  const groups: Record<SquadPosition, SquadPlayer[]> = {
    Goalkeeper: [],
    Defender: [],
    Midfielder: [],
    Attacker: [],
  };

  players.forEach((player) => {
    const position = classifyPlayerPosition(player.position);
    groups[position].push(player);
  });

  return [
    {
      position: 'Goalkeeper',
      players: groups.Goalkeeper,
      count: groups.Goalkeeper.length,
    },
    {
      position: 'Defender',
      players: groups.Defender,
      count: groups.Defender.length,
    },
    {
      position: 'Midfielder',
      players: groups.Midfielder,
      count: groups.Midfielder.length,
    },
    {
      position: 'Attacker',
      players: groups.Attacker,
      count: groups.Attacker.length,
    },
  ];
}

/**
 * Sort players by position and number
 */
export function sortSquadPlayers(players: SquadPlayer[]): SquadPlayer[] {
  const positionOrder: Record<string, number> = {
    Goalkeeper: 1,
    Defender: 2,
    Midfielder: 3,
    Attacker: 4,
  };

  return [...players].sort((a, b) => {
    const posA = classifyPlayerPosition(a.position);
    const posB = classifyPlayerPosition(b.position);

    if (positionOrder[posA] !== positionOrder[posB]) {
      return positionOrder[posA] - positionOrder[posB];
    }

    // Within same position, sort by number
    const numA = a.number ?? 999;
    const numB = b.number ?? 999;
    return numA - numB;
  });
}

/**
 * Team venue display information
 */
export interface VenueDisplayInfo {
  name: string;
  city: string | null;
  capacity: number | null;
  capacityDisplay: string;
  surface: string | null;
  hasImage: boolean;
  image: string | null;
}

/**
 * Format venue information for display
 */
export function formatVenueInfo(venue: Venue): VenueDisplayInfo {
  const capacity = venue.capacity ?? null;
  const capacityDisplay = capacity
    ? capacity >= 1000
      ? `${(capacity / 1000).toFixed(1)}k`
      : capacity.toString()
    : 'N/A';

  return {
    name: venue.name ?? 'Unknown Venue',
    city: venue.city,
    capacity,
    capacityDisplay,
    surface: venue.surface ?? null,
    hasImage: !!venue.image,
    image: venue.image ?? null,
  };
}

/**
 * Team statistics summary
 */
export interface TeamStatsSummary {
  teamId: number;
  teamName: string;
  league: {
    id: number;
    name: string;
  };
  season: number;
  totalGames: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  winPercentage: number;
  avgGoalsScored: number;
  avgGoalsConceded: number;
  cleanSheets: number;
  failedToScore: number;
}

/**
 * Calculate team statistics summary
 */
export function calculateTeamStatsSummary(
  teamId: number,
  teamName: string,
  league: { id: number; name: string },
  season: number,
  stats: TeamSeasonStatistics
): TeamStatsSummary {
  const totalGames = stats.fixtures?.played.total ?? 0;
  const wins = stats.fixtures?.wins.total ?? 0;
  const draws = stats.fixtures?.draws.total ?? 0;
  const losses = stats.fixtures?.loses.total ?? 0;
  const goalsFor = stats.goals?.for.total.total ?? 0;
  const goalsAgainst = stats.goals?.against.total.total ?? 0;
  const goalDifference = goalsFor - goalsAgainst;
  const points = wins * 3 + draws;
  const winPercentage = totalGames > 0 ? (wins / totalGames) * 100 : 0;
  const avgGoalsScored = totalGames > 0 ? goalsFor / totalGames : 0;
  const avgGoalsConceded = totalGames > 0 ? goalsAgainst / totalGames : 0;

  // Clean sheets and failed to score would need to be calculated from fixture details
  const cleanSheets = 0; // TODO: Calculate from fixtures
  const failedToScore = 0; // TODO: Calculate from fixtures

  return {
    teamId,
    teamName,
    league,
    season,
    totalGames,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    goalDifference,
    points,
    winPercentage,
    avgGoalsScored,
    avgGoalsConceded,
    cleanSheets,
    failedToScore,
  };
}

/**
 * Player list item for display
 */
export interface PlayerListItem {
  id: number;
  name: string;
  photo: string;
  age: number | null;
  position: string;
  number: number | null;
  nationality: string | null;
}

/**
 * Top scorer data
 */
export interface TopScorer {
  playerId: number;
  playerName: string;
  playerPhoto: string;
  teamId: number;
  teamName: string;
  teamLogo: string;
  goals: number;
  assists: number;
  appearances: number;
  goalsPerGame: number;
}

/**
 * Team color scheme
 */
export interface TeamColors {
  primary: string;
  secondary: string;
  accent: string;
}

/**
 * Extract team colors from logo (placeholder - would use image processing)
 */
export function extractTeamColors(logoUrl: string): TeamColors {
  // This would use an image processing library to extract dominant colors
  // For now, return default colors
  return {
    primary: '#1a1a1a',
    secondary: '#ffffff',
    accent: '#4a90e2',
  };
}

/**
 * Team rivalry/head-to-head record
 */
export interface TeamRivalry {
  team1: TeamListItem;
  team2: TeamListItem;
  totalMeetings: number;
  team1Wins: number;
  team2Wins: number;
  draws: number;
  team1Goals: number;
  team2Goals: number;
  lastMeetingDate: string | null;
  lastMeetingScore: {
    team1: number;
    team2: number;
  } | null;
}
