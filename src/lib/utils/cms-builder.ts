import type { CSSProperties, ElementType } from 'react';

import type { CmsBuilderNode, CmsBuilderNodeProps } from '@/types/cms-builder';

type BuilderBreakpoint = 'mobile' | 'tab' | 'laptop' | 'desktop';

interface BuilderResponsiveStyleRule {
  breakpoint: BuilderBreakpoint;
  property: string;
  value: string;
  important?: boolean;
}

interface BuilderBaseStyleRule {
  property: string;
  value: string;
}

const BUILDER_CSS_TO_REACT: Record<string, keyof CSSProperties> = {
  'align-items': 'alignItems',
  'aspect-ratio': 'aspectRatio',
  'background-color': 'backgroundColor',
  'color': 'color',
  'column-gap': 'columnGap',
  'display': 'display',
  'flex-direction': 'flexDirection',
  'flex-wrap': 'flexWrap',
  'font-size': 'fontSize',
  'font-weight': 'fontWeight',
  'gap': 'gap',
  'height': 'height',
  'justify-content': 'justifyContent',
  'margin': 'margin',
  'margin-bottom': 'marginBottom',
  'margin-left': 'marginLeft',
  'margin-right': 'marginRight',
  'margin-top': 'marginTop',
  'max-height': 'maxHeight',
  'max-width': 'maxWidth',
  'min-height': 'minHeight',
  'min-width': 'minWidth',
  'overflow': 'overflow',
  'padding': 'padding',
  'padding-bottom': 'paddingBottom',
  'padding-left': 'paddingLeft',
  'padding-right': 'paddingRight',
  'padding-top': 'paddingTop',
  'row-gap': 'rowGap',
  'text-align': 'textAlign',
  'width': 'width',
};

const BUILDER_BREAKPOINTS: Record<BuilderBreakpoint, string> = {
  mobile: '480px',
  tab: '768px',
  laptop: '1024px',
  desktop: '1280px',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseBuilderSpacingValue(token: string): string | null {
  if (token === 'px') {
    return '1px';
  }

  if (token.startsWith('[') && token.endsWith(']')) {
    return token.slice(1, -1).trim() || null;
  }

  if (/^-?\d*\.?\d+$/.test(token)) {
    const numeric = Number(token);

    if (!Number.isFinite(numeric)) {
      return null;
    }

    return numeric === 0 ? '0' : `${numeric * 0.25}rem`;
  }

  return null;
}

function parseBuilderDimensionValue(token: string, axis: 'width' | 'height'): string | null {
  if (token === 'full') {
    return '100%';
  }

  if (token === 'screen') {
    return axis === 'width' ? '100vw' : '100vh';
  }

  if (token === 'auto') {
    return 'auto';
  }

  if (token === 'fit') {
    return 'fit-content';
  }

  if (token === 'min') {
    return 'min-content';
  }

  if (token === 'max') {
    return 'max-content';
  }

  if (token.includes('/')) {
    const [numerator, denominator] = token.split('/').map(Number);

    if (
      numerator !== undefined &&
      denominator !== undefined &&
      Number.isFinite(numerator) &&
      Number.isFinite(denominator) &&
      denominator !== 0
    ) {
      return `${(numerator / denominator) * 100}%`;
    }
  }

  return parseBuilderSpacingValue(token);
}

function applyNegativeCssValue(value: string, isNegative: boolean): string {
  if (!isNegative || value === '0') {
    return value;
  }

  return value.startsWith('-') ? value : `-${value}`;
}

const BUILDER_MARGIN_PROPERTY_MAP = {
  m: ['margin'],
  mx: ['margin-left', 'margin-right'],
  my: ['margin-top', 'margin-bottom'],
  mt: ['margin-top'],
  mb: ['margin-bottom'],
  ml: ['margin-left'],
  mr: ['margin-right'],
} as const;

type BuilderMarginToken = keyof typeof BUILDER_MARGIN_PROPERTY_MAP;

/**
 * Parse Tailwind-like margin utilities authored in CMS builder className strings.
 *
 * @param token - Single class token (e.g. `-mt-[10vw]`, `tab:mb-[0vw]`)
 * @returns Margin sides + value, or null when the token is not a margin utility
 */
function parseBuilderMarginToken(token: string): {
  breakpoint?: BuilderBreakpoint;
  important?: boolean;
  properties: readonly string[];
  value: string;
} | null {
  const match = token.match(
    /^(?:(mobile|tab|laptop|desktop):)?(!)?(-)?(m|mx|my|mt|mb|ml|mr)-(.+)$/,
  );

  if (!match) {
    return null;
  }

  const [, breakpoint, importantMarker, negativeMarker, marginToken, rawValue] = match;

  if (!marginToken || !rawValue) {
    return null;
  }

  const properties = BUILDER_MARGIN_PROPERTY_MAP[marginToken as BuilderMarginToken];
  const parsedValue = parseBuilderSpacingValue(rawValue);

  if (!properties || !parsedValue) {
    return null;
  }

  return {
    breakpoint: breakpoint as BuilderBreakpoint | undefined,
    important: importantMarker === '!',
    properties,
    value: applyNegativeCssValue(parsedValue, negativeMarker === '-'),
  };
}

const BUILDER_PADDING_PROPERTY_MAP = {
  p: ['padding'],
  px: ['padding-left', 'padding-right'],
  py: ['padding-top', 'padding-bottom'],
  pt: ['padding-top'],
  pb: ['padding-bottom'],
  pl: ['padding-left'],
  pr: ['padding-right'],
} as const;

type BuilderPaddingToken = keyof typeof BUILDER_PADDING_PROPERTY_MAP;

/**
 * Parse Tailwind-like padding utilities from CMS className strings.
 *
 * @param token - Single class token (e.g. `pt-2`, `laptop:px-4`)
 * @returns Padding sides + value, or null when the token is not a padding utility
 */
function parseBuilderPaddingToken(token: string): {
  breakpoint?: BuilderBreakpoint;
  important?: boolean;
  properties: readonly string[];
  value: string;
} | null {
  const match = token.match(/^(?:(mobile|tab|laptop|desktop):)?(!)?(p|px|py|pt|pb|pl|pr)-(.+)$/);

  if (!match) {
    return null;
  }

  const [, breakpoint, importantMarker, paddingToken, rawValue] = match;

  if (!paddingToken || !rawValue) {
    return null;
  }

  const properties = BUILDER_PADDING_PROPERTY_MAP[paddingToken as BuilderPaddingToken];
  const parsedValue = parseBuilderSpacingValue(rawValue);

  if (!properties || !parsedValue) {
    return null;
  }

  return {
    breakpoint: breakpoint as BuilderBreakpoint | undefined,
    important: importantMarker === '!',
    properties,
    value: parsedValue,
  };
}

const BUILDER_TEXT_SIZE_VALUES: Record<string, string> = {
  'xs': '0.75rem',
  'sm': '0.875rem',
  'base': '1rem',
  'lg': '1.125rem',
  'xl': '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
};

/**
 * Parse Tailwind text-size utilities (`text-xs`, `laptop:text-xl`, `text-[14px]`).
 *
 * @param token - Single class token
 * @returns Font-size rule, or null when unmatched
 */
function parseBuilderTextSizeToken(token: string): {
  breakpoint?: BuilderBreakpoint;
  important?: boolean;
  value: string;
} | null {
  const bracketMatch = token.match(/^(?:(mobile|tab|laptop|desktop):)?(!)?text-\[(.+)\]$/);

  if (bracketMatch) {
    const [, breakpoint, importantMarker, rawValue] = bracketMatch;
    const value = rawValue?.trim();

    // Color brackets belong to text-color parsing (`text-[#fff]`).
    if (!value || value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl')) {
      return null;
    }

    return {
      breakpoint: breakpoint as BuilderBreakpoint | undefined,
      important: importantMarker === '!',
      value,
    };
  }

  const namedMatch = token.match(
    /^(?:(mobile|tab|laptop|desktop):)?(!)?text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl)$/,
  );

  if (!namedMatch) {
    return null;
  }

  const [, breakpoint, importantMarker, sizeToken] = namedMatch;

  if (!sizeToken || !(sizeToken in BUILDER_TEXT_SIZE_VALUES)) {
    return null;
  }

  const value = BUILDER_TEXT_SIZE_VALUES[sizeToken];

  if (!value) {
    return null;
  }

  return {
    breakpoint: breakpoint as BuilderBreakpoint | undefined,
    important: importantMarker === '!',
    value,
  };
}

