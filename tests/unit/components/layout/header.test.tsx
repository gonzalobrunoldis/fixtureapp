import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '@/components/layout/header';

describe('Header', () => {
  it('renders title correctly', () => {
    render(<Header title="Champions League" />);

    expect(screen.getByText('Champions League')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<Header title="Champions League" subtitle="Group Stage" />);

    expect(screen.getByText('Group Stage')).toBeInTheDocument();
  });

  it('does not render subtitle when not provided', () => {
    render(<Header title="Champions League" />);

    expect(screen.queryByText('Group Stage')).not.toBeInTheDocument();
  });

  it('renders action buttons when provided', () => {
    render(
      <Header title="Champions League" actions={<button>Filter</button>} />
    );

    expect(screen.getByRole('button', { name: 'Filter' })).toBeInTheDocument();
  });

  it('renders multiple actions', () => {
    render(
      <Header
        title="Champions League"
        actions={
          <>
            <button>Filter</button>
            <button>Sort</button>
          </>
        }
      />
    );

    expect(screen.getByRole('button', { name: 'Filter' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sort' })).toBeInTheDocument();
  });

  it('applies sticky positioning', () => {
    const { container } = render(<Header title="Test" />);
    const header = container.querySelector('header');

    expect(header).toHaveClass('sticky');
    expect(header).toHaveClass('top-0');
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <Header title="Test" className="custom-class" />
    );
    const header = container.querySelector('header');

    expect(header).toHaveClass('custom-class');
  });

  it('has proper backdrop blur styling', () => {
    const { container } = render(<Header title="Test" />);
    const header = container.querySelector('header');

    expect(header).toHaveClass('backdrop-blur');
  });
});
