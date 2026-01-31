import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FixtureFilters } from '@/components/fixtures/fixture-filters';
import { useFiltersStore } from '@/stores/filters.store';
import { mockAllFixtures } from '../../../__fixtures__/fixtures';

describe('FixtureFilters', () => {
  beforeEach(() => {
    // Reset store state before each test
    useFiltersStore.setState({
      hiddenLeagues: new Set(),
      hiddenCountries: new Set(),
    });
  });

  describe('Filter Button', () => {
    it('renders the filter button', () => {
      render(<FixtureFilters fixtures={mockAllFixtures} />);

      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    it('shows active filter count badge when filters are applied', () => {
      useFiltersStore.setState({
        hiddenLeagues: new Set([39, 140]),
      });

      render(<FixtureFilters fixtures={mockAllFixtures} />);

      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('does not show badge when no filters are applied', () => {
      render(<FixtureFilters fixtures={mockAllFixtures} />);

      // Should only have "Filters" text, no count
      const filterButton = screen.getByRole('button', { name: /Filters/i });
      expect(filterButton.textContent).toBe('Filters');
    });
  });

  describe('Filter Sheet', () => {
    it('opens sheet when filter button is clicked', async () => {
      const user = userEvent.setup();

      render(<FixtureFilters fixtures={mockAllFixtures} />);

      await user.click(screen.getByText('Filters'));

      // Sheet should open with title
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('shows competitions section', async () => {
      const user = userEvent.setup();

      render(<FixtureFilters fixtures={mockAllFixtures} />);

      await user.click(screen.getByText('Filters'));

      expect(screen.getByText('Competitions')).toBeInTheDocument();
    });

    it('shows countries section', async () => {
      const user = userEvent.setup();

      render(<FixtureFilters fixtures={mockAllFixtures} />);

      await user.click(screen.getByText('Filters'));

      expect(screen.getByText('Countries')).toBeInTheDocument();
    });

    it('lists all unique leagues from fixtures', async () => {
      const user = userEvent.setup();

      render(<FixtureFilters fixtures={mockAllFixtures} />);

      await user.click(screen.getByText('Filters'));

      // Should show all leagues from mockAllFixtures
      expect(screen.getByText('Premier League')).toBeInTheDocument();
      expect(screen.getByText('La Liga')).toBeInTheDocument();
      expect(screen.getByText('Bundesliga')).toBeInTheDocument();
    });

    it('lists all unique countries from fixtures', async () => {
      const user = userEvent.setup();

      render(<FixtureFilters fixtures={mockAllFixtures} />);

      await user.click(screen.getByText('Filters'));

      // Should show countries
      expect(screen.getByText('England')).toBeInTheDocument();
      expect(screen.getByText('Spain')).toBeInTheDocument();
      expect(screen.getByText('Germany')).toBeInTheDocument();
    });
  });

  describe('Toggle Behavior', () => {
    it('toggles league visibility when checkbox is clicked', async () => {
      const user = userEvent.setup();

      render(<FixtureFilters fixtures={mockAllFixtures} />);

      await user.click(screen.getByText('Filters'));

      // Find Premier League checkbox (it's inside a label)
      const premierLeagueLabel = screen
        .getByText('Premier League')
        .closest('label');
      if (premierLeagueLabel) {
        const checkbox = premierLeagueLabel.querySelector('[role="checkbox"]');
        if (checkbox) {
          await user.click(checkbox);

          const state = useFiltersStore.getState();
          expect(state.hiddenLeagues.has(39)).toBe(true); // Premier League ID
        }
      }
    });

    it('toggles country visibility when checkbox is clicked', async () => {
      const user = userEvent.setup();

      render(<FixtureFilters fixtures={mockAllFixtures} />);

      await user.click(screen.getByText('Filters'));

      // Find England checkbox
      const englandLabel = screen.getByText('England').closest('label');
      if (englandLabel) {
        const checkbox = englandLabel.querySelector('[role="checkbox"]');
        if (checkbox) {
          await user.click(checkbox);

          const state = useFiltersStore.getState();
          expect(state.hiddenCountries.has('England')).toBe(true);
        }
      }
    });
  });

  describe('Clear Filters', () => {
    it('shows Clear all button when filters are active', async () => {
      const user = userEvent.setup();

      useFiltersStore.setState({
        hiddenLeagues: new Set([39]),
      });

      render(<FixtureFilters fixtures={mockAllFixtures} />);

      await user.click(screen.getByText('Filters'));

      expect(screen.getByText('Clear all')).toBeInTheDocument();
    });

    it('clears all filters when Clear all is clicked', async () => {
      const user = userEvent.setup();

      useFiltersStore.setState({
        hiddenLeagues: new Set([39, 140]),
        hiddenCountries: new Set(['England']),
      });

      render(<FixtureFilters fixtures={mockAllFixtures} />);

      await user.click(screen.getByText('Filters'));
      await user.click(screen.getByText('Clear all'));

      const state = useFiltersStore.getState();
      expect(state.hiddenLeagues.size).toBe(0);
      expect(state.hiddenCountries.size).toBe(0);
    });
  });

  describe('Select All / None', () => {
    it('shows All button for competitions', async () => {
      const user = userEvent.setup();

      render(<FixtureFilters fixtures={mockAllFixtures} />);

      await user.click(screen.getByText('Filters'));

      const allButtons = screen.getAllByText('All');
      expect(allButtons.length).toBeGreaterThan(0);
    });

    it('shows None button for competitions', async () => {
      const user = userEvent.setup();

      render(<FixtureFilters fixtures={mockAllFixtures} />);

      await user.click(screen.getByText('Filters'));

      const noneButtons = screen.getAllByText('None');
      expect(noneButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Empty Fixtures', () => {
    it('shows message when no fixtures are provided', async () => {
      const user = userEvent.setup();

      render(<FixtureFilters fixtures={[]} />);

      await user.click(screen.getByText('Filters'));

      expect(
        screen.getByText('No filters available. Load some fixtures first.')
      ).toBeInTheDocument();
    });
  });
});
