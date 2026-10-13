import {
  collectAdjacentDrawerImageUrls,
  collectDrawerCategoryImageUrls,
  getDrawerViewportImageCount,
  prefetchAdjacentDrawerImages,
  prefetchDrawerImageUrls,
} from '@/lib/drawer/drawer-image-prefetch';
import type {
  DrawerHomeType,
  DrawerMenuCategory,
  DrawerMenuForHomeType,
  DrawerPriceRange,
  DrawerTab,
} from '@/types/drawer-menu';

function makeCategory(
  overrides: Partial<DrawerMenuCategory> & Pick<DrawerMenuCategory, 'id' | 'layoutType'>,
): DrawerMenuCategory {
  return {
    label: overrides.label ?? overrides.id,
    items: overrides.items ?? [],
    ...overrides,
  };
}

describe('getDrawerViewportImageCount', () => {
  it('returns layout-specific first-viewport counts', () => {
    expect(getDrawerViewportImageCount('grid-3')).toBe(6);
    expect(getDrawerViewportImageCount('grid-2-banner')).toBe(4);
    expect(getDrawerViewportImageCount('banner-list')).toBe(3);
    expect(getDrawerViewportImageCount('price-range')).toBe(4);
  });
});

describe('collectDrawerCategoryImageUrls', () => {
  it('returns empty array when category is missing', () => {
    expect(collectDrawerCategoryImageUrls(null)).toEqual([]);
    expect(collectDrawerCategoryImageUrls(undefined)).toEqual([]);
  });

  it('caps grid item URLs to the layout viewport count and skips blanks', () => {
    const category = makeCategory({
      id: 'category',
      layoutType: 'grid-3',
      items: [
        { id: '1', label: 'A', imageUrl: 'https://cdn.example.com/1.jpg' },
        { id: '2', label: 'B', imageUrl: '   ' },
        { id: '3', label: 'C', imageUrl: 'https://cdn.example.com/3.jpg' },
        { id: '4', label: 'D', imageUrl: 'https://cdn.example.com/4.jpg' },
        { id: '5', label: 'E', imageUrl: 'https://cdn.example.com/5.jpg' },
        { id: '6', label: 'F', imageUrl: 'https://cdn.example.com/6.jpg' },
        { id: '7', label: 'G', imageUrl: 'https://cdn.example.com/7.jpg' },
        { id: '8', label: 'H', imageUrl: 'https://cdn.example.com/8.jpg' },
      ],
    });

    expect(collectDrawerCategoryImageUrls(category)).toEqual([
      'https://cdn.example.com/1.jpg',
      'https://cdn.example.com/3.jpg',
      'https://cdn.example.com/4.jpg',
      'https://cdn.example.com/5.jpg',
      'https://cdn.example.com/6.jpg',
      'https://cdn.example.com/7.jpg',
    ]);
  });

  it('collects price-range images from priceRanges, not category items', () => {
    const category = makeCategory({
      id: 'price',
      layoutType: 'price-range',
      items: [{ id: 'ignored', label: 'X', imageUrl: 'https://cdn.example.com/ignored.jpg' }],
    });
    const priceRanges: DrawerPriceRange[] = [
      {
        id: 'p1',
        label: 'Under 10k',
        min: 0,
        max: 10_000,
        imageUrl: 'https://cdn.example.com/p1.jpg',
      },
      { id: 'p2', label: '10-20k', min: 10_000, max: 20_000, imageUrl: '' },
      {
        id: 'p3',
        label: '20-30k',
        min: 20_000,
        max: 30_000,
        imageUrl: 'https://cdn.example.com/p3.jpg',
      },
      {
        id: 'p4',
        label: '30-40k',
        min: 30_000,
        max: 40_000,
        imageUrl: 'https://cdn.example.com/p4.jpg',
      },
      {
        id: 'p5',
        label: '40k+',
        min: 40_000,
        max: null,
        imageUrl: 'https://cdn.example.com/p5.jpg',
      },
      {
        id: 'p6',
        label: 'extra',
        min: 0,
        max: null,
        imageUrl: 'https://cdn.example.com/p6.jpg',
      },
    ];

    expect(collectDrawerCategoryImageUrls(category, priceRanges)).toEqual([
      'https://cdn.example.com/p1.jpg',
      'https://cdn.example.com/p3.jpg',
      'https://cdn.example.com/p4.jpg',
      'https://cdn.example.com/p5.jpg',
    ]);
  });
});