const BUILDER_TEXT_ALIGN_VALUES = {
  left: 'left',
  center: 'center',
  right: 'right',
  justify: 'justify',
} as const;

/**
 * Parse Tailwind text-align utilities (`text-center`, `tab:text-left`).
 *
 * @param token - Single class token
 * @returns Text-align rule, or null when unmatched
 */
function parseBuilderTextAlignToken(token: string): {
  breakpoint?: BuilderBreakpoint;
  important?: boolean;
  value: string;
} | null {
  const match = token.match(
    /^(?:(mobile|tab|laptop|desktop):)?(!)?text-(left|center|right|justify)$/,
  );

  if (!match) {
    return null;
  }

  const [, breakpoint, importantMarker, alignToken] = match;

  if (!alignToken) {
    return null;
  }

  return {
    breakpoint: breakpoint as BuilderBreakpoint | undefined,
    important: importantMarker === '!',
    value: BUILDER_TEXT_ALIGN_VALUES[alignToken as keyof typeof BUILDER_TEXT_ALIGN_VALUES],
  };
}

const BUILDER_FONT_WEIGHT_VALUES: Record<string, string> = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
};

/**
 * Parse Tailwind font-weight utilities (`font-normal`, `laptop:font-semibold`).
 *
 * @param token - Single class token
 * @returns Font-weight rule, or null when unmatched
 */
function parseBuilderFontWeightToken(token: string): {
  breakpoint?: BuilderBreakpoint;
  important?: boolean;
  value: string;
} | null {
  const match = token.match(
    /^(?:(mobile|tab|laptop|desktop):)?(!)?font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/,
  );

  if (!match) {
    return null;
  }

  const [, breakpoint, importantMarker, weightToken] = match;

  if (!weightToken || !(weightToken in BUILDER_FONT_WEIGHT_VALUES)) {
    return null;
  }

  const value = BUILDER_FONT_WEIGHT_VALUES[weightToken];

  if (!value) {
    return null;
  }

  return {
    breakpoint: breakpoint as BuilderBreakpoint | undefined,
    important: importantMarker === '!',
    value,
  };
}

