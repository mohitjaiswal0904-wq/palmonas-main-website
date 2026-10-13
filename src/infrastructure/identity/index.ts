import { KwikPass } from '@/infrastructure/gokwik/KwikPass';
import {
  ensureKwikpassReady,
  initializeKwikpassDom,
  isKwikpassPluginReady,
  kwikpassAdapter,
  loadKwikpassScripts,
  loginErrorForConfigProbe,
  probeKwikpassConfigApi,
  waitForKwikpassSdk,
  applyKwikpassMerchantInfo,
  buildKwikpassMerchantInfo,
  getKwikpassCoreScriptUrl,
  getKwikpassEnvSnapshot,
  getKwikpassMerchantInfoInlineScript,
  getKwikpassMerchantScriptUrl,
  KWIKPASS_CORE_SCRIPT_ID,
  KWIKPASS_INIT_SCRIPT_ID,
  KWIKPASS_MERCHANT_SCRIPT_ID,
} from '@/infrastructure/gokwik/identity';

export type {
  KwikpassConfigProbeResponse,
  KwikpassConfigProbeResult,
} from '@/infrastructure/gokwik/identity';

export const identityProvider = kwikpassAdapter;

export {
  applyKwikpassMerchantInfo,
  buildKwikpassMerchantInfo,
  ensureKwikpassReady,
  getKwikpassCoreScriptUrl,
  getKwikpassEnvSnapshot,
  getKwikpassMerchantInfoInlineScript,
  getKwikpassMerchantScriptUrl,
  initializeKwikpassDom,
  isKwikpassPluginReady,
  loginErrorForConfigProbe,
  probeKwikpassConfigApi,
  KWIKPASS_CORE_SCRIPT_ID,
  KWIKPASS_INIT_SCRIPT_ID,
  KWIKPASS_MERCHANT_SCRIPT_ID,
  KwikPass,
  kwikpassAdapter,
  loadKwikpassScripts,
  waitForKwikpassSdk,
};

export type {
  KpDataSentDetail,
  KwikpassMerchantInfo,
  KwikpassSdkInstance,
} from '@/infrastructure/gokwik/types';
