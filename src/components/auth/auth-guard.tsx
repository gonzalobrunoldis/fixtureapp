'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

/**
 * AuthGuard component - protects routes from unauthorized access
 *
 * @param children - The content to render when authorized
 * @param requireAuth - If true, requires user to be authenticated (default: true)
 * @param redirectTo - Where to redirect if auth requirement not met (default: /login or /home)
 * @param fallback - Optional loading state while checking auth
 *
 * @example
 * // Protect a route - require login
 * <AuthGuard>
 *   <ProtectedContent />
 * </AuthGuard>
 *
 * @example
 * // Redirect authenticated users (e.g., auth pages)
 * <AuthGuard requireAuth={false} redirectTo="/home">
 *   <LoginForm />
 * </AuthGuard>
 */
export function AuthGuard({
  children,
  requireAuth = true,
  redirectTo,
  fallback = (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  ),
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (requireAuth && !user) {
      // User is not authenticated but auth is required
      const destination =
        redirectTo || `/login?redirectTo=${window.location.pathname}`;
      router.push(destination as any);
    } else if (!requireAuth && user) {
      // User is authenticated but shouldn't be (e.g., on login page)
      const destination = redirectTo || '/home';
      router.push(destination as any);
    }
  }, [user, loading, requireAuth, redirectTo, router]);

  // Show loading state while checking auth
  if (loading) {
    return <>{fallback}</>;
  }

  // Show content if auth requirements are met
  if ((requireAuth && user) || (!requireAuth && !user)) {
    return <>{children}</>;
  }

  // Show fallback while redirecting
  return <>{fallback}</>;
}

/**
 * RequireAuth - Shorthand for AuthGuard with requireAuth=true
 *
 * @example
 * <RequireAuth>
 *   <ProtectedPage />
 * </RequireAuth>
 */
export function RequireAuth({
  children,
  ...props
}: Omit<AuthGuardProps, 'requireAuth'>) {
  return (
    <AuthGuard requireAuth={true} {...props}>
      {children}
    </AuthGuard>
  );
}

/**
 * RequireGuest - Shorthand for AuthGuard with requireAuth=false
 * Redirects authenticated users away from guest-only pages (login, signup)
 *
 * @example
 * <RequireGuest>
 *   <LoginPage />
 * </RequireGuest>
 */
export function RequireGuest({
  children,
  ...props
}: Omit<AuthGuardProps, 'requireAuth'>) {
  return (
    <AuthGuard requireAuth={false} {...props}>
      {children}
    </AuthGuard>
  );
}