const BUILDER_TEXT_COLOR_VALUES: Record<string, string> = {
  'black': '#000000',
  'white': '#ffffff',
  'transparent': 'transparent',
  'gray-500': '#6b7280',
  'gray-600': '#4b5563',
  'stone-500': '#78716c',
  'stone-600': '#57534e',
  'stone-950': '#0c0a09',
};

/**
 * Parse Tailwind text-color utilities (`text-gray-500`, `text-[#757575]`, `laptop:text-black`).
 *
 * @param token - Single class token
 * @returns Color rule, or null when unmatched
 */
function parseBuilderTextColorToken(token: string): {
  breakpoint?: BuilderBreakpoint;
  important?: boolean;
  value: string;
} | null {
  const bracketMatch = token.match(/^(?:(mobile|tab|laptop|desktop):)?(!)?text-\[(.+)\]$/);

  if (bracketMatch) {
    const [, breakpoint, importantMarker, rawValue] = bracketMatch;
    const value = rawValue?.trim();

    // Arbitrary text-[14px] is font-size; only treat color-like brackets here.
    if (
      !value ||
      (!value.startsWith('#') && !value.startsWith('rgb') && !value.startsWith('hsl'))
    ) {
      return null;
    }

    return {
      breakpoint: breakpoint as BuilderBreakpoint | undefined,
      important: importantMarker === '!',
      value,
    };
  }

  const namedMatch = token.match(
    /^(?:(mobile|tab|laptop|desktop):)?(!)?text-(black|white|transparent|gray-500|gray-600|stone-500|stone-600|stone-950)$/,
  );

  if (!namedMatch) {
    return null;
  }

  const [, breakpoint, importantMarker, colorToken] = namedMatch;

  if (!colorToken || !(colorToken in BUILDER_TEXT_COLOR_VALUES)) {
    return null;
  }

  const value = BUILDER_TEXT_COLOR_VALUES[colorToken];

  if (!value) {
    return null;
  }

  return {
    breakpoint: breakpoint as BuilderBreakpoint | undefined,
    important: importantMarker === '!',
    value,
  };
}

const BUILDER_DISPLAY_VALUES = {
  'hidden': 'none',
  'block': 'block',
  'flex': 'flex',
  'grid': 'grid',
  'inline': 'inline',
  'inline-flex': 'inline-flex',
  'contents': 'contents',
} as const;

type BuilderDisplayToken = keyof typeof BUILDER_DISPLAY_VALUES;

function parseBuilderDisplayToken(token: string): {
  breakpoint?: BuilderBreakpoint;
  important?: boolean;
  value: string;
} | null {
  const match = token.match(
    /^(?:(mobile|tab|laptop|desktop):)?(!)?(hidden|block|flex|grid|inline|inline-flex|contents)$/,
  );

  if (!match) {
    return null;
  }

  const [, breakpoint, importantMarker, displayToken] = match;

  if (!displayToken) {
    return null;
  }

  return {
    breakpoint: breakpoint as BuilderBreakpoint | undefined,
    important: importantMarker === '!',
    value: BUILDER_DISPLAY_VALUES[displayToken as BuilderDisplayToken],
  };
}

const BUILDER_OVERFLOW_VALUES = {
  hidden: 'hidden',
  visible: 'visible',
  auto: 'auto',
  scroll: 'scroll',
} as const;

type BuilderOverflowToken = keyof typeof BUILDER_OVERFLOW_VALUES;

function parseBuilderOverflowToken(token: string): {
  breakpoint?: BuilderBreakpoint;
  important?: boolean;
  value: string;
} | null {
  const match = token.match(
    /^(?:(mobile|tab|laptop|desktop):)?(!)?overflow-(hidden|visible|auto|scroll)$/,
  );

  if (!match) {
    return null;
  }

  const [, breakpoint, importantMarker, overflowToken] = match;

  if (!overflowToken) {
    return null;
  }

  return {
    breakpoint: breakpoint as BuilderBreakpoint | undefined,
    important: importantMarker === '!',
    value: BUILDER_OVERFLOW_VALUES[overflowToken as BuilderOverflowToken],
  };
}

function parseBuilderDimensionToken(token: string): {
  breakpoint?: BuilderBreakpoint;
  important?: boolean;
  property: 'width' | 'height' | 'min-width' | 'max-width' | 'min-height' | 'max-height';
  value: string;
} | null {
  const match = token.match(
    /^(?:(mobile|tab|laptop|desktop):)?(!)?(w|min-w|max-w|h|min-h|max-h)-(.+)$/,
  );

  if (!match) {
    return null;
  }

  const [, breakpoint, importantMarker, rawProperty, rawValue] = match;

  if (!rawProperty || !rawValue) {
    return null;
  }

  const propertyMap = {
    'w': 'width',
    'h': 'height',
    'min-w': 'min-width',
    'max-w': 'max-width',
    'min-h': 'min-height',
    'max-h': 'max-height',
  } as const;

  const property = propertyMap[rawProperty as keyof typeof propertyMap];

  if (!property) {
    return null;
  }

  const parsedValue = parseBuilderDimensionValue(
    rawValue,
    property.includes('width') ? 'width' : 'height',
  );

  if (!parsedValue) {
    return null;
  }

  return {
    breakpoint: breakpoint as BuilderBreakpoint | undefined,
    important: importantMarker === '!',
    property,
    value: parsedValue,
  };
}

