import { buildMetadata } from '@/lib/seo/build-metadata';

export const metadata = buildMetadata({
  title: 'Profile',
  path: '/account/profile',
  noIndex: true,
});

/** Panel body is rendered by AccountSplitLayout from the client registry. */
export default function Page() {
  return null;
}
