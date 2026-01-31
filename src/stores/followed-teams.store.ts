import { create } from 'zustand';
import type { FollowedTeamDisplay } from '@/types/teams.types';

/**
 * Followed Teams State
 *
 * Manages followed teams and selected team for the Following/My Teams screen.
 */
export interface FollowedTeamsState {
  // State
  followedTeams: FollowedTeamDisplay[];
  selectedTeamId: number | null;
  isLoading: boolean;

  // Actions
  setFollowedTeams: (teams: FollowedTeamDisplay[]) => void;
  addFollowedTeam: (team: FollowedTeamDisplay) => void;
  removeFollowedTeam: (teamId: number) => void;
  selectTeam: (teamId: number | null) => void;

  // Selectors
  getSelectedTeam: () => FollowedTeamDisplay | null;
  isTeamFollowed: (teamId: number) => boolean;
  getFollowedTeamCount: () => number;
}

export const useFollowedTeamsStore = create<FollowedTeamsState>((set, get) => ({
  // Initial state
  followedTeams: [],
  selectedTeamId: null,
  isLoading: false,

  // Set all followed teams (used when loading from DB)
  setFollowedTeams: (teams: FollowedTeamDisplay[]) => {
    set({ followedTeams: teams });
  },

  // Add a newly followed team
  addFollowedTeam: (team: FollowedTeamDisplay) => {
    set((state) => {
      // Check if already followed
      if (state.followedTeams.some((t) => t.teamId === team.teamId)) {
        return state;
      }
      return {
        followedTeams: [...state.followedTeams, team],
      };
    });
  },

  // Remove an unfollowed team
  removeFollowedTeam: (teamId: number) => {
    set((state) => ({
      followedTeams: state.followedTeams.filter((t) => t.teamId !== teamId),
      // Clear selection if the selected team was removed
      selectedTeamId:
        state.selectedTeamId === teamId ? null : state.selectedTeamId,
    }));
  },

  // Select a team to view
  selectTeam: (teamId: number | null) => {
    set({ selectedTeamId: teamId });
  },

  // Get the currently selected team
  getSelectedTeam: () => {
    const state = get();
    if (!state.selectedTeamId) return null;
    return (
      state.followedTeams.find((t) => t.teamId === state.selectedTeamId) || null
    );
  },

  // Check if a team is followed
  isTeamFollowed: (teamId: number) => {
    return get().followedTeams.some((t) => t.teamId === teamId);
  },

  // Get count of followed teams
  getFollowedTeamCount: () => {
    return get().followedTeams.length;
  },
}));
