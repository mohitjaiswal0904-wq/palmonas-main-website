'use client';

import { CmsCardContent } from '@/components/cms/shared/CmsCardContent';
import { CmsRuntimeClassSlot } from '@/components/cms/shared/CmsRuntimeClassSlot';
import { useCmsAction } from '@/hooks/useCmsAction';
import { useImageIntrinsicAspectRatio } from '@/hooks/useImageIntrinsicAspectRatio';
import { buildCmsCardClassName } from '@/lib/utils/cms-card-grid-content';
import { cn } from '@/lib/utils/cn';
import { getImageDimensionsFromRecord } from '@/lib/utils/image-aspect-ratio';
import type { CmsSectionCard } from '@/types/cms-section';

interface CmsCardProps {
  card: CmsSectionCard;
  isSwipeable?: boolean;
  sectionColumnClass?: string;
  widthClass?: string;
  /** Grid item wrapper already applies API `height` utilities. */
  fillOuterHeight?: boolean;
}

export function CmsCard({
  card,
  isSwipeable = false,
  sectionColumnClass,
  widthClass,
  fillOuterHeight = false,
}: CmsCardProps) {
  const runAction = useCmsAction();
  const intrinsicDimensions = getImageDimensionsFromRecord(card.metadata);
  const { aspectRatio, onImageLoad } = useImageIntrinsicAspectRatio(
    card.image_url,
    intrinsicDimensions,
  );

  const rootClass = buildCmsCardClassName(card, {
    isSwipeable,
    sectionColumnClass,
    widthClass,
  });

  const ariaLabel = card.paragraphs?.[0] ?? 'CMS card';
  const hasAction = Boolean(card.action_type && card.action_value);
  const styleNodeId = card.id ?? `cms-card-${card.paragraphs?.[0] ?? 'item'}`;

  const content = (
    <CmsCardContent
      card={card}
      aspectRatio={aspectRatio}
      onImageLoad={onImageLoad}
      styleNodeId={styleNodeId}
      fillOuterHeight={fillOuterHeight}
    />
  );

  if (hasAction) {
    return (
      <CmsRuntimeClassSlot
        as="button"
        nodeId={styleNodeId}
        className={cn(rootClass, 'cursor-pointer')}
        onClick={() => {
          runAction(card);
        }}
        aria-label={ariaLabel}
      >
        {content}
      </CmsRuntimeClassSlot>
    );
  }

  return (
    <CmsRuntimeClassSlot nodeId={styleNodeId} className={rootClass}>
      {content}
    </CmsRuntimeClassSlot>
  );
}
