import { authMessages } from '@/config/auth/auth.config';
import {
  applyKwikpassMerchantInfo,
  buildKwikpassMerchantInfo,
  getKwikpassMerchantInfoInlineScript,
} from '@/infrastructure/gokwik/merchant-info';
import type {
  KpDataSentDetail,
  KwikpassMerchantInfo,
  KwikpassSdkInstance,
} from '@/infrastructure/gokwik/types';
import { logKwikpassAuth } from '@/lib/auth/auth.client';
import { env } from '@/lib/env';
import type { IdentityProviderPort } from '@/types/auth/identity-provider.port';

export const KWIKPASS_INIT_SCRIPT_ID = 'kwikpass-init';
export const KWIKPASS_CORE_SCRIPT_ID = 'kwikpass-core';
export const KWIKPASS_MERCHANT_SCRIPT_ID = 'kwikpass-merchant';

/** KwikPass env snapshot for logging and diagnostics. */
export interface KwikpassEnvSnapshot {
  mid: string;
  environment: string;
  baseUrl: string;
  shopDomain: string;
}

export type { KwikpassMerchantInfo };

export {
  applyKwikpassMerchantInfo,
  buildKwikpassMerchantInfo,
  getKwikpassMerchantInfoInlineScript,
};

/**
 * Returns KwikPass env fields used by bootstrap and auth flow.
 */
export function getKwikpassEnvSnapshot(): KwikpassEnvSnapshot {
  return {
    mid: env.NEXT_PUBLIC_KWIKPASS_MERCHANT_ID,
    environment: env.NEXT_PUBLIC_KWIKPASS_ENVIRONMENT,
    baseUrl: env.NEXT_PUBLIC_KP_BASE.replace(/\/$/, ''),
    shopDomain: env.NEXT_PUBLIC_KWIKPASS_SHOP_DOMAIN,
  };
}

export function getKwikpassCoreScriptUrl(): string {
  const { baseUrl } = getKwikpassEnvSnapshot();
  return `${baseUrl}/kwikpass/kwikpass-core-functions-min.js`;
}

export function getKwikpassMerchantScriptUrl(): string {
  const { baseUrl } = getKwikpassEnvSnapshot();
  return `${baseUrl}/kwikpass/plugin/build/kp-merchant-v2.js`;
}

const DEFAULT_READY_TIMEOUT_MS = 15_000;
const KWIKPASS_CONFIG_API_BASE = 'https://gkx.gokwik.co/kp/api/v1/configurations';

export type KwikpassConfigProbeResult = 'ok' | 'merchant_not_found' | 'forbidden' | 'error';

export interface KwikpassConfigProbeResponse {
  result: KwikpassConfigProbeResult;
  status: number;
}

export async function probeKwikpassConfigApi(mid: string): Promise<KwikpassConfigProbeResponse> {
  if (typeof window === 'undefined' || !mid) {
    return { result: 'error', status: 0 };
  }

  try {
    const response = await fetch(`${KWIKPASS_CONFIG_API_BASE}/${encodeURIComponent(mid)}`, {
      method: 'GET',
      credentials: 'omit',
    });

    if (response.ok) {
      return { result: 'ok', status: response.status };
    }
    if (response.status === 403) {
      return { result: 'forbidden', status: response.status };
    }
    if (response.status === 404) {
      return { result: 'merchant_not_found', status: response.status };
    }

    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    if (body?.error?.toLowerCase().includes('merchant not found')) {
      return { result: 'merchant_not_found', status: response.status };
    }

    return { result: 'error', status: response.status };
  } catch {
    return { result: 'error', status: 0 };
  }
}

export function loginErrorForConfigProbe(probe: KwikpassConfigProbeResponse): string {
  if (probe.result === 'merchant_not_found') {
    return authMessages.merchantNotFound;
  }
  if (probe.result === 'forbidden') {
    return authMessages.domainNotAllowed;
  }
  return authMessages.sdkNotReady;
}

function getSdkInstance(): KwikpassSdkInstance | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.__KP_LOGIN_SDK_INSTANCE__;
}

export function isKwikpassPluginReady(): boolean {
  return typeof getSdkInstance()?.handleKpLogin === 'function';
}

export function initializeKwikpassDom(): void {
  if (typeof window === 'undefined') return;
  window.kpUpdateDOM?.();
  window.handleDOMUpdate?.();
}

export function waitForKwikpassSdk(maxMs = DEFAULT_READY_TIMEOUT_MS): Promise<boolean> {
  if (typeof window === 'undefined') {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const startedAt = Date.now();

    const tick = (): void => {
      initializeKwikpassDom();
      if (isKwikpassPluginReady()) {
        resolve(true);
        return;
      }
      if (Date.now() - startedAt >= maxMs) {
        const merchantInfo = window.merchantInfo as
          | { mid?: string; environment?: string; integrationType?: string }
          | undefined;
        logKwikpassAuth('sdk.wait.timeout', 'Plugin SDK instance not available', {
          hasInstance: Boolean(window.__KP_LOGIN_SDK_INSTANCE__),
          hasHandleKpLogin: typeof window.__KP_LOGIN_SDK_INSTANCE__?.handleKpLogin === 'function',
          mid: merchantInfo?.mid,
          environment: merchantInfo?.environment,
          integrationType: merchantInfo?.integrationType,
          hint: 'Check gkx.gokwik.co config API returns 200 for mid+environment pair',
        });
        resolve(false);
        return;
      }
      window.setTimeout(tick, 50);
    };

    tick();
  });
}

