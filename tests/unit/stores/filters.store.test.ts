import { describe, it, expect, beforeEach } from 'vitest';
import {
  useFiltersStore,
  getSerializableFilters,
} from '@/stores/filters.store';

describe('Filters Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useFiltersStore.setState({
      hiddenLeagues: new Set(),
      hiddenCountries: new Set(),
    });
  });

  describe('toggleLeague', () => {
    it('adds league to hidden set when not present', () => {
      const { toggleLeague, hiddenLeagues } = useFiltersStore.getState();

      toggleLeague(39); // Premier League

      const state = useFiltersStore.getState();
      expect(state.hiddenLeagues.has(39)).toBe(true);
    });

    it('removes league from hidden set when already present', () => {
      useFiltersStore.setState({
        hiddenLeagues: new Set([39]),
      });

      const { toggleLeague } = useFiltersStore.getState();
      toggleLeague(39);

      const state = useFiltersStore.getState();
      expect(state.hiddenLeagues.has(39)).toBe(false);
    });

    it('handles multiple league toggles correctly', () => {
      const { toggleLeague } = useFiltersStore.getState();

      toggleLeague(39);
      toggleLeague(140);
      toggleLeague(39); // Toggle back

      const state = useFiltersStore.getState();
      expect(state.hiddenLeagues.has(39)).toBe(false);
      expect(state.hiddenLeagues.has(140)).toBe(true);
    });
  });

  describe('toggleCountry', () => {
    it('adds country to hidden set when not present', () => {
      const { toggleCountry } = useFiltersStore.getState();

      toggleCountry('England');

      const state = useFiltersStore.getState();
      expect(state.hiddenCountries.has('England')).toBe(true);
    });

    it('removes country from hidden set when already present', () => {
      useFiltersStore.setState({
        hiddenCountries: new Set(['England']),
      });

      const { toggleCountry } = useFiltersStore.getState();
      toggleCountry('England');

      const state = useFiltersStore.getState();
      expect(state.hiddenCountries.has('England')).toBe(false);
    });
  });

  describe('showAllLeagues', () => {
    it('clears all hidden leagues', () => {
      useFiltersStore.setState({
        hiddenLeagues: new Set([39, 140, 78]),
      });

      const { showAllLeagues } = useFiltersStore.getState();
      showAllLeagues();

      const state = useFiltersStore.getState();
      expect(state.hiddenLeagues.size).toBe(0);
    });
  });

  describe('hideAllLeagues', () => {
    it('hides all provided leagues', () => {
      const { hideAllLeagues } = useFiltersStore.getState();
      hideAllLeagues([39, 140, 78]);

      const state = useFiltersStore.getState();
      expect(state.hiddenLeagues.size).toBe(3);
      expect(state.hiddenLeagues.has(39)).toBe(true);
      expect(state.hiddenLeagues.has(140)).toBe(true);
      expect(state.hiddenLeagues.has(78)).toBe(true);
    });
  });

  describe('showAllCountries', () => {
    it('clears all hidden countries', () => {
      useFiltersStore.setState({
        hiddenCountries: new Set(['England', 'Spain', 'Germany']),
      });

      const { showAllCountries } = useFiltersStore.getState();
      showAllCountries();

      const state = useFiltersStore.getState();
      expect(state.hiddenCountries.size).toBe(0);
    });
  });

  describe('hideAllCountries', () => {
    it('hides all provided countries', () => {
      const { hideAllCountries } = useFiltersStore.getState();
      useFiltersStore.setState({
        hiddenCountries: new Set(['England', 'Spain', 'Germany']),
      });

      const state = useFiltersStore.getState();
      expect(state.hiddenCountries.size).toBe(3);
    });
  });

  describe('setFilters', () => {
    it('sets both hidden leagues and countries', () => {
      const { setFilters } = useFiltersStore.getState();
      setFilters({
        hiddenLeagues: [39, 140],
        hiddenCountries: ['England', 'Spain'],
      });

      const state = useFiltersStore.getState();
      expect(state.hiddenLeagues.size).toBe(2);
      expect(state.hiddenCountries.size).toBe(2);
    });

    it('handles partial updates', () => {
      const { setFilters } = useFiltersStore.getState();
      setFilters({
        hiddenLeagues: [39],
      });

      const state = useFiltersStore.getState();
      expect(state.hiddenLeagues.size).toBe(1);
      expect(state.hiddenCountries.size).toBe(0);
    });
  });

  describe('clearFilters', () => {
    it('clears all filters', () => {
      useFiltersStore.setState({
        hiddenLeagues: new Set([39, 140]),
        hiddenCountries: new Set(['England', 'Spain']),
      });

      const { clearFilters } = useFiltersStore.getState();
      clearFilters();

      const state = useFiltersStore.getState();
      expect(state.hiddenLeagues.size).toBe(0);
      expect(state.hiddenCountries.size).toBe(0);
    });
  });

  describe('isLeagueVisible', () => {
    it('returns true for non-hidden leagues', () => {
      const { isLeagueVisible } = useFiltersStore.getState();
      expect(isLeagueVisible(39)).toBe(true);
    });

    it('returns false for hidden leagues', () => {
      useFiltersStore.setState({
        hiddenLeagues: new Set([39]),
      });

      const { isLeagueVisible } = useFiltersStore.getState();
      expect(isLeagueVisible(39)).toBe(false);
    });
  });

  describe('isCountryVisible', () => {
    it('returns true for non-hidden countries', () => {
      const { isCountryVisible } = useFiltersStore.getState();
      expect(isCountryVisible('England')).toBe(true);
    });

    it('returns false for hidden countries', () => {
      useFiltersStore.setState({
        hiddenCountries: new Set(['England']),
      });

      const { isCountryVisible } = useFiltersStore.getState();
      expect(isCountryVisible('England')).toBe(false);
    });
  });

  describe('hasActiveFilters', () => {
    it('returns false when no filters are active', () => {
      const { hasActiveFilters } = useFiltersStore.getState();
      expect(hasActiveFilters()).toBe(false);
    });

    it('returns true when leagues are hidden', () => {
      useFiltersStore.setState({
        hiddenLeagues: new Set([39]),
      });

      const { hasActiveFilters } = useFiltersStore.getState();
      expect(hasActiveFilters()).toBe(true);
    });

    it('returns true when countries are hidden', () => {
      useFiltersStore.setState({
        hiddenCountries: new Set(['England']),
      });

      const { hasActiveFilters } = useFiltersStore.getState();
      expect(hasActiveFilters()).toBe(true);
    });
  });

  describe('getSerializableFilters', () => {
    it('converts Sets to arrays for serialization', () => {
      useFiltersStore.setState({
        hiddenLeagues: new Set([39, 140]),
        hiddenCountries: new Set(['England', 'Spain']),
      });

      const state = useFiltersStore.getState();
      const serializable = getSerializableFilters(state);

      expect(Array.isArray(serializable.hiddenLeagues)).toBe(true);
      expect(Array.isArray(serializable.hiddenCountries)).toBe(true);
      expect(serializable.hiddenLeagues).toContain(39);
      expect(serializable.hiddenLeagues).toContain(140);
      expect(serializable.hiddenCountries).toContain('England');
      expect(serializable.hiddenCountries).toContain('Spain');
    });
  });
});
