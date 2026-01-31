import { create } from 'zustand';

/**
 * Filter State for Fixtures
 *
 * Manages visibility filters for sports, competitions, and countries.
 * Filters hide fixtures from view but don't remove options from the filter UI.
 */

export interface FiltersState {
  // Hidden items (fixtures with these will be hidden)
  hiddenLeagues: Set<number>;
  hiddenCountries: Set<string>;

  // Actions
  toggleLeague: (leagueId: number) => void;
  toggleCountry: (country: string) => void;
  showAllLeagues: () => void;
  hideAllLeagues: (leagueIds: number[]) => void;
  showAllCountries: () => void;
  hideAllCountries: (countries: string[]) => void;
  setFilters: (filters: {
    hiddenLeagues?: number[];
    hiddenCountries?: string[];
  }) => void;
  clearFilters: () => void;

  // Selectors
  isLeagueVisible: (leagueId: number) => boolean;
  isCountryVisible: (country: string) => boolean;
  hasActiveFilters: () => boolean;
}

export const useFiltersStore = create<FiltersState>((set, get) => ({
  hiddenLeagues: new Set(),
  hiddenCountries: new Set(),

  toggleLeague: (leagueId: number) => {
    set((state) => {
      const newHiddenLeagues = new Set(state.hiddenLeagues);
      if (newHiddenLeagues.has(leagueId)) {
        newHiddenLeagues.delete(leagueId);
      } else {
        newHiddenLeagues.add(leagueId);
      }
      return { hiddenLeagues: newHiddenLeagues };
    });
  },

  toggleCountry: (country: string) => {
    set((state) => {
      const newHiddenCountries = new Set(state.hiddenCountries);
      if (newHiddenCountries.has(country)) {
        newHiddenCountries.delete(country);
      } else {
        newHiddenCountries.add(country);
      }
      return { hiddenCountries: newHiddenCountries };
    });
  },

  showAllLeagues: () => {
    set({ hiddenLeagues: new Set() });
  },

  hideAllLeagues: (leagueIds: number[]) => {
    set({ hiddenLeagues: new Set(leagueIds) });
  },

  showAllCountries: () => {
    set({ hiddenCountries: new Set() });
  },

  hideAllCountries: (countries: string[]) => {
    set({ hiddenCountries: new Set(countries) });
  },

  setFilters: (filters) => {
    set({
      hiddenLeagues: new Set(filters.hiddenLeagues || []),
      hiddenCountries: new Set(filters.hiddenCountries || []),
    });
  },

  clearFilters: () => {
    set({
      hiddenLeagues: new Set(),
      hiddenCountries: new Set(),
    });
  },

  isLeagueVisible: (leagueId: number) => {
    return !get().hiddenLeagues.has(leagueId);
  },

  isCountryVisible: (country: string) => {
    return !get().hiddenCountries.has(country);
  },

  hasActiveFilters: () => {
    const state = get();
    return state.hiddenLeagues.size > 0 || state.hiddenCountries.size > 0;
  },
}));

/**
 * Helper to get serializable filter state for persistence
 */
export function getSerializableFilters(state: FiltersState) {
  return {
    hiddenLeagues: Array.from(state.hiddenLeagues),
    hiddenCountries: Array.from(state.hiddenCountries),
  };
}
