/** @deprecated Import from `@/infrastructure/identity` instead. */
export {
  getKwikpassCoreScriptUrl,
  getKwikpassEnvSnapshot,
  getKwikpassMerchantScriptUrl,
  KWIKPASS_CORE_SCRIPT_ID,
  KWIKPASS_INIT_SCRIPT_ID,
  KWIKPASS_MERCHANT_SCRIPT_ID,
} from '@/infrastructure/gokwik/identity';
export {
  applyKwikpassMerchantInfo,
  buildKwikpassMerchantInfo,
  getKwikpassMerchantInfoInlineScript,
} from '@/infrastructure/gokwik/merchant-info';
export type { KwikpassEnvSnapshot } from '@/infrastructure/gokwik/identity';
export type { KwikpassMerchantInfo } from '@/infrastructure/gokwik/types';
