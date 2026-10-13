import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

import { BlogListPageContent } from '@/components/blog/BlogListPageContent';
import type { BlogArticlesResponse } from '@/types/blog';

const mockUseBlogArticles = jest.fn();

jest.mock('@/hooks/useBlogArticles', () => ({
  useBlogArticles: (...args: unknown[]) => mockUseBlogArticles(...args),
}));

jest.mock('@/components/blog/BlogCard', () => ({
  BlogCard: ({ article }: { article: { title: string } }) => <div>{article.title}</div>,
}));

jest.mock('@/components/blog/BlogInfiniteScrollTrigger', () => ({
  BlogInfiniteScrollTrigger: () => <div data-testid="infinite-scroll" />,
}));

jest.mock('@/components/ui/Loader', () => ({
  Loader: () => <div role="status">Loading</div>,
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt }: { alt: string; children?: ReactNode }) => (
    // eslint-disable-next-line @next/next/no-img-element -- test stub
    <img alt={alt} />
  ),
}));

const articlesResponse: BlogArticlesResponse = {
  articles: [
    {
      id: '1',
      handle: 'guide',
      blogHandle: 'news',
      title: 'Styling Guide',
      author: 'Palmonas',
      excerpt: 'Excerpt',
      imageUrl: 'https://cdn.example.com/a.jpg',
      publishedAt: '2026-02-05T00:00:00.000Z',
      publishedDay: '05',
      publishedMonth: 'FEB',
    },
  ],
  total: 1,
  page: 1,
  limit: 12,
  hasNext: false,
};

describe('BlogListPageContent', () => {
  beforeEach(() => {
    mockUseBlogArticles.mockReset();
  });

  it('renders the hero at the banner aspect ratio so the full image is visible', () => {
    mockUseBlogArticles.mockReturnValue({
      articles: articlesResponse.articles,
      total: 1,
      hasMoreArticles: false,
      isLoading: false,
      isLoadingMoreArticles: false,
      loadMoreArticles: jest.fn(),
      error: null,
    });

    const { container } = render(
      <BlogListPageContent
        initialArticles={articlesResponse}
        heroImageUrl="https://cdn.example.com/hero.jpg"
      />,
    );

    expect(
      screen.getByRole('img', { name: 'Latest jewellery news from Palmonas' }),
    ).toBeInTheDocument();
    expect(container.querySelector('[class*="aspect-[320/127]"]')).toBeTruthy();
  });

  it('uses a tight mobile grid with reduced horizontal padding', () => {
    mockUseBlogArticles.mockReturnValue({
      articles: articlesResponse.articles,
      total: 1,
      hasMoreArticles: false,
      isLoading: false,
      isLoadingMoreArticles: false,
      loadMoreArticles: jest.fn(),
      error: null,
    });

    const { container } = render(<BlogListPageContent initialArticles={articlesResponse} />);
    const section = container.querySelector('section.px-3');
    const grid = container.querySelector('.grid.grid-cols-1');

    expect(section).toHaveClass('px-3', 'tab:px-6', 'laptop:px-10');
    expect(grid).toHaveClass('grid-cols-1', 'tab:grid-cols-2', 'laptop:grid-cols-4');
    expect(screen.getByText('Styling Guide')).toBeInTheDocument();
  });

  it('shows the empty state when there are no articles', () => {
    mockUseBlogArticles.mockReturnValue({
      articles: [],
      total: 0,
      hasMoreArticles: false,
      isLoading: false,
      isLoadingMoreArticles: false,
      loadMoreArticles: jest.fn(),
      error: null,
    });

    render(<BlogListPageContent />);

    expect(screen.getByText('No posts yet')).toBeInTheDocument();
    expect(screen.getByText(/Check back soon/i)).toBeInTheDocument();
  });

  it('shows an error message when the articles query fails', () => {
    mockUseBlogArticles.mockReturnValue({
      articles: [],
      total: 0,
      hasMoreArticles: false,
      isLoading: false,
      isLoadingMoreArticles: false,
      loadMoreArticles: jest.fn(),
      error: { message: 'network' },
    });

    render(<BlogListPageContent />);

    expect(
      screen.getByText(/We could not load blog posts right now/i),
    ).toBeInTheDocument();
  });
});
