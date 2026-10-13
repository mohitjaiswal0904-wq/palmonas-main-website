import { render, screen } from '@testing-library/react';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

import { SearchPopularTerms } from '@/components/search/SearchPopularTerms';
import type { SearchSuggestions } from '@/types/search-suggestions';

jest.mock('@/components/ui/AppLink', () => ({
  AppLink: ({
    href,
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const suggestions: SearchSuggestions = {
  popularTerms: ['Gold Ring', 'Earring'],
  recentSearchTerms: [],
  headerPopularTerms: [],
  popularCollections: [],
  exploreTerms: [],
};

describe('SearchPopularTerms', () => {
  it('renders popular search chips as links', () => {
    render(<SearchPopularTerms suggestions={suggestions} />);

    expect(screen.getByLabelText('Popular searches')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Search for Gold Ring' })).toHaveAttribute(
      'href',
      expect.stringContaining('/search?'),
    );
  });

  it('renders recent search chips when history exists', () => {
    render(<SearchPopularTerms suggestions={{ ...suggestions, recentSearchTerms: ['anklet'] }} />);

    expect(screen.getByLabelText('Recent search')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Search for anklet' })).toBeInTheDocument();
  });

  it('hides recent chips when there are no terms and history is not loading', () => {
    render(<SearchPopularTerms suggestions={suggestions} />);

    expect(screen.queryByLabelText('Recent search')).not.toBeInTheDocument();
  });

  it('shows a recent loading skeleton while popular chips stay clickable', () => {
    render(<SearchPopularTerms isLoadingRecent suggestions={suggestions} />);

    expect(screen.getByLabelText('Recent search')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading recent searches')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Search for Earring' })).toBeInTheDocument();
  });
});
