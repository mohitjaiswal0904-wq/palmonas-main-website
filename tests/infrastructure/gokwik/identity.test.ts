import {
  ensureKwikpassReady,
  getKwikpassEnvSnapshot,
  initializeKwikpassDom,
  kwikpassAdapter,
  KWIKPASS_CORE_SCRIPT_ID,
  KWIKPASS_INIT_SCRIPT_ID,
  KWIKPASS_MERCHANT_SCRIPT_ID,
  waitForKwikpassSdk,
} from '@/infrastructure/gokwik/identity';

jest.mock('@/infrastructure/gokwik/merchant-info', () => ({
  ...jest.requireActual('@/infrastructure/gokwik/merchant-info'),
  applyKwikpassMerchantInfo: jest.fn(),
}));

import { applyKwikpassMerchantInfo } from '@/infrastructure/gokwik/merchant-info';

const mockApplyKwikpassMerchantInfo = applyKwikpassMerchantInfo as jest.MockedFunction<
  typeof applyKwikpassMerchantInfo
>;

describe('gokwik identity', () => {
  beforeEach(() => {
    window.__KP_LOGIN_SDK_INSTANCE__ = undefined;
    window.kpUpdateDOM = undefined;
    window.handleDOMUpdate = undefined;
    window.merchantInfo = undefined;
    mockApplyKwikpassMerchantInfo.mockClear();
    document.getElementById(KWIKPASS_INIT_SCRIPT_ID)?.remove();
    document.getElementById(KWIKPASS_CORE_SCRIPT_ID)?.remove();
    document.getElementById(KWIKPASS_MERCHANT_SCRIPT_ID)?.remove();
  });

  it('getKwikpassEnvSnapshot returns script base URL without trailing slash', () => {
    expect(getKwikpassEnvSnapshot()).toEqual({
      mid: 'test-mid',
      environment: 'production',
      baseUrl: 'https://pdp.gokwik.co',
      shopDomain: 'palmonas.myshopify.com',
    });
  });

  it('waitForKwikpassSdk resolves true when handleKpLogin exists', async () => {
    window.__KP_LOGIN_SDK_INSTANCE__ = { handleKpLogin: jest.fn() };
    await expect(waitForKwikpassSdk(500)).resolves.toBe(true);
  });

  it('isReady returns true when handleKpLogin exists', () => {
    window.__KP_LOGIN_SDK_INSTANCE__ = { handleKpLogin: jest.fn() };
    expect(kwikpassAdapter.isReady()).toBe(true);
  });

  it('initializeKwikpassDom calls vendor DOM hooks when present', () => {
    const kpUpdateDOM = jest.fn();
    const handleDOMUpdate = jest.fn();
    window.kpUpdateDOM = kpUpdateDOM;
    window.handleDOMUpdate = handleDOMUpdate;

    initializeKwikpassDom();

    expect(kpUpdateDOM).toHaveBeenCalled();
    expect(handleDOMUpdate).toHaveBeenCalled();
  });

  it('openLogin calls handleKpLogin', () => {
    const handleKpLogin = jest.fn();
    window.__KP_LOGIN_SDK_INSTANCE__ = { handleKpLogin };

    kwikpassAdapter.openLogin();

    expect(handleKpLogin).toHaveBeenCalled();
  });

  it('ensureKwikpassReady returns true when plugin SDK is already ready', async () => {
    window.__KP_LOGIN_SDK_INSTANCE__ = { handleKpLogin: jest.fn() };

    await expect(ensureKwikpassReady()).resolves.toBe(true);
    expect(mockApplyKwikpassMerchantInfo).toHaveBeenCalled();
  });

  it('onAuthSuccess fires when kp_data_sent has kpToken', () => {
    const onSuccess = jest.fn();
    const unsub = kwikpassAdapter.onAuthSuccess(onSuccess);

    window.dispatchEvent(
      new CustomEvent('kp_data_sent', {
        detail: { success: true, kpToken: 'kp-token-abc' },
      }),
    );

    expect(onSuccess).toHaveBeenCalledWith({ kpToken: 'kp-token-abc' });
    unsub();
  });

  it('onAuthError fires when kp_data_sent reports error message', () => {
    const onError = jest.fn();
    const unsub = kwikpassAdapter.onAuthError(onError);

    window.dispatchEvent(
      new CustomEvent('kp_data_sent', {
        detail: { success: false, error: 'Invalid OTP' },
      }),
    );

    expect(onError).toHaveBeenCalledWith({ message: 'Invalid OTP', code: 'Invalid OTP' });
    unsub();
  });

  it('onAuthCancel fires when kp_data_sent has success false without error', () => {
    const onCancel = jest.fn();
    const unsub = kwikpassAdapter.onAuthCancel(onCancel);

    window.dispatchEvent(
      new CustomEvent('kp_data_sent', { detail: { success: false } }),
    );

    expect(onCancel).toHaveBeenCalledTimes(1);
    unsub();
  });

  it('onAuthCancel fires when kp_data_sent reports a user-dismissed error', () => {
    const onCancel = jest.fn();
    const onError = jest.fn();
    const unsubCancel = kwikpassAdapter.onAuthCancel(onCancel);
    const unsubError = kwikpassAdapter.onAuthError(onError);

    window.dispatchEvent(
      new CustomEvent('kp_data_sent', {
        detail: { success: false, error: 'User cancelled login' },
      }),
    );

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
    unsubCancel();
    unsubError();
  });
});
