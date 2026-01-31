import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SportIcon } from '@/components/shared/sport-icon';

describe('SportIcon', () => {
  it('renders with default type (football)', () => {
    const { container } = render(<SportIcon />);
    const icon = container.querySelector('svg');

    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('aria-label', 'football icon');
  });

  it('renders football icon', () => {
    const { container } = render(<SportIcon type="football" />);
    const icon = container.querySelector('svg');

    expect(icon).toHaveAttribute('aria-label', 'football icon');
  });

  it('renders trophy icon', () => {
    const { container } = render(<SportIcon type="trophy" />);
    const icon = container.querySelector('svg');

    expect(icon).toHaveAttribute('aria-label', 'trophy icon');
  });

  it('renders medal icon', () => {
    const { container } = render(<SportIcon type="medal" />);
    const icon = container.querySelector('svg');

    expect(icon).toHaveAttribute('aria-label', 'medal icon');
  });

  it('renders with default size (md)', () => {
    const { container } = render(<SportIcon />);
    const icon = container.querySelector('svg');

    expect(icon).toHaveClass('h-6');
    expect(icon).toHaveClass('w-6');
  });

  it('renders with small size', () => {
    const { container } = render(<SportIcon size="sm" />);
    const icon = container.querySelector('svg');

    expect(icon).toHaveClass('h-4');
    expect(icon).toHaveClass('w-4');
  });

  it('renders with large size', () => {
    const { container } = render(<SportIcon size="lg" />);
    const icon = container.querySelector('svg');

    expect(icon).toHaveClass('h-8');
    expect(icon).toHaveClass('w-8');
  });

  it('applies custom className when provided', () => {
    const { container } = render(<SportIcon className="text-primary" />);
    const icon = container.querySelector('svg');

    expect(icon).toHaveClass('text-primary');
  });

  it('combines size classes with custom className', () => {
    const { container } = render(
      <SportIcon size="lg" className="text-primary" />
    );
    const icon = container.querySelector('svg');

    expect(icon).toHaveClass('h-8');
    expect(icon).toHaveClass('w-8');
    expect(icon).toHaveClass('text-primary');
  });
});
