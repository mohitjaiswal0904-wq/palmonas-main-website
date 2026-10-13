import { normalizeSearchQuery } from '@/lib/utils/search-query';

/** Fewest full matches on the first page before a second, narrower search. */
export const SEARCH_INTENT_MIN_MATCHES = 4;

export type SearchIntentType =
  | 'ring'
  | 'bracelet'
  | 'earring'
  | 'studs'
  | 'necklace'
  | 'chain'
  | 'mangalsutra'
  | 'bangle'
  | 'anklet'
  | 'pendant';

export type SearchIntentMetal =
  | 'silver'
  | 'gold'
  | 'rose-gold'
  | 'gold-plated'
  | '9kt'
  | 'platinum';

export type SearchIntentStone = 'lab-grown';

export interface SearchIntent {
  /** Text sent to the search API. */
  apiQuery: string;
  /** Catalog `product_type` label, when one type is confident. */
  productType?: string;
  /** Second query used when the first page has fewer than {@link SEARCH_INTENT_MIN_MATCHES}. */
  fallbackQuery?: string;
  /** Finished phrases to offer while the shopper is still typing. */
  suggestions: string[];
  type?: SearchIntentType;
  metal?: SearchIntentMetal;
  gender?: 'men';
  stone?: SearchIntentStone;
}

interface TypeRule {
  prefixes: string[];
  type: SearchIntentType;
  productType?: string;
}

const TYPE_RULES: TypeRule[] = [
  {
    prefixes: ['mangalsutra', 'mangalsutras', 'mangal'],
    type: 'mangalsutra',
    productType: 'mangalsutras',
  },
  {
    prefixes: ['earrings', 'earring', 'earings', 'earing', 'ear'],
    type: 'earring',
    productType: 'earrings',
  },
  { prefixes: ['bangles', 'bangle', 'bang', 'ban'], type: 'bangle' },
  {
    prefixes: ['bracelets', 'bracelet', 'brace', 'brac', 'bra'],
    type: 'bracelet',
    productType: 'bracelets',
  },
  { prefixes: ['necklaces', 'necklace'], type: 'necklace', productType: 'necklaces' },
  { prefixes: ['chains', 'chain', 'cha'], type: 'chain', productType: 'necklaces' },
  { prefixes: ['studs', 'stud'], type: 'studs', productType: 'earrings' },
  { prefixes: ['anklets', 'anklet', 'ank'], type: 'anklet', productType: 'anklets' },
  { prefixes: ['pendants', 'pendant', 'pend'], type: 'pendant', productType: 'pendants' },
  { prefixes: ['rings', 'ring', 'rin'], type: 'ring', productType: 'rings' },
];

const TOKEN_COMPLETIONS: Record<string, string> = {
  sil: 'silver',
  silv: 'silver',
  silve: 'silver',
  gol: 'gold',
  golde: 'gold',
  golden: 'gold',
  bra: 'bracelet',
  brac: 'bracelet',
  brace: 'bracelet',
  rin: 'ring',
  ear: 'earrings',
  earing: 'earrings',
  earings: 'earrings',
  mangal: 'mangalsutra',
  cha: 'chain',
  ban: 'bangle',
  bang: 'bangle',
  ank: 'anklet',
  pend: 'pendant',
};

const EMPTY_INTENT: SearchIntent = {
  apiQuery: '',
  suggestions: [],
};

/**
 * Reads a typed search into the query, type, metal, and gender the current catalog can serve.
 * Does not look up products.
 *
 * @param query - Raw search text from the shopper.
 * @returns Intent used to call the search API and to rank what comes back.
 */
