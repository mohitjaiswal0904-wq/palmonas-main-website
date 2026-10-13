import { fireEvent, render, screen } from '@testing-library/react';

import { BlogCard } from '@/components/blog/BlogCard';
import type { BlogArticle } from '@/types/blog';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...rest }: { alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element -- test stub
    <img alt={alt} {...rest} />
  ),
}));

const article: BlogArticle = {
  id: '1',
  handle: 'valentines-styling',
  blogHandle: 'news',
  title: "Jewellery Styling Guide for Valentine's Week Outfits",
  author: 'Palmonas',
  excerpt: "Valentine's Week is like the fashion Olympics for emotions…",
  imageUrl: 'https://cdn.example.com/blog.jpg',
  publishedAt: '2026-02-05T00:00:00.000Z',
  publishedDay: '05',
  publishedMonth: 'FEB',
};

describe('BlogCard', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders title, excerpt, and date badge', () => {
    render(<BlogCard article={article} />);

    expect(
      screen.getByRole('link', { name: `Read ${article.title}` }),
    ).toBeInTheDocument();
    expect(screen.getByText(article.title)).toBeInTheDocument();
    expect(screen.getByText(article.excerpt)).toHaveClass('line-clamp-2');
    expect(screen.getByText('05')).toBeInTheDocument();
    expect(screen.getByText('FEB')).toBeInTheDocument();
  });

  it('uses a full-bleed image and rounded card chrome', () => {
    const { container } = render(<BlogCard article={article} />);
    const card = screen.getByRole('link', { name: `Read ${article.title}` });

    expect(card).toHaveClass('w-full', 'rounded-[12px]', 'overflow-hidden');
    expect(container.querySelector('.aspect-square')).toBeInTheDocument();
    expect(screen.getByAltText(article.title)).toBeInTheDocument();
  });

  it('navigates to the article on click', () => {
    render(<BlogCard article={article} />);

    fireEvent.click(screen.getByRole('link', { name: `Read ${article.title}` }));

    expect(mockPush).toHaveBeenCalledWith('/blogs/valentines-styling');
  });

  it('navigates when Enter is pressed on the card', () => {
    render(<BlogCard article={article} />);

    fireEvent.keyDown(screen.getByRole('link', { name: `Read ${article.title}` }), {
      key: 'Enter',
    });

    expect(mockPush).toHaveBeenCalledWith('/blogs/valentines-styling');
  });

  it('renders a soft placeholder when imageUrl is empty', () => {
    const { container } = render(
      <BlogCard article={{ ...article, imageUrl: '', excerpt: '' }} />,
    );

    expect(screen.queryByAltText(article.title)).not.toBeInTheDocument();
    expect(container.querySelector('[aria-hidden="true"].bg-palmonas-soft')).toBeInTheDocument();
    expect(screen.getByText('', { selector: 'p.line-clamp-2' })).toBeInTheDocument();
  });

  it('does not navigate on unrelated key presses', () => {
    render(<BlogCard article={article} />);

    fireEvent.keyDown(screen.getByRole('link', { name: `Read ${article.title}` }), {
      key: 'Escape',
    });

    expect(mockPush).not.toHaveBeenCalled();
  });
});
