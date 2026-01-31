'use client';

import { AlertCircle, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EmptyState, LoadingSpinner } from '@/components/shared';
import { groupFixturesByLeague } from '@/services/fixtures.service';
import { type FixtureDisplay } from '@/types/fixtures.types';
import { FixtureCard } from './fixture-card';

interface FixtureListProps {
  fixtures: FixtureDisplay[];
  onFixtureClick?: (fixture: FixtureDisplay) => void;
  isLoading?: boolean;
  error?: Error | null;
  emptyMessage?: string;
}

export function FixtureList({
  fixtures,
  onFixtureClick,
  isLoading = false,
  error = null,
  emptyMessage = 'No fixtures scheduled for this date',
}: FixtureListProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" label="Loading fixtures..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to load fixtures"
        description={
          error.message || 'An error occurred while loading fixtures'
        }
        action={{
          label: 'Try Again',
          onClick: () => window.location.reload(),
        }}
      />
    );
  }

  // Empty state
  if (!fixtures || fixtures.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="No fixtures"
        description={emptyMessage}
      />
    );
  }

  // Group fixtures by league
  const groupedFixtures = groupFixturesByLeague(fixtures);

  return (
    <div className="space-y-6">
      {Array.from(groupedFixtures.entries()).map(
        ([leagueId, leagueFixtures]) => {
          // Get league info from first fixture in group
          const league = leagueFixtures[0]?.league;

          if (!league) return null;

          return (
            <div key={leagueId} className="space-y-3">
              {/* League Header */}
              <div className="flex items-center gap-2 px-1">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={league.logo} alt={league.name} />
                  <AvatarFallback>{league.name[0]}</AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-sm">{league.name}</h3>
                <span className="text-xs text-muted-foreground">
                  ({leagueFixtures.length})
                </span>
              </div>

              {/* Fixtures in this league */}
              <div className="space-y-2">
                {leagueFixtures.map((fixture) => (
                  <FixtureCard
                    key={fixture.id}
                    fixture={fixture}
                    onClick={() => onFixtureClick?.(fixture)}
                  />
                ))}
              </div>
            </div>
          );
        }
      )}
    </div>
  );
}