export function parseSearchIntent(query: string): SearchIntent {
  const typed = normalizeSearchQuery(query).toLowerCase().replace(/['’]/g, '');

  if (!typed) {
    return EMPTY_INTENT;
  }

  const completed = completeTokens(rewriteSpellings(typed));
  const gender = detectGender(completed) ? 'men' : undefined;
  const apiQuery = applyGender(completed, gender);
  const typeRule = detectType(apiQuery);
  const metal = detectMetal(apiQuery);
  const stone = detectStone(apiQuery);

  return {
    apiQuery,
    productType: resolveProductType(typeRule, gender),
    fallbackQuery: buildFallback(apiQuery, typeRule?.type, stone),
    suggestions: apiQuery !== typed ? [apiQuery] : [],
    type: typeRule?.type,
    metal,
    gender,
    stone,
  };
}

function rewriteSpellings(query: string): string {
  return query
    .replace(/\b9\s*carat\b/g, '9kt')
    .replace(/\b9\s*kt\b/g, '9kt')
    .replace(/\b9\s*k\b/g, '9kt')
    .replace(/\bmens\b/g, 'men')
    .replace(/\bman\b/g, 'men');
}

function completeTokens(query: string): string {
  return query
    .split(' ')
    .map((token) => completeToken(token, query))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function completeToken(token: string, query: string): string {
  const completed = TOKEN_COMPLETIONS[token];

  if (completed) {
    return completed;
  }

  if (token.length >= 4 && 'platinum'.startsWith(token) && !query.includes('gold')) {
    return 'platinum';
  }

  return token;
}

function detectGender(query: string): boolean {
  return /\bmen\b/.test(query) || /\bfor men\b/.test(query);
}

function applyGender(query: string, gender: 'men' | undefined): string {
  if (gender !== 'men') {
    return query;
  }

  const rest = query
    .replace(/\bfor men\b/g, ' ')
    .replace(/\bmen\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return rest ? `men ${rest}` : 'men';
}

function detectType(query: string): TypeRule | undefined {
  const tokens = query.split(' ').filter((token) => token.length > 0);
  const matches = TYPE_RULES.filter((rule) =>
    tokens.some((token) => tokenMatches(token, rule.prefixes)),
  );

  if (matches.length !== 1) {
    return undefined;
  }

  return matches[0];
}

function tokenMatches(token: string, prefixes: string[]): boolean {
  return prefixes.some(
    (prefix) => prefix === token || (token.length >= 3 && prefix.startsWith(token)),
  );
}

function detectMetal(query: string): SearchIntentMetal | undefined {
  if (/\b9kt\b/.test(query)) {
    return '9kt';
  }

  if (/\brose gold\b/.test(query)) {
    return 'rose-gold';
  }

  if (hasPlatinum(query)) {
    return 'platinum';
  }

  if (/\bgold plated\b|\bgold pla\b|\bgold pl\b/.test(query)) {
    return 'gold-plated';
  }

  if (
    /\bsilver\b|\b925\b/.test(query) ||
    query.split(' ').some((token) => tokenMatches(token, ['silver']))
  ) {
    return 'silver';
  }

  if (/\bgold\b/.test(query)) {
    return 'gold';
  }

  return undefined;
}

function hasPlatinum(query: string): boolean {
  return query
    .split(' ')
    .some((token) => token === 'platinum' || (token.length >= 4 && 'platinum'.startsWith(token)));
}

function detectStone(query: string): SearchIntentStone | undefined {
  if (/\bdiamond\b|\blab grown\b/.test(query)) {
    return 'lab-grown';
  }

  return undefined;
}

function resolveProductType(
  typeRule: TypeRule | undefined,
  gender: 'men' | undefined,
): string | undefined {
  if (!typeRule) {
    return undefined;
  }

  if (gender === 'men') {
    if (typeRule.type === 'ring') {
      return "men's rings";
    }

    if (typeRule.type === 'bracelet') {
      return "men's bracelets";
    }

    if (typeRule.type === 'chain' || typeRule.type === 'necklace') {
      return "men's chains";
    }
  }

  return typeRule.productType;
}

function buildFallback(
  apiQuery: string,
  type: SearchIntentType | undefined,
  stone: SearchIntentStone | undefined,
): string | undefined {
  if (type === 'chain' && !apiQuery.includes('necklace')) {
    return `${apiQuery} necklace`;
  }

  if (type === 'studs' && !apiQuery.includes('earring')) {
    return `${apiQuery} earrings`;
  }

  if (stone === 'lab-grown' && !apiQuery.includes('lab')) {
    const typeWord =
      type === 'ring'
        ? ' ring'
        : type === 'earring'
          ? ' earrings'
          : type === 'bracelet'
            ? ' bracelet'
            : type === 'necklace'
              ? ' necklace'
              : type === 'studs'
                ? ' studs'
                : '';

    return `lab grown diamond${typeWord}`;
  }

  return undefined;
}

/**
 * Places finished-word suggestions ahead of the existing suggestion list.
 *
 * @param typedQuery - Current input value.
 * @param terms - Suggestions already collected from history and popular searches.
 * @param limit - Maximum terms to return.
 * @returns Intent suggestions first, then the remaining terms.
 */
export function mergeIntentSuggestions(
  typedQuery: string,
  terms: string[],
  limit: number,
): string[] {
  const suggestions = parseSearchIntent(typedQuery).suggestions;
  const rest = terms.filter((term) => !suggestions.includes(term));

  return [...suggestions, ...rest].slice(0, limit);
}
