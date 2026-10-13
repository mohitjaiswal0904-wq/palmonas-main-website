import { MainContentSkeleton } from '@/components/layout/PageChromeSkeleton';
import { StreamingPageShell } from '@/components/layout/StreamingPageShell';
import { PolicyPageContent } from '@/components/policy/PolicyPageContent';
import { getPolicyPageBySlug } from '@/config/policy/policy-pages.config';
import { buildMetadata } from '@/lib/seo/build-metadata';
import type { PolicyPageDefinition } from '@/types/policy/policy.types';

interface PolicyPageBodyProps {
  page: PolicyPageDefinition;
}

/** Main content column for a static policy page. */
export function PolicyPageBody({ page }: PolicyPageBodyProps) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:py-12">
      <PolicyPageContent content={page.content} />
    </main>
  );
}

interface StaticPolicyPageProps {
  slug: string;
}

/**
 * Server wrapper for static `/pages/{slug}` policy routes with site chrome.
 */
export function StaticPolicyPage({ slug }: StaticPolicyPageProps) {
  const page = getPolicyPageBySlug(slug);
  if (!page) {
    return null;
  }

  return (
    <StreamingPageShell mainFallback={<MainContentSkeleton ariaLabel="Loading page" />}>
      <PolicyPageBody page={page} />
    </StreamingPageShell>
  );
}

/**
 * Builds SEO metadata for a static policy page slug.
 *
 * @param slug - Path segment after `/pages/`.
 */
export function buildPolicyPageMetadata(slug: string) {
  const page = getPolicyPageBySlug(slug);
  if (!page) {
    return null;
  }

  return buildMetadata({
    title: page.content.pageTitle,
    path: slug === 'faq' ? '/pages/faqs' : `/pages/${slug}`,
    description: page.metaDescription,
  });
}
