import {
  getPdpMobileHeaderTitle,
  setPdpMobileHeaderTitle,
  subscribePdpMobileHeaderTitle,
} from '@/lib/layout/pdp-mobile-header-title';

describe('pdp-mobile-header-title', () => {
  afterEach(() => {
    setPdpMobileHeaderTitle('');
  });

  it('stores and returns the published title', () => {
    setPdpMobileHeaderTitle('Gold Ring');
    expect(getPdpMobileHeaderTitle()).toBe('Gold Ring');
  });

  it('notifies subscribers when the title changes', () => {
    const listener = jest.fn();
    const unsubscribe = subscribePdpMobileHeaderTitle(listener);

    setPdpMobileHeaderTitle('Necklace');
    expect(listener).toHaveBeenCalledTimes(1);

    setPdpMobileHeaderTitle('Necklace');
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    setPdpMobileHeaderTitle('Bracelet');
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('clears the title when set to an empty string', () => {
    setPdpMobileHeaderTitle('Earrings');
    setPdpMobileHeaderTitle('');
    expect(getPdpMobileHeaderTitle()).toBe('');
  });

  it('stops notifying after unsubscribe', () => {
    const listener = jest.fn();
    const unsubscribe = subscribePdpMobileHeaderTitle(listener);
    unsubscribe();

    setPdpMobileHeaderTitle('Anklet');
    expect(listener).not.toHaveBeenCalled();
  });
});
