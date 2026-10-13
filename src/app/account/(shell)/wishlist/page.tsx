import { buildMetadata } from '@/lib/seo/build-metadata';

export const metadata = buildMetadata({
  title: 'Wishlist',
  path: '/account/wishlist',
  noIndex: true,
});

/** Panel body is rendered by AccountSplitLayout from the client registry. */
export default function Page() {
  return null;
}
