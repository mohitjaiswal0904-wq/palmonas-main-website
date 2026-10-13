import type { SearchIntent, SearchIntentMetal, SearchIntentType } from '@/lib/search/search-intent';
import type { Product } from '@/types/product';

const TYPE_SCORE = 1_000_000;
const METAL_SCORE = 10_000;
const GENDER_SCORE = 1_000;
const SOLID_GOLD_SCORE = 100;

/**
 * Puts products that match the search intent first and drops pieces that are not jewellery.
 * Returns an empty list when the intent asks for something the page does not contain,
 * unless `keepUnmatched` is set so later pages can still show supporting products.
 *
 * @param products - Products already returned by the search API.
 * @param intent - Parsed search intent. An empty intent keeps the API order.
 * @param options.keepUnmatched - Keep non-matches when this page itself has no full match.
 * @returns Products in shopper order.
 */
export function rankSearchResults(
  products: Product[],
  intent: SearchIntent,
  options?: { keepUnmatched?: boolean },
): Product[] {
  const kept = products.filter((product) => !isExcludedNonJewellery(product, intent));
  const unconstrained = !intent.type && !intent.metal && !intent.gender && !intent.stone;

  if (unconstrained) {
    return kept;
  }

  if (
    !options?.keepUnmatched &&
    kept.filter((product) => isFullMatch(product, intent)).length === 0
  ) {
    return [];
  }

  return kept
    .map((product, index) => ({ product, index, score: scoreProduct(product, intent) }))
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map((entry) => entry.product);
}

/**
 * Counts products that satisfy every part of the intent.
 *
 * @param products - Products from one search response.
 * @param intent - Parsed search intent.
 * @returns How many products are a full match.
 */
export function countIntentMatches(products: Product[], intent: SearchIntent): number {
  if (!intent.type && !intent.metal && !intent.gender && !intent.stone) {
    return products.length;
  }

  return products.filter((product) => isFullMatch(product, intent)).length;
}

function isExcludedNonJewellery(product: Product, intent: SearchIntent): boolean {
  const name = product.name.toLowerCase();
  const asksForAccessory = /\bhair\b|\bgift\b/.test(intent.apiQuery);

  if (asksForAccessory) {
    return false;
  }

  return /\bhair tie\b|\bgift box\b|\bgift bag\b/.test(name);
}

function isFullMatch(product: Product, intent: SearchIntent): boolean {
  if (intent.type && typeFit(product, intent.type) !== 'full') {
    return false;
  }

  if (intent.metal && !matchesMetal(product, intent.metal)) {
    return false;
  }

  if (intent.gender === 'men' && !hasMenWord(product.name)) {
    return false;
  }

  if (intent.stone === 'lab-grown' && !matchesLabGrown(product)) {
    return false;
  }

  return true;
}

function scoreProduct(product: Product, intent: SearchIntent): number {
  let score = 0;

  if (intent.type) {
    const fit = typeFit(product, intent.type);
    if (fit === 'full') {
      score += TYPE_SCORE;
    } else if (fit === 'partial') {
      score += TYPE_SCORE / 10;
    }
  }

  if (intent.metal && matchesMetal(product, intent.metal)) {
    score += METAL_SCORE;
    if (intent.metal === 'gold' && product.productCategory === 'gold') {
      score += SOLID_GOLD_SCORE;
    }
  }

  if (intent.gender === 'men' && hasMenWord(product.name)) {
    score += GENDER_SCORE;
  }

  if (intent.stone === 'lab-grown' && matchesLabGrown(product)) {
    score += METAL_SCORE;
  }

  return score;
}

function typeFit(product: Product, type: SearchIntentType): 'full' | 'partial' | 'none' {
  const types = productTypeLabels(product);
  const name = product.name.toLowerCase();

  switch (type) {
    case 'chain':
      if (
        hasWord(name, 'chain') &&
        (types.includes('necklaces') || types.includes("men's chains"))
      ) {
        return 'full';
      }
      if (types.includes('necklaces') || types.includes("men's chains")) {
        return 'partial';
      }
      return 'none';
    case 'mangalsutra':
      if (
        types.includes('mangalsutras') ||
        (hasWord(name, 'mangalsutra') && !hasWord(name, 'bracelet'))
      ) {
        return 'full';
      }
      if (hasWord(name, 'mangalsutra')) {
        return 'partial';
      }
      return 'none';
    case 'bangle':
      return hasWord(name, 'bangle') || hasWord(name, 'kada') ? 'full' : 'none';
    case 'bracelet':
      if (
        types.includes('bracelets') ||
        types.includes("men's bracelets") ||
        hasWord(name, 'bracelet')
      ) {
        return 'full';
      }
      return 'none';
    case 'ring':
      if (types.includes('earrings') || hasWord(name, 'earring')) {
        return 'none';
      }
      if (types.includes('rings') || types.includes("men's rings") || hasWord(name, 'ring')) {
        return 'full';
      }
      return 'none';
    case 'earring':
      return types.includes('earrings') || hasWord(name, 'earring') ? 'full' : 'none';
    case 'studs':
      return (types.includes('earrings') || hasWord(name, 'earring') || hasWord(name, 'stud')) &&
        hasWord(name, 'stud')
        ? 'full'
        : 'none';
    case 'necklace':
      return types.includes('necklaces') || hasWord(name, 'necklace') ? 'full' : 'none';
    case 'anklet':
      return types.includes('anklets') || hasWord(name, 'anklet') ? 'full' : 'none';
    case 'pendant':
      return types.includes('pendants') || hasWord(name, 'pendant') ? 'full' : 'none';
    default:
      return 'none';
  }
}

function matchesMetal(product: Product, metal: SearchIntentMetal): boolean {
  const name = product.name.toLowerCase();
  const colors = (product.colors ?? []).join(' ').toLowerCase();

  switch (metal) {
    case 'silver':
      return /\bsilver\b|\b925\b/.test(name) || /\bsilver\b/.test(colors);
    case 'rose-gold':
      return /rose gold/.test(name);
    case 'gold-plated':
      return product.productCategory !== 'gold' && /gold[-\s]?plated|\bplated\b/.test(name);
    case '9kt':
      return product.productCategory === 'gold' || /\b9\s*kt\b/.test(name);
    case 'platinum':
      return product.productCategory === 'platinum' || /\bplatinum\b/.test(name);
    case 'gold':
      return product.productCategory === 'gold' || /\bgold\b/.test(name);
    default:
      return false;
  }
}

function matchesLabGrown(product: Product): boolean {
  const name = product.name.toLowerCase();

  if (/laboratory grown|\blab grown\b/.test(name)) {
    return true;
  }

  return product.productCategory === 'gold' && /\bdiamond\b/.test(name);
}

function hasMenWord(name: string): boolean {
  return /\bmens?\b/.test(name.toLowerCase());
}

function hasWord(name: string, word: string): boolean {
  return new RegExp(`\\b${word}s?\\b`, 'i').test(name);
}

function productTypeLabels(product: Product): string[] {
  const fromFilter = product.filterAttributes?.product_type ?? [];
  const fromCategory = product.category ? [product.category] : [];

  return [...fromFilter, ...fromCategory].map((label) => label.toLowerCase());
}
