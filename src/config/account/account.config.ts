import accountConfig from '@/config/account/account.config.json';
import faqsContent from '@/config/account/content/faqs.content.json';
import privacyContent from '@/config/account/content/privacy.content.json';
import redeemContent from '@/config/account/content/redeem.content.json';
import rewardsContent from '@/config/account/content/rewards-policy.content.json';
import supportContent from '@/config/account/content/support.content.json';

export type AccountConfig = typeof accountConfig;

export const accountConfigData = accountConfig as AccountConfig;

/** Localization / chrome copy (a11y, toasts, disabled placeholder). */
export const accountMessages = accountConfigData.messages;

export const ACCOUNT_SUPPORT_TICKET_URL = accountConfigData.supportTicketUrl;
export const ACCOUNT_SUPPORT_HOME_URL = accountConfigData.supportHomeUrl;

/** Verbatim live FAQs dump (`/pages/faqs`). */
export const accountFaqsContent = faqsContent;

/** Verbatim live privacy dump (`/pages/privacy-policy`). */
export const accountPrivacyContent = privacyContent;

/** Verbatim rewards policy dump (`/pages/palmonas-rewards-policy`). */
export const accountRewardsPolicyContent = rewardsContent;

/** Redeem + related support FAQs + rewards policy offer/terms. */
export const accountRedeemContent = redeemContent;

/** Verbatim support center dump (`support.palmonas.com`). */
export const accountSupportContent = supportContent;

export type AccountFeatureKey = keyof AccountConfig['features'];

const PANEL_FEATURE_BY_ID = Object.fromEntries(
  (
    Object.entries(accountConfigData.features) as [
      AccountFeatureKey,
      AccountConfig['features'][AccountFeatureKey],
    ][]
  ).map(([key, value]) => [value.panelId, key]),
) as Record<string, AccountFeatureKey>;

/**
 * Returns whether an account Others panel feature is enabled in config.
 *
 * @param feature - Feature key from `account.config.json` features block.
 * @returns True when the feature is enabled.
 */
export function isAccountFeatureEnabled(feature: AccountFeatureKey): boolean {
  return accountConfigData.features[feature]?.enabled === true;
}

/**
 * True when panel id is ungated, or its `features.*.panelId` flag is enabled.
 * Mirrors cart/auth: flags live in JSON; helpers only read config.
 *
 * @param panelId - Account route panel id (e.g. `support`, `refer-and-earn`).
 */
export function isAccountPanelFeatureEnabled(panelId: string): boolean {
  const featureKey = PANEL_FEATURE_BY_ID[panelId];
  if (!featureKey) {
    return true;
  }
  return isAccountFeatureEnabled(featureKey);
}