describe('prefetchDrawerImageUrls', () => {
  const originalImage = window.Image;
  let lastImage: { src: string; fetchPriority?: string; decoding: string };

  beforeEach(() => {
    window.Image = jest.fn().mockImplementation(() => {
      lastImage = { src: '', decoding: 'auto' };
      return lastImage;
    }) as unknown as typeof Image;
  });

  afterEach(() => {
    window.Image = originalImage;
  });

  it('warms the raw CDN URL so it matches unoptimized next/image', () => {
    prefetchDrawerImageUrls(['https://cdn.example.com/a.jpg', 'https://cdn.example.com/a.jpg']);

    expect(window.Image).toHaveBeenCalledTimes(1);
    expect(lastImage.src).toBe('https://cdn.example.com/a.jpg');
    expect(lastImage.fetchPriority).toBe('low');
  });

  it('stops assigning sources when the abort signal fires', () => {
    const controller = new AbortController();
    controller.abort();

    prefetchDrawerImageUrls(['https://cdn.example.com/a.jpg'], controller.signal);

    expect(window.Image).not.toHaveBeenCalled();
  });
});

describe('collectAdjacentDrawerImageUrls / prefetchAdjacentDrawerImages', () => {
  const originalImage = window.Image;

  const tabs: DrawerTab[] = [
    { id: 'demifine', label: 'Demifine®', ariaLabel: 'Demifine® Jewellery' },
    { id: 'gold', label: 'Gold', ariaLabel: 'Gold Jewellery' },
  ];

  const menusByHomeType: Record<DrawerHomeType, DrawerMenuForHomeType> = {
    demifine: {
      categories: [
        makeCategory({
          id: 'category',
          layoutType: 'grid-3',
          items: [
            { id: 'c1', label: 'C1', imageUrl: 'https://cdn.example.com/demi-cat-1.jpg' },
            { id: 'c2', label: 'C2', imageUrl: 'https://cdn.example.com/demi-cat-2.jpg' },
          ],
        }),
        makeCategory({
          id: 'gender',
          layoutType: 'grid-3',
          items: [
            { id: 'g1', label: 'G1', imageUrl: 'https://cdn.example.com/demi-gender-1.jpg' },
            { id: 'g2', label: 'G2', imageUrl: 'https://cdn.example.com/demi-gender-2.jpg' },
          ],
        }),
        makeCategory({
          id: 'collection',
          layoutType: 'grid-3',
          items: [
            { id: 'col1', label: 'Col1', imageUrl: 'https://cdn.example.com/demi-col-1.jpg' },
          ],
        }),
        makeCategory({
          id: 'hidden',
          layoutType: 'banner-list',
          hiddenInSidebar: true,
          items: [{ id: 'h1', label: 'H1', imageUrl: 'https://cdn.example.com/hidden.jpg' }],
        }),
      ],
      bottomItems: [],
    },
    gold: {
      categories: [
        makeCategory({
          id: 'category',
          layoutType: 'grid-3',
          items: [
            { id: 'gc1', label: 'GC1', imageUrl: 'https://cdn.example.com/gold-1.jpg' },
            { id: 'gc2', label: 'GC2', imageUrl: 'https://cdn.example.com/gold-2.jpg' },
          ],
        }),
      ],
      bottomItems: [],
    },
    silver: { categories: [], bottomItems: [] },
  };

  beforeEach(() => {
    window.Image = jest.fn().mockImplementation(() => ({
      decoding: 'auto',
      src: '',
    })) as unknown as typeof Image;
  });

  afterEach(() => {
    window.Image = originalImage;
  });

  it('collects next two sidebar categories plus next home pill', () => {
    expect(
      collectAdjacentDrawerImageUrls({
        activeTab: 'demifine',
        activeCategoryId: 'category',
        menusByHomeType,
        tabs,
        sidebarLookahead: 2,
      }),
    ).toEqual([
      'https://cdn.example.com/demi-gender-1.jpg',
      'https://cdn.example.com/demi-gender-2.jpg',
      'https://cdn.example.com/demi-col-1.jpg',
      'https://cdn.example.com/gold-1.jpg',
      'https://cdn.example.com/gold-2.jpg',
    ]);
  });

  it('prefetches collected adjacent URLs', () => {
    prefetchAdjacentDrawerImages({
      activeTab: 'demifine',
      activeCategoryId: 'category',
      menusByHomeType,
      tabs,
      sidebarLookahead: 2,
    });

    expect(window.Image).toHaveBeenCalledTimes(5);
  });

  it('skips next home pill when already on the last tab', () => {
    expect(
      collectAdjacentDrawerImageUrls({
        activeTab: 'gold',
        activeCategoryId: 'category',
        menusByHomeType,
        tabs,
      }),
    ).toEqual([]);
  });

  it('is a no-op when aborted before start', () => {
    const controller = new AbortController();
    controller.abort();

    prefetchAdjacentDrawerImages({
      activeTab: 'demifine',
      activeCategoryId: 'category',
      menusByHomeType,
      tabs,
      signal: controller.signal,
    });

    expect(window.Image).not.toHaveBeenCalled();
  });
});
