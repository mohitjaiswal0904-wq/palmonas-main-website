import { useCartStore, resetCartSession } from '@/store/cart/cart.store';

describe('cart.store fresh fetch flag', () => {
  beforeEach(() => {
    useCartStore.getState().reset();
  });

  it('starts with requiresFreshCartFetch false', () => {
    expect(useCartStore.getState().requiresFreshCartFetch).toBe(false);
  });

  it('starts with cartMergeInProgress false', () => {
    expect(useCartStore.getState().cartMergeInProgress).toBe(false);
  });

  it('setCartMergeInProgress toggles merge flag', () => {
    useCartStore.getState().setCartMergeInProgress(true);
    expect(useCartStore.getState().cartMergeInProgress).toBe(true);
    useCartStore.getState().setCartMergeInProgress(false);
    expect(useCartStore.getState().cartMergeInProgress).toBe(false);
  });

  it('markCartRequiresFreshFetch sets the dirty flag', () => {
    useCartStore.getState().markCartRequiresFreshFetch();
    expect(useCartStore.getState().requiresFreshCartFetch).toBe(true);
  });

  it('clearCartRequiresFreshFetch clears the dirty flag', () => {
    useCartStore.getState().markCartRequiresFreshFetch();
    useCartStore.getState().clearCartRequiresFreshFetch();
    expect(useCartStore.getState().requiresFreshCartFetch).toBe(false);
  });

  it('reset clears the dirty flag', () => {
    useCartStore.getState().markCartRequiresFreshFetch();
    resetCartSession();
    expect(useCartStore.getState().requiresFreshCartFetch).toBe(false);
  });
});
