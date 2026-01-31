import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageContainer } from '@/components/layout/page-container';

describe('PageContainer', () => {
  it('renders children correctly', () => {
    render(
      <PageContainer>
        <div>Test Content</div>
      </PageContainer>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies default padding', () => {
    const { container } = render(
      <PageContainer>
        <div>Content</div>
      </PageContainer>
    );
    const main = container.querySelector('main');

    expect(main).toHaveClass('px-4');
    expect(main).toHaveClass('pt-6');
  });

  it('removes padding when noPadding is true', () => {
    const { container } = render(
      <PageContainer noPadding>
        <div>Content</div>
      </PageContainer>
    );
    const main = container.querySelector('main');

    expect(main).not.toHaveClass('px-4');
    expect(main).not.toHaveClass('pt-6');
  });

  it('applies bottom padding for bottom navigation', () => {
    const { container } = render(
      <PageContainer>
        <div>Content</div>
      </PageContainer>
    );
    const main = container.querySelector('main');

    expect(main).toHaveClass('pb-20');
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <PageContainer className="custom-class">
        <div>Content</div>
      </PageContainer>
    );
    const main = container.querySelector('main');

    expect(main).toHaveClass('custom-class');
  });

  it('has min-height for full screen coverage', () => {
    const { container } = render(
      <PageContainer>
        <div>Content</div>
      </PageContainer>
    );
    const main = container.querySelector('main');

    expect(main).toHaveClass('min-h-screen');
  });
});
