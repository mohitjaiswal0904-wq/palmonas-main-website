import {
  mergeCollectionWithListMeta,
  transformCollection,
  transformCollectionListMeta,
} from '@/types/collection';

describe('transformCollectionListMeta', () => {
  it('maps collection_image from the products list API', () => {
    expect(
      transformCollectionListMeta({
        collection_handle: 'gold-best-sellers',
        collection_title: 'Gold Best Sellers',
        collection_type: 'NORMAL',
        collection_image: {
          id: 'gid://shopify/MediaImage/39500762644737',
          url: 'https://cdn.shopify.com/collection-banner.jpg',
          altText: null,
          width: 8000,
          height: 2896,
        },
      }),
    ).toEqual({
      handle: 'gold-best-sellers',
      title: 'Gold Best Sellers',
      type: 'NORMAL',
      image: {
        url: 'https://cdn.shopify.com/collection-banner.jpg',
        width: 8000,
        height: 2896,
      },
    });
  });

  it('returns undefined when collection metadata is absent', () => {
    expect(transformCollectionListMeta({})).toBeUndefined();
    expect(transformCollectionListMeta({ collection_image: null })).toBeUndefined();
  });
});

describe('mergeCollectionWithListMeta', () => {
  const baseCollection = transformCollection({
    handle: 'gold-best-sellers',
    title: 'Fallback Title',
  });

  it('prefers products-list image and title for collection page banner', () => {
    const merged = mergeCollectionWithListMeta(baseCollection, {
      handle: 'gold-best-sellers',
      title: 'Gold Best Sellers',
      image: {
        url: 'https://cdn.shopify.com/collection-banner.jpg',
        altText: 'Gold Best Sellers',
        width: 8000,
        height: 2896,
      },
    });

    expect(merged.title).toBe('Gold Best Sellers');
    expect(merged.image).toBe('https://cdn.shopify.com/collection-banner.jpg');
    expect(merged.imageAlt).toBe('Gold Best Sellers');
    expect(merged.imageWidth).toBe(8000);
    expect(merged.imageHeight).toBe(2896);
  });

  it('keeps the base collection when list metadata is missing', () => {
    expect(mergeCollectionWithListMeta(baseCollection, undefined)).toEqual(baseCollection);
  });
});
