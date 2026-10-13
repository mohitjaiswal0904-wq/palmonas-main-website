import { render, screen } from '@testing-library/react';

import { BlogRelatedArticles } from '@/components/blog/BlogRelatedArticles';
import type { BlogArticle } from '@/types/blog';

jest.mock('@/components/blog/BlogCard', () => ({
  BlogCard: ({ article }: { article: { title: string } }) => <div>{article.title}</div>,
}));

const articles: BlogArticle[] = [
  {
    id: '1',
    handle: 'a',
    blogHandle: 'news',
    title: 'Article A',
    author: 'Palmonas',
    excerpt: 'A',
    imageUrl: 'https://cdn.example.com/a.jpg',
    publishedAt: '2026-02-05T00:00:00.000Z',
    publishedDay: '05',
    publishedMonth: 'FEB',
  },
  {
    id: '2',
    handle: 'b',
    blogHandle: 'news',
    title: 'Article B',
    author: 'Palmonas',
    excerpt: 'B',
    imageUrl: 'https://cdn.example.com/b.jpg',
    publishedAt: '2026-02-06T00:00:00.000Z',
    publishedDay: '06',
    publishedMonth: 'FEB',
  },
];

describe('BlogRelatedArticles', () => {
  it('renders the related articles heading and cards', () => {
    render(<BlogRelatedArticles articles={articles} />);

    expect(screen.getByRole('heading', { name: 'Related articles' })).toBeInTheDocument();
    expect(screen.getByText('Article A')).toBeInTheDocument();
    expect(screen.getByText('Article B')).toBeInTheDocument();
  });

  it('uses reduced mobile side padding on the section', () => {
    const { container } = render(<BlogRelatedArticles articles={articles} />);

    expect(container.querySelector('section')).toHaveClass('px-3', 'tab:px-6', 'laptop:px-10');
  });

  it('returns null when there are no articles', () => {
    const { container } = render(<BlogRelatedArticles articles={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('exposes an accessible labelled region', () => {
    render(<BlogRelatedArticles articles={articles} />);

    expect(screen.getByRole('region', { name: 'Related articles' })).toBeInTheDocument();
  });
});
