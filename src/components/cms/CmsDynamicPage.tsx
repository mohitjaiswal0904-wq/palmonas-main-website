import { CmsPageBody } from '@/components/cms/CmsPageBody';
import { MainContentSkeleton } from '@/components/layout/PageChromeSkeleton';
import { StreamingPageShell } from '@/components/layout/StreamingPageShell';
import { ResourceNotFound } from '@/components/ui/ResourceNotFound';
import { cmsPageRouteMap } from '@/config/cms-pages.config';
import { getFirstShellChunkId, hasShellChunks } from '@/lib/utils/cms-page-shell';
import { getCmsPageChunk, getCmsPageShell } from '@/services/server/cms-page.service.server';
import type { CmsPageShellResponse } from '@/types/cms-page';

interface CmsDynamicPageProps {
  slug: string;
}

function CmsPageUnavailable({ slug }: { slug: string }) {
  const isHome = slug === cmsPageRouteMap.home;

  return (
    <main>
      <ResourceNotFound
        title={isHome ? 'Homepage unavailable' : 'Page unavailable'}
        description="This page could not be loaded from the CMS. The route exists, but content may not be published yet."
        ctaHref="/"
        ctaLabel="Back to home"
      />
    </main>
  );
}

async function CmsDynamicPageMain({ slug }: { slug: string }) {
  let shell: CmsPageShellResponse;

  try {
    shell = await getCmsPageShell(slug);
  } catch {
    return <CmsPageUnavailable slug={slug} />;
  }

  if (!hasShellChunks(shell)) {
    return (
      <main>
        <CmsPageBody slug={slug} shell={shell} initialSections={[]} />
      </main>
    );
  }

  const firstChunkId = getFirstShellChunkId(shell);

  if (firstChunkId === null) {
    return (
      <main>
        <CmsPageBody slug={slug} shell={shell} initialSections={[]} />
      </main>
    );
  }

  let firstChunk;

  try {
    firstChunk = await getCmsPageChunk(slug, firstChunkId);
  } catch {
    return <CmsPageUnavailable slug={slug} />;
  }

  return (
    <main>
      <CmsPageBody
        slug={slug}
        shell={shell}
        initialChunkId={firstChunkId}
        initialSections={firstChunk.sections}
      />
    </main>
  );
}

/**
 * CMS named page — chrome streams ahead of shell/chunk so loaders show immediately.
 */
export function CmsDynamicPage({ slug }: CmsDynamicPageProps) {
  return (
    <StreamingPageShell mainFallback={<MainContentSkeleton ariaLabel="Loading page" />}>
      <CmsDynamicPageMain slug={slug} />
    </StreamingPageShell>
  );
}
