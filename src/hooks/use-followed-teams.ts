'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from './use-auth';
import {
  loadFollowedTeams,
  followTeam as followTeamService,
  unfollowTeam as unfollowTeamService,
  isTeamFollowed as isTeamFollowedService,
} from '@/services/followed-teams.service';
import { useFollowedTeamsStore } from '@/stores/followed-teams.store';
import type {
  FollowedTeamInsert,
  FollowedTeamDisplay,
} from '@/types/teams.types';

/**
 * Hook to manage followed teams persistence
 *
 * - Loads followed teams from DB on mount for authenticated users
 * - Provides functions to follow/unfollow teams
 * - Auto-selects first team if none selected
 */
export function useFollowedTeams() {
  const { user, loading: authLoading } = useAuth();
  const {
    followedTeams,
    selectedTeamId,
    setFollowedTeams,
    addFollowedTeam,
    removeFollowedTeam,
    selectTeam,
    getSelectedTeam,
    isTeamFollowed,
  } = useFollowedTeamsStore();

  const isInitializedRef = useRef(false);

  // Load followed teams from DB on mount (for authenticated users)
  useEffect(() => {
    if (authLoading) return;

    const loadTeams = async () => {
      if (user && !isInitializedRef.current) {
        try {
          const teams = await loadFollowedTeams(user.id);
          setFollowedTeams(teams);

          // Auto-select first team if none selected
          if (teams.length > 0 && !selectedTeamId) {
            selectTeam(teams[0].teamId);
          }

          isInitializedRef.current = true;
        } catch (error) {
          console.error('Failed to load followed teams:', error);
          isInitializedRef.current = true;
        }
      } else if (!user) {
        // Clear state when user logs out
        setFollowedTeams([]);
        selectTeam(null);
        isInitializedRef.current = false;
      }
    };

    loadTeams();
  }, [user, authLoading, setFollowedTeams, selectTeam, selectedTeamId]);

  // Follow a team
  const followTeam = useCallback(
    async (team: FollowedTeamInsert): Promise<{ error: Error | null }> => {
      if (!user) {
        return {
          error: new Error('User must be authenticated to follow teams'),
        };
      }

      try {
        const { data, error } = await followTeamService(user.id, team);

        if (error) {
          return { error };
        }

        if (data) {
          // Optimistically add to store
          addFollowedTeam(data);

          // Auto-select if this is the first team
          if (followedTeams.length === 0) {
            selectTeam(data.teamId);
          }
        }

        return { error: null };
      } catch (error) {
        console.error('Failed to follow team:', error);
        return {
          error: error instanceof Error ? error : new Error('Unknown error'),
        };
      }
    },
    [user, addFollowedTeam, selectTeam, followedTeams.length]
  );

  // Unfollow a team
  const unfollowTeam = useCallback(
    async (teamId: number): Promise<{ error: Error | null }> => {
      if (!user) {
        return { error: new Error('User must be authenticated') };
      }

      try {
        const { error } = await unfollowTeamService(user.id, teamId);

        if (error) {
          return { error };
        }

        // Remove from store
        removeFollowedTeam(teamId);

        return { error: null };
      } catch (error) {
        console.error('Failed to unfollow team:', error);
        return {
          error: error instanceof Error ? error : new Error('Unknown error'),
        };
      }
    },
    [user, removeFollowedTeam]
  );

  // Check if team is followed
  const checkIsFollowed = useCallback(
    async (teamId: number): Promise<boolean> => {
      if (!user) return false;

      // First check local state (faster)
      if (isTeamFollowed(teamId)) return true;

      // Fallback to DB check
      try {
        return await isTeamFollowedService(user.id, teamId);
      } catch (error) {
        console.error('Failed to check if team is followed:', error);
        return false;
      }
    },
    [user, isTeamFollowed]
  );

  return {
    followedTeams,
    selectedTeam: getSelectedTeam(),
    selectedTeamId,
    isAuthenticated: !!user,
    isLoading: authLoading,
    followTeam,
    unfollowTeam,
    selectTeam,
    isTeamFollowed: checkIsFollowed,
  };
}
