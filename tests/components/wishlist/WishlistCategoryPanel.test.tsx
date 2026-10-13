import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';

import { WishlistCategoryPanel } from '@/components/wishlist/WishlistCategoryPanel';
import { PRODUCT_CATEGORY } from '@/types/product';
import type { WishlistCategoryFilter, WishlistItem } from '@/types/wishlist';

jest.mock('@/hooks/layout/useSiteHeaderStickyOffset', () => ({
  useSiteHeaderStickyOffset: () => 0,
}));

jest.mock('@/hooks/layout/useStickyPinState', () => ({
  useStickyPinState: () => false,
}));

jest.mock('@/components/ui/AppLink', () => ({
  AppLink: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

jest.mock('@/components/wishlist/WishlistItemCard', () => ({
  WishlistItemCard: ({ item }: { item: WishlistItem }) => <div>{item.product.name}</div>,
}));

function createItem(
  name: string,
  productCategory: (typeof PRODUCT_CATEGORY)[keyof typeof PRODUCT_CATEGORY],
): WishlistItem {
  return {
    productId: name,
    variantId: `${name}-variant`,
    product: {
      id: name,
      handle: name,
      name,
      description: '',
      price: 999,
      image: 'https://example.com/product.jpg',
      images: ['https://example.com/product.jpg'],
      category: productCategory,
      productCategory,
      offers: [],
      variants: [],
    },
  };
}

const goldItem = createItem('Gold Ring', PRODUCT_CATEGORY.GOLD);
const demifineItem = createItem('Demifine Ring', PRODUCT_CATEGORY.DEMIFINE);

function renderPanel(overrides?: {
  items?: WishlistItem[];
  activeFilter?: WishlistCategoryFilter;
  availableFilters?: WishlistCategoryFilter[];
}) {
  const onFilterChange = jest.fn();

  const view = render(
    <WishlistCategoryPanel
      items={overrides?.items ?? [goldItem]}
      activeFilter={overrides?.activeFilter ?? 'gold'}
      availableFilters={overrides?.availableFilters ?? ['demifine', 'gold', 'all']}
      onFilterChange={onFilterChange}
      onRemoveRequest={jest.fn()}
    />,
  );

  return { onFilterChange, container: view.container };
}

describe('WishlistCategoryPanel', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = jest.fn();
  });

  it('keeps the gold pill selected with demifine and all pills visible', () => {
    renderPanel();

    expect(screen.getByRole('tab', { name: 'Gold Jewellery' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: 'Demifine®' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'All Jewellery' })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Silver Jewellery' })).not.toBeInTheDocument();
  });

  it('renders only the active category products', () => {
    renderPanel({ items: [demifineItem], activeFilter: 'demifine' });

    expect(screen.getByText('Demifine Ring')).toBeInTheDocument();
    expect(screen.queryByText('Gold Ring')).not.toBeInTheDocument();
  });

  it('uses a five-column desktop grid like collection density', () => {
    const { container } = renderPanel();
    const grid = container.querySelector('.laptop\\:grid-cols-5');

    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass('grid', 'grid-cols-2', 'tab:grid-cols-3');
  });

  it('requests a filter change when another pill is picked', async () => {
    const user = userEvent.setup();
    const { onFilterChange } = renderPanel({ items: [demifineItem], activeFilter: 'demifine' });

    await user.click(screen.getByRole('tab', { name: 'Gold Jewellery' }));

    expect(onFilterChange).toHaveBeenCalledWith('gold');
  });

  it('ignores a click on the already active pill', async () => {
    const user = userEvent.setup();
    const { onFilterChange } = renderPanel();

    await user.click(screen.getByRole('tab', { name: 'Gold Jewellery' }));

    expect(onFilterChange).not.toHaveBeenCalled();
  });

  it('shows the gold explore CTA when the gold category is empty', () => {
    renderPanel({ items: [], activeFilter: 'gold' });

    expect(screen.getByRole('link', { name: 'Explore our Gold products' })).toHaveAttribute(
      'href',
      '/collections/9kt-fine-gold',
    );
  });

  it('shows the demifine explore CTA when the demifine category is empty', () => {
    renderPanel({ items: [], activeFilter: 'demifine' });

    expect(screen.getByRole('link', { name: 'Explore our Demifine products' })).toHaveAttribute(
      'href',
      '/collections/shop-by-category',
    );
  });

  it('hides the explore CTA when the category has products', () => {
    renderPanel({ items: [goldItem], activeFilter: 'gold' });

    expect(
      screen.queryByRole('link', { name: 'Explore our Gold products' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Gold Ring')).toBeInTheDocument();
  });
});