const BUILDER_FLEX_DIRECTION_VALUES = {
  'flex-row': 'row',
  'flex-col': 'column',
  'flex-row-reverse': 'row-reverse',
  'flex-col-reverse': 'column-reverse',
} as const;

type BuilderFlexDirectionToken = keyof typeof BUILDER_FLEX_DIRECTION_VALUES;

function parseBuilderFlexDirectionToken(token: string): {
  breakpoint?: BuilderBreakpoint;
  important?: boolean;
  value: string;
} | null {
  const match = token.match(
    /^(?:(mobile|tab|laptop|desktop):)?(!)?(flex-row|flex-col|flex-row-reverse|flex-col-reverse)$/,
  );

  if (!match) {
    return null;
  }

  const [, breakpoint, importantMarker, directionToken] = match;

  if (!directionToken) {
    return null;
  }

  return {
    breakpoint: breakpoint as BuilderBreakpoint | undefined,
    important: importantMarker === '!',
    value: BUILDER_FLEX_DIRECTION_VALUES[directionToken as BuilderFlexDirectionToken],
  };
}

const BUILDER_FLEX_WRAP_VALUES = {
  'flex-wrap': 'wrap',
  'flex-nowrap': 'nowrap',
} as const;

type BuilderFlexWrapToken = keyof typeof BUILDER_FLEX_WRAP_VALUES;

function parseBuilderFlexWrapToken(token: string): {
  breakpoint?: BuilderBreakpoint;
  important?: boolean;
  value: string;
} | null {
  const match = token.match(/^(?:(mobile|tab|laptop|desktop):)?(!)?(flex-wrap|flex-nowrap)$/);

  if (!match) {
    return null;
  }

  const [, breakpoint, importantMarker, wrapToken] = match;

  if (!wrapToken) {
    return null;
  }

  return {
    breakpoint: breakpoint as BuilderBreakpoint | undefined,
    important: importantMarker === '!',
    value: BUILDER_FLEX_WRAP_VALUES[wrapToken as BuilderFlexWrapToken],
  };
}

const BUILDER_JUSTIFY_VALUES = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
} as const;

type BuilderJustifyToken = keyof typeof BUILDER_JUSTIFY_VALUES;

function parseBuilderJustifyContentToken(token: string): {
  breakpoint?: BuilderBreakpoint;
  important?: boolean;
  value: string;
} | null {
  const match = token.match(
    /^(?:(mobile|tab|laptop|desktop):)?(!)?justify-(start|center|end|between|around|evenly)$/,
  );

  if (!match) {
    return null;
  }

  const [, breakpoint, importantMarker, justifyToken] = match;

  if (!justifyToken) {
    return null;
  }

  return {
    breakpoint: breakpoint as BuilderBreakpoint | undefined,
    important: importantMarker === '!',
    value: BUILDER_JUSTIFY_VALUES[justifyToken as BuilderJustifyToken],
  };
}

const BUILDER_ALIGN_ITEMS_VALUES = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
} as const;

type BuilderAlignItemsToken = keyof typeof BUILDER_ALIGN_ITEMS_VALUES;

function parseBuilderAlignItemsToken(token: string): {
  breakpoint?: BuilderBreakpoint;
  important?: boolean;
  value: string;
} | null {
  const match = token.match(
    /^(?:(mobile|tab|laptop|desktop):)?(!)?items-(start|center|end|stretch|baseline)$/,
  );

  if (!match) {
    return null;
  }

  const [, breakpoint, importantMarker, alignToken] = match;

  if (!alignToken) {
    return null;
  }

  return {
    breakpoint: breakpoint as BuilderBreakpoint | undefined,
    important: importantMarker === '!',
    value: BUILDER_ALIGN_ITEMS_VALUES[alignToken as BuilderAlignItemsToken],
  };
}

function parseBuilderGapToken(token: string): {
  breakpoint?: BuilderBreakpoint;
  important?: boolean;
  property: 'gap' | 'row-gap' | 'column-gap';
  value: string;
} | null {
  const match = token.match(
    /^(?:(mobile|tab|laptop|desktop):)?(!)?(gap|gap-x|gap-y|row-gap|col-gap|column-gap)-(.+)$/,
  );

  if (!match) {
    return null;
  }

  const [, breakpoint, importantMarker, gapToken, rawValue] = match;

  if (!gapToken || !rawValue) {
    return null;
  }

  const propertyMap = {
    'gap': 'gap',
    'gap-x': 'column-gap',
    'col-gap': 'column-gap',
    'column-gap': 'column-gap',
    'gap-y': 'row-gap',
    'row-gap': 'row-gap',
  } as const;

  const property = propertyMap[gapToken as keyof typeof propertyMap];
  const parsedValue = parseBuilderSpacingValue(rawValue);

  if (!property || !parsedValue) {
    return null;
  }

  return {
    breakpoint: breakpoint as BuilderBreakpoint | undefined,
    important: importantMarker === '!',
    property,
    value: parsedValue,
  };
}

const BUILDER_BACKGROUND_COLOR_VALUES = {
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
} as const;

