import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

describe('LoadingSpinner', () => {
  it('renders with default size (md)', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('svg');

    expect(spinner).toHaveClass('h-8');
    expect(spinner).toHaveClass('w-8');
  });

  it('renders with small size', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    const spinner = container.querySelector('svg');

    expect(spinner).toHaveClass('h-4');
    expect(spinner).toHaveClass('w-4');
  });

  it('renders with large size', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const spinner = container.querySelector('svg');

    expect(spinner).toHaveClass('h-12');
    expect(spinner).toHaveClass('w-12');
  });

  it('renders with extra large size', () => {
    const { container } = render(<LoadingSpinner size="xl" />);
    const spinner = container.querySelector('svg');

    expect(spinner).toHaveClass('h-16');
    expect(spinner).toHaveClass('w-16');
  });

  it('applies animate-spin class', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('svg');

    expect(spinner).toHaveClass('animate-spin');
  });

  it('applies primary text color', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('svg');

    expect(spinner).toHaveClass('text-primary');
  });

  it('renders label when provided', () => {
    render(<LoadingSpinner label="Loading fixtures..." />);

    expect(screen.getByText('Loading fixtures...')).toBeInTheDocument();
  });

  it('does not render label when not provided', () => {
    const { container } = render(<LoadingSpinner />);
    const label = container.querySelector('p');

    expect(label).not.toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const { container } = render(<LoadingSpinner className="custom-class" />);
    const spinner = container.querySelector('svg');

    expect(spinner).toHaveClass('custom-class');
  });

  it('has proper accessibility label', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('svg');

    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });

  it('uses custom label for accessibility when provided', () => {
    const { container } = render(<LoadingSpinner label="Loading data..." />);
    const spinner = container.querySelector('svg');

    expect(spinner).toHaveAttribute('aria-label', 'Loading data...');
  });
});
