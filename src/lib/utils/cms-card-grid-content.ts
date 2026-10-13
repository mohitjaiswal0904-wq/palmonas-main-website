import type { CSSProperties } from 'react';

import {
  HORIZONTAL_SCROLL_PASS_VERTICAL,
  HORIZONTAL_SCROLLBAR_HIDDEN,
} from '@/lib/layout/horizontal-scroll';
import { cn } from '@/lib/utils/cn';
import type { CmsSectionCard } from '@/types/cms-section';

export const CARD_GRID_CONTENT_TYPES = [
  'default',
  'image-only',
  'text-only',
  'image-text',
] as const;

export type CardGridContentType = (typeof CARD_GRID_CONTENT_TYPES)[number];

/**
 * Shared card-grid slot classes.
 * `gridSwipeable` keeps horizontal breathing space for curated-metal and demifine collection carousels.
 */
export const CARD_GRID_DEFAULTS = {
  cardRoot: 'flex w-full flex-col items-center gap-2.5',
  imageWrapperDefault: 'w-full overflow-hidden bg-white',
  imageWrapperImageOnly: 'w-full overflow-hidden bg-white',
  image: 'h-full w-full object-cover',
  content: 'flex w-full flex-col items-center gap-0.5 text-center',
  title: 'text-base font-normal text-stone-950 laptop:text-xl',
  paragraph: 'text-sm font-normal text-stone-600',
  columnFixed: '',
  columnSwipeable: 'shrink-0 snap-start',
  gridFixed: 'flex flex-wrap justify-start gap-8 tab:justify-center',
  /**
   * Scrollport for swipeable card grids.
   * Centering lives on `gridSwipeableTrack` so overflow extends to the right only.
   */
  gridSwipeable: cn(
    'mx-3 w-full min-w-0 overflow-x-auto snap-x snap-mandatory',
    HORIZONTAL_SCROLLBAR_HIDDEN,
    HORIZONTAL_SCROLL_PASS_VERTICAL,
  ),
  /** Centers cards when they fit; grows with content so extra cards overflow to the right. */
  gridSwipeableTrack: 'flex w-max min-w-full flex-nowrap justify-center gap-3',
  wrapper: 'w-full pt-0',
} as const;

function isCardGridContentType(value: string): value is CardGridContentType {
  return CARD_GRID_CONTENT_TYPES.includes(value as CardGridContentType);
}

/**
 * Merge CMS slot utilities onto defaults.
 * Empty override keeps the default; non-empty override is additive (`cn`).
 *
 * @param defaultClass - Built-in layout utilities for the slot
 * @param override - Optional CMS `tailwind_class_names` value
 * @returns Combined class string
 */
export function pickTailwindSlot(defaultClass: string, override?: string): string {
  const trimmed = override?.trim();

  return trimmed ? cn(defaultClass, trimmed) : defaultClass;
}

export function innerImageRoundingFromWrapper(wrapperClass: string): string {
  return wrapperClass
    .split(/\s+/)
    .filter((token) => token.startsWith('rounded'))
    .join(' ');
}

export function getCardGridContentType(card: CmsSectionCard): CardGridContentType {
  if (card.variant && isCardGridContentType(card.variant)) {
    return card.variant;
  }

  const explicitType =
    (typeof card.card_type === 'string' ? card.card_type : undefined) ??
    (typeof card.metadata?.card_type === 'string' ? card.metadata.card_type : undefined);

  if (explicitType && isCardGridContentType(explicitType)) {
    return explicitType;
  }

  const hasImage = Boolean(card.image_url?.trim());
  const hasText = Boolean(card.paragraphs?.some((paragraph) => paragraph.trim().length > 0));

  if (hasImage && !hasText) {
    return 'image-only';
  }

  if (!hasImage && hasText) {
    return 'text-only';
  }

  return 'default';
}

export function parseCardSizeToCss(
  size: string | undefined,
  viewportWidth?: number,
): string | undefined {
  if (!size?.trim() || size.trim() === 'auto') {
    return undefined;
  }

  const trimmed = size.trim();

  if (trimmed.endsWith('vw') || trimmed.endsWith('%')) {
    return trimmed;
  }

  if (trimmed.endsWith('px')) {
    return trimmed;
  }

  if (viewportWidth) {
    const numericValue = parseInt(trimmed, 10);
    if (!Number.isNaN(numericValue)) {
      return `${numericValue}px`;
    }
  }

  const numericValue = parseInt(trimmed, 10);
  if (!Number.isNaN(numericValue)) {
    return `${numericValue}px`;
  }

  return undefined;
}