type BuilderBackgroundColorToken = keyof typeof BUILDER_BACKGROUND_COLOR_VALUES;

function parseBuilderBackgroundColorToken(token: string): {
  breakpoint?: BuilderBreakpoint;
  important?: boolean;
  value: string;
} | null {
  const bracketMatch = token.match(/^(?:(mobile|tab|laptop|desktop):)?(!)?bg-\[(.+)\]$/);

  if (bracketMatch) {
    const [, breakpoint, importantMarker, rawValue] = bracketMatch;

    if (!rawValue?.trim()) {
      return null;
    }

    return {
      breakpoint: breakpoint as BuilderBreakpoint | undefined,
      important: importantMarker === '!',
      value: rawValue.trim(),
    };
  }

  const namedMatch = token.match(
    /^(?:(mobile|tab|laptop|desktop):)?(!)?bg-(white|black|transparent)$/,
  );

  if (!namedMatch) {
    return null;
  }

  const [, breakpoint, importantMarker, colorToken] = namedMatch;

  if (!colorToken) {
    return null;
  }

  return {
    breakpoint: breakpoint as BuilderBreakpoint | undefined,
    important: importantMarker === '!',
    value: BUILDER_BACKGROUND_COLOR_VALUES[colorToken as BuilderBackgroundColorToken],
  };
}

function applyBuilderBaseStyleRule(style: CSSProperties, rule: BuilderBaseStyleRule): void {
  const reactProperty = BUILDER_CSS_TO_REACT[rule.property];

  if (!reactProperty) {
    return;
  }

  (style as Record<string, string | number>)[reactProperty] = rule.value;
}

function pushResponsiveStyleRule(
  rules: BuilderResponsiveStyleRule[],
  utility: {
    breakpoint?: BuilderBreakpoint;
    important?: boolean;
    property: string;
    value: string;
  },
): void {
  if (!utility.breakpoint) {
    return;
  }

  rules.push({
    breakpoint: utility.breakpoint,
    property: utility.property,
    value: utility.value,
    important: utility.important,
  });
}

/**
 * Collect base (non-breakpoint) utility rules from a CMS className string.
 *
 * @param className - Space-separated Tailwind-like utilities
 * @returns CSS property/value rules without media queries
 */
function collectBuilderBaseStyleRules(className: string | undefined): BuilderBaseStyleRule[] {
  if (!className) {
    return [];
  }

  const rules: BuilderBaseStyleRule[] = [];

  className.split(/\s+/).forEach((token) => {
    if (!token) {
      return;
    }

    const margin = parseBuilderMarginToken(token);
    if (margin && !margin.breakpoint) {
      margin.properties.forEach((property) => {
        rules.push({ property, value: margin.value });
      });
    }

    const dimension = parseBuilderDimensionToken(token);
    if (dimension && !dimension.breakpoint) {
      rules.push({ property: dimension.property, value: dimension.value });
    }

    const display = parseBuilderDisplayToken(token);
    if (display && !display.breakpoint) {
      rules.push({ property: 'display', value: display.value });
    }

    const overflow = parseBuilderOverflowToken(token);
    if (overflow && !overflow.breakpoint) {
      rules.push({ property: 'overflow', value: overflow.value });
    }

    const flexDirection = parseBuilderFlexDirectionToken(token);
    if (flexDirection && !flexDirection.breakpoint) {
      rules.push({ property: 'flex-direction', value: flexDirection.value });
    }

    const flexWrap = parseBuilderFlexWrapToken(token);
    if (flexWrap && !flexWrap.breakpoint) {
      rules.push({ property: 'flex-wrap', value: flexWrap.value });
    }

    const justifyContent = parseBuilderJustifyContentToken(token);
    if (justifyContent && !justifyContent.breakpoint) {
      rules.push({ property: 'justify-content', value: justifyContent.value });
    }

    const alignItems = parseBuilderAlignItemsToken(token);
    if (alignItems && !alignItems.breakpoint) {
      rules.push({ property: 'align-items', value: alignItems.value });
    }

    const gap = parseBuilderGapToken(token);
    if (gap && !gap.breakpoint) {
      rules.push({ property: gap.property, value: gap.value });
    }

    const backgroundColor = parseBuilderBackgroundColorToken(token);
    if (backgroundColor && !backgroundColor.breakpoint) {
      rules.push({ property: 'background-color', value: backgroundColor.value });
    }

    const padding = parseBuilderPaddingToken(token);
    if (padding && !padding.breakpoint) {
      padding.properties.forEach((property) => {
        rules.push({ property, value: padding.value });
      });
    }

    const textAlign = parseBuilderTextAlignToken(token);
    if (textAlign && !textAlign.breakpoint) {
      rules.push({ property: 'text-align', value: textAlign.value });
    }

    const textColor = parseBuilderTextColorToken(token);
    if (textColor && !textColor.breakpoint) {
      rules.push({ property: 'color', value: textColor.value });
    }

    const textSize = parseBuilderTextSizeToken(token);
    if (textSize && !textSize.breakpoint) {
      rules.push({ property: 'font-size', value: textSize.value });
    }

    const fontWeight = parseBuilderFontWeightToken(token);
    if (fontWeight && !fontWeight.breakpoint) {
      rules.push({ property: 'font-weight', value: fontWeight.value });
    }

    const aspectMatch = token.match(
      /^(?:(mobile|tab|laptop|desktop):)?(!)?aspect-(square|video|\[(.+)\])$/,
    );
    if (aspectMatch && !aspectMatch[1]) {
      const named = aspectMatch[3];
      const arbitrary = aspectMatch[4];
      const value =
        named === 'square' ? '1 / 1' : named === 'video' ? '16 / 9' : (arbitrary?.trim() ?? '');
      if (value) {
        rules.push({ property: 'aspect-ratio', value });
      }
    }
  });

  return rules;
}

