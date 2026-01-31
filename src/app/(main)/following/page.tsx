'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Header } from '@/components/layout/header';
import { EmptyFollowingState } from '@/components/following/empty-following-state';
import { FollowedTeamsBar } from '@/components/following/followed-teams-bar';
import { TeamSearch } from '@/components/following/team-search';
import { useFollowedTeams } from '@/hooks/use-followed-teams';
import type { TeamDisplay } from '@/types/teams.types';

export default function FollowingPage() {
  const {
    followedTeams,
    selectedTeamId,
    selectTeam,
    followTeam,
    unfollowTeam,
    isAuthenticated,
  } = useFollowedTeams();

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleTeamSelect = async (team: TeamDisplay) => {
    const { error } = await followTeam({
      teamId: team.id,
      teamName: team.name,
      teamLogo: team.logo,
      sport: 'football', // TODO: Support multiple sports
    });

    if (error) {
      console.error('Failed to follow team:', error);
    }
  };

  const handleTeamRemove = async (teamId: number) => {
    const { error } = await unfollowTeam(teamId);

    if (error) {
      console.error('Failed to unfollow team:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <PageContainer>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Authentication Required</h2>
            <p className="mt-2 text-muted-foreground">
              Please log in to follow teams
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header
        title="Following"
        subtitle="Track your favorite teams and their matches"
      />

      {followedTeams.length === 0 ? (
        <EmptyFollowingState onAddTeamClick={() => setIsSearchOpen(true)} />
      ) : (
        <div className="space-y-6">
          <FollowedTeamsBar
            teams={followedTeams}
            selectedTeamId={selectedTeamId}
            onTeamSelect={selectTeam}
            onTeamRemove={handleTeamRemove}
            onAddTeamClick={() => setIsSearchOpen(true)}
          />

          {/* Team Context View - Placeholder for now */}
          {selectedTeamId && (
            <div className="rounded-lg border bg-card p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold">Team Details</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Team competitions, standings, and matches will appear here
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  (FIX-70, FIX-71: Coming in next iteration)
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <TeamSearch
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        onTeamSelect={handleTeamSelect}
        followedTeamIds={followedTeams.map((t) => t.teamId)}
      />
    </PageContainer>
  );
}
