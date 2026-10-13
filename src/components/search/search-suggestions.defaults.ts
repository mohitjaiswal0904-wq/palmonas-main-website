import type { SearchSuggestions } from '@/types/search-suggestions';

export const DEFAULT_SEARCH_SUGGESTIONS: SearchSuggestions = {
  popularTerms: ['Rings', 'Gold Earrings', 'Mangalsutra', 'Bracelets', 'Pendants', 'Silver Chains'],
  recentSearchTerms: [],
  headerPopularTerms: ['Ring', 'Gold Ring', 'Earrings', 'Bracelets'],
  popularCollections: [
    { label: 'Rings Collection', handle: 'rings' },
    { label: 'Solitaire Collection', handle: 'solitaire-rings' },
    { label: 'Demifine® Collection', handle: 'shop-by-category' },
    { label: 'Gold Collection', handle: '9kt-fine-gold' },
  ],
  exploreTerms: [
    { label: 'Gold', query: 'Gold' },
    { label: 'Silver', query: 'Silver' },
    { label: 'Demifine®', query: 'Demifine' },
  ],
};
