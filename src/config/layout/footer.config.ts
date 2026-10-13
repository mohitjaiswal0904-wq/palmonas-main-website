import rawConfig from '@/config/layout/footer.config.json';

type FooterConfigJson = typeof rawConfig;

export const footerFeatureConfig = rawConfig as FooterConfigJson;

/** User-facing footer newsletter copy. */
export const footerMessages = footerFeatureConfig.messages;

/** Frontend corrections for known stale labels still supplied by the footer CMS slot. */
export const footerCmsCopyCorrections: Record<string, string> =
  footerFeatureConfig.cmsCopyCorrections;
