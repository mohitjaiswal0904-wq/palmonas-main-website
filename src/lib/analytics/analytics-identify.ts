import type { WebEngageUserProfileInput } from '@/lib/analytics/webengage-user-attributes';

/** Optional identity payload passed to analytics vendors on login. */
export interface AnalyticsIdentifyOptions {
  /** WebEngage CUID — defaults to `distinctId` when omitted. */
  webengageUserId?: string;
  /** Profile fields synced to WebEngage system attributes. */
  webengageProfile?: WebEngageUserProfileInput;
}
