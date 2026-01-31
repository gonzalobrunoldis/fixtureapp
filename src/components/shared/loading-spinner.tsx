import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export type LoadingSpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

interface LoadingSpinnerProps {
  size?: LoadingSpinnerSize;
  className?: string;
  label?: string;
}

const sizeClasses: Record<LoadingSpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

/**
 * LoadingSpinner - Animated loading spinner with size variants
 *
 * @example
 * <LoadingSpinner size="md" label="Loading fixtures..." />
 */
export function LoadingSpinner({
  size = 'md',
  className,
  label,
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2
        className={cn(
          'animate-spin text-primary',
          sizeClasses[size],
          className
        )}
        aria-label={label || 'Loading'}
      />
      {label && (
        <p className="text-sm text-muted-foreground" role="status">
          {label}
        </p>
      )}
    </div>
  );
}
