import {
  getAccountPanelHref,
  isAccountNestedDetailPath,
  panelIdFromMenuItemId,
  resolveAccountPanel,
} from '@/components/account/common/account-panels';

describe('resolveAccountPanel', () => {
  it('returns null on the account hub', () => {
    expect(resolveAccountPanel('/account')).toBeNull();
  });

  it('resolves known top-level panels', () => {
    expect(resolveAccountPanel('/account/wallet')).toBe('wallet');
    expect(resolveAccountPanel('/account/profile')).toBe('profile');
    expect(resolveAccountPanel('/account/order-history')).toBe('order-history');
  });

  it('returns null for nested detail paths so children render', () => {
    expect(resolveAccountPanel('/account/order-history/ord_1')).toBeNull();
    expect(resolveAccountPanel('/account/delivery-address/new')).toBeNull();
    expect(resolveAccountPanel('/account/delivery-address/addr_1/edit')).toBeNull();
    expect(resolveAccountPanel('/account/plan-of-purchase/sub_1')).toBeNull();
  });

  it('returns null outside /account', () => {
    expect(resolveAccountPanel('/pop')).toBeNull();
  });
});

describe('isAccountNestedDetailPath', () => {
  it('detects nested detail routes', () => {
    expect(isAccountNestedDetailPath('/account/orders/abc')).toBe(true);
    expect(isAccountNestedDetailPath('/account/wallet')).toBe(false);
  });

  it('does not treat top-level delivery-address as nested', () => {
    expect(isAccountNestedDetailPath('/account/delivery-address')).toBe(false);
  });
});

describe('panelIdFromMenuItemId', () => {
  it('maps menu ids to panels', () => {
    expect(panelIdFromMenuItemId('wallet')).toBe('wallet');
  });

  it('keeps plan-of-purchase external (/pop)', () => {
    expect(panelIdFromMenuItemId('plan-of-purchase')).toBeNull();
  });

  it('keeps wishlist external (/wishlist)', () => {
    expect(panelIdFromMenuItemId('wishlist')).toBeNull();
  });
});

describe('getAccountPanelHref', () => {
  it('returns the soft-navigation path for a panel', () => {
    expect(getAccountPanelHref('wallet')).toBe('/account/wallet');
  });

  it('returns profile path', () => {
    expect(getAccountPanelHref('profile')).toBe('/account/profile');
  });

  it('keeps the legacy in-shell wishlist path for deep links', () => {
    expect(getAccountPanelHref('wishlist')).toBe('/account/wishlist');
  });
});
