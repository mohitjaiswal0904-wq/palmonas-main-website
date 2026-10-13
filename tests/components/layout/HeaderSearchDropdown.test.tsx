import type { ReactNode } from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { HeaderSearchDropdown } from '@/components/layout/HeaderSearchDropdown';
import { DEFAULT_SEARCH_SUGGESTIONS } from '@/components/search/search-suggestions.defaults';
import type { Product } from '@/types/product';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img alt={alt} />;
  },
}));

jest.mock('@/components/ui/AppLink', () => ({
  AppLink: ({
    children,
    href,
    ...props
  }: {
    children: ReactNode;
    href: string;
    'aria-label'?: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const sampleProduct = {
  id: 'p1',
  handle: 'gold-ring',
  name: 'Gold Ring',
  image: 'https://example.com/ring.jpg',
} as Product;

describe('HeaderSearchDropdown', () => {
  it('shows recent and popular terms when the query is empty', () => {
    render(
      <HeaderSearchDropdown
        suggestions={{
          ...DEFAULT_SEARCH_SUGGESTIONS,
          recentSearchTerms: ['anklet'],
        }}
        onTermSelect={jest.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Recent Search' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Popular Searches' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Use suggestion anklet' })).toBeInTheDocument();
  });

  it('hides recent when there are no terms and history is not loading', () => {
    render(
      <HeaderSearchDropdown
        suggestions={{
          ...DEFAULT_SEARCH_SUGGESTIONS,
          recentSearchTerms: [],
        }}
        onTermSelect={jest.fn()}
      />,
    );

    expect(screen.queryByRole('heading', { name: 'Recent Search' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Popular Searches' })).toBeInTheDocument();
  });

  it('shows a recent-only loading skeleton while popular stays clickable', () => {
    render(
      <HeaderSearchDropdown
        isLoadingRecent
        suggestions={{
          ...DEFAULT_SEARCH_SUGGESTIONS,
          recentSearchTerms: [],
          headerPopularTerms: ['Rings'],
        }}
        onTermSelect={jest.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Recent Search' })).toBeInTheDocument();
    expect(screen.getByLabelText('Loading recent searches')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Use suggestion Rings' })).toBeInTheDocument();
  });

  it('applies matched terms without opening full search, and opens products', () => {
    const onTermSelect = jest.fn();
    const onProductSelect = jest.fn();
    const onViewAllResults = jest.fn();

    render(
      <HeaderSearchDropdown
        query="gold"
        matchedTerms={['Gold Ring']}
        productSuggestions={[sampleProduct]}
        onTermSelect={onTermSelect}
        onProductSelect={onProductSelect}
        onViewAllResults={onViewAllResults}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Suggestions' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Products' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Popular Searches' })).not.toBeInTheDocument();

    fireEvent.mouseDown(screen.getByRole('button', { name: 'Use suggestion Gold Ring' }));
    expect(onTermSelect).toHaveBeenCalledWith('Gold Ring');
    expect(onViewAllResults).not.toHaveBeenCalled();

    fireEvent.mouseDown(screen.getByRole('button', { name: 'View Gold Ring' }));
    expect(onProductSelect).toHaveBeenCalledWith('gold-ring');
  });

  it('opens full search only via View all results', () => {
    const onViewAllResults = jest.fn();

    render(
      <HeaderSearchDropdown
        query="ring"
        productSuggestions={[sampleProduct]}
        onTermSelect={jest.fn()}
        onViewAllResults={onViewAllResults}
      />,
    );

    fireEvent.mouseDown(screen.getByRole('button', { name: 'View all results for ring' }));
    expect(onViewAllResults).toHaveBeenCalledTimes(1);
  });

  it('shows a loading state while products are fetching', () => {
    render(
      <HeaderSearchDropdown query="ring" isLoadingProducts onTermSelect={jest.fn()} />,
    );

    expect(screen.getByText('Searching…')).toBeInTheDocument();
  });

  it('shows an empty products message when nothing matches', () => {
    render(
      <HeaderSearchDropdown query="xyz" productSuggestions={[]} onTermSelect={jest.fn()} />,
    );

    expect(screen.getByText('No matching products')).toBeInTheDocument();
  });
});
