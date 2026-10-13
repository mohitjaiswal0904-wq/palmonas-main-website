import { goldPriceSectionConfig, homeMessages } from '@/config/home/home.config';

describe('home config', () => {
  it('provides the gold price section display label', () => {
    expect(homeMessages.labels.shopByPrice).toBe('Shop By Price');
  });

  it('identifies gold price collection paths', () => {
    expect(
      '/collections/gold-less-than-10k'.startsWith(
        goldPriceSectionConfig.collectionPathPrefix,
      ),
    ).toBe(true);
  });
});
