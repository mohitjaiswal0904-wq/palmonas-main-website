import {
  PRODUCT_PDP_PRICE_ID,
  readPdpHeaderPriceFromElement,
} from '@/lib/product/pdp-header-price';

describe('readPdpHeaderPriceFromElement', () => {
  it('reads selling and compare-at prices from the header node', () => {
    const element = document.createElement('div');
    element.dataset.sellingPrice = '3266';
    element.dataset.compareAtPrice = '4500';

    expect(readPdpHeaderPriceFromElement(element)).toEqual({
      price: 3266,
      compareAtPrice: 4500,
    });
  });

  it('omits compare-at when the dataset value is missing', () => {
    const element = document.createElement('div');
    element.dataset.sellingPrice = '1000';

    expect(readPdpHeaderPriceFromElement(element)).toEqual({
      price: 1000,
      compareAtPrice: null,
    });
  });

  it('returns nulls when the header node is missing', () => {
    expect(readPdpHeaderPriceFromElement(null)).toEqual({
      price: null,
      compareAtPrice: null,
    });
  });

  it('returns nulls when selling price is not a finite number', () => {
    const element = document.createElement('div');
    element.dataset.sellingPrice = 'abc';
    element.dataset.compareAtPrice = '4500';

    expect(readPdpHeaderPriceFromElement(element)).toEqual({
      price: null,
      compareAtPrice: null,
    });
  });

  it('ignores a non-numeric compare-at while keeping the selling price', () => {
    const element = document.createElement('div');
    element.dataset.sellingPrice = '3266';
    element.dataset.compareAtPrice = 'n/a';

    expect(readPdpHeaderPriceFromElement(element)).toEqual({
      price: 3266,
      compareAtPrice: null,
    });
  });

  it('exposes a stable PDP header price id', () => {
    expect(PRODUCT_PDP_PRICE_ID).toBe('product-pdp-price');
  });
});
