'use client';

import { DynamicSectionRenderer } from '@/components/cms/DynamicSectionRenderer';
import { CMS_SECTION_CLASS } from '@/components/cms/cms-section-layout';
import { Loader } from '@/components/ui/Loader';
import { ResourceNotFound } from '@/components/ui/ResourceNotFound';
import { useCmsPage } from '@/hooks/useCms';

interface CmsPageContentProps {
  slug: string;
}

export function CmsPageContent({ slug }: CmsPageContentProps) {
  const { sections, isLoading, error } = useCmsPage(slug);

  if (isLoading) {
    return (
      <main className={`${CMS_SECTION_CLASS} flex justify-center`}>
        <Loader />
      </main>
    );
  }

  if (error?.code === 'NOT_FOUND' || !sections) {
    return (
      <ResourceNotFound
        title="Page not found"
        description="This page may have been moved or is no longer available."
        ctaHref="/"
        ctaLabel="Back to home"
      />
    );
  }

  return (
    <main>
      <DynamicSectionRenderer sections={sections} />
    </main>
  );
}
