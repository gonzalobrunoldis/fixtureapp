import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BottomNav } from '@/components/layout/bottom-nav';
import { usePathname } from 'next/navigation';

// Mock Next.js navigation hooks
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

const mockUsePathname = vi.mocked(usePathname);

describe('BottomNav', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/home');
  });

  it('renders all 5 navigation tabs', () => {
    render(<BottomNav />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Competitions')).toBeInTheDocument();
    expect(screen.getByText('Groups')).toBeInTheDocument();
    expect(screen.getByText('Following')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders navigation links with correct hrefs', () => {
    render(<BottomNav />);

    expect(screen.getByText('Home').closest('a')).toHaveAttribute(
      'href',
      '/home'
    );
    expect(screen.getByText('Competitions').closest('a')).toHaveAttribute(
      'href',
      '/competitions'
    );
    expect(screen.getByText('Groups').closest('a')).toHaveAttribute(
      'href',
      '/groups'
    );
    expect(screen.getByText('Following').closest('a')).toHaveAttribute(
      'href',
      '/following'
    );
    expect(screen.getByText('Settings').closest('a')).toHaveAttribute(
      'href',
      '/settings'
    );
  });

  it('highlights the active tab based on current pathname', () => {
    mockUsePathname.mockReturnValue('/home');

    render(<BottomNav />);

    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).toHaveClass('text-primary');
  });

  it('applies muted foreground color to inactive tabs', () => {
    mockUsePathname.mockReturnValue('/home');

    render(<BottomNav />);

    const competitionsLink = screen.getByText('Competitions').closest('a');
    expect(competitionsLink).toHaveClass('text-muted-foreground');
  });

  it('renders with fixed positioning at bottom', () => {
    const { container } = render(<BottomNav />);
    const nav = container.querySelector('nav');

    expect(nav).toHaveClass('fixed');
    expect(nav).toHaveClass('bottom-0');
  });

  it('renders all navigation icons', () => {
    const { container } = render(<BottomNav />);
    const icons = container.querySelectorAll('svg');

    // Should have 5 icons (one for each tab)
    expect(icons).toHaveLength(5);
  });
});
