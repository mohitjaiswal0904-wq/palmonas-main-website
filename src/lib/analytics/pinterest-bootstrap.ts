/**
 * Strips unsafe characters from a Pinterest tag id before script embedding.
 *
 * @param tagId - Raw Pinterest tag id from env.
 * @returns Sanitized tag id.
 */
export function sanitizePinterestTagId(tagId: string): string {
  return tagId.trim().replace(/[^0-9]/g, '');
}

/**
 * Builds the Pinterest Pixel base inline script.
 *
 * @param tagId - Pinterest tag id from Ads Manager.
 * @returns Inline script body for Next.js Script.
 * @see https://help.pinterest.com/en/business/article/install-the-base-code
 */
export function buildPinterestBootstrapScript(tagId: string): string {
  const safeTagId = sanitizePinterestTagId(tagId);

  if (!safeTagId) {
    return '';
  }

  return `
!function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[],n.version='3.0';var t=document.createElement('script');t.async=!0,t.src=e;var r=document.getElementsByTagName('script')[0];r.parentNode.insertBefore(t,r)}}('https://s.pinimg.com/ct/core.js');
pintrk('load','${safeTagId}');
pintrk('page');
`.trim();
}

/** DOM id for the Pinterest Pixel bootstrap script tag. */
export const pinterestBootstrapScriptId = 'palmonas-analytics-pinterest-pixel';
