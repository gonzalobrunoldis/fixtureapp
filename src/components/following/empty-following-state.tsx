import { Heart } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';

interface EmptyFollowingStateProps {
  onAddTeamClick: () => void;
}

/**
 * EmptyFollowingState - Display when user has no followed teams
 */
export function EmptyFollowingState({
  onAddTeamClick,
}: EmptyFollowingStateProps) {
  return (
    <EmptyState
      icon={Heart}
      title="No teams followed yet"
      description="Start following teams to see their matches, competitions, and standings in one place"
      action={{
        label: 'Find teams to follow',
        onClick: onAddTeamClick,
      }}
    />
  );
}
