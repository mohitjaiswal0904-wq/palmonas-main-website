import { notFound } from 'next/navigation';

import { DynamicSectionRenderer } from '@/components/cms/DynamicSectionRenderer';
import { MainContentSkeleton } from '@/components/layout/PageChromeSkeleton';
import { StreamingPageShell } from '@/components/layout/StreamingPageShell';
import { PolicyPageBody, buildPolicyPageMetadata } from '@/components/policy/StaticPolicyPage';
import { getPolicyPageBySlug } from '@/config/policy/policy-pages.config';
import { isAppError } from '@/lib/errors';
import { buildMetadata } from '@/lib/seo/build-metadata';
import { getPageSections } from '@/services/server/cms.service.server';
import type { CmsSection } from '@/types/cms';

interface CmsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CmsPageProps) {
  const { slug } = await params;
  const policyMeta = buildPolicyPageMetadata(slug);
  if (policyMeta) {
    return policyMeta;
  }

  return buildMetadata({
    title: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
    path: `/pages/${slug}`,
  });
}

async function CmsPageBody({ params }: CmsPageProps) {
  const { slug } = await params;
  const policyPage = getPolicyPageBySlug(slug);

  if (policyPage) {
    return <PolicyPageBody page={policyPage} />;
  }

  let sections: CmsSection[];

  try {
    sections = await getPageSections(slug);
  } catch (err) {
    if (isAppError(err) && err.code === 'NOT_FOUND') {
      notFound();
    }

    throw err;
  }

  if (sections.length === 0) {
    notFound();
  }

  return (
    <main>
      <DynamicSectionRenderer sections={sections} />
    </main>
  );
}

export default function CmsPage(props: CmsPageProps) {
  return (
    <StreamingPageShell mainFallback={<MainContentSkeleton ariaLabel="Loading page" />}>
      <CmsPageBody {...props} />
    </StreamingPageShell>
  );
}
