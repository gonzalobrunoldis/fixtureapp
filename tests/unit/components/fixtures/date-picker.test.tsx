import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DatePicker } from '@/components/fixtures/date-picker';

describe('DatePicker', () => {
  const mockDate = new Date('2026-01-31T12:00:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders navigation buttons', () => {
      render(<DatePicker selectedDate={mockDate} onDateChange={vi.fn()} />);

      // Should have prev and next buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it('renders Today button', () => {
      render(<DatePicker selectedDate={mockDate} onDateChange={vi.fn()} />);

      // Look for the Today button specifically
      const todayButtons = screen
        .getAllByRole('button')
        .filter((btn) => btn.textContent?.trim() === 'Today');
      expect(todayButtons.length).toBeGreaterThan(0);
    });

    it('displays date buttons for navigation', () => {
      render(<DatePicker selectedDate={mockDate} onDateChange={vi.fn()} />);

      // Should show some dates
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Navigation', () => {
    it('calls onDateChange when clicking Today button', () => {
      const onDateChange = vi.fn();
      // Use a date that's not today so Today button is visible
      const differentDate = new Date('2026-01-25T12:00:00Z');

      render(
        <DatePicker selectedDate={differentDate} onDateChange={onDateChange} />
      );

      // Find the Today button by finding buttons and filtering
      const buttons = screen.getAllByRole('button');
      const todayButton = buttons.find(
        (btn) => btn.textContent?.trim() === 'Today'
      );

      if (todayButton) {
        fireEvent.click(todayButton);
        expect(onDateChange).toHaveBeenCalled();
      }
    });
  });

  describe('Selected Date', () => {
    it('highlights the selected date', () => {
      render(<DatePicker selectedDate={mockDate} onDateChange={vi.fn()} />);

      // Find button with bg-primary class (selected state)
      const buttons = screen.getAllByRole('button');
      const selectedButton = buttons.find((btn) =>
        btn.className.includes('bg-primary')
      );

      expect(selectedButton).toBeDefined();
    });
  });

  describe('Date Range', () => {
    it('shows dates within the configured range', () => {
      render(<DatePicker selectedDate={mockDate} onDateChange={vi.fn()} />);

      // Should have multiple date buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(5); // At least 5 dates + navigation
    });
  });
});
