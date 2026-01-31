'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Trophy, Users, Heart, Settings } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    href: '/home',
    label: 'Home',
    icon: Home,
  },
  {
    href: '/competitions',
    label: 'Competitions',
    icon: Trophy,
  },
  {
    href: '/groups',
    label: 'Groups',
    icon: Users,
  },
  {
    href: '/following',
    label: 'Following',
    icon: Heart,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
  },
];

/**
 * BottomNav - Mobile bottom navigation with 5 main tabs
 *
 * Navigation items:
 * - Home: Today's fixtures and upcoming matches
 * - Competitions: League standings and schedules
 * - Groups: User prediction groups and leaderboards
 * - Following: Favorite teams and followed competitions
 * - Settings: User preferences and account settings
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href as any}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-3 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
