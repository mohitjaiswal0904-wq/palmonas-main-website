import Link from 'next/link';

import { resolveCollectionPagePath } from '@/lib/utils/collection-page-path';

interface WishlistEmptyStateProps {
  title?: string;
  description?: string;
  showLoginCta?: boolean;
  onLogin?: () => void;
}

export function WishlistEmptyState({
  title = 'Your wishlist is empty',
  description = 'Save pieces you love and they will appear here.',
  showLoginCta = false,
  onLogin,
}: WishlistEmptyStateProps) {
  return (
    <section
      className="rounded-palmonas-lg border border-stone-200 px-6 py-16 text-center"
      aria-label="Empty wishlist"
    >
      <h2 className="font-display text-2xl text-[#151515]">{title}</h2>
      <p className="mt-2 text-sm text-[#62748E]">{description}</p>
      {showLoginCta && onLogin ? (
        <button
          type="button"
          className="rounded-palmonas-md mt-6 inline-flex bg-stone-900 px-5 py-3 text-sm font-medium text-white"
          aria-label="Sign in to view wishlist"
          onClick={onLogin}
        >
          Sign in
        </button>
      ) : (
        <Link
          href={resolveCollectionPagePath('best-sellers')}
          className="rounded-palmonas-md mt-6 inline-flex bg-stone-900 px-5 py-3 text-sm font-medium text-white"
        >
          Shop bestsellers
        </Link>
      )}
    </section>
  );
}
