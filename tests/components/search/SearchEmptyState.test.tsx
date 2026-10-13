import { render, screen } from '@testing-library/react';

import { SearchEmptyState } from '@/components/search/SearchEmptyState';

jest.mock('@/components/search/SearchMostLovedSection', () => ({
  SearchMostLovedSection: () => <div data-testid="most-loved-section" />,
}));

describe('SearchEmptyState', () => {
  it('renders one query-specific title and recovery guidance', () => {
    render(<SearchEmptyState query="XYZY" />);

    expect(screen.getByRole('heading', { name: 'No results for “XYZY”' })).toBeInTheDocument();
    expect(
      screen.getByText(
        /Try adjusting your search or explore our bestsellers — you might just find something you love/i,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText('No matches for “XYZY”')).not.toBeInTheDocument();
  });

  it('renders the most loved recommendations section', () => {
    render(<SearchEmptyState query="missing" />);

    expect(screen.getByTestId('most-loved-section')).toBeInTheDocument();
  });

  it('exposes a test id for the empty state root', () => {
    render(<SearchEmptyState query="none" />);

    expect(screen.getByTestId('search-empty-state')).toBeInTheDocument();
  });

  it('keeps the query in the visible heading', () => {
    render(<SearchEmptyState query="opal" />);

    expect(screen.getByRole('heading', { name: 'No results for “opal”' })).toBeInTheDocument();
  });
});
