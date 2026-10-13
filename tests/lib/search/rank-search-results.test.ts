import { rankSearchResults } from '@/lib/search/rank-search-results';
import { parseSearchIntent } from '@/lib/search/search-intent';
import type { Product, ProductCategory } from '@/types/product';

/**
 * Builds a product fixture with the catalog fields the ranker reads.
 *
 * @param name - Shopper-facing product name.
 * @param productType - Catalog product_type label.
 * @param productCategory - demifine, gold, or platinum.
 * @returns A Product the ranker can score.
 */
function product(
  name: string,
  productType: string,
  productCategory: ProductCategory = 'demifine',
): Product {
  return {
    id: name,
    handle: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    description: '',
    price: 1000,
    image: '',
    images: [],
    category: productCategory,
    productCategory,
    filterAttributes: { product_type: [productType] },
    offers: [],
    variants: [],
  };
}

describe('rankSearchResults', () => {
  it('puts a chain necklace before a chain ring', () => {
    const intent = parseSearchIntent('chain');
    const ranked = rankSearchResults(
      [product('Chain Forge Textured Ring', 'rings'), product('Gold Chain Necklace', 'necklaces')],
      intent,
    );

    expect(ranked.map((item) => item.name)).toEqual([
      'Gold Chain Necklace',
      'Chain Forge Textured Ring',
    ]);
  });

  it('puts a mangalsutra necklace before a mangalsutra bracelet', () => {
    const ranked = rankSearchResults(
      [
        product('Threads of Love Mangalsutra Bracelet', 'mangalsutra bracelets'),
        product('Timeless Elegance Mangalsutra', 'mangalsutras'),
      ],
      parseSearchIntent('mangalsutra'),
    );

    expect(ranked[0]?.name).toBe('Timeless Elegance Mangalsutra');
  });

  it('puts bangles before other jewellery', () => {
    const ranked = rankSearchResults(
      [
        product('Golden Twirl Pendant Necklace', 'necklaces'),
        product('Plain Stackable Bangle Bracelet', 'bracelets'),
      ],
      parseSearchIntent('bangles'),
    );

    expect(ranked[0]?.name).toBe('Plain Stackable Bangle Bracelet');
  });

  it('ranks men ahead of mangalsutra when the query was man', () => {
    const ranked = rankSearchResults(
      [
        product('Timeless Elegance Mangalsutra', 'mangalsutras'),
        product("Bold Men's 925 Silver Ring", "men's rings"),
      ],
      parseSearchIntent('man'),
    );

    expect(ranked[0]?.name).toBe("Bold Men's 925 Silver Ring");
  });

  it('puts a silver chain necklace before silver chain earrings', () => {
    const ranked = rankSearchResults(
      [
        product('Silver Chain Tassel Earrings', 'earrings'),
        product('Layered Silver Chain Necklace', 'necklaces'),
      ],
      parseSearchIntent('silver chain'),
    );

    expect(ranked.map((item) => item.name)[0]).toBe('Layered Silver Chain Necklace');
  });

  it('puts a mens silver ring before a womens silver ring', () => {
    const ranked = rankSearchResults(
      [
        product('925 Silver Indi Ring', 'rings'),
        product("Bold Men's 925 Silver Ring", "men's rings"),
      ],
      parseSearchIntent('silver ring for men'),
    );

    expect(ranked[0]?.name).toBe("Bold Men's 925 Silver Ring");
  });

  it('drops hair ties and gift boxes and leads gold with solid 9kt', () => {
    const ranked = rankSearchResults(
      [
        product('Heart Hair Tie | Gold', 'hair ties'),
        product('Golden Glow Heartbeat Gift Box', 'gift box'),
        product('Detailed Gold Bracelet', 'bracelets'),
        product('Prism 9KT Gold Ring', 'rings', 'gold'),
      ],
      parseSearchIntent('gold'),
    );

    expect(ranked.map((item) => item.name)).toEqual([
      'Prism 9KT Gold Ring',
      'Detailed Gold Bracelet',
    ]);
  });

  it('puts lab-grown diamond ahead of crystal pieces that only use the word', () => {
    const ranked = rankSearchResults(
      [
        product('Diamond Drift Drop Earrings', 'earrings'),
        product('Pear Drop 9KT Gold Laboratory Grown Diamond Earrings', 'earrings', 'gold'),
      ],
      parseSearchIntent('diamond'),
    );

    expect(ranked[0]?.name).toContain('Laboratory Grown');
  });

  it('returns nothing when platinum bracelets are not in the results', () => {
    const ranked = rankSearchResults(
      [product('Aurelia Citrine Platinum Plated Ring', 'rings', 'platinum')],
      parseSearchIntent('platinum bracelet'),
    );

    expect(ranked).toEqual([]);
  });

  it('returns nothing for a mens platinum ring that is not sold', () => {
    const ranked = rankSearchResults(
      [product('Aurelia Citrine Platinum Plated Ring', 'rings', 'platinum')],
      parseSearchIntent('platinum ring for men'),
    );

    expect(ranked).toEqual([]);
  });

  it('returns nothing for a platinum chain necklace that is not sold', () => {
    const ranked = rankSearchResults(
      [product('Aurelia Octa Platinum Plated Necklace', 'necklaces', 'platinum')],
      parseSearchIntent('platinum chain'),
    );

    expect(ranked).toEqual([]);
  });

  it('keeps platinum rings that exist', () => {
    const ranked = rankSearchResults(
      [product('Aurelia Citrine Platinum Plated Ring', 'rings', 'platinum')],
      parseSearchIntent('platinum ring'),
    );

    expect(ranked).toHaveLength(1);
  });
});
