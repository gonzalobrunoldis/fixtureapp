/**
 * Followed Teams Service
 *
 * Service layer for managing followed teams in the database.
 * Handles CRUD operations for the followed_teams table.
 */

import { createClient } from '@/lib/supabase/client';
import type { FollowedTeam } from '@/types/database.types';
import type {
  FollowedTeamDisplay,
  FollowedTeamInsert,
} from '@/types/teams.types';

/**
 * Transform database FollowedTeam to FollowedTeamDisplay
 */
function transformFollowedTeam(dbTeam: FollowedTeam): FollowedTeamDisplay {
  return {
    id: dbTeam.id,
    userId: dbTeam.user_id,
    teamId: dbTeam.team_id,
    teamName: dbTeam.team_name,
    teamLogo: dbTeam.team_logo,
    sport: dbTeam.sport,
    createdAt: new Date(dbTeam.created_at),
  };
}

/**
 * Load followed teams from the database
 */
export async function loadFollowedTeams(
  userId: string
): Promise<FollowedTeamDisplay[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('followed_teams')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error loading followed teams:', error);
    return [];
  }

  return (data as FollowedTeam[]).map(transformFollowedTeam);
}

/**
 * Follow a new team
 */
export async function followTeam(
  userId: string,
  team: FollowedTeamInsert
): Promise<{ data: FollowedTeamDisplay | null; error: Error | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('followed_teams')
    .insert({
      user_id: userId,
      team_id: team.teamId,
      team_name: team.teamName,
      team_logo: team.teamLogo,
      sport: team.sport,
    } as any)
    .select()
    .single();

  if (error) {
    console.error('Error following team:', error);
    return { data: null, error: new Error(error.message) };
  }

  return { data: transformFollowedTeam(data as FollowedTeam), error: null };
}

/**
 * Unfollow a team
 */
export async function unfollowTeam(
  userId: string,
  teamId: number
): Promise<{ error: Error | null }> {
  const supabase = createClient();

  const { error } = await supabase
    .from('followed_teams')
    .delete()
    .eq('user_id', userId)
    .eq('team_id', teamId);

  if (error) {
    console.error('Error unfollowing team:', error);
    return { error: new Error(error.message) };
  }

  return { error: null };
}

/**
 * Check if a team is already followed
 */
export async function isTeamFollowed(
  userId: string,
  teamId: number
): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('followed_teams')
    .select('id')
    .eq('user_id', userId)
    .eq('team_id', teamId)
    .maybeSingle();

  if (error) {
    console.error('Error checking if team is followed:', error);
    return false;
  }

  return !!data;
}
