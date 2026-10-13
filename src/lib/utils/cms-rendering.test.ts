import { isVideoUrl } from '@/lib/utils/cms-media';
import { transformCmsProducts, transformCollectionProducts } from '@/lib/utils/cms-products';
import { parseInlineCss } from '@/lib/utils/parse-inline-css';
import { runCmsAction } from '@/lib/utils/run-cms-action';

describe('parseInlineCss', () => {
  it('parses gap declarations into camelCase style keys', () => {
    expect(parseInlineCss('gap: 16px; row-gap: 8px')).toEqual({
      gap: '16px',
      rowGap: '8px',
    });
  });
});

describe('runCmsAction', () => {
  it('routes collection actions to collection pages', () => {
    const push = jest.fn();

    runCmsAction({ action_type: 'collection', action_value: 'rings' }, { push });

    expect(push).toHaveBeenCalledWith('/collections/rings');
  });

  it('routes curated collection actions to collection routes', () => {
    const push = jest.fn();

    runCmsAction({ action_type: 'collection', action_value: 'shraddhas-favourite' }, { push });
    expect(push).toHaveBeenCalledWith('/collections/shraddhas-favourite');

    runCmsAction({ action_type: 'collection', action_value: 'emily-paris-collection' }, { push });
    expect(push).toHaveBeenCalledWith('/collections/emily-paris-collection');
  });
});

describe('isVideoUrl', () => {
  it('detects common video extensions', () => {
    expect(isVideoUrl('https://cdn.example.com/clip.mp4')).toBe(true);
    expect(isVideoUrl('https://cdn.example.com/image.jpg')).toBe(false);
  });
});

describe('transformCmsProducts', () => {
  it('maps CMS product payloads into storefront products', () => {
    const products = transformCmsProducts([
      {
        id: 'gid://shopify/Product/1',
        title: 'Gold Ring',
        handle: 'gold-ring',
        price: { amount: '1299.00', currencyCode: 'INR' },
        image: { url: 'https://cdn.example.com/ring.jpg' },
      },
    ]);

    expect(products).toHaveLength(1);
    expect(products[0]?.handle).toBe('gold-ring');
    expect(products[0]?.price).toBe(1299);
    expect(products[0]?.image).toBe('https://cdn.example.com/ring.jpg');
  });
});

describe('transformCollectionProducts', () => {
  it('maps collection API product payloads into storefront products', () => {
    const products = transformCollectionProducts([
      {
        id: '9043668861185',
        handle: 'textured-disc-open-ring',
        name: 'Textured Disc Open Ring',
        price: 2379,
        compare_at_price: 2979,
        image_url: 'https://cdn.example.com/ring.jpg',
        offers: [{ key: 'offer-1', name: 'Extra 10% off', code: 'SAVE10', type: 'DISCOUNT' }],
      },
    ]);

    expect(products).toHaveLength(1);
    expect(products[0]?.handle).toBe('textured-disc-open-ring');
    expect(products[0]?.price).toBe(2379);
    expect(products[0]?.compareAtPrice).toBe(2979);
    expect(products[0]?.image).toBe('https://cdn.example.com/ring.jpg');
    expect(products[0]?.offers).toHaveLength(1);
  });

  it('respects maxProducts when provided', () => {
    const products = transformCollectionProducts(
      [
        { id: '1', handle: 'one', name: 'One', price: 100 },
        { id: '2', handle: 'two', name: 'Two', price: 200 },
      ],
      1,
    );

    expect(products).toHaveLength(1);
    expect(products[0]?.handle).toBe('one');
  });
});
