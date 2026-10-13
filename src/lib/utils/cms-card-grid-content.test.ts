import {
  buildCmsCardClassName,
  CARD_GRID_DEFAULTS,
  classNameHasHeightUtility,
  getCardGridContentType,
  getCardImageObjectFit,
  getCardImageStyle,
  innerImageRoundingFromWrapper,
  parseCardSizeToCss,
  pickTailwindSlot,
  resolveCardImageWrapperClass,
} from '@/lib/utils/cms-card-grid-content';
import type { CmsSectionCard } from '@/types/cms-section';

describe('pickTailwindSlot', () => {
  it('merges the override onto the default when provided', () => {
    expect(pickTailwindSlot('default-class', 'override-class')).toBe(
      'default-class override-class',
    );
  });

  it('falls back to the default when override is empty', () => {
    expect(pickTailwindSlot('default-class', '   ')).toBe('default-class');
    expect(pickTailwindSlot('default-class')).toBe('default-class');
  });

  it('keeps layout defaults when CMS sends additive image utilities', () => {
    expect(
      pickTailwindSlot(CARD_GRID_DEFAULTS.imageWrapperDefault, 'w-full overflow-hidden mb-2'),
    ).toContain('overflow-hidden');
    expect(
      pickTailwindSlot(CARD_GRID_DEFAULTS.imageWrapperDefault, 'w-full overflow-hidden mb-2'),
    ).toContain('mb-2');
  });
});

describe('innerImageRoundingFromWrapper', () => {
  it('extracts rounded classes from the wrapper', () => {
    expect(innerImageRoundingFromWrapper('w-full overflow-hidden rounded-xl rounded-t-lg')).toBe(
      'rounded-xl rounded-t-lg',
    );
  });
});

describe('getCardGridContentType', () => {
  it('respects explicit card_type values', () => {
    const card: CmsSectionCard = {
      card_type: 'image-text',
      image_url: 'https://cdn.example.com/a.webp',
      paragraphs: ['Title'],
    };

    expect(getCardGridContentType(card)).toBe('image-text');
  });

  it('derives image-only and text-only cards from content', () => {
    expect(
      getCardGridContentType({
        image_url: 'https://cdn.example.com/a.webp',
      }),
    ).toBe('image-only');

    expect(
      getCardGridContentType({
        paragraphs: ['Only text'],
      }),
    ).toBe('text-only');
  });

  it('maps image + text to default unless variant is a content type', () => {
    expect(
      getCardGridContentType({
        image_url: 'https://cdn.example.com/a.webp',
        paragraphs: ['Title', 'Subtitle'],
      }),
    ).toBe('default');

    expect(
      getCardGridContentType({
        variant: 'image-text',
        image_url: 'https://cdn.example.com/a.webp',
        paragraphs: ['Title'],
      }),
    ).toBe('image-text');
  });

  it('uses variant as the card content type when it matches', () => {
    expect(
      getCardGridContentType({
        variant: 'image-only',
        image_url: 'https://cdn.example.com/a.webp',
        paragraphs: ['Ignored'],
      }),
    ).toBe('image-only');
  });
});

describe('getCardImageObjectFit', () => {
  it('uses cover for all card types to match category tile imagery', () => {
    expect(getCardImageObjectFit('default')).toBe('cover');
    expect(getCardImageObjectFit('image-text')).toBe('cover');
    expect(getCardImageObjectFit('image-only')).toBe('cover');
  });
});

describe('CARD_GRID_DEFAULTS', () => {
  it('defines the expected layout slots', () => {
    expect(CARD_GRID_DEFAULTS.cardRoot).toContain('flex-col');
    expect(CARD_GRID_DEFAULTS.content).toContain('flex-col');
  });
});

describe('buildCmsCardClassName', () => {
  it('merges column, card, action, and width classes from CMS tailwind slots', () => {
    const className = buildCmsCardClassName(
      {
        tailwind_class_names: {
          card: 'rounded-xl bg-white shadow-sm',
          action: 'cursor-pointer',
        },
      },
      {
        isSwipeable: true,
        sectionColumnClass: 'px-2',
        widthClass: 'w-[48%]',
      },
    );

    expect(className).toContain('px-2');
    expect(className).toContain('rounded-xl');
    expect(className).toContain('cursor-pointer');
    expect(className).toContain('w-[48%]');
  });
});

describe('getCardImageStyle', () => {
  it('prefers explicit height, then known aspect ratio, otherwise width only', () => {
    expect(getCardImageStyle({ height: '240px' })).toEqual({
      width: '100%',
      height: '240px',
    });

    expect(getCardImageStyle({ aspectRatio: '4 / 3' })).toEqual({
      width: '100%',
      aspectRatio: '4 / 3',
    });

    expect(getCardImageStyle({})).toEqual({
      width: '100%',
    });

    expect(getCardImageStyle({ height: 'auto' })).toEqual({
      width: '100%',
    });
  });

  it('does not force width when the slot already has w-* utilities', () => {
    expect(
      getCardImageStyle({
        className: 'overflow-hidden w-[76vw] tab:w-[50vw] laptop:w-[30vw]',
      }),
    ).toEqual({});
  });

  it('does not force aspect ratio when the slot already has h-* utilities', () => {
    expect(
      getCardImageStyle({
        aspectRatio: '900 / 1200',
        className: 'h-[78vw] tab:h-[49vw] laptop:h-[29vw]',
      }),
    ).toEqual({ width: '100%' });
  });

  it('detects responsive height utilities on card and image slots', () => {
    expect(classNameHasHeightUtility('h-[78vw] tab:h-[49vw] laptop:h-[29vw]')).toBe(true);
    expect(classNameHasHeightUtility('w-[55vw] overflow-hidden')).toBe(false);
  });
});

describe('resolveCardImageWrapperClass', () => {
  it('adds h-full when height is on the card slot but not the image slot', () => {
    const className = resolveCardImageWrapperClass(
      {
        tailwind_class_names: {
          card: 'h-[78vw] tab:h-[49vw] laptop:h-[29vw]',
          image: 'w-full overflow-hidden',
        },
      },
      CARD_GRID_DEFAULTS.imageWrapperDefault,
    );

    expect(className).toContain('h-full');
    expect(className).not.toContain('h-[78vw]');
  });

  it('keeps authored image height utilities as-is', () => {
    const className = resolveCardImageWrapperClass(
      {
        tailwind_class_names: {
          image: 'w-[55vw] h-[78vw] tab:h-[49vw] laptop:h-[29vw]',
        },
      },
      CARD_GRID_DEFAULTS.imageWrapperDefault,
    );

    expect(className).toContain('h-[78vw]');
    expect(className).not.toContain('h-full');
  });
});

describe('parseCardSizeToCss', () => {
  it('keeps vw and percent units as CSS values', () => {
    expect(parseCardSizeToCss('32vw')).toBe('32vw');
    expect(parseCardSizeToCss('50%')).toBe('50%');
  });
});