/**
 * Whether a CMS class string already defines width utilities (including responsive).
 *
 * @param className - Tailwind-like class string
 * @returns True when width should come from runtime CSS, not forced inline `width: 100%`
 */
export function classNameHasWidthUtility(className: string | undefined): boolean {
  if (!className) {
    return false;
  }

  return /(?:^|\s)(?:(?:mobile|tab|laptop|desktop):)?(?:!)?(?:min-|max-)?w-/.test(className);
}

/**
 * Whether a CMS class string already defines height utilities (including responsive).
 *
 * @param className - Tailwind-like class string
 * @returns True when height should come from runtime CSS, not forced inline height / aspect-ratio
 */
export function classNameHasHeightUtility(className: string | undefined): boolean {
  if (!className) {
    return false;
  }

  return /(?:^|\s)(?:(?:mobile|tab|laptop|desktop):)?(?:!)?(?:min-|max-)?h-/.test(className);
}

/**
 * Combines card + image slot classes for dimension conflict checks.
 *
 * @param card - CMS card payload
 * @param imageWrapperClass - Resolved image wrapper utilities
 * @returns Merged class string used to detect authored width/height utilities
 */
export function getCardDimensionClassName(card: CmsSectionCard, imageWrapperClass: string): string {
  const cardClass =
    card.tailwind_class_names?.card?.trim() ?? card.tailwind_class_names?.root?.trim() ?? '';

  return cn(cardClass, imageWrapperClass);
}

/**
 * Resolve image wrapper classes, filling the card when height is set on the card slot only.
 *
 * @param card - CMS card payload
 * @param defaultClass - Built-in image wrapper utilities
 * @param options - When `fillOuterHeight`, stretch image inside a grid item sized by API height
 * @returns Wrapper class string for `CmsRuntimeClassSlot`
 */
export function resolveCardImageWrapperClass(
  card: CmsSectionCard,
  defaultClass: string,
  options?: { fillOuterHeight?: boolean },
): string {
  const tw = card.tailwind_class_names;
  const imageClass = pickTailwindSlot(defaultClass, tw?.image);
  const hasImageHeight = classNameHasHeightUtility(imageClass);
  const hasCardHeight = classNameHasHeightUtility(
    card.tailwind_class_names?.card ?? card.tailwind_class_names?.root,
  );

  if (hasImageHeight) {
    return imageClass;
  }

  if (hasCardHeight || options?.fillOuterHeight) {
    return cn(imageClass, 'h-full');
  }

  return imageClass;
}

export function getCardImageStyle(options: {
  aspectRatio?: string;
  height?: string;
  viewportWidth?: number;
  /** When the slot already has `w-*` / `tab:w-*`, skip forcing `width: 100%`. */
  className?: string;
}): CSSProperties {
  const explicitHeight = parseCardSizeToCss(options.height, options.viewportWidth);
  const hasWidthUtility = classNameHasWidthUtility(options.className);
  const hasHeightUtility = classNameHasHeightUtility(options.className);
  const widthStyle: CSSProperties = hasWidthUtility ? {} : { width: '100%' };

  if (explicitHeight && !hasHeightUtility) {
    return { ...widthStyle, height: explicitHeight };
  }

  // Known intrinsic ratio only — skip when CMS height utilities or explicit height control layout.
  if (options.aspectRatio && !hasHeightUtility && !explicitHeight) {
    return { ...widthStyle, aspectRatio: options.aspectRatio };
  }

  return widthStyle;
}

export function buildCmsCardClassName(
  card: CmsSectionCard,
  options: {
    widthClass?: string;
    isSwipeable?: boolean;
    sectionColumnClass?: string;
  } = {},
): string {
  const tw = card.tailwind_class_names;
  const columnBase = options.isSwipeable
    ? CARD_GRID_DEFAULTS.columnSwipeable
    : CARD_GRID_DEFAULTS.columnFixed;
  const columnPart = pickTailwindSlot(columnBase, options.sectionColumnClass);
  const cardPart = tw?.card?.trim() || tw?.root?.trim() || '';
  const actionPart = tw?.action?.trim() || '';

  return cn(
    'h-full w-full text-left transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400',
    columnPart,
    cardPart,
    actionPart,
    options.widthClass,
  );
}

export function getCardImageObjectFit(_cardType: CardGridContentType): 'contain' | 'cover' {
  return 'cover';
}
