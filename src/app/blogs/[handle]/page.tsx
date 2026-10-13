import type { Metadata } from 'next';

import { BlogPageContent } from '@/components/blog';
import { MainContentSkeleton } from '@/components/layout/PageChromeSkeleton';
import { StreamingPageShell } from '@/components/layout/StreamingPageShell';
import { ResourceNotFound } from '@/components/ui/ResourceNotFound';
import { isAppError } from '@/lib/errors';
import { buildMetadata } from '@/lib/seo/build-metadata';
import { getBlogArticles, getBlogByHandle } from '@/services/server/blog.service.server';
import type { BlogArticle, BlogArticleDetail } from '@/types/blog';

interface BlogDetailPageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { handle } = await params;

  try {
    const article = await getBlogByHandle(handle);

    return buildMetadata({
      title: article.title,
      description: article.excerpt || article.title,
      path: `/blogs/${handle}`,
      ogImage: article.imageUrl,
    });
  } catch {
    return buildMetadata({
      title: 'Article not found',
      path: `/blogs/${handle}`,
      noIndex: true,
    });
  }
}

async function BlogDetailPageBody({ params }: BlogDetailPageProps) {
  const { handle } = await params;
  let article: BlogArticleDetail | undefined;
  let relatedArticles: BlogArticle[] = [];
  let isNotFound = false;

  try {
    const [fetchedArticle, relatedResponse] = await Promise.all([
      getBlogByHandle(handle),
      getBlogArticles({ page: 1, limit: 5, publishedOnly: true }).catch(() => null),
    ]);

    article = fetchedArticle;
    relatedArticles =
      relatedResponse?.articles.filter((item) => item.handle !== handle).slice(0, 4) ?? [];
  } catch (err) {
    if (isAppError(err) && err.code === 'NOT_FOUND') {
      isNotFound = true;
    } else {
      throw err;
    }
  }

  if (isNotFound) {
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
    <BlogPageContent handle={handle} initialArticle={article} relatedArticles={relatedArticles} />
  );
}

export default function BlogDetailPage(props: BlogDetailPageProps) {
  return (
    <StreamingPageShell mainFallback={<MainContentSkeleton ariaLabel="Loading article" />}>
      <BlogDetailPageBody {...props} />
    </StreamingPageShell>
  );
}