function getBuilderBaseClassStyle(
  className: string | undefined,
  omitProperties?: ReadonlySet<string>,
): CSSProperties | undefined {
  const style: CSSProperties = {};

  collectBuilderBaseStyleRules(className).forEach((rule) => {
    if (omitProperties?.has(rule.property)) {
      return;
    }

    applyBuilderBaseStyleRule(style, rule);
  });

  return Object.keys(style).length > 0 ? style : undefined;
}

export function getBuilderResponsiveStyleRules(
  className: string | undefined,
): BuilderResponsiveStyleRule[] {
  if (!className) {
    return [];
  }

  return className
    .split(/\s+/)
    .flatMap((token) => {
      const rules: BuilderResponsiveStyleRule[] = [];
      const margin = parseBuilderMarginToken(token);

      if (margin?.breakpoint) {
        margin.properties.forEach((property) => {
          pushResponsiveStyleRule(rules, {
            breakpoint: margin.breakpoint,
            property,
            value: margin.value,
            important: margin.important,
          });
        });
      }

      const dimension = parseBuilderDimensionToken(token);

      if (dimension?.breakpoint) {
        pushResponsiveStyleRule(rules, dimension);
      }

      const display = parseBuilderDisplayToken(token);

      if (display?.breakpoint) {
        pushResponsiveStyleRule(rules, {
          breakpoint: display.breakpoint,
          property: 'display',
          value: display.value,
          important: display.important,
        });
      }

      const overflow = parseBuilderOverflowToken(token);

      if (overflow?.breakpoint) {
        pushResponsiveStyleRule(rules, {
          breakpoint: overflow.breakpoint,
          property: 'overflow',
          value: overflow.value,
          important: overflow.important,
        });
      }

      const flexDirection = parseBuilderFlexDirectionToken(token);

      if (flexDirection?.breakpoint) {
        pushResponsiveStyleRule(rules, {
          breakpoint: flexDirection.breakpoint,
          property: 'flex-direction',
          value: flexDirection.value,
          important: flexDirection.important,
        });
      }

      const flexWrap = parseBuilderFlexWrapToken(token);

      if (flexWrap?.breakpoint) {
        pushResponsiveStyleRule(rules, {
          breakpoint: flexWrap.breakpoint,
          property: 'flex-wrap',
          value: flexWrap.value,
          important: flexWrap.important,
        });
      }

      const justifyContent = parseBuilderJustifyContentToken(token);

      if (justifyContent?.breakpoint) {
        pushResponsiveStyleRule(rules, {
          breakpoint: justifyContent.breakpoint,
          property: 'justify-content',
          value: justifyContent.value,
          important: justifyContent.important,
        });
      }

      const alignItems = parseBuilderAlignItemsToken(token);

      if (alignItems?.breakpoint) {
        pushResponsiveStyleRule(rules, {
          breakpoint: alignItems.breakpoint,
          property: 'align-items',
          value: alignItems.value,
          important: alignItems.important,
        });
      }

      const gap = parseBuilderGapToken(token);

      if (gap?.breakpoint) {
        pushResponsiveStyleRule(rules, gap);
      }

      const backgroundColor = parseBuilderBackgroundColorToken(token);

      if (backgroundColor?.breakpoint) {
        pushResponsiveStyleRule(rules, {
          breakpoint: backgroundColor.breakpoint,
          property: 'background-color',
          value: backgroundColor.value,
          important: backgroundColor.important,
        });
      }

      const padding = parseBuilderPaddingToken(token);

      if (padding?.breakpoint) {
        padding.properties.forEach((property) => {
          pushResponsiveStyleRule(rules, {
            breakpoint: padding.breakpoint,
            property,
            value: padding.value,
            important: padding.important,
          });
        });
      }

      const textAlign = parseBuilderTextAlignToken(token);

      if (textAlign?.breakpoint) {
        pushResponsiveStyleRule(rules, {
          breakpoint: textAlign.breakpoint,
          property: 'text-align',
          value: textAlign.value,
          important: textAlign.important,
        });
      }

      const textColor = parseBuilderTextColorToken(token);

      if (textColor?.breakpoint) {
        pushResponsiveStyleRule(rules, {
          breakpoint: textColor.breakpoint,
          property: 'color',
          value: textColor.value,
          important: textColor.important,
        });
      }

      const textSize = parseBuilderTextSizeToken(token);

      if (textSize?.breakpoint) {
        pushResponsiveStyleRule(rules, {
          breakpoint: textSize.breakpoint,
          property: 'font-size',
          value: textSize.value,
          important: textSize.important,
        });
      }

      const fontWeight = parseBuilderFontWeightToken(token);

      if (fontWeight?.breakpoint) {
        pushResponsiveStyleRule(rules, {
          breakpoint: fontWeight.breakpoint,
          property: 'font-weight',
          value: fontWeight.value,
          important: fontWeight.important,
        });
      }

      return rules;
    })
    .filter(
      (rule): rule is BuilderResponsiveStyleRule => rule != null && rule.breakpoint !== undefined,
    );
}

