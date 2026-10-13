import { AppLink } from '@/components/ui/AppLink';
import { wishlistMessages, type WishlistCategoryExploreCta } from '@/config/wishlist';

interface WishlistCategoryEmptyStateProps {
  cta: WishlistCategoryExploreCta;
}

/**
 * Empty state for a wishlist category pill with a CTA to the matching collection.
 */
export function WishlistCategoryEmptyState({ cta }: WishlistCategoryEmptyStateProps) {
  return (
    <section
      className="rounded-palmonas-lg border border-stone-200 px-6 py-16 text-center"
      aria-label={wishlistMessages.a11y.categoryEmpty}
    >
      <AppLink
        href={cta.href}
        aria-label={cta.ariaLabel}
        className="rounded-palmonas-md inline-flex bg-stone-900 px-5 py-3 text-sm font-medium text-white"
      >
        {cta.label}
      </AppLink>
    </section>
  );
}
