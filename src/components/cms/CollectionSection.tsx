'use client';

import { CmsEmbeddedExtras } from '@/components/cms/shared/CmsEmbeddedExtras';
import { CmsMedia } from '@/components/cms/shared/CmsMedia';
import { CmsProductGrid } from '@/components/cms/shared/CmsProductGrid';
import { CmsSectionHeader, CmsSectionShell } from '@/components/cms/shared/CmsSectionShell';
import { getSectionContentRecord, getSectionDisplayTitle } from '@/lib/utils/cms-content';
import { resolveMediaUrl } from '@/lib/utils/cms-media';
import { getCollectionHandle, transformCollectionProducts } from '@/lib/utils/cms-products';
import type { CmsSection } from '@/types/cms';

interface CollectionSectionProps {
  section: CmsSection;
}

export function CollectionSection({ section }: CollectionSectionProps) {
  const content = getSectionContentRecord(section);
  const handle = getCollectionHandle(content);
  const title = getSectionDisplayTitle(section);
  const products = transformCollectionProducts(content.products);
  const productsPerRow = typeof content.productsPerRow === 'number' ? content.productsPerRow : 4;
  const mediaUrl = resolveMediaUrl(content);
  const showViewAll = content.showViewAll !== false;

  if (products.length === 0) {
    return null;
  }

  return (
    <CmsSectionShell section={section}>
      <CmsSectionHeader title={title} />
      {mediaUrl ? (
        <CmsMedia
          url={mediaUrl}
          mediaType={typeof content.mediaType === 'string' ? content.mediaType : undefined}
          alt={title}
          className="rounded-palmonas-md aspect-[21/9] w-full"
        />
      ) : null}
      <CmsProductGrid
        products={products}
        columns={productsPerRow}
        collectionHandle={handle ?? undefined}
        viewAllHref={showViewAll && handle ? `/collections/${handle}` : undefined}
      />
      <CmsEmbeddedExtras content={content} />
    </CmsSectionShell>
  );
}
