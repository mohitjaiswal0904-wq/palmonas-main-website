/** 60vw / 80vw — tab breakpoint scale */
export const CMS_CARD_GRID_TAB_SCALE = 0.75;
/** 32vw / 80vw — laptop+ breakpoint scale */
export const CMS_CARD_GRID_LAPTOP_SCALE = 0.4;

export interface ResponsiveCardGridItemDimensions {
  /** Runtime Tailwind utilities applied via `CmsRuntimeClassSlot` (base + tab/laptop). */
  className: string;
}

type ParsedCssSize =
  | { kind: 'auto' }
  | { kind: 'keyword'; value: string }
  | { kind: 'length'; value: number; unit: string };

function parseCssSize(value?: string): ParsedCssSize | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const trimmed = value.trim().toLowerCase();

  if (trimmed === 'auto') {
    return { kind: 'auto' };
  }

  const match = trimmed.match(/^([\d.]+)([a-z%]*)$/);
  if (!match) {
    return { kind: 'keyword', value: trimmed };
  }

  const numericValue = Number(match[1]);
  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return undefined;
  }

  return {
    kind: 'length',
    value: numericValue,
    unit: match[2] ?? '',
  };
}

function formatScaledNumber(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

function scaleCssSize(parsed: ParsedCssSize, scale: number): string {
  if (parsed.kind === 'auto') {
    return 'auto';
  }

  if (parsed.kind === 'keyword') {
    return parsed.value;
  }

  return `${formatScaledNumber(parsed.value * scale)}${parsed.unit}`;
}

function toCssSize(parsed: ParsedCssSize): string {
  if (parsed.kind === 'auto') {
    return 'auto';
  }

  if (parsed.kind === 'keyword') {
    return parsed.value;
  }

  return `${formatScaledNumber(parsed.value)}${parsed.unit}`;
}

function appendResponsiveAxisClasses(
  axis: 'w' | 'h',
  rawValue: string | undefined,
  classes: string[],
): void {
  const parsed = parseCssSize(rawValue);
  if (!parsed || parsed.kind === 'auto') {
    return;
  }

  const mobile = toCssSize(parsed);
  const tab = scaleCssSize(parsed, CMS_CARD_GRID_TAB_SCALE);
  const laptop = scaleCssSize(parsed, CMS_CARD_GRID_LAPTOP_SCALE);

  classes.push(`${axis}-[${mobile}]`, `tab:${axis}-[${tab}]`, `laptop:${axis}-[${laptop}]`);
}

/**
 * Build per-card width/height utilities from CMS size fields.
 * Mobile uses API values as-is; tab ×0.75; laptop+ ×0.4 on the numeric part.
 *
 * @param width - CMS card width (e.g. `80vw`)
 * @param height - CMS card height (e.g. `120px` or `auto`)
 * @returns Class string for `CmsRuntimeClassSlot`
 */
export function getResponsiveCardGridItemDimensions(
  width?: string,
  height?: string,
): ResponsiveCardGridItemDimensions {
  const classes: string[] = ['shrink-0'];

  appendResponsiveAxisClasses('w', width, classes);
  appendResponsiveAxisClasses('h', height, classes);

  return {
    className: classes.join(' '),
  };
}

/** @internal */
export const cmsCardGridTestUtils = {
  parseCssSize,
  scaleCssSize,
  toCssSize,
};
