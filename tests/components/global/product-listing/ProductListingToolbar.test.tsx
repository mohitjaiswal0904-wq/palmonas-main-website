import { render, screen } from '@testing-library/react';

import { ProductListingToolbar } from '@/components/global/product-listing/ProductListingToolbar';
import { ProductListingProvider } from '@/hooks/useProductListingControls';
import type { ProductFilterGroup } from '@/types/product-listing';

const filterGroups: ProductFilterGroup[] = [
  {
    id: 'price',
    label: 'Price',
    options: [{ id: 'under-5k', label: 'Under 5k' }],
  },
];

function renderToolbar(props: Parameters<typeof ProductListingToolbar>[0] = {}) {
  return render(
    <ProductListingProvider filterGroups={filterGroups}>
      <ProductListingToolbar {...props} />
    </ProductListingProvider>,
  );
}

describe('ProductListingToolbar', () => {
  it('keeps offer pills left aligned instead of pushing them to the sort side', () => {
    renderToolbar({ offers: ['Buy 1 Get 1'] });

    const pills = screen.getByText('Buy 1 Get 1').parentElement;

    expect(pills?.className).toContain('justify-start');
    expect(pills?.className).toContain('shrink-0');
  });

  it('does not let the active-filters slot grow and push pills right', () => {
    renderToolbar({ offers: ['Free Shipping'] });

    const pills = screen.getByText('Free Shipping').parentElement;
    const filtersSlot = pills?.previousElementSibling;

    expect(filtersSlot?.className).not.toContain('flex-1');
    expect(filtersSlot?.className).toContain('min-w-0');
  });

  it('keeps the sort control pinned to the right edge', () => {
    renderToolbar({ offers: ['Free Shipping'] });

    const sortSlot = screen.getByLabelText(/sort/i).closest('div')?.parentElement;

    expect(sortSlot?.className).toContain('ml-auto');
  });

  it('renders the no-filters message in place of active filters', () => {
    renderToolbar({ noFiltersMessage: 'No filters available' });

    expect(screen.getByText('No filters available')).toBeInTheDocument();
  });

  it('renders no pill wrapper when there are no offers', () => {
    renderToolbar({ offers: [] });

    expect(screen.queryByText('Buy 1 Get 1')).not.toBeInTheDocument();
  });

  it('places offer filter chips on the left of sort', () => {
    renderToolbar({
      offerFilter: {
        offers: ['Buy 1 Get 1'],
        selectedOffer: null,
        onSelect: jest.fn(),
      },
    });

    const chips = screen.getByRole('toolbar', { name: 'Offer filters' });
    const sortSlot = screen.getByLabelText(/sort/i).closest('div')?.parentElement;

    expect(
      Boolean(
        chips.compareDocumentPosition(sortSlot ?? document.body) & Node.DOCUMENT_POSITION_FOLLOWING,
      ),
    ).toBe(true);
    expect(chips.className).toContain('px-0');
    expect(sortSlot?.className).toContain('ml-auto');
  });

  it('does not render static offer pills when offer filter chips are provided', () => {
    renderToolbar({
      offers: ['Static pill'],
      offerFilter: {
        offers: ['Buy 1 Get 1'],
        selectedOffer: null,
        onSelect: jest.fn(),
      },
    });

    expect(screen.getByRole('button', { name: 'Buy 1 Get 1' })).toBeInTheDocument();
    expect(screen.queryByText('Static pill')).not.toBeInTheDocument();
  });
});
