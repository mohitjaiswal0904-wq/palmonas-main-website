'use client';

import { User } from 'lucide-react';

import { BlogArticleBody } from '@/components/blog/BlogArticleBody';
import { BlogRelatedArticles } from '@/components/blog/BlogRelatedArticles';
import { Loader } from '@/components/ui/Loader';
import { ResourceNotFound } from '@/components/ui/ResourceNotFound';
import { useBlog } from '@/hooks/useBlog';
import type { BlogArticle, BlogArticleDetail } from '@/types/blog';

interface BlogPageContentProps {
  handle: string;
  initialArticle?: BlogArticleDetail | null;
  relatedArticles?: BlogArticle[];
}

export function BlogPageContent({
  handle,
  initialArticle,
  relatedArticles = [],
}: BlogPageContentProps) {
  const { blog, isLoading, error } = useBlog(handle, { initialArticle });

  if (isLoading && !blog) {
    return (
      <main className="flex justify-center py-20">
        <Loader />
      </main>
    );
  }

  if (error?.code === 'NOT_FOUND' || !blog) {
    return (
      <ResourceNotFound
        title="Article not found"
        description="This journal entry may have been removed, or the link you followed may be incorrect."
        ctaHref="/blogs"
        ctaLabel="Back to journal"
      />
    );
  }

  return (
    <main className="bg-palmonas-surface">
      <section className="container py-8">
        <div className="mx-auto max-w-[1440px] text-center">
          <p className="font-nunito-sans text-palmonas-muted text-sm">Blogs</p>
          <h1 className="font-nunito-sans text-palmonas-ink tab:text-4xl mt-2 text-3xl font-normal tracking-tight">
            {blog.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm">
            <div className="text-palmonas-muted flex items-center gap-2">
              <User className="h-4 w-4" aria-hidden="true" />
              <span>By : {blog.author}</span>
            </div>
          </div>
        </div>

        <article className="mx-auto mt-10 max-w-[1050px] px-4">
          <BlogArticleBody html={blog.bodyHtml} />
        </article>
      </section>

      <BlogRelatedArticles articles={relatedArticles} />
    </main>
  );
}
