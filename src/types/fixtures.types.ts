/**
 * Fixture Display Types
 *
 * Display-specific types for fixtures used in the UI.
 * These types transform API response types into UI-friendly formats.
 */

import { type FixtureStatus } from '@/lib/api-football/endpoints';

/**
 * Team Information for Display
 */
export interface TeamInfo {
  id: number;
  name: string;
  logo: string;
  isWinner: boolean | null;
}

/**
 * League Information for Display
 */
export interface LeagueInfo {
  id: number;
  name: string;
  logo: string;
  country?: string;
}

/**
 * Venue Information for Display
 */
export interface VenueInfo {
  name: string;
  city: string;
}

/**
 * Match Event Type
 */
export type MatchEventType = 'goal' | 'card' | 'substitution' | 'var';

/**
 * Match Event
 */
export interface MatchEvent {
  type: MatchEventType;
  time: number;
  team: 'home' | 'away';
  player: string;
  detail?: string; // e.g., "penalty", "own goal", "yellow", "red"
  assist?: string; // For goals
}

/**
 * Score Information
 */
export interface ScoreInfo {
  home: number | null;
  away: number | null;
  halftime?: {
    home: number | null;
    away: number | null;
  };
  fulltime?: {
    home: number | null;
    away: number | null;
  };
}

/**
 * Fixture Display Model
 *
 * Main model for displaying fixture information in the UI
 */
export interface FixtureDisplay {
  id: number;
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  status: FixtureStatus;
  statusLong: string;
  elapsed: number | null;
  startTime: Date;
  score: ScoreInfo;
  league: LeagueInfo;
  venue?: VenueInfo;
  events?: MatchEvent[];
  referee?: string;
}

/**
 * Helper type guards
 */
export function isLiveMatch(fixture: FixtureDisplay): boolean {
  const liveStatuses: FixtureStatus[] = ['1H', 'HT', '2H', 'ET', 'BT', 'P'];
  return liveStatuses.includes(fixture.status);
}

export function isUpcomingMatch(fixture: FixtureDisplay): boolean {
  const upcomingStatuses: FixtureStatus[] = ['TBD', 'NS'];
  return upcomingStatuses.includes(fixture.status);
}

export function isFinishedMatch(fixture: FixtureDisplay): boolean {
  const finishedStatuses: FixtureStatus[] = [
    'FT',
    'AET',
    'PEN',
    'CANC',
    'ABD',
    'AWD',
    'WO',
  ];
  return finishedStatuses.includes(fixture.status);
}

export function isCancelledMatch(fixture: FixtureDisplay): boolean {
  const cancelledStatuses: FixtureStatus[] = ['CANC', 'ABD', 'PST'];
  return cancelledStatuses.includes(fixture.status);
}
