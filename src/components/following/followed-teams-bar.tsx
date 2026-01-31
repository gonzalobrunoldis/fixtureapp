'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TeamChip } from './team-chip';
import type { FollowedTeamDisplay } from '@/types/teams.types';

interface FollowedTeamsBarProps {
  teams: FollowedTeamDisplay[];
  selectedTeamId: number | null;
  onTeamSelect: (teamId: number) => void;
  onTeamRemove: (teamId: number) => void;
  onAddTeamClick: () => void;
}

/**
 * FollowedTeamsBar - Horizontal scrollable bar showing all followed teams
 *
 * Displays team chips in a horizontal scroll container with an "Add team" button.
 */
export function FollowedTeamsBar({
  teams,
  selectedTeamId,
  onTeamSelect,
  onTeamRemove,
  onAddTeamClick,
}: FollowedTeamsBarProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {/* Team chips */}
      {teams.map((team) => (
        <TeamChip
          key={team.id}
          team={team}
          isSelected={team.teamId === selectedTeamId}
          onSelect={() => onTeamSelect(team.teamId)}
          onRemove={() => onTeamRemove(team.teamId)}
        />
      ))}

      {/* Add team button */}
      <button
        onClick={onAddTeamClick}
        className="flex flex-shrink-0 flex-col items-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-card p-3 transition-colors hover:border-muted-foreground/50 hover:bg-accent"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Plus className="h-5 w-5 text-muted-foreground" />
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          Add team
        </span>
      </button>
    </div>
  );
}
