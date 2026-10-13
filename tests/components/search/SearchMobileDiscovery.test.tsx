import { render, screen } from '@testing-library/react';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

import { SearchMobileDiscovery } from '@/components/search/SearchMobileDiscovery';
import type { SearchSuggestions } from '@/types/search-suggestions';

jest.mock('@/components/ui/AppLink', () => ({
  AppLink: ({
    href,
    children,
    replace: _replace,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children: ReactNode;
    replace?: boolean;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock('@/components/icons', () => ({
  CollectionGridIcon: () => <span data-testid="collection-icon" />,
  SearchIcon: () => <span data-testid="search-icon" />,
}));

const suggestions: SearchSuggestions = {
  popularTerms: ['Gold Ring', 'Earring'],
  recentSearchTerms: [],
  headerPopularTerms: ['Gold Ring', 'Earring', 'Bracelets'],
  popularCollections: [
    { label: 'Rings Collection', handle: 'rings' },
    { label: 'Gold Collection', handle: 'gold' },
  ],
  exploreTerms: [],
};

describe('SearchMobileDiscovery', () => {
  it('renders popular search terms as links', () => {
    render(<SearchMobileDiscovery suggestions={suggestions} />);

    expect(screen.getByRole('heading', { name: 'Popular Searches' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Search for Gold Ring' })).toHaveAttribute(
      'href',
      expect.stringContaining('/search?'),
    );
    expect(screen.getByRole('link', { name: 'Search for Bracelets' })).toBeInTheDocument();
  });

  it('renders popular collections as links', () => {
    render(<SearchMobileDiscovery suggestions={suggestions} />);

    expect(screen.getByRole('heading', { name: 'Popular Collection' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse Rings Collection' })).toHaveAttribute(
      'href',
      expect.stringContaining('/collections/rings'),
    );
  });

  it('falls back to popularTerms when headerPopularTerms is empty', () => {
    render(
      <SearchMobileDiscovery
        suggestions={{ ...suggestions, headerPopularTerms: [], popularTerms: ['Necklace'] }}
      />,
    );

    expect(screen.getByRole('link', { name: 'Search for Necklace' })).toBeInTheDocument();
  });

  it('renders recent search terms above popular searches', () => {
    render(
      <SearchMobileDiscovery suggestions={{ ...suggestions, recentSearchTerms: ['anklet'] }} />,
    );

    expect(screen.getByRole('heading', { name: 'Recent Search' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Search for anklet' })).toHaveAttribute(
      'href',
      expect.stringContaining('/search?'),
    );
  });

  it('hides recent when there are no terms and history is not loading', () => {
    render(<SearchMobileDiscovery suggestions={suggestions} />);

    expect(screen.queryByRole('heading', { name: 'Recent Search' })).not.toBeInTheDocument();
  });

  it('shows a recent loading skeleton while popular stays clickable', () => {
    render(<SearchMobileDiscovery isLoadingRecent suggestions={suggestions} />);

    expect(screen.getByRole('heading', { name: 'Recent Search' })).toBeInTheDocument();
    expect(screen.getByLabelText('Loading recent searches')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Search for Gold Ring' })).toBeInTheDocument();
  });

  it('hides empty sections', () => {
    render(
      <SearchMobileDiscovery
        suggestions={{
          ...suggestions,
          headerPopularTerms: [],
          popularTerms: [],
          popularCollections: [],
        }}
      />,
    );

    expect(screen.queryByRole('heading', { name: 'Popular Searches' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Popular Collection' })).not.toBeInTheDocument();
  });
});
