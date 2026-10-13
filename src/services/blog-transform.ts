import { formatBlogDateParts } from '@/lib/utils/format-blog-date';
import { stripHtml, truncateText } from '@/lib/utils/strip-html';
import type {
  BlogArticle,
  BlogArticleApi,
  BlogArticleDetail,
  BlogArticlesEnvelopeApiResponse,
  BlogArticlesListApiData,
  BlogArticlesResponse,
} from '@/types/blog';

/** ~2 lines of card subtext at 13px / leading-6 before CSS line-clamp. */
const EXCERPT_MAX_LENGTH = 160;

function unwrapArticlesList(
  raw: BlogArticlesListApiData | BlogArticlesEnvelopeApiResponse,
): BlogArticlesListApiData {
  if ('items' in raw) {
    return raw;
  }

  return raw.data;
}

/**
 * Build listing-card excerpt from summary HTML, falling back to body HTML.
 *
 * @param summaryHtml - Shopify/CMS summary field (often empty on list payloads).
 * @param bodyHtml - Optional article body when summary is blank.
 * @returns Plain-text excerpt truncated for the card subtext.
 */
export function buildBlogExcerpt(summaryHtml: string, bodyHtml?: string): string {
  const summary = stripHtml(summaryHtml);

  if (summary) {
    return truncateText(summary, EXCERPT_MAX_LENGTH);
  }

  if (bodyHtml) {
    return truncateText(stripHtml(bodyHtml), EXCERPT_MAX_LENGTH);
  }

  return '';
}

export function transformBlogArticle(raw: BlogArticleApi): BlogArticle {
  const { day, month } = formatBlogDateParts(raw.published_at);

  return {
    id: String(raw.id),
    handle: raw.handle,
    blogHandle: raw.blog_handle,
    title: raw.title,
    author: raw.author,
    excerpt: buildBlogExcerpt(raw.summary_html, raw.body_html),
    imageUrl: raw.image_src,
    publishedAt: raw.published_at,
    publishedDay: day,
    publishedMonth: month,
  };
}

export function transformBlogArticleDetail(raw: BlogArticleApi): BlogArticleDetail {
  return {
    ...transformBlogArticle(raw),
    bodyHtml: raw.body_html ?? '',
  };
}

export function transformBlogArticlesResponse(
  raw: BlogArticlesListApiData | BlogArticlesEnvelopeApiResponse,
): BlogArticlesResponse {
  const list = unwrapArticlesList(raw);

  return {
    articles: list.items.map(transformBlogArticle),
    total: list.total,
    page: list.page,
    limit: list.limit,
    hasNext: list.has_next,
  };
}

/**
 * Fill missing list excerpts from article detail (list API omits summary/body).
 *
 * @param articles - Transformed list articles.
 * @param fetchDetail - Loads a single article by handle.
 * @returns Articles with excerpt populated when detail fetch succeeds.
 */
export async function enrichBlogArticleExcerpts(
  articles: BlogArticle[],
  fetchDetail: (handle: string) => Promise<Pick<BlogArticleDetail, 'excerpt' | 'bodyHtml'>>,
): Promise<BlogArticle[]> {
  return Promise.all(
    articles.map(async (article) => {
      if (article.excerpt.trim()) {
        return article;
      }

      try {
        const detail = await fetchDetail(article.handle);
        const excerpt = detail.excerpt.trim() || buildBlogExcerpt('', detail.bodyHtml);

        if (!excerpt) {
          return article;
        }

        return { ...article, excerpt };
      } catch {
        return article;
      }
    }),
  );
}
