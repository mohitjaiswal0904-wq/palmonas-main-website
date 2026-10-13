import { clearAnalyticsPageContext, setAnalyticsPageContext } from '@/lib/analytics/analytics-page-context';
import {
  buildAnalyticsPageProperties,
  parsePathnameAnalyticsContext,
  resolveAnalyticsPageContext,
} from '@/lib/analytics/build-analytics-page-properties';

describe('parsePathnameAnalyticsContext', () => {
  it('parses collection and product routes', () => {
    expect(parsePathnameAnalyticsContext('/collections/gifts-for-him')).toEqual({
      pageType: 'collection',
      collectionHandle: 'gifts-for-him',
    });
    expect(parsePathnameAnalyticsContext('/products/gold-ring')).toEqual({
      pageType: 'product',
      productHandle: 'gold-ring',
    });
  });
});

describe('resolveAnalyticsPageContext', () => {
  afterEach(() => {
    clearAnalyticsPageContext();
  });

  it('merges SSR page names over URL handles', () => {
    setAnalyticsPageContext({
      pageType: 'product',
      productName: 'Gold Ring',
      productHandle: 'gold-ring',
    });

    expect(resolveAnalyticsPageContext('/products/gold-ring')).toEqual({
      pageType: 'product',
      productHandle: 'gold-ring',
      productName: 'Gold Ring',
    });
  });
});

describe('buildAnalyticsPageProperties', () => {
  it('maps collection and product fields to analytics keys', () => {
    expect(
      buildAnalyticsPageProperties({
        pageType: 'collection',
        collectionName: 'Gifts for Him',
        collectionHandle: 'gifts-for-him',
      }),
    ).toEqual({
      page_type: 'collection',
      collection_name: 'Gifts for Him',
      collection_handle: 'gifts-for-him',
    });
  });
});
