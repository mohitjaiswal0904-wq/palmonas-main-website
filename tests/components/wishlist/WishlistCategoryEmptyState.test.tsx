import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

import { WishlistCategoryEmptyState } from '@/components/wishlist/WishlistCategoryEmptyState';
import { wishlistMessages } from '@/config/wishlist';

jest.mock('@/components/ui/AppLink', () => ({
  AppLink: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe('WishlistCategoryEmptyState', () => {
  it('renders the gold explore CTA with the collection href', () => {
    render(
      <WishlistCategoryEmptyState
        cta={{
          href: '/collections/9kt-fine-gold',
          label: wishlistMessages.labels.exploreGold,
          ariaLabel: wishlistMessages.a11y.exploreGold,
        }}
      />,
    );

    const link = screen.getByRole('link', { name: wishlistMessages.a11y.exploreGold });
    expect(link).toHaveAttribute('href', '/collections/9kt-fine-gold');
    expect(link).toHaveTextContent(wishlistMessages.labels.exploreGold);
  });

  it('renders the demifine explore CTA', () => {
    render(
      <WishlistCategoryEmptyState
        cta={{
          href: '/collections/shop-by-category',
          label: wishlistMessages.labels.exploreDemifine,
          ariaLabel: wishlistMessages.a11y.exploreDemifine,
        }}
      />,
    );

    expect(
      screen.getByRole('link', { name: wishlistMessages.a11y.exploreDemifine }),
    ).toHaveAttribute('href', '/collections/shop-by-category');
  });
});
