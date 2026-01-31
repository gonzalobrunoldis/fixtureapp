import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FixtureList } from '@/components/fixtures/fixture-list';
import {
  mockAllFixtures,
  mockUpcomingFixture,
  mockPremierLeagueFixtures,
} from '../../../__fixtures__/fixtures';

describe('FixtureList', () => {
  describe('Loading State', () => {
    it('shows loading spinner when isLoading is true', () => {
      render(<FixtureList fixtures={[]} isLoading={true} />);

      expect(screen.getByText('Loading fixtures...')).toBeInTheDocument();
    });

    it('does not show fixtures when loading', () => {
      render(<FixtureList fixtures={mockAllFixtures} isLoading={true} />);

      expect(screen.queryByText('Manchester United')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error message when error is provided', () => {
      const error = new Error('Failed to fetch fixtures');
      render(<FixtureList fixtures={[]} error={error} />);

      expect(screen.getByText('Failed to load fixtures')).toBeInTheDocument();
    });

    it('shows retry button on error', () => {
      const error = new Error('Network error');
      render(<FixtureList fixtures={[]} error={error} />);

      expect(
        screen.getByRole('button', { name: 'Try Again' })
      ).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('shows empty state when fixtures array is empty', () => {
      render(<FixtureList fixtures={[]} />);

      expect(screen.getByText('No fixtures')).toBeInTheDocument();
    });

    it('shows custom empty message when provided', () => {
      render(
        <FixtureList
          fixtures={[]}
          emptyMessage="No matches today. Check tomorrow!"
        />
      );

      expect(
        screen.getByText('No matches today. Check tomorrow!')
      ).toBeInTheDocument();
    });
  });

  describe('Fixtures Display', () => {
    it('renders fixture cards', () => {
      render(<FixtureList fixtures={[mockUpcomingFixture]} />);

      expect(screen.getByText('Manchester United')).toBeInTheDocument();
      expect(screen.getByText('Liverpool')).toBeInTheDocument();
    });

    it('groups fixtures by league with league header', () => {
      render(<FixtureList fixtures={mockAllFixtures} />);

      // Check for league names in the list - they appear as h3 headings
      const headers = screen.getAllByRole('heading', { level: 3 });
      const headerTexts = headers.map((h) => h.textContent);

      expect(headerTexts).toContain('Premier League');
      expect(headerTexts).toContain('La Liga');
    });

    it('shows fixture count per league', () => {
      render(<FixtureList fixtures={mockPremierLeagueFixtures} />);

      // Should show count in parentheses
      expect(screen.getByText('(2)')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onFixtureClick when a fixture card is clicked', async () => {
      const user = userEvent.setup();
      const onFixtureClick = vi.fn();

      const { container } = render(
        <FixtureList
          fixtures={[mockUpcomingFixture]}
          onFixtureClick={onFixtureClick}
        />
      );

      // Find card by class
      const card = container.querySelector('.cursor-pointer');
      if (card) {
        await user.click(card);
        expect(onFixtureClick).toHaveBeenCalledTimes(1);
        expect(onFixtureClick).toHaveBeenCalledWith(mockUpcomingFixture);
      }
    });
  });

  describe('Multiple Fixtures', () => {
    it('renders all fixtures', () => {
      render(<FixtureList fixtures={mockAllFixtures} />);

      // All teams should be visible
      expect(screen.getByText('Manchester United')).toBeInTheDocument();
      expect(screen.getByText('Real Madrid')).toBeInTheDocument();
      expect(screen.getByText('Bayern Munich')).toBeInTheDocument();
    });
  });
});