export function getBuilderResponsiveStyleText(
  nodeId: string,
  className: string | undefined,
  dataAttribute: 'data-cms-builder-node' | 'data-cms-style-node' = 'data-cms-builder-node',
): string | null {
  const rules = getBuilderResponsiveStyleRules(className);
  const selector = `[${dataAttribute}="${nodeId}"]`;

  // Base utilities that also have responsive variants must live in the stylesheet
  // (not inline style), otherwise inline width/height always wins over media queries.
  const responsiveProperties = new Set(rules.map((rule) => rule.property));
  const baseDeclarations = collectBuilderBaseStyleRules(className)
    .filter((rule) => responsiveProperties.has(rule.property))
    .map((rule) => `${rule.property}: ${rule.value};`);

  const chunks: string[] = [];

  if (baseDeclarations.length > 0) {
    chunks.push(`${selector} { ${baseDeclarations.join(' ')} }`);
  }

  rules.forEach((rule) => {
    const minWidth = BUILDER_BREAKPOINTS[rule.breakpoint];
    const importantSuffix = rule.important ? ' !important' : '';

    chunks.push(
      `@media (min-width: ${minWidth}) { ${selector} { ${rule.property}: ${rule.value}${importantSuffix}; } }`,
    );
  });

  return chunks.length > 0 ? chunks.join('\n') : null;
}

function assignStringProp(
  target: CmsBuilderNodeProps,
  source: Record<string, unknown>,
  sourceKey: string,
  targetKey: keyof CmsBuilderNodeProps = sourceKey as keyof CmsBuilderNodeProps,
): void {
  const value = source[sourceKey];

  if (typeof value === 'string') {
    (target as Record<string, unknown>)[targetKey] = value;
  }
}

function assignNullableStringProp(
  target: CmsBuilderNodeProps,
  source: Record<string, unknown>,
  sourceKey: string,
  targetKey: keyof CmsBuilderNodeProps = sourceKey as keyof CmsBuilderNodeProps,
): void {
  const value = source[sourceKey];

  if (typeof value === 'string' || value === null) {
    (target as Record<string, unknown>)[targetKey] = value;
  }
}

function assignNumberishProp(
  target: CmsBuilderNodeProps,
  source: Record<string, unknown>,
  sourceKey: string,
  targetKey: keyof CmsBuilderNodeProps = sourceKey as keyof CmsBuilderNodeProps,
): void {
  const value = source[sourceKey];

  if (typeof value === 'string' || typeof value === 'number') {
    (target as Record<string, unknown>)[targetKey] = value;
  }
}

function parseBuilderNodeProps(value: unknown): CmsBuilderNodeProps | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const props: CmsBuilderNodeProps = {};

  assignStringProp(props, value, 'className');

  if (isRecord(value.style)) {
    props.style = Object.fromEntries(
      Object.entries(value.style).filter(
        (entry): entry is [string, string | number] =>
          typeof entry[1] === 'string' || typeof entry[1] === 'number',
      ),
    );
  }

  assignStringProp(props, value, 'content');
  assignStringProp(props, value, 'text');
  assignStringProp(props, value, 'tag');
  assignStringProp(props, value, 'src');
  assignStringProp(props, value, 'alt');
  assignNumberishProp(props, value, 'width');
  assignNumberishProp(props, value, 'height');
  assignStringProp(props, value, 'label');
  assignStringProp(props, value, 'href');
  assignStringProp(props, value, 'target');
  assignStringProp(props, value, 'poster');
  assignNullableStringProp(props, value, 'action_type');
  assignNullableStringProp(props, value, 'action_value');
  assignNullableStringProp(props, value, 'clickAction');
  assignNullableStringProp(props, value, 'clickActionValue');
  assignStringProp(props, value, 'variant');
  assignStringProp(props, value, 'background_color');
  assignStringProp(props, value, 'backgroundColor');
  assignStringProp(props, value, 'text_color');
  assignStringProp(props, value, 'textColor');
  assignStringProp(props, value, 'backgroundImage');
  assignStringProp(props, value, 'objectFit');
  assignNumberishProp(props, value, 'fontSize');
  assignNumberishProp(props, value, 'fontWeight');
  assignStringProp(props, value, 'color');
  assignStringProp(props, value, 'textAlign');
  assignNumberishProp(props, value, 'lineHeight');
  assignNumberishProp(props, value, 'letterSpacing');
  assignStringProp(props, value, 'textTransform');

  if (typeof value.autoplay === 'boolean') {
    props.autoplay = value.autoplay;
  }

  if (typeof value.opacity === 'number') {
    props.opacity = value.opacity;
  }

  return Object.keys(props).length > 0 ? props : undefined;
}

function mergeBuilderNodeProps(
  base: CmsBuilderNodeProps | undefined,
  override: CmsBuilderNodeProps | undefined,
): CmsBuilderNodeProps | undefined {
  if (!base) {
    return override;
  }

  if (!override) {
    return base;
  }

  return {
    ...base,
    ...override,
    style: {
      ...(base.style ?? {}),
      ...(override.style ?? {}),
    },
  };
}

