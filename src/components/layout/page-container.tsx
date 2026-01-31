import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

/**
 * PageContainer - Main content container with proper spacing and scroll handling
 *
 * Provides:
 * - Consistent padding across pages
 * - Bottom spacing for bottom navigation
 * - Scroll handling for mobile
 * - Optional no-padding mode for full-width content
 *
 * @example
 * <PageContainer>
 *   <div>Your page content</div>
 * </PageContainer>
 */
export function PageContainer({
  children,
  className,
  noPadding = false,
}: PageContainerProps) {
  return (
    <main
      className={cn('min-h-screen pb-20', !noPadding && 'px-4 py-6', className)}
    >
      {children}
    </main>
  );
}
