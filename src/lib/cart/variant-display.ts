export interface VariantDisplayLine {
  label: string;
  value: string;
}

const DEFAULT_TITLE_LOWER = 'default title';

/** Chain length × width/thickness from Shopify (e.g. `L-60 cm x W-3 mm`). */
const CHAIN_LENGTH_DIMENSION_PATTERN = /^L-\d+(?:\.\d+)?\s*cm\s*x\s*(?:W|L)-\d+(?:\.\d+)?\s*mm$/i;

const SIZE_LIKE = new Set([
  'big',
  'small',
  'medium',
  's',
  'm',
  'l',
  'xs',
  'xl',
  'xxl',
  'xxs',
  'tiny',
  'large',
  'regular',
  'petite',
  'oversized',
]);

/** True if the value is a single letter (A/B/a/b), not Size or Colour. */
function isLetterLike(value: string): boolean {
  return /^[a-z]$/i.test(value.trim());
}

/** True when the value is a chain L×W/L dimension string shown as Length on cart lines. */
function isChainLengthDimension(value: string): boolean {
  return CHAIN_LENGTH_DIMENSION_PATTERN.test(value.trim());
}

/** True if the value looks like a size (number or common size word), not a colour. */
function isSizeLike(value: string): boolean {
  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) return true;
  return SIZE_LIKE.has(trimmed.toLowerCase());
}

/**
 * Resolves the display label for one variant title part.
 *
 * @param value - Variant option value (colour, size, or letter).
 */
function resolveVariantLabel(value: string): string {
  if (isLetterLike(value)) return 'Letter';
  if (isSizeLike(value)) return 'Size';
  return 'Colour';
}

/**
 * Parses Shopify variant title into labelled Colour/Size/Letter display lines.
 * Mirrors palmonas-app cart-item variant display logic.
 */
export function getVariantDisplayLines(variantTitle: string | undefined): VariantDisplayLine[] {
  if (!variantTitle || !variantTitle.trim()) return [];
  const title = variantTitle.trim();
  if (title.toLowerCase() === DEFAULT_TITLE_LOWER) return [];

  if (title.includes(' / ')) {
    const parts = title
      .split(' / ')
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length === 0) return [];
    if (parts.length === 1) {
      const part = parts[0]!;
      return [{ label: resolveVariantLabel(part), value: part }];
    }
    const first = parts[0]!;
    const second = parts[1]!;
    if (isChainLengthDimension(second)) {
      return [
        { label: 'Colour', value: first },
        { label: 'Length', value: second },
      ];
    }
    return [
      { label: resolveVariantLabel(first), value: first },
      { label: resolveVariantLabel(second), value: second },
    ];
  }

  if (isChainLengthDimension(title)) {
    return [{ label: 'Length', value: title }];
  }

  return [{ label: resolveVariantLabel(title), value: title }];
}

/**
 * Formats variant title as a single display line (legacy helper).
 */
export function formatVariantLabel(title: string): string {
  const lines = getVariantDisplayLines(title);
  if (lines.length === 0) return '';
  const first = lines[0]!;
  return `${first.label} : ${first.value}`;
}

/**
 * Builds a cart-line option label from variant title, then size/color fallbacks.
 *
 * @param input - Cart line display fields.
 * @returns Colour/size label, or empty when nothing usable is present.
 */
export function formatProductCartLineLabel(input: {
  variantTitle?: string;
  size?: string;
  color?: string;
}): string {
  const fromTitle = formatVariantLabel(input.variantTitle ?? '');
  if (fromTitle) return fromTitle;
  if (input.size) return `Size : ${input.size}`;
  if (input.color) return `Colour : ${input.color}`;
  return '';
}
