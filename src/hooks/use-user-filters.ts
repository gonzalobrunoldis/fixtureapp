'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from './use-auth';
import {
  loadUserFilters,
  saveUserFilters,
  type FiltersData,
} from '@/services/user-filters.service';
import {
  useFiltersStore,
  getSerializableFilters,
} from '@/stores/filters.store';

const DEBOUNCE_MS = 1000;

/**
 * Hook to manage user filter persistence
 *
 * - Loads filters from DB on mount for authenticated users
 * - Saves filters to DB (debounced) when they change
 * - Unauthenticated users have filters in memory only
 */
export function useUserFilters() {
  const { user, loading: authLoading } = useAuth();
  const { setFilters, hiddenLeagues, hiddenCountries } = useFiltersStore();

  const isInitializedRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>('');

  // Load filters from DB on mount (for authenticated users)
  useEffect(() => {
    if (authLoading) return;

    const loadFilters = async () => {
      if (user && !isInitializedRef.current) {
        try {
          const filters = await loadUserFilters(user.id);
          setFilters(filters);
          lastSavedRef.current = JSON.stringify(filters);
          isInitializedRef.current = true;
        } catch (error) {
          console.error('Failed to load user filters:', error);
          isInitializedRef.current = true;
        }
      } else if (!user) {
        // Clear initialization flag when user logs out
        isInitializedRef.current = false;
        lastSavedRef.current = '';
      }
    };

    loadFilters();
  }, [user, authLoading, setFilters]);

  // Save filters to DB when they change (debounced, for authenticated users)
  useEffect(() => {
    if (authLoading || !user || !isInitializedRef.current) return;

    const currentFilters: FiltersData = {
      hiddenLeagues: Array.from(hiddenLeagues),
      hiddenCountries: Array.from(hiddenCountries),
    };

    const currentFiltersJson = JSON.stringify(currentFilters);

    // Skip if filters haven't actually changed
    if (currentFiltersJson === lastSavedRef.current) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce the save
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const { error } = await saveUserFilters(user.id, currentFilters);
        if (!error) {
          lastSavedRef.current = currentFiltersJson;
        }
      } catch (error) {
        console.error('Failed to save user filters:', error);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [user, authLoading, hiddenLeagues, hiddenCountries]);

  // Force save function (for immediate saves, e.g., before navigation)
  const forceSave = useCallback(async () => {
    if (!user) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    const currentFilters = getSerializableFilters(useFiltersStore.getState());
    const currentFiltersJson = JSON.stringify(currentFilters);

    if (currentFiltersJson !== lastSavedRef.current) {
      try {
        const { error } = await saveUserFilters(user.id, currentFilters);
        if (!error) {
          lastSavedRef.current = currentFiltersJson;
        }
      } catch (error) {
        console.error('Failed to force save user filters:', error);
      }
    }
  }, [user]);

  return {
    isAuthenticated: !!user,
    isLoading: authLoading,
    forceSave,
  };
}
