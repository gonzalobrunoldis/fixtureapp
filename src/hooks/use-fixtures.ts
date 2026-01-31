/**
 * useFixtures Hook
 *
 * React Query hook for fetching fixtures by date.
 * Handles auto-refresh for live matches and caching.
 */

import { useQuery } from '@tanstack/react-query';
import { formatDateForApi } from '@/lib/utils/date';
import { getFixturesByDate } from '@/services/fixtures.service';
import { isLiveMatch, type FixtureDisplay } from '@/types/fixtures.types';

interface UseFixturesOptions {
  enabled?: boolean;
}

export function useFixtures(date: Date, options?: UseFixturesOptions) {
  const dateString = formatDateForApi(date);

  return useQuery({
    queryKey: ['fixtures', dateString],
    queryFn: async () => {
      const result = await getFixturesByDate(dateString);

      if (result.error) {
        throw result.error;
      }

      return result.data || [];
    },
    staleTime: 60 * 1000, // Consider data stale after 1 minute
    refetchInterval: (query) => {
      // Auto-refresh if any match is live
      const fixtures = query.state.data as FixtureDisplay[] | undefined;
      const hasLiveMatches = fixtures?.some((f) => isLiveMatch(f));
      return hasLiveMatches ? 15000 : false; // 15 seconds for live matches
    },
    refetchOnWindowFocus: true, // Refresh when user returns to tab
    enabled: options?.enabled ?? true,
  });
}
