import { render, screen } from '@testing-library/react';

import { HomePageSkeleton } from '@/components/home/HomePageSkeleton';

describe('HomePageSkeleton', () => {
  it('marks the main region as busy with the home loading label', () => {
    render(<HomePageSkeleton />);

    expect(screen.getByLabelText('Loading home')).toHaveAttribute('aria-busy', 'true');
  });

  it('exposes a test id for route loading checks', () => {
    render(<HomePageSkeleton />);

    expect(screen.getByTestId('home-page-skeleton')).toBeInTheDocument();
  });

  it('uses a main landmark', () => {
    render(<HomePageSkeleton />);

    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('does not use a non-home busy label', () => {
    render(<HomePageSkeleton />);

    expect(screen.queryByLabelText('Loading page content')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Loading product')).not.toBeInTheDocument();
  });

  it('body variant skips the main landmark so real tabs can sit above', () => {
    render(<HomePageSkeleton variant="body" />);

    expect(screen.queryByRole('main')).not.toBeInTheDocument();
    expect(screen.getByTestId('home-page-skeleton')).toHaveAttribute('aria-busy', 'true');
  });

  it('matches the CMS section and heading spacing rhythm', () => {
    const { container } = render(<HomePageSkeleton />);
    const bodyStack = container.querySelector('.gap-6');
    const headingPlaceholder = bodyStack?.querySelector('.mb-3');

    expect(bodyStack).toBeInTheDocument();
    expect(headingPlaceholder).toBeInTheDocument();
  });
});
