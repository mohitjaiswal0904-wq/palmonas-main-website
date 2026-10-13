import { render, screen } from '@testing-library/react';

import { ResourceNotFound } from '@/components/ui/ResourceNotFound';

describe('ResourceNotFound', () => {
  it('renders the default not-found kicker', () => {
    render(<ResourceNotFound title="Missing" description="Gone" />);

    expect(screen.getByText('Not found')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Missing' })).toBeInTheDocument();
  });

  it('links to home by default', () => {
    render(<ResourceNotFound title="Missing" description="Gone" />);

    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/');
  });

  it('uses a custom kicker for load failures', () => {
    render(
      <ResourceNotFound
        kicker="Temporarily unavailable"
        title="Couldn't load this product"
        description="Try again"
        ctaHref="/products/ring"
        ctaLabel="Try again"
      />,
    );

    expect(screen.getByText('Temporarily unavailable')).toBeInTheDocument();
    expect(screen.queryByText('Not found')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Try again' })).toHaveAttribute(
      'href',
      '/products/ring',
    );
  });

  it('renders the description', () => {
    render(<ResourceNotFound title="Missing" description="Check the URL" />);

    expect(screen.getByText('Check the URL')).toBeInTheDocument();
  });
});
