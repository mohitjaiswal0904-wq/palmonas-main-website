/** Client-only — calls external API via @/lib/api. SSR pages use @/services/server/*.server. */
import { api } from '@/lib/api';
import { BLOG_PAGE_SIZE } from '@/lib/constants';
import { ENDPOINTS } from '@/lib/endpoints';
import { normaliseError } from '@/lib/errors';
import {
  enrichBlogArticleExcerpts,
  transformBlogArticleDetail,
  transformBlogArticlesResponse,
} from '@/services/blog-transform';
import type {
  BlogArticleDetail,
  BlogArticlesEnvelopeApiResponse,
  BlogArticlesQueryParams,
  BlogArticlesResponse,
  BlogArticleEnvelopeApiResponse,
} from '@/types/blog';
import { BLOG_HANDLE as DEFAULT_BLOG_HANDLE } from '@/types/blog';

function toArticlesQueryParams(
  params: BlogArticlesQueryParams & { page: number },
): Record<string, string | number | boolean> {
  return {
    page: params.page,
    limit: params.limit,
    published_only: params.publishedOnly ?? true,
  };
}

export async function getBlogByHandle(
  handle: string,
  blogHandle: string = DEFAULT_BLOG_HANDLE,
): Promise<BlogArticleDetail> {
  try {
    const { data } = await api.get<BlogArticleEnvelopeApiResponse>(
      ENDPOINTS.blogs.article(blogHandle, handle),
      {
        params: { published_only: true },
      },
    );
    return transformBlogArticleDetail(data.data);
  } catch (err) {
    throw normaliseError(err);
  }
}

export async function getBlogArticles(
  params: BlogArticlesQueryParams & { page: number },
  blogHandle: string = DEFAULT_BLOG_HANDLE,
): Promise<BlogArticlesResponse> {
  try {
    const { data } = await api.get<BlogArticlesEnvelopeApiResponse>(
      ENDPOINTS.blogs.articles(blogHandle),
      {
        params: toArticlesQueryParams(params),
      },
    );
    const response = transformBlogArticlesResponse(data);
    // List payloads omit summary/body — hydrate card subtext from article detail.
    const articles = await enrichBlogArticleExcerpts(response.articles, (handle) =>
      getBlogByHandle(handle, blogHandle),
    );

    return { ...response, articles };
  } catch (err) {
    throw normaliseError(err);
  }
}

export async function getLatestBlogs(
  limit = BLOG_PAGE_SIZE,
  blogHandle: string = DEFAULT_BLOG_HANDLE,
): Promise<BlogArticlesResponse> {
  return getBlogArticles({ page: 1, limit, publishedOnly: true }, blogHandle);
}
