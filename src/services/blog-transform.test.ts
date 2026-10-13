import {
  buildBlogExcerpt,
  enrichBlogArticleExcerpts,
  transformBlogArticle,
  transformBlogArticleDetail,
  transformBlogArticlesResponse,
} from '@/services/blog-transform';
import type { BlogArticle, BlogArticleApi } from '@/types/blog';

const sampleArticle: BlogArticleApi = {
  id: 596348764417,
  blog_id: 83759399169,
  blog_handle: 'news',
  handle: 'the-everyday-necklace-that-becomes-everything',
  title: 'The Everyday Necklace That Becomes Everything',
  author: 'Pallavi Mohadikar',
  summary_html: '<p>Valentine’s Week is like the fashion Olympics for emotions.</p>',
  tags: [],
  image_src: 'https://cdn.shopify.com/s/files/1/0613/1400/7297/articles/necklace_sq.png',
  published_at: '2026-02-27T05:30:03+00:00',
  status: 'active',
  updated_at: '2026-07-07T07:58:55.010160+00:00',
  body_html: '<p>Body content for the article.</p>',
};

describe('blog transform', () => {
  it('maps article fields and formats the published date badge', () => {
    const article = transformBlogArticle(sampleArticle);

    expect(article.id).toBe('596348764417');
    expect(article.handle).toBe('the-everyday-necklace-that-becomes-everything');
    expect(article.publishedDay).toBe('27');
    expect(article.publishedMonth).toBe('FEB');
    expect(article.excerpt).toContain('Valentine');
  });

  it('maps article detail with body html', () => {
    const article = transformBlogArticleDetail(sampleArticle);

    expect(article.bodyHtml).toBe('<p>Body content for the article.</p>');
  });

  it('maps paginated article responses', () => {
    const response = transformBlogArticlesResponse({
      items: [sampleArticle],
      total: 171,
      page: 1,
      limit: 20,
      has_next: true,
    });

    expect(response.articles).toHaveLength(1);
    expect(response.total).toBe(171);
    expect(response.hasNext).toBe(true);
  });

  it('builds excerpt from body when summary is empty', () => {
    expect(
      buildBlogExcerpt(
        '',
        '<p>If jewellery had a reality check, lab-grown diamonds would be it.</p>',
      ),
    ).toContain('lab-grown diamonds');
  });

  it('returns an empty excerpt when summary and body are blank', () => {
    expect(buildBlogExcerpt('', '')).toBe('');
  });

  it('enriches missing excerpts from article detail', async () => {
    const bare: BlogArticle = {
      id: '1',
      handle: 'lab-grown',
      blogHandle: 'news',
      title: 'Lab-Grown',
      author: 'Palmonas',
      excerpt: '',
      imageUrl: 'https://cdn.example.com/a.jpg',
      publishedAt: '2026-03-03T00:00:00.000Z',
      publishedDay: '03',
      publishedMonth: 'MAR',
    };

    const enriched = await enrichBlogArticleExcerpts([bare], async () => ({
      excerpt: 'If jewellery had a reality check, lab-grown diamonds would be it.',
      bodyHtml: '',
    }));

    expect(enriched[0]?.excerpt).toContain('lab-grown diamonds');
  });

  it('keeps the original article when detail enrichment fails', async () => {
    const bare: BlogArticle = {
      id: '1',
      handle: 'missing',
      blogHandle: 'news',
      title: 'Missing',
      author: 'Palmonas',
      excerpt: '',
      imageUrl: '',
      publishedAt: '2026-03-03T00:00:00.000Z',
      publishedDay: '03',
      publishedMonth: 'MAR',
    };

    const enriched = await enrichBlogArticleExcerpts([bare], async () => {
      throw new Error('not found');
    });

    expect(enriched[0]).toEqual(bare);
  });
});
