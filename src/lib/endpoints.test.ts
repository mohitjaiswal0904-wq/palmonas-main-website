import { ENDPOINTS } from '@/lib/endpoints';

describe('product detail endpoints', () => {
  it('builds the numeric product detail endpoint', () => {
    expect(ENDPOINTS.products.detail('12345')).toBe('/api/v2/product/id/12345');
  });

  it('builds the handle-based product detail endpoint', () => {
    expect(ENDPOINTS.products.detailByHandle('classic-gold-ring')).toBe(
      '/api/v2/product/handle/classic-gold-ring',
    );
  });

  it('routes numeric product page params to the ID endpoint', () => {
    expect(ENDPOINTS.products.detailFromRouteParam('12345')).toBe('/api/v2/product/id/12345');
  });

  it('routes non-numeric product page params to the handle endpoint', () => {
    expect(ENDPOINTS.products.detailFromRouteParam('classic-gold-ring')).toBe(
      '/api/v2/product/handle/classic-gold-ring',
    );
  });

  it('builds the product bundles endpoint from a handle', () => {
    expect(ENDPOINTS.products.bundles('hearts-all-over-bracelet-18k-gold-plated-88883')).toBe(
      '/api/v2/shopify/product/hearts-all-over-bracelet-18k-gold-plated-88883/bundles',
    );
  });

  it('encodes bundle handle path segments', () => {
    expect(ENDPOINTS.products.bundles('look/set')).toBe('/api/v2/shopify/product/set/bundles');
  });
});

describe('cart endpoints', () => {
  it('uses v2 cart paths', () => {
    expect(ENDPOINTS.cart.current).toBe('/api/v2/cart/current');
    expect(ENDPOINTS.cart.add).toBe('/api/v2/cart/add');
    expect(ENDPOINTS.cart.byId('abc')).toBe('/api/v2/cart/by-id/abc');
  });
});

describe('blog endpoints', () => {
  it('builds the blog articles list endpoint', () => {
    expect(ENDPOINTS.blogs.articles('news')).toBe('/api/v2/blogs/news/articles');
  });

  it('builds the blog article detail endpoint', () => {
    expect(ENDPOINTS.blogs.article('news', 'lab-grown-diamonds')).toBe(
      '/api/v2/blogs/news/articles/lab-grown-diamonds',
    );
  });
});

describe('POP endpoints', () => {
  it('exposes the create subscription endpoint', () => {
    expect(ENDPOINTS.pop.subscriptions).toBe('/api/v2/pop/subscriptions');
  });

  it('builds the subscription detail endpoint', () => {
    expect(ENDPOINTS.pop.subscriptionDetail('42')).toBe('/api/v2/pop/subscriptions/42');
  });
});
