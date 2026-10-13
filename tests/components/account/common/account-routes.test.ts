import {
  isExternalAccountMenuHref,
  planOfPurchaseDetailPath,
} from '@/components/account/common/account-routes';

describe('isExternalAccountMenuHref', () => {
  it('treats /pop as external', () => {
    expect(isExternalAccountMenuHref('/pop')).toBe(true);
  });

  it('treats /wishlist as external', () => {
    expect(isExternalAccountMenuHref('/wishlist')).toBe(true);
  });

  it('keeps /account paths in-shell', () => {
    expect(isExternalAccountMenuHref('/account/wallet')).toBe(false);
  });
});

describe('planOfPurchaseDetailPath', () => {
  it('builds the POP my-plan detail URL', () => {
    expect(planOfPurchaseDetailPath('sub_1')).toBe('/pop/my-plan/sub_1');
  });
});
