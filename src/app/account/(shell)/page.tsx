import { buildMetadata } from '@/lib/seo/build-metadata';

export const metadata = buildMetadata({ title: 'Account', path: '/account', noIndex: true });

/**
 * Hub chrome lives in `AccountSplitLayout`. The page still emits a node so
 * Cache Components does not drop this segment from instant-nav validation.
 */
export default function AccountPage() {
  return <div hidden data-account-hub-page="" />;
}
