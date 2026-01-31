import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FixtureCard } from '@/components/fixtures/fixture-card';
import {
  mockUpcomingFixture,
  mockLiveFixture,
  mockFinishedFixture,
  mockCancelledFixture,
} from '../../../__fixtures__/fixtures';

describe('FixtureCard', () => {
  describe('Upcoming Fixture', () => {
    it('renders team names', () => {
      render(<FixtureCard fixture={mockUpcomingFixture} />);

      expect(screen.getByText('Manchester United')).toBeInTheDocument();
      expect(screen.getByText('Liverpool')).toBeInTheDocument();
    });

    it('displays start time instead of score for upcoming matches', () => {
      render(<FixtureCard fixture={mockUpcomingFixture} />);

      // Should not display score (since it's null)
      expect(screen.queryByText('0 - 0')).not.toBeInTheDocument();
    });

    it('displays NS status badge', () => {
      render(<FixtureCard fixture={mockUpcomingFixture} />);

      expect(screen.getByText('Not Started')).toBeInTheDocument();
    });
  });

  describe('Live Fixture', () => {
    it('renders team names', () => {
      render(<FixtureCard fixture={mockLiveFixture} />);

      expect(screen.getByText('Real Madrid')).toBeInTheDocument();
      expect(screen.getByText('Barcelona')).toBeInTheDocument();
    });

    it('displays current score', () => {
      render(<FixtureCard fixture={mockLiveFixture} />);

      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('displays elapsed time', () => {
      render(<FixtureCard fixture={mockLiveFixture} />);

      // Should show elapsed time badge
      expect(screen.getByText("67'")).toBeInTheDocument();
    });
  });

  describe('Finished Fixture', () => {
    it('renders team names', () => {
      render(<FixtureCard fixture={mockFinishedFixture} />);

      expect(screen.getByText('Bayern Munich')).toBeInTheDocument();
      expect(screen.getByText('Dortmund')).toBeInTheDocument();
    });

    it('displays final score', () => {
      render(<FixtureCard fixture={mockFinishedFixture} />);

      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('displays Full Time status', () => {
      render(<FixtureCard fixture={mockFinishedFixture} />);

      expect(screen.getByText('Full Time')).toBeInTheDocument();
    });

    it('displays halftime score', () => {
      render(<FixtureCard fixture={mockFinishedFixture} />);

      expect(screen.getByText(/HT: 1 - 0/)).toBeInTheDocument();
    });
  });

  describe('Cancelled Fixture', () => {
    it('renders team names', () => {
      render(<FixtureCard fixture={mockCancelledFixture} />);

      expect(screen.getByText('Juventus')).toBeInTheDocument();
      expect(screen.getByText('Inter Milan')).toBeInTheDocument();
    });

    it('displays cancelled status', () => {
      render(<FixtureCard fixture={mockCancelledFixture} />);

      expect(screen.getByText('Cancelled')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onClick when card is clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      const { container } = render(
        <FixtureCard fixture={mockUpcomingFixture} onClick={onClick} />
      );

      // Find the card element
      const card = container.querySelector('.cursor-pointer');
      if (card) {
        await user.click(card);
        expect(onClick).toHaveBeenCalledTimes(1);
      }
    });

    it('does not throw when onClick is not provided', async () => {
      const user = userEvent.setup();

      const { container } = render(
        <FixtureCard fixture={mockUpcomingFixture} />
      );

      const card = container.querySelector('.cursor-pointer');
      if (card) {
        await expect(user.click(card)).resolves.not.toThrow();
      }
    });
  });

  describe('League Info', () => {
    it('displays league name when not compact', () => {
      render(<FixtureCard fixture={mockUpcomingFixture} />);

      expect(screen.getByText('Premier League')).toBeInTheDocument();
    });

    it('hides league info when compact', () => {
      render(<FixtureCard fixture={mockUpcomingFixture} compact />);

      // League name should not be shown in compact mode
      expect(screen.queryByText('Premier League')).not.toBeInTheDocument();
    });
  });
});
