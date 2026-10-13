import { applyProductListing, sortProducts } from '@/lib/utils/product-listing';
import type { Product } from '@/types/product';
import {
  countActiveFilters,
  createEmptyProductFilters,
  DEFAULT_PRODUCT_FILTER_GROUPS,
} from '@/types/product-listing';

describe('product-listing utils', () => {
  const products: Product[] = [
    {
      id: '1',
      handle: '1',
      name: 'Z Ring',
      description: '',
      price: 1500,
      image: '',
      images: [],
      category: 'rings',
      productCategory: 'demifine',
      offers: [],
      variants: [],
    },
    {
      id: '2',
      handle: '2',
      name: 'A Necklace',
      description: '',
      price: 6000,
      image: '',
      images: [],
      category: 'necklaces',
      productCategory: 'demifine',
      offers: [],
      variants: [],
    },
  ];

  it('sorts products by price ascending', () => {
    expect(sortProducts(products, 'price-asc').map((product) => product.id)).toEqual(['1', '2']);
  });

  it('filters products by price range', () => {
    const filters = createEmptyProductFilters(DEFAULT_PRODUCT_FILTER_GROUPS);
    filters.price = ['under-2000'];

    expect(applyProductListing(products, 'featured', filters)).toHaveLength(1);
    expect(applyProductListing(products, 'featured', filters)[0]?.id).toBe('1');
  });

  it('counts active filters', () => {
    const filters = createEmptyProductFilters(DEFAULT_PRODUCT_FILTER_GROUPS);
    filters.category = ['rings'];
    filters.price = ['under-2000'];

    expect(countActiveFilters(filters)).toBe(2);
  });
});
