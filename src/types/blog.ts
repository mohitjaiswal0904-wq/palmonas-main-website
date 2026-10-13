import type { ApiResponse } from '@/types/api';

export const BLOG_HANDLE = 'news' as const;

export interface BlogArticleApi {
  id: number;
  blog_id: number;
  blog_handle: string;
  handle: string;
  title: string;
  author: string;
  summary_html: string;
  tags: string[];
  image_src: string;
  published_at: string;
  status: string;
  updated_at: string;
  body_html?: string;
}

export interface BlogArticlesListApiData {
  items: BlogArticleApi[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
}

export type BlogArticlesEnvelopeApiResponse = ApiResponse<BlogArticlesListApiData>;
export type BlogArticleEnvelopeApiResponse = ApiResponse<BlogArticleApi>;

export interface BlogArticle {
  id: string;
  handle: string;
  blogHandle: string;
  title: string;
  author: string;
  excerpt: string;
  imageUrl: string;
  publishedAt: string;
  publishedDay: string;
  publishedMonth: string;
}

export interface BlogArticleDetail extends BlogArticle {
  bodyHtml: string;
}

export interface BlogArticlesResponse {
  articles: BlogArticle[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
}

export interface BlogArticlesParams {
  page: number;
  limit: number;
  blogHandle?: string;
  publishedOnly?: boolean;
}

export type BlogArticlesQueryParams = Omit<BlogArticlesParams, 'page'>;

/** @deprecated Use BlogArticle instead. */
export type BlogPost = BlogArticle;
