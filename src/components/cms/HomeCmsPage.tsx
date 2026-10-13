import { Suspense } from 'react';

import { CmsPageBody } from '@/components/cms/CmsPageBody';
import { HomeCmsPageContent } from '@/components/home/HomeCmsPageContent';
import { HomePageSkeleton } from '@/components/home/HomePageSkeleton';
import { ResourceNotFound } from '@/components/ui/ResourceNotFound';
import { getFirstShellChunkId, hasShellChunks } from '@/lib/utils/cms-page-shell';
import {
  getHomePageCmsSlug,
  resolveHomePageCategory,
  getHomePageCategorySearchParam,
} from '@/lib/utils/home-page-category';
import { getCmsPageChunk, getCmsPageShell } from '@/services/server/cms-page.service.server';
import type { CmsPageShellResponse } from '@/types/cms-page';

interface HomeCmsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function HomeCmsMainUnavailable() {
  return (
    <main>
      <ResourceNotFound
        title="Homepage unavailable"
        description="This page could not be loaded from the CMS. The route exists, but content may not be published yet."
        ctaHref="/"
        ctaLabel="Back to home"
      />
    </main>
  );
}

async function HomeCmsMain({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const activeCategory = resolveHomePageCategory(getHomePageCategorySearchParam(params));
  const slug = getHomePageCmsSlug(activeCategory);
  let shell: CmsPageShellResponse;

  try {
    shell = await getCmsPageShell(slug);
  } catch {
    return <HomeCmsMainUnavailable />;
  }

  if (!hasShellChunks(shell)) {
    return (
      <main>
        <HomeCmsPageContent activeCategory={activeCategory}>
          <CmsPageBody key={slug} slug={slug} shell={shell} initialSections={[]} />
        </HomeCmsPageContent>
      </main>
    );
  }

  const firstChunkId = getFirstShellChunkId(shell);

  if (firstChunkId === null) {
    return (
      <main>
        <HomeCmsPageContent activeCategory={activeCategory}>
          <CmsPageBody key={slug} slug={slug} shell={shell} initialSections={[]} />
        </HomeCmsPageContent>
      </main>
    );
  }

  let firstChunk;

  try {
    firstChunk = await getCmsPageChunk(slug, firstChunkId);
  } catch {
    return <HomeCmsMainUnavailable />;
  }

  return (
    <main>
      <HomeCmsPageContent activeCategory={activeCategory}>
        <CmsPageBody
          key={slug}
          slug={slug}
          shell={shell}
          initialChunkId={firstChunkId}
          initialSections={firstChunk.sections}
        />
      </HomeCmsPageContent>
    </main>
  );
}

/**
 * Home page composition with a page-level Suspense around CMS IO.
 * A layout Suspense is too high for Cache Components instant-nav — `/` then
 * blocks on `getCmsPageShell` instead of streaming the shell.
 */
export function HomeCmsPage({ searchParams }: HomeCmsPageProps) {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomeCmsMain searchParams={searchParams} />
    </Suspense>
  );
}
