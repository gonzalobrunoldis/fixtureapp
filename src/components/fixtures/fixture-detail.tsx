'use client';

import { format } from 'date-fns';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  type FixtureDisplay,
  isLiveMatch,
  isFinishedMatch,
  isCancelledMatch,
} from '@/types/fixtures.types';
import { MatchEvents } from './match-events';

interface FixtureDetailProps {
  fixture: FixtureDisplay | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FixtureDetail({
  fixture,
  open,
  onOpenChange,
}: FixtureDetailProps) {
  if (!fixture) return null;

  const isLive = isLiveMatch(fixture);
  const isFinished = isFinishedMatch(fixture);
  const isCancelled = isCancelledMatch(fixture);

  const homeWinner =
    isFinished &&
    fixture.score.home !== null &&
    fixture.score.away !== null &&
    fixture.score.home > fixture.score.away;

  const awayWinner =
    isFinished &&
    fixture.score.home !== null &&
    fixture.score.away !== null &&
    fixture.score.away > fixture.score.home;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {fixture.homeTeam.name} vs {fixture.awayTeam.name}
          </DialogTitle>
        </DialogHeader>

        {/* League Header */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Avatar className="h-5 w-5">
            <AvatarImage src={fixture.league.logo} alt={fixture.league.name} />
            <AvatarFallback>{fixture.league.name[0]}</AvatarFallback>
          </Avatar>
          <span>{fixture.league.name}</span>
          {fixture.league.country && (
            <>
              <span>•</span>
              <span>{fixture.league.country}</span>
            </>
          )}
        </div>

        {/* Match Score Section */}
        <div className="flex items-center justify-between py-4">
          {/* Home Team */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={fixture.homeTeam.logo}
                alt={fixture.homeTeam.name}
              />
              <AvatarFallback className="text-lg">
                {fixture.homeTeam.name.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span
              className={cn(
                'text-sm font-medium text-center',
                homeWinner && 'text-primary'
              )}
            >
              {fixture.homeTeam.name}
            </span>
          </div>

          {/* Score / Time */}
          <div className="flex flex-col items-center gap-1 px-4">
            {fixture.score.home !== null && fixture.score.away !== null ? (
              <>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'text-3xl font-bold tabular-nums',
                      homeWinner && 'text-primary'
                    )}
                  >
                    {fixture.score.home}
                  </span>
                  <span className="text-xl text-muted-foreground">-</span>
                  <span
                    className={cn(
                      'text-3xl font-bold tabular-nums',
                      awayWinner && 'text-primary'
                    )}
                  >
                    {fixture.score.away}
                  </span>
                </div>
                {/* Halftime score */}
                {fixture.score.halftime &&
                  fixture.score.halftime.home !== null &&
                  fixture.score.halftime.away !== null && (
                    <span className="text-xs text-muted-foreground">
                      HT: {fixture.score.halftime.home} -{' '}
                      {fixture.score.halftime.away}
                    </span>
                  )}
              </>
            ) : (
              <span className="text-2xl font-semibold">
                {format(fixture.startTime, 'HH:mm')}
              </span>
            )}

            {/* Status Badge */}
            <Badge
              variant={
                isLive ? 'default' : isCancelled ? 'destructive' : 'secondary'
              }
              className={cn(
                isLive && 'animate-pulse bg-live text-live-foreground'
              )}
            >
              {isLive && fixture.elapsed
                ? `${fixture.elapsed}'`
                : fixture.statusLong}
            </Badge>
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={fixture.awayTeam.logo}
                alt={fixture.awayTeam.name}
              />
              <AvatarFallback className="text-lg">
                {fixture.awayTeam.name.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span
              className={cn(
                'text-sm font-medium text-center',
                awayWinner && 'text-primary'
              )}
            >
              {fixture.awayTeam.name}
            </span>
          </div>
        </div>

        <Separator />

        {/* Match Info */}
        <div className="space-y-3 py-2">
          <h4 className="text-sm font-semibold">Match Info</h4>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{format(fixture.startTime, 'EEEE, MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{format(fixture.startTime, 'HH:mm')} (Local time)</span>
            </div>
            {fixture.venue && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>
                  {fixture.venue.name}, {fixture.venue.city}
                </span>
              </div>
            )}
            {fixture.referee && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{fixture.referee}</span>
              </div>
            )}
          </div>
        </div>

        {/* Match Events */}
        {fixture.events && fixture.events.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3 py-2">
              <h4 className="text-sm font-semibold">Match Events</h4>
              <MatchEvents events={fixture.events} />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
