/**
 * CustomFit.ai Intelligent Code.
 * Vendor: do not edit the script body.
 */

import { env } from '@/lib/env';

/** CustomFit API origin for DNS preconnect. */
export const CUSTOMFIT_API_ORIGIN = 'https://api.customfit.ai';

/** CustomFit SDK script URL. */
export const CUSTOMFIT_SDK_SRC =
  'https://sdk.customfit.ai/e92c8a30-97ae-11f1-ad9a-f901460c92a7/cf-js-sdk-min.js';

/** DOM id for the CustomFit preinit / bootstrap inline script. */
export const CUSTOMFIT_PREINIT_SCRIPT_ID = 'customfitpreinit';

/**
 * Returns whether CustomFit may load. The SDK errors on hosts that are not
 * allowlisted (localhost, preview URLs).
 *
 * @param appEnv - Deployed app environment; defaults to public env.
 * @returns True only for production Palmonas hosts.
 */
export function shouldLoadCustomFit(
  appEnv: typeof env.NEXT_PUBLIC_APP_ENV = env.NEXT_PUBLIC_APP_ENV,
): boolean {
  return appEnv === 'production';
}

/**
 * Builds the CustomFit preinit + SDK loader inline script.
 *
 * @returns Inline script body for Next.js Script.
 */
export function buildCustomFitBootstrapScript(): string {
  return '!function(e,t,i,s){var n=t.getElementById("customfitpreinit");if(n){n.insertAdjacentHTML("beforebegin",\'<style type="text/css">.customfit-invisible-preinit-block{visibility:hidden !important; opacity:0 !important}</style>\');var r=document.querySelector("html");r.classList.add("customfit-invisible-preinit-block"),setTimeout(function(){r.classList.remove("customfit-invisible-preinit-block")},5e3);var c=t.getElementsByTagName("script")[0],o=t.createElement("script");o.id="customfitinit",o.setAttribute("crossorigin","*"),o.async=!0,o.src="https://sdk.customfit.ai/e92c8a30-97ae-11f1-ad9a-f901460c92a7/cf-js-sdk-min.js",o.type="text/javascript",c.parentNode.insertBefore(o,c),o.onerror=function(){var e=t.getElementById("customfit-invisible-preinit-block");e&&e.parentNode.removeChild(e)}}}(window,document);';
}
