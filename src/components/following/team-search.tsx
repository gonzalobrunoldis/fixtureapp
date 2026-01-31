'use client';

import { useCallback, useState, useEffect } from 'react';
import { Search, Loader2, Heart } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { searchTeams } from '@/services/teams.service';
import type { TeamDisplay } from '@/types/teams.types';
import { useDebounce } from '@/hooks/use-debounce';

interface TeamSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTeamSelect: (team: TeamDisplay) => void;
  followedTeamIds: number[];
}

/**
 * TeamSearch - Dialog for searching and selecting teams to follow
 *
 * Features:
 * - Debounced search (300ms)
 * - Shows loading state
 * - Displays search results with team logos
 * - Indicates which teams are already followed
 */
export function TeamSearch({
  open,
  onOpenChange,
  onTeamSelect,
  followedTeamIds,
}: TeamSearchProps) {
  const [query, setQuery] = useState('');
  const [teams, setTeams] = useState<TeamDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Search teams when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.length < 3) {
        setTeams([]);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      const { data, error: searchError } = await searchTeams(debouncedQuery);

      if (searchError) {
        setError(searchError.message);
        setTeams([]);
      } else if (data) {
        setTeams(data);
      }

      setIsLoading(false);
    };

    performSearch();
  }, [debouncedQuery]);

  // Clear search when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery('');
      setTeams([]);
      setError(null);
    }
  }, [open]);

  const handleTeamClick = useCallback(
    (team: TeamDisplay) => {
      onTeamSelect(team);
      onOpenChange(false);
    },
    [onTeamSelect, onOpenChange]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-hidden sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Follow a team</DialogTitle>
          <DialogDescription>
            Search for a team to follow and see their matches and standings
          </DialogDescription>
        </DialogHeader>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search teams... (min 3 characters)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="py-12 text-center">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && query.length >= 3 && teams.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No teams found matching &ldquo;{query}&rdquo;
              </p>
            </div>
          )}

          {/* Prompt to search */}
          {!isLoading && !error && query.length < 3 && (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">
                Enter at least 3 characters to search
              </p>
            </div>
          )}

          {/* Results list */}
          {!isLoading && !error && teams.length > 0 && (
            <div className="space-y-1">
              {teams.map((team) => {
                const isFollowed = followedTeamIds.includes(team.id);

                return (
                  <button
                    key={team.id}
                    onClick={() => !isFollowed && handleTeamClick(team)}
                    disabled={isFollowed}
                    className="flex w-full items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={team.logo} alt={team.name} />
                      <AvatarFallback>{team.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{team.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {team.country}
                        {team.code && ` • ${team.code}`}
                      </p>
                    </div>
                    {isFollowed && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Heart className="h-4 w-4 fill-current" />
                        <span>Following</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
