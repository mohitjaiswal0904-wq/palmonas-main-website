import { act, renderHook, waitFor } from '@testing-library/react';

import { productTheme } from '@/config/product/product.config';
import { usePdpHeaderPriceVisibility } from '@/hooks/product/usePdpHeaderPriceVisibility';
import { PRODUCT_PDP_PRICE_ID } from '@/lib/product/pdp-header-price';

class IntersectionObserverMock {
  observe = jest.fn();
  disconnect = jest.fn();

  constructor(
    private readonly callback: IntersectionObserverCallback,
    public readonly options?: IntersectionObserverInit,
  ) {
    observers.push(this);
  }

  trigger(isIntersecting: boolean): void {
    this.callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

class MutationObserverMock {
  observe = jest.fn();
  disconnect = jest.fn();

  constructor(private readonly callback: MutationCallback) {
    mutationObservers.push(this);
  }

  trigger(): void {
    this.callback([], this as unknown as MutationObserver);
  }
}

const observers: IntersectionObserverMock[] = [];
const mutationObservers: MutationObserverMock[] = [];

function mountHeaderPrice(sellingPrice: string, compareAtPrice?: string): HTMLElement {
  const element = document.createElement('div');
  element.id = PRODUCT_PDP_PRICE_ID;
  element.dataset.sellingPrice = sellingPrice;
  if (compareAtPrice) {
    element.dataset.compareAtPrice = compareAtPrice;
  }
  document.body.appendChild(element);
  return element;
}

describe('usePdpHeaderPriceVisibility', () => {
  beforeEach(() => {
    observers.length = 0;
    mutationObservers.length = 0;
    global.IntersectionObserver = jest.fn(function IntersectionObserver(
      this: IntersectionObserverMock,
      callback: IntersectionObserverCallback,
      options?: IntersectionObserverInit,
    ) {
      return new IntersectionObserverMock(callback, options) as unknown as IntersectionObserver;
    }) as unknown as typeof IntersectionObserver;
    global.MutationObserver = jest.fn(function MutationObserver(
      this: MutationObserverMock,
      callback: MutationCallback,
    ) {
      return new MutationObserverMock(callback) as unknown as MutationObserver;
    }) as unknown as typeof MutationObserver;
  });

  afterEach(() => {
    document.getElementById(PRODUCT_PDP_PRICE_ID)?.remove();
  });

  it('reads the header price and stays visible until the node leaves view', async () => {
    mountHeaderPrice('3266', '4500');

    const { result } = renderHook(() => usePdpHeaderPriceVisibility());

    await waitFor(() => {
      expect(result.current).toEqual({
        isHeaderPriceVisible: true,
        price: 3266,
        compareAtPrice: 4500,
      });
    });
    expect(observers[0]?.options?.rootMargin).toBe(productTheme.pdpRhythm.stickyBarPriceRootMargin);

    act(() => {
      observers[0]?.trigger(false);
    });

    expect(result.current.isHeaderPriceVisible).toBe(false);
    expect(result.current.price).toBe(3266);
  });

  it('marks the header price visible again when it re-enters view', async () => {
    mountHeaderPrice('1000');

    const { result } = renderHook(() => usePdpHeaderPriceVisibility());

    await waitFor(() => {
      expect(result.current.price).toBe(1000);
    });

    act(() => {
      observers[0]?.trigger(false);
    });
    act(() => {
      observers[0]?.trigger(true);
    });

    expect(result.current.isHeaderPriceVisible).toBe(true);
  });

  it('keeps the header price visible when the observer target is missing', () => {
    const { result } = renderHook(() => usePdpHeaderPriceVisibility());

    expect(result.current).toEqual({
      isHeaderPriceVisible: true,
      price: null,
      compareAtPrice: null,
    });
    expect(observers).toHaveLength(0);
  });

  it('returns a null selling price when the dataset is invalid', async () => {
    mountHeaderPrice('not-a-price');

    const { result } = renderHook(() => usePdpHeaderPriceVisibility());

    await waitFor(() => {
      expect(observers).toHaveLength(1);
    });

    expect(result.current).toEqual({
      isHeaderPriceVisible: true,
      price: null,
      compareAtPrice: null,
    });
  });

  it('mirrors live gold price updates from the header dataset', async () => {
    const element = mountHeaderPrice('123');

    const { result } = renderHook(() => usePdpHeaderPriceVisibility());

    await waitFor(() => {
      expect(result.current.price).toBe(123);
    });

    element.dataset.sellingPrice = '18999';
    act(() => {
      mutationObservers[0]?.trigger();
    });

    expect(result.current.price).toBe(18999);
  });
});
