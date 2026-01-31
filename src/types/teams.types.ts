/**
 * Team Types
 *
 * Display models for team-related data in the UI.
 */

/**
 * Team display model - UI-friendly team representation
 */
export interface TeamDisplay {
  id: number;
  name: string;
  logo: string;
  country: string;
  code: string | null; // 3-letter code (e.g., "RMA" for Real Madrid)
  founded: number | null;
  national: boolean;
  venue?: {
    name: string;
    city: string;
    capacity: number | null;
  };
}

/**
 * Followed team display model - extends database type
 */
export interface FollowedTeamDisplay {
  id: string; // UUID from database
  userId: string;
  teamId: number; // API-Football team ID
  teamName: string;
  teamLogo: string | null;
  sport: 'football' | 'basketball' | 'hockey' | 'handball';
  createdAt: Date;
}

/**
 * Followed team insert model - for creating new followed teams
 */
export interface FollowedTeamInsert {
  teamId: number;
  teamName: string;
  teamLogo: string | null;
  sport: 'football' | 'basketball' | 'hockey' | 'handball';
}
