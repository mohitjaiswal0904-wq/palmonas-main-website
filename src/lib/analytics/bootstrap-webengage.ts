import { loadClientScript } from '@/infrastructure/analytics/load-client-script';
import { isWebEngageSdkInitialized } from '@/lib/analytics/wait-for-webengage-ready';
import {
  buildWebEngageBootstrapScript,
  isWebEngageRemoteConfigAvailable,
  isWebEngageRuntimeEnabled,
  sanitizeWebEngageLicenseCode,
  webengageBootstrapScriptId,
} from '@/lib/analytics/webengage-bootstrap';
import {
  getAnalyticsWebEngageDataCenter,
  getAnalyticsWebEngageLicenseCode,
  isWebEngageAnalyticsEnabled,
} from '@/lib/env';

let remoteConfigChecked = false;
let remoteConfigAvailable = false;

/**
 * Resets cached remote-config probe state — test helper only.
 */
export function resetWebEngageBootstrapCacheForTests(): void {
  remoteConfigChecked = false;
  remoteConfigAvailable = false;
}

/**
 * Loads WebEngage only when host and remote v4 config are valid.
 *
 * @returns True when bootstrap script is present or was injected successfully.
 */
export async function bootstrapWebEngageIfReady(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false;
  }

  if (!isWebEngageAnalyticsEnabled() || !isWebEngageRuntimeEnabled()) {
    return false;
  }

  const licenseCode = getAnalyticsWebEngageLicenseCode();

  if (!licenseCode || !sanitizeWebEngageLicenseCode(licenseCode)) {
    return false;
  }

  if (document.getElementById(webengageBootstrapScriptId) || isWebEngageSdkInitialized()) {
    return true;
  }

  if (!remoteConfigChecked) {
    remoteConfigChecked = true;
    remoteConfigAvailable = await isWebEngageRemoteConfigAvailable(
      licenseCode,
      getAnalyticsWebEngageDataCenter(),
    );
  }

  if (!remoteConfigAvailable) {
    return false;
  }

  const bootstrapScript = buildWebEngageBootstrapScript(
    licenseCode,
    getAnalyticsWebEngageDataCenter(),
  );

  if (!bootstrapScript) {
    return false;
  }

  try {
    await loadClientScript({
      id: webengageBootstrapScriptId,
      inline: bootstrapScript,
    });
    return true;
  } catch {
    return false;
  }
}
