import { ReactNode } from 'react';
import { BottomNav } from '@/components/layout';
import { AuthGuard } from '@/components/auth/auth-guard';

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * Main Layout - Layout for authenticated app pages
 *
 * Features:
 * - Authentication guard (redirects to login if not authenticated)
 * - Bottom navigation for mobile
 * - Proper spacing for bottom nav
 *
 * All routes under (main) require authentication
 */
export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <AuthGuard>
      <div className="relative min-h-screen">
        {children}
        <BottomNav />
      </div>
    </AuthGuard>
  );
}
