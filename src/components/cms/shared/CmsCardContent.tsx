'use client';

/* eslint-disable @next/next/no-img-element -- CMS media uses arbitrary CDN URLs */

import type { ReactNode, SyntheticEvent } from 'react';

import { CmsRuntimeClassSlot } from '@/components/cms/shared/CmsRuntimeClassSlot';
import { sanitizeBuilderAssetUrl } from '@/lib/utils/cms-builder';
import {
  CARD_GRID_DEFAULTS,
  getCardGridContentType,
  getCardDimensionClassName,
  getCardImageStyle,
  innerImageRoundingFromWrapper,
  pickTailwindSlot,
  resolveCardImageWrapperClass,
} from '@/lib/utils/cms-card-grid-content';
import { cn } from '@/lib/utils/cn';
import type { CmsSectionCard } from '@/types/cms-section';

interface CmsCardContentProps {
  card: CmsSectionCard;
  aspectRatio?: string;
  onImageLoad?: (event: SyntheticEvent<HTMLImageElement>) => void;
  styleNodeId?: string;
  fillOuterHeight?: boolean;
}

interface CmsCardImageProps {
  card: CmsSectionCard;
  wrapperClass: string;
  objectFit: 'contain' | 'cover';
  aspectRatio?: string;
  onImageLoad?: (event: SyntheticEvent<HTMLImageElement>) => void;
  styleNodeId: string;
  fillOuterHeight?: boolean;
}

function CmsCardImage({
  card,
  wrapperClass,
  objectFit,
  aspectRatio,
  onImageLoad,
  styleNodeId,
}: CmsCardImageProps) {
  if (!card.image_url) {
    return null;
  }

  const imageInnerRounding = innerImageRoundingFromWrapper(wrapperClass);
  const alt = card.paragraphs?.[0]?.trim() || 'Category';
  const dimensionClassName = getCardDimensionClassName(card, wrapperClass);
  const imageStyle = getCardImageStyle({
    aspectRatio,
    height: card.height,
    className: dimensionClassName,
  });

  return (
    <CmsRuntimeClassSlot
      nodeId={`${styleNodeId}-image`}
      className={wrapperClass}
      style={imageStyle}
    >
      <img
        src={sanitizeBuilderAssetUrl(card.image_url)}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={onImageLoad}
        className={cn(
          CARD_GRID_DEFAULTS.image,
          objectFit === 'contain' ? 'object-contain' : 'object-cover',
          imageInnerRounding,
        )}
      />
    </CmsRuntimeClassSlot>
  );
}

function CmsCardParagraphs({ card, styleNodeId }: { card: CmsSectionCard; styleNodeId: string }) {
  if (!card.paragraphs || card.paragraphs.length === 0) {
    return null;
  }

  const tw = card.tailwind_class_names;
  const contentClass = pickTailwindSlot(CARD_GRID_DEFAULTS.content, tw?.content);

  return (
    <CmsRuntimeClassSlot nodeId={`${styleNodeId}-content`} className={contentClass}>
      {card.paragraphs.map((paragraph, index) => {
        const slotClass =
          index === 0
            ? pickTailwindSlot(CARD_GRID_DEFAULTS.title, tw?.title)
            : pickTailwindSlot(CARD_GRID_DEFAULTS.paragraph, tw?.paragraph);
        const paragraphNodeId =
          index === 0 ? `${styleNodeId}-title` : `${styleNodeId}-paragraph-${index}`;

        return (
          <CmsRuntimeClassSlot
            key={`${card.id ?? 'card'}-${index}`}
            as="p"
            nodeId={paragraphNodeId}
            className={cn(
              slotClass,
              index > 0 && card.show_divider ? 'border-t border-stone-200 pt-2' : undefined,
            )}
          >
            {paragraph}
          </CmsRuntimeClassSlot>
        );
      })}
    </CmsRuntimeClassSlot>
  );
}

function renderDefaultCard(
  card: CmsSectionCard,
  aspectRatio: string | undefined,
  styleNodeId: string,
  onImageLoad?: (event: SyntheticEvent<HTMLImageElement>) => void,
  fillOuterHeight?: boolean,
): ReactNode {
  const imageWrapperClass = resolveCardImageWrapperClass(
    card,
    CARD_GRID_DEFAULTS.imageWrapperDefault,
    { fillOuterHeight },
  );

  return (
    <div className={CARD_GRID_DEFAULTS.cardRoot}>
      <CmsCardImage
        card={card}
        wrapperClass={imageWrapperClass}
        objectFit="cover"
        aspectRatio={aspectRatio}
        onImageLoad={onImageLoad}
        styleNodeId={styleNodeId}
      />
      <CmsCardParagraphs card={card} styleNodeId={styleNodeId} />
    </div>
  );
}

function renderImageOnlyCard(
  card: CmsSectionCard,
  aspectRatio: string | undefined,
  styleNodeId: string,
  onImageLoad?: (event: SyntheticEvent<HTMLImageElement>) => void,
  fillOuterHeight?: boolean,
): ReactNode {
  if (!card.image_url) {
    return null;
  }

  const imageWrapperClass = resolveCardImageWrapperClass(
    card,
    CARD_GRID_DEFAULTS.imageWrapperImageOnly,
    { fillOuterHeight },
  );

  return (
    <div className={CARD_GRID_DEFAULTS.cardRoot}>
      <CmsCardImage
        card={card}
        wrapperClass={imageWrapperClass}
        objectFit="cover"
        aspectRatio={aspectRatio}
        onImageLoad={onImageLoad}
        styleNodeId={styleNodeId}
      />
      <CmsCardParagraphs card={card} styleNodeId={styleNodeId} />
    </div>
  );
}

function renderTextOnlyCard(card: CmsSectionCard, styleNodeId: string): ReactNode {
  if (!card.paragraphs || card.paragraphs.length === 0) {
    return null;
  }

  return <CmsCardParagraphs card={card} styleNodeId={styleNodeId} />;
}

function renderImageTextCard(
  card: CmsSectionCard,
  aspectRatio: string | undefined,
  styleNodeId: string,
  onImageLoad?: (event: SyntheticEvent<HTMLImageElement>) => void,
  fillOuterHeight?: boolean,
): ReactNode {
  const imageWrapperClass = resolveCardImageWrapperClass(
    card,
    CARD_GRID_DEFAULTS.imageWrapperDefault,
    { fillOuterHeight },
  );

  return (
    <div className={CARD_GRID_DEFAULTS.cardRoot}>
      <CmsCardImage
        card={card}
        wrapperClass={imageWrapperClass}
        objectFit="cover"
        aspectRatio={aspectRatio}
        onImageLoad={onImageLoad}
        styleNodeId={styleNodeId}
      />
      <CmsCardParagraphs card={card} styleNodeId={styleNodeId} />
    </div>
  );
}

export function CmsCardContent({
  card,
  aspectRatio,
  onImageLoad,
  styleNodeId = card.id ?? 'cms-card',
  fillOuterHeight = false,
}: CmsCardContentProps) {
  const cardType = getCardGridContentType(card);

  switch (cardType) {
    case 'image-only':
      return renderImageOnlyCard(card, aspectRatio, styleNodeId, onImageLoad, fillOuterHeight);
    case 'text-only':
      return renderTextOnlyCard(card, styleNodeId);
    case 'image-text':
      return renderImageTextCard(card, aspectRatio, styleNodeId, onImageLoad, fillOuterHeight);
    case 'default':
    default:
      return renderDefaultCard(card, aspectRatio, styleNodeId, onImageLoad, fillOuterHeight);
  }
}
