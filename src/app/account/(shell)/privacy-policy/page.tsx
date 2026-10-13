import { buildMetadata } from '@/lib/seo/build-metadata';

export const metadata = buildMetadata({
  title: 'Privacy Policy',
  path: '/account/privacy-policy',
  noIndex: true,
});

/** Panel body is rendered by AccountSplitLayout from the client registry. */
export default function Page() {
  return null;
}
