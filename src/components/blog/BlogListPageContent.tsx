'use client';

import Image from 'next/image';
import { useMemo } from 'react';

import { BlogCard } from '@/components/blog/BlogCard';
import { BlogInfiniteScrollTrigger } from '@/components/blog/BlogInfiniteScrollTrigger';
import { Loader } from '@/components/ui/Loader';
import { useBlogArticles } from '@/hooks/useBlogArticles';
import { BLOG_PAGE_SIZE } from '@/lib/constants';
import type { BlogArticlesQueryParams, BlogArticlesResponse } from '@/types/blog';

/** Native CMS blog banner ratio (1920×762 → 320/127) — keeps the full hero visible. */
const BLOG_HERO_ASPECT_CLASS = 'aspect-[320/127]';

interface BlogListPageContentProps {
  initialArticles?: BlogArticlesResponse | null;
  heroImageUrl?: string | null;
}

export function BlogListPageContent({ initialArticles, heroImageUrl }: BlogListPageContentProps) {
  const articleParams = useMemo<BlogArticlesQueryParams>(
    () => ({
      limit: BLOG_PAGE_SIZE,
      publishedOnly: true,
    }),
    [],
  );
  const {
    articles,
    total,
    hasMoreArticles,
    isLoading,
    isLoadingMoreArticles,
    loadMoreArticles,
    error,
  } = useBlogArticles(articleParams, { initialArticles });

  const viewedCount = articles.length;
  const progressPercent = total > 0 ? Math.min(100, (viewedCount / total) * 100) : 0;
  const heroImage = heroImageUrl ?? articles[0]?.imageUrl ?? null;
  const hasArticles = viewedCount > 0;
  const isInitialLoading = isLoading && !hasArticles;

  return (
    <main className="bg-palmonas-surface">
      {heroImage ? (
        <section className="relative w-full overflow-hidden">
          <div className={`relative w-full ${BLOG_HERO_ASPECT_CLASS}`}>
            <Image
              src={heroImage}
              alt="Latest jewellery news from Palmonas"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>
        </section>
      ) : null}

      <section className="tab:px-6 laptop:px-10 px-3 py-10">
        {error ? (
          <div className="rounded-palmonas-lg border-palmonas-border bg-palmonas-soft text-palmonas-muted border p-5 text-sm">
            We could not load blog posts right now. Please check your connection and try again.
          </div>
        ) : null}

        {isInitialLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader />
          </div>
        ) : null}

        {hasArticles ? (
          <>
            <div className="laptop:grid-cols-4 tab:grid-cols-2 laptop:gap-6 grid grid-cols-1 gap-4">
              {articles.map((article) => (
                <BlogCard key={article.id} article={article} />
              ))}
            </div>

            <div className="mx-auto mt-12 max-w-md text-center">
              <p className="font-nunito-sans text-palmonas-muted text-sm">
                You&apos;ve viewed {viewedCount} of {total} posts
              </p>
              <div
                className="bg-palmonas-soft mx-auto mt-5 h-1.5 overflow-hidden rounded-full"
                role="progressbar"
                aria-valuenow={viewedCount}
                aria-valuemin={0}
                aria-valuemax={total}
                aria-label="Blog posts viewed"
              >
                <div
                  className="bg-palmonas-ink h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              {hasMoreArticles ? (
                <button
                  type="button"
                  onClick={loadMoreArticles}
                  disabled={isLoadingMoreArticles}
                  className="font-nunito-sans text-palmonas-ink mt-7 text-sm underline underline-offset-4 disabled:opacity-60"
                  aria-label="Load more blog posts"
                >
                  {isLoadingMoreArticles ? 'Loading more posts...' : 'Load More Posts'}
                </button>
              ) : null}
            </div>

            <BlogInfiniteScrollTrigger
              hasMoreArticles={hasMoreArticles}
              isLoadingMoreArticles={isLoadingMoreArticles}
              onLoadMoreArticles={loadMoreArticles}
            />
          </>
        ) : null}

        {!isLoading && !error && !hasArticles ? (
          <div className="rounded-palmonas-lg border-palmonas-border bg-palmonas-soft border p-8 text-center">
            <h2 className="text-palmonas-ink text-lg font-semibold">No posts yet</h2>
            <p className="text-palmonas-muted mx-auto mt-2 max-w-md text-sm">
              Check back soon for the latest jewellery stories and styling guides.
            </p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
