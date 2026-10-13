import { render, screen, within } from '@testing-library/react';

import { SearchPageContent } from '@/components/search/SearchPageContent';
import { setSearchDraftQuery } from '@/lib/search/search-draft-query';
import type { SearchSuggestions } from '@/types/search-suggestions';

let mockQuery = 'Diamond';
let mockProducts: Array<{ id: string }> = [{ id: 'product-1' }];
let mockTotalResults = 7;
let mockIsAuthenticated = true;
let mockIsGuest = false;
let mockAuthLoading = false;
let mockRecentTerms: string[] = [];
let mockIsLoadingRecent = false;

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/hooks/auth/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: mockIsAuthenticated,
    isGuest: mockIsGuest,
    isLoading: mockAuthLoading,
  }),
}));

jest.mock('@/hooks/useSearchHistory', () => ({
  useSearchHistory: () => ({
    terms: mockRecentTerms,
    isLoading: mockIsLoadingRecent,
    error: null,
  }),
}));

jest.mock('@/hooks/useSearchAutocomplete', () => ({
  useSearchAutocomplete: () => ({
    products: [{ id: 'p1', handle: 'gold-ring', name: 'Gold Ring' }],
    isLoading: false,
    error: null,
  }),
}));

jest.mock('@/hooks/useSearch', () => ({
  useSearch: () => ({
    query: mockQuery,
    products: mockProducts,
    filterGroups: [],
    offers: [],
    hasMoreProducts: false,
    isLoadingMoreProducts: false,
    loadedPageCount: 1,
    loadMoreProducts: jest.fn(),
    totalResults: mockTotalResults,
  }),
}));

jest.mock('@/components/global/product-listing', () => ({
  ProductListingControls: () => <div data-testid="product-listing" />,
}));

jest.mock('@/components/search/SearchEmptyState', () => ({
  SearchEmptyState: () => <div data-testid="empty-state" />,
}));

jest.mock('@/components/search/SearchMobileDiscovery', () => ({
  SearchMobileDiscovery: ({
    className,
    suggestions,
    isLoadingRecent,
  }: {
    className?: string;
    suggestions: SearchSuggestions;
    isLoadingRecent?: boolean;
  }) => (
    <div className={className} data-testid="mobile-discovery">
      {suggestions.recentSearchTerms.join(',')}
      {isLoadingRecent ? 'loading-recent' : ''}
    </div>
  ),
}));

jest.mock('@/components/layout/HeaderSearchDropdown', () => ({
  HeaderSearchDropdown: ({ query, matchedTerms }: { query: string; matchedTerms?: string[] }) => (
    <div data-testid="typed-suggestions">
      {query}:{matchedTerms?.join(',')}
    </div>
  ),
}));

jest.mock('@/components/search/SearchPopularTerms', () => ({
  SearchPopularTerms: ({
    suggestions,
    isLoadingRecent,
  }: {
    suggestions: SearchSuggestions;
    isLoadingRecent?: boolean;
  }) => (
    <div data-testid="popular-terms">
      {suggestions.recentSearchTerms.join(',')}
      {isLoadingRecent ? 'loading-recent' : ''}
    </div>
  ),
}));

const suggestions: SearchSuggestions = {
  popularTerms: [],
  recentSearchTerms: [],
  headerPopularTerms: [],
  popularCollections: [],
  exploreTerms: [],
};

function renderSearchPage(query = mockQuery) {
  return render(
    <SearchPageContent query={query} filters={{}} sort="featured" suggestions={suggestions} />,
  );
}

describe('SearchPageContent mobile result summary', () => {
  beforeEach(() => {
    mockQuery = 'Diamond';
    mockProducts = [{ id: 'product-1' }];
    mockTotalResults = 7;
    mockIsAuthenticated = true;
    mockIsGuest = false;
    mockAuthLoading = false;
    mockRecentTerms = [];
    mockIsLoadingRecent = false;
    setSearchDraftQuery('');
  });

  it('shows the total product count and searched text above results', () => {
    renderSearchPage();
    const summary = screen.getByTestId('search-mobile-result-summary');

    expect(within(summary).getByText('7 results for')).toBeInTheDocument();
    expect(within(summary).getByRole('heading', { name: '“Diamond”' })).toBeInTheDocument();
  });

  it('uses the singular result label for one product', () => {
    mockTotalResults = 1;
    renderSearchPage();

    expect(
      within(screen.getByTestId('search-mobile-result-summary')).getByText('1 result for'),
    ).toBeInTheDocument();
  });

  it('hides the result summary when there is no searched text', () => {
    mockQuery = '';
    renderSearchPage('');

    expect(screen.queryByTestId('search-mobile-result-summary')).not.toBeInTheDocument();
  });

  it('hides the result summary when the search has no products', () => {
    mockProducts = [];
    mockTotalResults = 0;
    renderSearchPage();

    expect(screen.queryByTestId('search-mobile-result-summary')).not.toBeInTheDocument();
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });
});

