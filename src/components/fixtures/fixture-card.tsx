'use client';

import { Clock } from 'lucide-react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatTimeForDisplay } from '@/lib/utils/date';
import {
  isCancelledMatch,
  isFinishedMatch,
  isLiveMatch,
  isUpcomingMatch,
  type FixtureDisplay,
} from '@/types/fixtures.types';

interface FixtureCardProps {
  fixture: FixtureDisplay;
  onClick?: () => void;
  compact?: boolean;
  className?: string;
}

export function FixtureCard({
  fixture,
  onClick,
  compact = false,
  className,
}: FixtureCardProps) {
  const isLive = isLiveMatch(fixture);
  const isUpcoming = isUpcomingMatch(fixture);
  const isFinished = isFinishedMatch(fixture);
  const isCancelled = isCancelledMatch(fixture);

  const getStatusBadgeVariant = () => {
    if (isLive) return 'default';
    if (isCancelled) return 'destructive';
    return 'secondary';
  };

  const getStatusText = () => {
    if (isLive && fixture.elapsed) {
      return `${fixture.elapsed}'`;
    }
    if (fixture.status === 'HT') {
      return 'Half Time';
    }
    if (fixture.status === 'FT') {
      return 'Full Time';
    }
    if (fixture.status === 'AET') {
      return 'AET';
    }
    if (fixture.status === 'PEN') {
      return 'Penalties';
    }
    if (fixture.status === 'PST') {
      return 'Postponed';
    }
    if (fixture.status === 'CANC') {
      return 'Cancelled';
    }
    if (fixture.status === 'TBD') {
      return 'TBD';
    }
    return fixture.statusLong;
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-colors hover:bg-accent/50',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* League Info */}
          {!compact && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Avatar className="h-4 w-4">
                <AvatarImage
                  src={fixture.league.logo}
                  alt={fixture.league.name}
                />
                <AvatarFallback>{fixture.league.name[0]}</AvatarFallback>
              </Avatar>
              <span>{fixture.league.name}</span>
            </div>
          )}

          {/* Match Info */}
          <div className="flex items-center justify-between gap-4">
            {/* Home Team */}
            <div className="flex flex-1 items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={fixture.homeTeam.logo}
                  alt={fixture.homeTeam.name}
                />
                <AvatarFallback>
                  {fixture.homeTeam.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span
                className={cn(
                  'font-medium',
                  fixture.homeTeam.isWinner && isFinished && 'text-primary'
                )}
              >
                {fixture.homeTeam.name}
              </span>
            </div>

            {/* Score or Time */}
            <div className="flex shrink-0 flex-col items-center gap-1">
              {isUpcoming ? (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{formatTimeForDisplay(fixture.startTime)}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-2xl font-bold">
                  <span
                    className={cn(
                      fixture.homeTeam.isWinner && isFinished && 'text-primary'
                    )}
                  >
                    {fixture.score.home ?? '-'}
                  </span>
                  <span className="text-muted-foreground">:</span>
                  <span
                    className={cn(
                      fixture.awayTeam.isWinner && isFinished && 'text-primary'
                    )}
                  >
                    {fixture.score.away ?? '-'}
                  </span>
                </div>
              )}

              {/* Status Badge */}
              <Badge variant={getStatusBadgeVariant()} className="text-xs">
                {isLive && (
                  <span className="mr-1 inline-block h-2 w-2 animate-pulse rounded-full bg-current" />
                )}
                {getStatusText()}
              </Badge>
            </div>

            {/* Away Team */}
            <div className="flex flex-1 items-center justify-end gap-3">
              <span
                className={cn(
                  'font-medium text-right',
                  fixture.awayTeam.isWinner && isFinished && 'text-primary'
                )}
              >
                {fixture.awayTeam.name}
              </span>
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={fixture.awayTeam.logo}
                  alt={fixture.awayTeam.name}
                />
                <AvatarFallback>
                  {fixture.awayTeam.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Halftime Score (for finished matches) */}
          {isFinished &&
            fixture.score.halftime &&
            (fixture.score.halftime.home !== null ||
              fixture.score.halftime.away !== null) && (
              <div className="text-center text-xs text-muted-foreground">
                HT: {fixture.score.halftime.home} -{' '}
                {fixture.score.halftime.away}
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
