const WEBENGAGE_BOOTSTRAP_SCRIPT_ID = '_webengage_script_tag';
const WEBENGAGE_SDK_PATH = '/js/webengage-min-v-6.0.js';

/** WebEngage data center ids — must match the dashboard host region. */
export type WebEngageDataCenter = 'in' | 'us' | 'ksa' | 'eug';

const WEBENGAGE_SDK_ORIGINS: Record<WebEngageDataCenter, { https: string; http: string }> = {
  in: {
    https: 'https://widgets.in.webengage.com',
    http: 'http://widgets.in.webengage.com',
  },
  us: {
    https: 'https://ssl.widgets.webengage.com',
    http: 'http://cdn.widgets.webengage.com',
  },
  ksa: {
    https: 'https://widgets.ksa.webengage.com',
    http: 'http://widgets.ksa.webengage.com',
  },
  eug: {
    https: 'https://widgets.eug.webengage.com',
    http: 'http://widgets.eug.webengage.com',
  },
};

/** Remote v4 config hosts — storage iframe reads these before exposing `webengage_fs_configurationMap`. */
const WEBENGAGE_V4_CONFIG_ORIGINS: Record<WebEngageDataCenter, string> = {
  in: 'https://wsdk-files.in.webengage.com',
  us: 'https://wsdk-files.webengage.com',
  ksa: 'https://wsdk-files.ksa.webengage.com',
  eug: 'https://wsdk-files.eug.webengage.com',
};

/** Hostnames where WebEngage storage iframe config fails (domain not registered). */
const WEBENGAGE_UNSUPPORTED_HOSTNAMES = ['localhost', '127.0.0.1'] as const;

/**
 * Returns whether WebEngage can load on the given browser host.
 *
 * @param hostname - Optional hostname override (defaults to `window.location.hostname`).
 * @returns False on localhost — WebEngage storage iframe throws when the domain is unregistered.
 */
export function isWebEngageSupportedHost(hostname?: string): boolean {
  const resolvedHostname =
    hostname ?? (typeof window !== 'undefined' ? window.location.hostname : '');

  return !WEBENGAGE_UNSUPPORTED_HOSTNAMES.includes(
    resolvedHostname as (typeof WEBENGAGE_UNSUPPORTED_HOSTNAMES)[number],
  );
}

/**
 * Returns whether WebEngage should run in the current browser session.
 *
 * @returns False on unsupported hosts such as localhost.
 */
export function isWebEngageRuntimeEnabled(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }

  return isWebEngageSupportedHost();
}

/**
 * Strips unsafe characters from a WebEngage license code before script embedding.
 *
 * @param licenseCode - Raw license code from env (may include leading `~`).
 * @returns Sanitized license code.
 */
export function sanitizeWebEngageLicenseCode(licenseCode: string): string {
  return licenseCode.trim().replace(/[^a-zA-Z0-9~.-]/g, '');
}

/**
 * Resolves the WebEngage SDK origin for a data center.
 *
 * @param dataCenter - WebEngage account region.
 * @returns HTTPS origin used by the bootstrap loader.
 */
export function getWebEngageSdkOrigin(dataCenter: WebEngageDataCenter): string {
  return WEBENGAGE_SDK_ORIGINS[dataCenter].https;
}

/**
 * Builds the remote v4.js URL that defines `webengage_fs_configurationMap`.
 *
 * @param licenseCode - WebEngage license code.
 * @param dataCenter - WebEngage account region (defaults to India).
 * @returns CDN URL for the account config script.
 */
export function getWebEngageV4ConfigUrl(
  licenseCode: string,
  dataCenter: WebEngageDataCenter = 'in',
): string {
  const safeLicenseCode = sanitizeWebEngageLicenseCode(licenseCode);

  return `${WEBENGAGE_V4_CONFIG_ORIGINS[dataCenter]}/webengage/${safeLicenseCode}/v4.js`;
}

/**
 * Checks whether WebEngage published a non-empty remote SDK config.
 *
 * @param licenseCode - WebEngage license code.
 * @param dataCenter - WebEngage account region (defaults to India).
 * @returns True when v4.js exists and defines configuration content.
 */
export async function isWebEngageRemoteConfigAvailable(
  licenseCode: string,
  dataCenter: WebEngageDataCenter = 'in',
): Promise<boolean> {
  const safeLicenseCode = sanitizeWebEngageLicenseCode(licenseCode);

  if (!safeLicenseCode) {
    return false;
  }

  const configUrl = getWebEngageV4ConfigUrl(safeLicenseCode, dataCenter);

  try {
    const headResponse = await fetch(configUrl, {
      method: 'HEAD',
      cache: 'no-store',
    });

    if (!headResponse.ok) {
      return false;
    }

    const contentLength = headResponse.headers.get('content-length');

    if (contentLength === '0') {
      return false;
    }

    if (contentLength !== null && Number(contentLength) > 0) {
      return true;
    }

    const response = await fetch(configUrl, { cache: 'no-store' });

    if (!response.ok) {
      return false;
    }

    const configScript = (await response.text()).trim();

    return configScript.length > 0 && configScript.includes('webengage_fs_configurationMap');
  } catch {
    return false;
  }
}

/**
 * Builds the official WebEngage v6 SPA bootstrap inline script.
 *
 * @param licenseCode - WebEngage license code.
 * @param dataCenter - WebEngage account region (defaults to India).
 * @returns Inline script body for Next.js Script.
 */
export function buildWebEngageBootstrapScript(
  licenseCode: string,
  dataCenter: WebEngageDataCenter = 'in',
): string {
  const safeLicenseCode = sanitizeWebEngageLicenseCode(licenseCode);

  if (!safeLicenseCode) {
    return '';
  }

  const sdkOrigin = getWebEngageSdkOrigin(dataCenter);

  return `
var webengage;
!function(w,e,b,n,g){function o(e,t){e[t[t.length-1]]=function(){r.__queue.push([t.join("."),arguments])}}var i,s,r=w[b],z=" ",l="init options track screen onReady".split(z),a="webPersonalization feedback survey notification notificationInbox".split(z),c="options render clear abort".split(z),p="Prepare Render Open Close Submit Complete View Click".split(z),u="identify login logout setAttribute".split(z);if(!r||!r.__v){for(w[b]=r={__queue:[],is_spa:1,__v:"6.0",user:{}},i=0;i<l.length;i++)o(r,[l[i]]);for(i=0;i<a.length;i++){for(r[a[i]]={},s=0;s<c.length;s++)o(r[a[i]],[a[i],c[s]]);for(s=0;s<p.length;s++)o(r[a[i]],[a[i],"on"+p[s]])}for(i=0;i<u.length;i++)o(r.user,["user",u[i]]);setTimeout(function(){var f=e.createElement("script"),d=e.getElementById("${WEBENGAGE_BOOTSTRAP_SCRIPT_ID}");f.type="text/javascript",f.async=!0,f.src="${sdkOrigin}${WEBENGAGE_SDK_PATH}",d.parentNode.insertBefore(f,d)})}}(window,document,"webengage");
if(!window.__palmonasWebEngageInit){window.__palmonasWebEngageInit=!0;webengage.init('${safeLicenseCode}');}
`.trim();
}

/** DOM id for the WebEngage bootstrap script tag. */
export const webengageBootstrapScriptId = WEBENGAGE_BOOTSTRAP_SCRIPT_ID;

/** Default WebEngage India SDK origin used by the bootstrap loader. */
export const webengageIndiaSdkOrigin = WEBENGAGE_SDK_ORIGINS.in.https;
