/** DOM id for the GTM bootstrap script tag. */
export const gtmBootstrapScriptId = 'palmonas-analytics-gtm';

/**
 * Strips unsafe characters from a GTM container id before script embedding.
 *
 * @param containerId - Raw GTM container id (GTM-XXXX).
 * @returns Sanitized container id.
 */
export function sanitizeGtmContainerId(containerId: string): string {
  return containerId.trim().replace(/[^a-zA-Z0-9-]/g, '');
}

/**
 * Builds the Google Tag Manager bootstrap inline script.
 *
 * @param containerId - GTM container id (Simprosys imports tags here).
 * @returns Inline script body for the root layout.
 * @see https://support.simprosys.com/faq/import-your-tracking-container-into-gtm
 */
export function buildGtmBootstrapScript(containerId: string): string {
  const safeContainerId = sanitizeGtmContainerId(containerId);

  if (!safeContainerId) {
    return '';
  }

  return `
(function(w,d,s,l,i){
  w[l]=w[l]||[];
  if (w.__palmonasGtmId === i) { return; }
  w.__palmonasGtmId = i;
  var existing=d.getElementById('${gtmBootstrapScriptId}-src');
  if (existing) { return; }
  w[l].push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
  var f=d.getElementsByTagName(s)[0], j=d.createElement(s), dl=l!='dataLayer'?'&l='+l:'';
  j.async=true;
  j.id='${gtmBootstrapScriptId}-src';
  j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
  f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${safeContainerId}');
`.trim();
}
