import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from '@/components/shared/empty-state';
import { Calendar } from 'lucide-react';

describe('EmptyState', () => {
  it('renders title correctly', () => {
    render(<EmptyState icon={Calendar} title="No fixtures scheduled" />);

    expect(screen.getByText('No fixtures scheduled')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <EmptyState
        icon={Calendar}
        title="No fixtures scheduled"
        description="Check back later for upcoming matches"
      />
    );

    expect(
      screen.getByText('Check back later for upcoming matches')
    ).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    render(<EmptyState icon={Calendar} title="No fixtures scheduled" />);

    expect(screen.queryByText('Check back later')).not.toBeInTheDocument();
  });

  it('renders action button when provided', () => {
    const action = {
      label: 'Refresh',
      onClick: vi.fn(),
    };

    render(
      <EmptyState
        icon={Calendar}
        title="No fixtures scheduled"
        action={action}
      />
    );

    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
  });

  it('calls onClick when action button is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const action = {
      label: 'Refresh',
      onClick,
    };

    render(
      <EmptyState
        icon={Calendar}
        title="No fixtures scheduled"
        action={action}
      />
    );

    const button = screen.getByRole('button', { name: 'Refresh' });
    await user.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not render action button when not provided', () => {
    render(<EmptyState icon={Calendar} title="No fixtures scheduled" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders icon', () => {
    const { container } = render(
      <EmptyState icon={Calendar} title="No fixtures scheduled" />
    );

    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <EmptyState
        icon={Calendar}
        title="No fixtures scheduled"
        className="custom-class"
      />
    );

    const wrapper = container.querySelector('.custom-class');
    expect(wrapper).toBeInTheDocument();
  });

  it('has proper minimum height', () => {
    const { container } = render(
      <EmptyState icon={Calendar} title="No fixtures scheduled" />
    );

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('min-h-[400px]');
  });

  it('centers content vertically and horizontally', () => {
    const { container } = render(
      <EmptyState icon={Calendar} title="No fixtures scheduled" />
    );

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('items-center');
    expect(wrapper).toHaveClass('justify-center');
  });
});
