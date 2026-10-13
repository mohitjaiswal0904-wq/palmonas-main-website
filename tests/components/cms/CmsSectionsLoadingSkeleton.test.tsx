import { render, screen } from '@testing-library/react';

import { CmsSectionsLoadingSkeleton } from '@/components/cms/CmsSectionsLoadingSkeleton';

describe('CmsSectionsLoadingSkeleton', () => {
  it('marks the region busy for assistive tech', () => {
    render(<CmsSectionsLoadingSkeleton />);

    expect(screen.getByLabelText('Loading more sections')).toHaveAttribute('aria-busy', 'true');
  });

  it('exposes a test id for chunk-loading checks', () => {
    render(<CmsSectionsLoadingSkeleton />);

    expect(screen.getByTestId('cms-sections-loading-skeleton')).toBeInTheDocument();
  });

  it('renders the requested number of section blocks', () => {
    const { container } = render(<CmsSectionsLoadingSkeleton sectionCount={2} />);

    expect(container.querySelectorAll('section')).toHaveLength(2);
  });

  it('defaults to three section blocks', () => {
    const { container } = render(<CmsSectionsLoadingSkeleton />);

    expect(container.querySelectorAll('section')).toHaveLength(3);
  });
});
