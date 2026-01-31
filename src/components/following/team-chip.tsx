'use client';

import { X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { FollowedTeamDisplay } from '@/types/teams.types';

interface TeamChipProps {
  team: FollowedTeamDisplay;
  isSelected: boolean;
  onSelect: () => void;
  onRemove?: () => void;
}

/**
 * TeamChip - A selectable chip displaying a team logo and name
 *
 * Used in the horizontal scrollable bar of followed teams.
 */
export function TeamChip({
  team,
  isSelected,
  onSelect,
  onRemove,
}: TeamChipProps) {
  return (
    <div className="group relative flex-shrink-0">
      {/* Remove button (visible on hover) */}
      {onRemove && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute -right-2 -top-2 z-10 h-5 w-5 rounded-full opacity-0 shadow-md transition-opacity group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      )}

      {/* Chip content */}
      <button
        onClick={onSelect}
        className={cn(
          'flex flex-col items-center gap-2 rounded-lg border-2 bg-card p-3 transition-all hover:bg-accent',
          isSelected
            ? 'border-primary shadow-md'
            : 'border-transparent hover:border-muted'
        )}
      >
        <Avatar className="h-10 w-10">
          <AvatarImage src={team.teamLogo || ''} alt={team.teamName} />
          <AvatarFallback>{team.teamName[0]}</AvatarFallback>
        </Avatar>
        <span className="max-w-[80px] truncate text-xs font-medium">
          {team.teamName}
        </span>
      </button>
    </div>
  );
}