export function normalizeBuilderNode(raw: unknown, fallbackId: string): CmsBuilderNode | null {
  if (!isRecord(raw) || typeof raw.type !== 'string' || !raw.type) {
    return null;
  }

  const id = typeof raw.id === 'string' && raw.id ? raw.id : fallbackId;
  const children = Array.isArray(raw.children)
    ? raw.children
        .map((child, index) => normalizeBuilderNode(child, `${id}-child-${index}`))
        .filter((child): child is CmsBuilderNode => child !== null)
    : [];

  return {
    id,
    type: raw.type,
    name: typeof raw.name === 'string' ? raw.name : undefined,
    props: mergeBuilderNodeProps(parseBuilderNodeProps(raw), parseBuilderNodeProps(raw.props)),
    children,
  };
}

export function getBuilderElements(content: Record<string, unknown>): CmsBuilderNode[] {
  if (Array.isArray(content.elements)) {
    return content.elements
      .map((element, index) => normalizeBuilderNode(element, `builder-el-${index}`))
      .filter((element): element is CmsBuilderNode => element !== null);
  }

  const componentData = content.component_data;

  if (Array.isArray(componentData)) {
    return componentData
      .map((element, index) => normalizeBuilderNode(element, `builder-el-${index}`))
      .filter((element): element is CmsBuilderNode => element !== null);
  }

  if (!isRecord(componentData)) {
    return [];
  }

  if (Array.isArray(componentData.elements)) {
    return componentData.elements
      .map((element, index) => normalizeBuilderNode(element, `builder-el-${index}`))
      .filter((element): element is CmsBuilderNode => element !== null);
  }

  const singleNode = normalizeBuilderNode(componentData, 'builder-root');

  return singleNode ? [singleNode] : [];
}

export function sanitizeBuilderAssetUrl(url: string): string {
  return url.trim().replace(/\s+/g, '%20');
}

export function resolveBuilderTextContent(props: CmsBuilderNodeProps | undefined): string {
  return props?.content ?? props?.text ?? '';
}

export function toBuilderStyle(props: CmsBuilderNodeProps | undefined): CSSProperties | undefined {
  // Omit properties that have responsive variants — those are emitted via stylesheet CSS.
  const responsiveProperties = new Set(
    getBuilderResponsiveStyleRules(props?.className).map((rule) => rule.property),
  );
  const normalized: Record<string, string | number> = {
    ...(getBuilderBaseClassStyle(props?.className, responsiveProperties) ?? {}),
  };

  Object.entries(props?.style ?? {}).forEach(([key, value]) => {
    if (typeof value === 'string' || typeof value === 'number') {
      normalized[key] = value;
    }
  });

  if (props?.width !== undefined && normalized.width === undefined) {
    normalized.width = props.width;
  }

  if (props?.height !== undefined && normalized.height === undefined) {
    normalized.height = props.height;
  }

  if (props?.background_color && normalized.backgroundColor === undefined) {
    normalized.backgroundColor = props.background_color;
  }

  if (props?.backgroundColor && normalized.backgroundColor === undefined) {
    normalized.backgroundColor = props.backgroundColor;
  }

  if (props?.text_color && normalized.color === undefined) {
    normalized.color = props.text_color;
  }

  if (props?.textColor && normalized.color === undefined) {
    normalized.color = props.textColor;
  }

  if (props?.color && normalized.color === undefined) {
    normalized.color = props.color;
  }

  if (props?.fontSize !== undefined && normalized.fontSize === undefined) {
    normalized.fontSize = props.fontSize;
  }

  if (props?.fontWeight !== undefined && normalized.fontWeight === undefined) {
    normalized.fontWeight = props.fontWeight;
  }

  if (props?.textAlign && normalized.textAlign === undefined) {
    normalized.textAlign = props.textAlign;
  }

  if (props?.lineHeight !== undefined && normalized.lineHeight === undefined) {
    normalized.lineHeight = props.lineHeight;
  }

  if (props?.letterSpacing !== undefined && normalized.letterSpacing === undefined) {
    normalized.letterSpacing = props.letterSpacing;
  }

  if (props?.textTransform && normalized.textTransform === undefined) {
    normalized.textTransform = props.textTransform;
  }

  if (props?.opacity !== undefined && normalized.opacity === undefined) {
    normalized.opacity = props.opacity;
  }

  if (props?.backgroundImage && normalized.backgroundImage === undefined) {
    normalized.backgroundImage = `url("${sanitizeBuilderAssetUrl(props.backgroundImage)}")`;
    normalized.backgroundPosition = 'center';
    normalized.backgroundRepeat = 'no-repeat';
    normalized.backgroundSize = 'cover';
  }

  if (props?.objectFit && normalized.objectFit === undefined) {
    normalized.objectFit = props.objectFit;
  }

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

const BUILDER_TEXT_TAGS = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span']);

export function resolveBuilderTextTag(tag: string | undefined): ElementType {
  if (tag && BUILDER_TEXT_TAGS.has(tag)) {
    return tag as ElementType;
  }

  return 'p';
}

export function builderTextContainsHtml(content: string): boolean {
  return /<[a-z][\s\S]*>/i.test(content);
}
