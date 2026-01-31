import { cn } from '@/lib/utils';
import { Trophy, CircleDot, Medal } from 'lucide-react';

export type SportType = 'football' | 'trophy' | 'medal';
export type SportIconSize = 'sm' | 'md' | 'lg';

interface SportIconProps {
  type?: SportType;
  size?: SportIconSize;
  className?: string;
}

const sizeClasses: Record<SportIconSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

/**
 * SportIcon - Display icons for different sports and achievements
 *
 * @example
 * <SportIcon type="football" size="md" />
 * <SportIcon type="trophy" size="lg" className="text-primary" />
 */
export function SportIcon({
  type = 'football',
  size = 'md',
  className,
}: SportIconProps) {
  const Icon = {
    football: CircleDot,
    trophy: Trophy,
    medal: Medal,
  }[type];

  return (
    <Icon
      className={cn(sizeClasses[size], className)}
      aria-label={`${type} icon`}
    />
  );
}
