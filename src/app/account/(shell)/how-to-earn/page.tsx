import { buildMetadata } from '@/lib/seo/build-metadata';

export const metadata = buildMetadata({
  title: 'How To Earn',
  path: '/account/how-to-earn',
  noIndex: true,
});

/** Panel body is rendered by AccountSplitLayout from the client registry. */
export default function Page() {
  return null;
}
