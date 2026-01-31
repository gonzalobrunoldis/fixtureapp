/**
 * Teams Service
 *
 * Service layer for team-related operations.
 * Handles data transformation from API responses to UI models.
 */

import { type TeamInfo } from '@/lib/api-football/endpoints';
import { type TeamDisplay } from '@/types/teams.types';

/**
 * Service result type
 */
export interface TeamsServiceResult<T> {
  data: T | null;
  error: Error | null;
}

/**
 * Transform API-Football team response to TeamDisplay
 */
export function transformTeamResponse(apiTeam: TeamInfo): TeamDisplay {
  return {
    id: apiTeam.team.id,
    name: apiTeam.team.name,
    logo: apiTeam.team.logo,
    country: apiTeam.team.country,
    code: apiTeam.team.code,
    founded: apiTeam.team.founded,
    national: apiTeam.team.national,
    venue: apiTeam.venue.name
      ? {
          name: apiTeam.venue.name,
          city: apiTeam.venue.city || '',
          capacity: apiTeam.venue.capacity,
        }
      : undefined,
  };
}

/**
 * Search teams by name
 */
export async function searchTeams(
  query: string
): Promise<TeamsServiceResult<TeamDisplay[]>> {
  try {
    if (query.length < 3) {
      return {
        data: [],
        error: new Error('Search query must be at least 3 characters'),
      };
    }

    const response = await fetch(
      `/api/teams?search=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error(`Failed to search teams: ${response.statusText}`);
    }

    const data = await response.json();

    // Transform API responses to TeamDisplay
    const teams = data.teams.map(transformTeamResponse);

    return { data: teams, error: null };
  } catch (error) {
    console.error('Error searching teams:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Get team by ID
 */
export async function getTeamById(
  teamId: number
): Promise<TeamsServiceResult<TeamDisplay>> {
  try {
    const response = await fetch(`/api/teams?id=${teamId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch team: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.teams || data.teams.length === 0) {
      throw new Error('Team not found');
    }

    const team = transformTeamResponse(data.teams[0]);

    return { data: team, error: null };
  } catch (error) {
    console.error('Error fetching team:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}
