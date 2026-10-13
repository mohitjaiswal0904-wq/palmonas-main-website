import { render, screen } from '@testing-library/react';

import { ProductFilterSidebar } from '@/components/global/product-listing/ProductFilterSidebar';
import { ProductListingProvider } from '@/hooks/useProductListingControls';
import type { ProductFilterGroup } from '@/types/product-listing';

const filterGroups: ProductFilterGroup[] = [
  {
    id: 'color',
    label: 'Color',
    options: [
      { id: 'gold', label: 'Gold' },
      { id: 'silver', label: 'Silver' },
    ],
  },
];

describe('ProductFilterSidebar', () => {
  it('does not render an All chip on desktop filter groups (PW-625)', () => {
    render(
      <ProductListingProvider filterGroups={filterGroups} filters={{ color: [] }}>
        <ProductFilterSidebar />
      </ProductListingProvider>,
    );

    expect(screen.queryByRole('button', { name: /show all color/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/^All$/)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/filter by gold/i)).toBeInTheDocument();
  });

  it('renders list options with white unselected backgrounds in the sheet (PW-628)', () => {
    const { container } = render(
      <ProductListingProvider
        filterGroups={filterGroups}
        filters={{ color: ['gold'] }}
        onFiltersChange={jest.fn()}
      >
        <ProductFilterSidebar variant="sheet" />
      </ProductListingProvider>,
    );

    const selected = container.querySelector('label.bg-palmonas-filterSoft');
    const whiteRows = container.querySelectorAll('label.bg-white');

    expect(selected).toBeInTheDocument();
    expect(whiteRows.length).toBeGreaterThan(0);
  });

  it('fills selected desktop chips like collection offer chips', () => {
    render(
      <ProductListingProvider
        filterGroups={filterGroups}
        filters={{ color: ['gold'] }}
        onFiltersChange={jest.fn()}
      >
        <ProductFilterSidebar />
      </ProductListingProvider>,
    );

    const goldChip = screen.getByText('Gold');

    expect(goldChip.className).toContain('bg-[#ECE2DF]');
    expect(goldChip.className).toContain('border-[#C4B8B8]');
    expect(goldChip.className).toContain('text-[#151515]');
  });

  it('does not fill unselected desktop chips', () => {
    render(
      <ProductListingProvider
        filterGroups={filterGroups}
        filters={{ color: ['gold'] }}
        onFiltersChange={jest.fn()}
      >
        <ProductFilterSidebar />
      </ProductListingProvider>,
    );

    const silverChip = screen.getByText('Silver');

    expect(silverChip.className).not.toContain('bg-[#ECE2DF]');
    expect(silverChip.className).toContain('bg-palmonas-surface');
  });
});
