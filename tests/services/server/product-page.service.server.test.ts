import { getProductPageServerData } from '@/services/server/product-page.service.server';
import { PRODUCT_CATEGORY } from '@/types/product';

jest.mock('@/services/server/product.service.server', () => ({
  getProductByHandle: jest.fn(),
  getRelatedProducts: jest.fn(),
}));

jest.mock('@/lib/utils/variant-options', () => ({
  getDefaultVariant: (variants: Array<{ sku?: string }>) => variants[0],
}));

jest.mock('@/services/server/mto-price.service.server', () => ({
  getMtoPrice: jest.fn(),
}));

const { getProductByHandle } = jest.requireMock<{ getProductByHandle: jest.Mock }>(
  '@/services/server/product.service.server',
);
const { getMtoPrice } = jest.requireMock<{ getMtoPrice: jest.Mock }>(
  '@/services/server/mto-price.service.server',
);

const demifineProduct = {
  id: 'p1',
  handle: 'ring-1',
  productCategory: PRODUCT_CATEGORY.DEMIFINE,
  variants: [{ id: 'v1', sku: 'SKU-1', selectedOptions: [] }],
};

const goldProduct = {
  id: 'g1',
  handle: 'gold-ring',
  productCategory: PRODUCT_CATEGORY.GOLD,
  variants: [
    { id: 'v1', sku: 'GOLD-A', selectedOptions: [] },
    { id: 'v2', sku: 'GOLD-B', selectedOptions: [] },
  ],
};

describe('getProductPageServerData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns demifine product without related or MTO fetches', async () => {
    getProductByHandle.mockResolvedValue(demifineProduct);

    const result = await getProductPageServerData('ring-1');

    expect(result).toEqual({ product: demifineProduct });
    expect(getMtoPrice).not.toHaveBeenCalled();
  });

  it('loads only the default-variant gold price for gold products', async () => {
    getProductByHandle.mockResolvedValue(goldProduct);
    getMtoPrice.mockResolvedValue({
      totalPrice: 12_000,
      pricePerGram: 5_500,
      showCalculation: true,
    });

    const result = await getProductPageServerData('gold-ring');

    expect(getMtoPrice).toHaveBeenCalledTimes(1);
    expect(getMtoPrice).toHaveBeenCalledWith({ sku: 'GOLD-A', purity: '9kt' });
    expect(result.initialGoldPriceSku).toBe('GOLD-A');
    expect(result.initialGoldPrice).toEqual({
      totalPrice: 12_000,
      pricePerGram: 5_500,
      showCalculation: true,
    });
  });

  it('omits initial gold price when MTO returns an empty payload', async () => {
    getProductByHandle.mockResolvedValue(goldProduct);
    getMtoPrice.mockResolvedValue({ totalPrice: 0, pricePerGram: 0, showCalculation: false });

    const result = await getProductPageServerData('gold-ring');

    expect(result.initialGoldPriceSku).toBe('GOLD-A');
    expect(result.initialGoldPrice).toBeUndefined();
  });

  it('returns gold product when default MTO price fails', async () => {
    getProductByHandle.mockResolvedValue(goldProduct);
    getMtoPrice.mockRejectedValue(new Error('mto down'));

    const result = await getProductPageServerData('gold-ring');

    expect(result.product).toEqual(goldProduct);
    expect(result.initialGoldPriceSku).toBe('GOLD-A');
    expect(result.initialGoldPrice).toBeUndefined();
  });

  it('omits gold price fields when every variant is missing a sku', async () => {
    getProductByHandle.mockResolvedValue({
      ...goldProduct,
      variants: [{ id: 'v1', selectedOptions: [] }],
    });

    const result = await getProductPageServerData('gold-ring');

    expect(getMtoPrice).not.toHaveBeenCalled();
    expect(result).toEqual({
      product: { ...goldProduct, variants: [{ id: 'v1', selectedOptions: [] }] },
    });
    expect('initialGoldPriceSku' in result).toBe(false);
  });
});
