import { Circle, Replace, Sparkles, Square } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { type MatchEvent } from '@/types/fixtures.types';

interface MatchEventsProps {
  events: MatchEvent[];
  className?: string;
}

export function MatchEvents({ events, className }: MatchEventsProps) {
  if (!events || events.length === 0) {
    return null;
  }

  // Sort events by time
  const sortedEvents = [...events].sort((a, b) => a.time - b.time);

  return (
    <div className={cn('space-y-2', className)}>
      {sortedEvents.map((event, index) => (
        <MatchEventItem key={index} event={event} />
      ))}
    </div>
  );
}

interface MatchEventItemProps {
  event: MatchEvent;
}

function MatchEventItem({ event }: MatchEventItemProps) {
  const { type, time, team, player, detail, assist } = event;

  const getEventIcon = () => {
    switch (type) {
      case 'goal':
        return <Circle className="h-4 w-4 fill-primary text-primary" />;
      case 'card':
        return detail === 'red' ? (
          <Square className="h-4 w-4 fill-destructive text-destructive" />
        ) : (
          <Square className="h-4 w-4 fill-yellow-500 text-yellow-500" />
        );
      case 'substitution':
        return <Replace className="h-4 w-4 text-muted-foreground" />;
      case 'var':
        return <Sparkles className="h-4 w-4 text-primary" />;
      default:
        return null;
    }
  };

  const getEventText = () => {
    switch (type) {
      case 'goal':
        if (detail === 'penalty') {
          return `⚽ ${player} (Penalty)${assist ? ` - Assist: ${assist}` : ''}`;
        }
        if (detail === 'own goal') {
          return `⚽ ${player} (Own Goal)`;
        }
        return `⚽ ${player}${assist ? ` - Assist: ${assist}` : ''}`;
      case 'card':
        return `${detail === 'red' ? '🟥' : '🟨'} ${player}`;
      case 'substitution':
        return `🔄 ${player}`;
      case 'var':
        return `📺 VAR - ${detail || 'Check'}`;
      default:
        return player;
    }
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 text-sm',
        team === 'home' ? 'flex-row' : 'flex-row-reverse'
      )}
    >
      <Badge variant="outline" className="shrink-0 font-mono">
        {time}&apos;
      </Badge>
      <div className="flex items-center gap-2">
        {getEventIcon()}
        <span
          className={cn(
            'text-sm',
            team === 'home' ? 'text-left' : 'text-right'
          )}
        >
          {getEventText()}
        </span>
      </div>
    </div>
  );
}
