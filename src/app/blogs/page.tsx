import type { Metadata } from 'next';

import { BlogListPageContent } from '@/components/blog';
import { MainContentSkeleton } from '@/components/layout/PageChromeSkeleton';
import { StreamingPageShell } from '@/components/layout/StreamingPageShell';
import { BLOG_PAGE_SIZE } from '@/lib/constants';
import { buildMetadata } from '@/lib/seo/build-metadata';
import { getBlogArticles } from '@/services/server/blog.service.server';

export const metadata: Metadata = buildMetadata({
  title: 'Journal',
  path: '/blogs',
  description: 'Latest jewellery news, styling guides, and stories from Palmonas.',
});

async function BlogsPageBody() {
  const initialArticles = await getBlogArticles({
    page: 1,
    limit: BLOG_PAGE_SIZE,
    publishedOnly: true,
  }).catch(() => null);

  const heroImageUrl =
    'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/07/blog_banner-ffa92d84.jpg';

  return <BlogListPageContent initialArticles={initialArticles} heroImageUrl={heroImageUrl} />;
}

export default function BlogsPage() {
  return (
    <StreamingPageShell mainFallback={<MainContentSkeleton ariaLabel="Loading journal" />}>
      <BlogsPageBody />
    </StreamingPageShell>
  );
}