describe('SearchPageContent recent searches', () => {
  beforeEach(() => {
    mockQuery = '';
    mockProducts = [];
    mockTotalResults = 0;
    mockIsAuthenticated = true;
    mockIsGuest = false;
    mockAuthLoading = false;
    mockRecentTerms = ['anklet'];
    mockIsLoadingRecent = false;
    setSearchDraftQuery('');
  });

  it('passes recent terms into discovery and chip lists for signed-in users', () => {
    renderSearchPage('');

    expect(screen.getByTestId('mobile-discovery')).toHaveTextContent('anklet');
    expect(screen.getByTestId('popular-terms')).toHaveTextContent('anklet');
  });

  it('hides recent terms for guests', () => {
    mockIsGuest = true;
    mockRecentTerms = ['anklet'];
    renderSearchPage('');

    expect(screen.getByTestId('mobile-discovery')).not.toHaveTextContent('anklet');
    expect(screen.getByTestId('popular-terms')).not.toHaveTextContent('anklet');
  });

  it('marks recent sections as loading while history is fetching', () => {
    mockRecentTerms = [];
    mockIsLoadingRecent = true;
    renderSearchPage('');

    expect(screen.getByTestId('mobile-discovery')).toHaveTextContent('loading-recent');
    expect(screen.getByTestId('popular-terms')).toHaveTextContent('loading-recent');
  });

  it('does not show a recent loading state while auth is still bootstrapping', () => {
    mockAuthLoading = true;
    mockIsLoadingRecent = true;
    renderSearchPage('');

    expect(screen.getByTestId('mobile-discovery')).not.toHaveTextContent('loading-recent');
    expect(screen.getByTestId('popular-terms')).not.toHaveTextContent('loading-recent');
  });
});

describe('SearchPageContent typed suggestions', () => {
  beforeEach(() => {
    mockQuery = '';
    mockProducts = [];
    mockTotalResults = 0;
    mockIsAuthenticated = true;
    mockIsGuest = false;
    mockAuthLoading = false;
    mockRecentTerms = [];
    mockIsLoadingRecent = false;
    setSearchDraftQuery('');
  });

  it('shows desktop-style suggestions while the mobile field draft differs from the page query', () => {
    setSearchDraftQuery('gold');
    renderSearchPage('');

    expect(screen.getByTestId('search-mobile-typed-suggestions')).toBeInTheDocument();
    expect(screen.getByTestId('typed-suggestions')).toHaveTextContent('gold');
    expect(screen.getByTestId('mobile-discovery')).toHaveClass('hidden');
  });

  it('hides product results while the user is typing a new query', () => {
    mockQuery = 'Diamond';
    mockProducts = [{ id: 'product-1' }];
    mockTotalResults = 7;
    setSearchDraftQuery('gold');
    renderSearchPage('Diamond');

    expect(screen.getByTestId('search-mobile-typed-suggestions')).toBeInTheDocument();
    expect(screen.queryByTestId('product-listing')).not.toBeInTheDocument();
    expect(screen.queryByTestId('search-mobile-result-summary')).not.toBeInTheDocument();
  });

  it('keeps results visible when the draft matches the committed search', () => {
    mockQuery = 'Diamond';
    mockProducts = [{ id: 'product-1' }];
    mockTotalResults = 7;
    setSearchDraftQuery('Diamond');
    renderSearchPage('Diamond');

    expect(screen.queryByTestId('search-mobile-typed-suggestions')).not.toBeInTheDocument();
    expect(screen.getByTestId('product-listing')).toBeInTheDocument();
  });

  it('keeps discovery when the draft is empty', () => {
    renderSearchPage('');

    expect(screen.queryByTestId('search-mobile-typed-suggestions')).not.toBeInTheDocument();
    expect(screen.getByTestId('mobile-discovery')).toBeInTheDocument();
  });
});
