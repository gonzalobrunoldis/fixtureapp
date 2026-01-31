import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

/**
 * Header - Page header with title, optional subtitle, and action buttons
 *
 * @example
 * <Header
 *   title="Champions League"
 *   subtitle="Group Stage"
 *   actions={<Button>Filter</Button>}
 * />
 */
export function Header({ title, subtitle, actions, className }: HeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex-1">
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {actions && <div className="ml-4 flex gap-2">{actions}</div>}
      </div>
    </header>
  );
}
