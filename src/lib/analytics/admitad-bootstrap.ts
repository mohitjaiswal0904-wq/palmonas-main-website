/**
 * Strips unsafe characters from an Admitad campaign code before script embedding.
 *
 * @param campaignCode - Raw campaign code from env.
 * @returns Sanitized campaign code.
 */
export function sanitizeAdmitadCampaignCode(campaignCode: string): string {
  return campaignCode.trim().replace(/[^a-zA-Z0-9_-]/g, '');
}

/**
 * Builds the Admitad TagTag pass-through script tag src.
 *
 * @param campaignCode - Admitad program campaign code.
 * @returns External script URL for Next.js Script.
 * @see https://support.mitgo.com/hc/en-us/articles/33312506659218-Integration-via-tracking-code
 */
export function buildAdmitadScriptSrc(campaignCode: string): string {
  const safeCode = sanitizeAdmitadCampaignCode(campaignCode);

  if (!safeCode) {
    return '';
  }

  return `https://www.artfut.com/static/tagtag.min.js?campaign_code=${safeCode}`;
}

/** DOM id for the Admitad TagTag bootstrap script tag. */
export const admitadBootstrapScriptId = 'palmonas-analytics-admitad-tagtag';