function injectKwikpassScript(id: string, src: string, maxMs: number): Promise<void> {
  const existing = document.getElementById(id);
  if (existing) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;

    const timeoutId = window.setTimeout(() => {
      reject(new Error('sdk_timeout'));
    }, maxMs);

    script.onload = () => {
      window.clearTimeout(timeoutId);
      resolve();
    };
    script.onerror = () => {
      window.clearTimeout(timeoutId);
      reject(new Error('script_load_error'));
    };
    document.head.appendChild(script);
  });
}

function ensureKwikpassInitMerchantInfo(): void {
  applyKwikpassMerchantInfo();

  if (typeof document === 'undefined') return;
  if (document.getElementById(KWIKPASS_INIT_SCRIPT_ID)) return;

  const script = document.createElement('script');
  script.id = KWIKPASS_INIT_SCRIPT_ID;
  script.textContent = getKwikpassMerchantInfoInlineScript();
  document.head.appendChild(script);
}

export async function loadKwikpassScripts(maxMs = DEFAULT_READY_TIMEOUT_MS): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  ensureKwikpassInitMerchantInfo();

  if (isKwikpassPluginReady()) {
    return;
  }

  await injectKwikpassScript(KWIKPASS_CORE_SCRIPT_ID, getKwikpassCoreScriptUrl(), maxMs);
  await injectKwikpassScript(KWIKPASS_MERCHANT_SCRIPT_ID, getKwikpassMerchantScriptUrl(), maxMs);
  initializeKwikpassDom();

  const ready = await waitForKwikpassSdk(maxMs);
  if (!ready) {
    throw new Error('sdk_timeout');
  }
}

export async function ensureKwikpassReady(maxMs = DEFAULT_READY_TIMEOUT_MS): Promise<boolean> {
  ensureKwikpassInitMerchantInfo();

  if (isKwikpassPluginReady()) {
    return true;
  }

  const hasInit = document.getElementById(KWIKPASS_INIT_SCRIPT_ID);
  const hasCore = document.getElementById(KWIKPASS_CORE_SCRIPT_ID);
  const hasMerchant = document.getElementById(KWIKPASS_MERCHANT_SCRIPT_ID);
  if (!hasInit || !hasCore || !hasMerchant) {
    try {
      await loadKwikpassScripts(maxMs);
      if (isKwikpassPluginReady()) {
        return true;
      }
    } catch {
      // Script injection failed — fall through to SDK poll.
    }
  }

  return waitForKwikpassSdk(maxMs);
}

/**
 * Returns true when a `kp_data_sent` payload indicates the user dismissed KwikPass.
 *
 * @param detail - Vendor event detail from the KwikPass login modal.
 */
function isKwikpassAuthCancelDetail(detail: KpDataSentDetail | undefined): boolean {
  if (!detail || detail.success !== false) {
    return false;
  }

  const error = detail.error?.trim();
  if (!error) {
    return true;
  }

  return /cancel|closed|dismiss|abort|user.?denied/i.test(error);
}

export const kwikpassAdapter: IdentityProviderPort = {
  isReady(): boolean {
    return isKwikpassPluginReady();
  },

  waitForReady(maxMs = DEFAULT_READY_TIMEOUT_MS): Promise<boolean> {
    return ensureKwikpassReady(maxMs);
  },

  openLogin(): void {
    if (typeof window === 'undefined') return;
    logKwikpassAuth('login.open.called', 'Calling handleKpLogin');
    window.__KP_LOGIN_SDK_INSTANCE__?.handleKpLogin?.();
  },

  logout(redirectTo?: string): void {
    if (typeof window === 'undefined') return;
    logKwikpassAuth('logout.start', 'Calling handleLogout');
    window.handleLogout?.(redirectTo);
  },

  onAuthSuccess(callback: (payload: { kpToken: string }) => void): () => void {
    if (typeof window === 'undefined') return () => undefined;

    const handler = (event: Event): void => {
      const detail = (event as CustomEvent<KpDataSentDetail>).detail;
      if (detail?.success && detail.kpToken) {
        logKwikpassAuth('vendor.kp_data_sent.success', 'KwikPass OTP success');
        callback({ kpToken: detail.kpToken });
      }
    };

    window.addEventListener('kp_data_sent', handler);
    return () => window.removeEventListener('kp_data_sent', handler);
  },

  onAuthError(callback: (error: { message: string; code?: string }) => void): () => void {
    if (typeof window === 'undefined') return () => undefined;

    const handler = (event: Event): void => {
      const detail = (event as CustomEvent<KpDataSentDetail>).detail;
      if (detail?.success === false) {
        if (isKwikpassAuthCancelDetail(detail)) {
          return;
        }
        logKwikpassAuth('vendor.kp_data_sent.error', 'KwikPass reported error', detail.error);
        callback({ message: detail.error ?? authMessages.errors.kwikpass, code: detail.error });
      }
      if (detail?.kpLogout) {
        logKwikpassAuth('vendor.kp_logout', 'KwikPass session invalidated');
        callback({ message: 'KwikPass session invalidated', code: 'kp_logout' });
      }
    };

    window.addEventListener('kp_data_sent', handler);
    return () => window.removeEventListener('kp_data_sent', handler);
  },

  onAuthCancel(callback: () => void): () => void {
    if (typeof window === 'undefined') return () => undefined;

    const handler = (event: Event): void => {
      const detail = (event as CustomEvent<KpDataSentDetail>).detail;
      if (isKwikpassAuthCancelDetail(detail)) {
        logKwikpassAuth('vendor.kp_data_sent.cancel', 'User closed KwikPass modal', detail?.error);
        callback();
      }
    };

    window.addEventListener('kp_data_sent', handler);
    return () => window.removeEventListener('kp_data_sent', handler);
  },
};

export {};
