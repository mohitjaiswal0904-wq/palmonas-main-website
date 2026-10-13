import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MobileFilterSheet } from '@/components/global/product-listing/MobileFilterSheet';
import { ProductListingProvider } from '@/hooks/useProductListingControls';
import { transformAvailableProductFilters } from '@/lib/utils/product-filters';
import type { AvailableProductFiltersApiResponse } from '@/types/product-filters';
import { createEmptyProductFilters, type ProductFilters } from '@/types/product-listing';

jest.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    showError: jest.fn(),
    showSuccess: jest.fn(),
    showInfo: jest.fn(),
    showWarning: jest.fn(),
  }),
}));

const samplePath = join(process.cwd(), 'src/components/collection/sample.json');
const sample = JSON.parse(readFileSync(samplePath, 'utf8')) as {
  data: { available_filters: unknown };
};
const filterGroups = transformAvailableProductFilters(
  sample.data.available_filters as AvailableProductFiltersApiResponse,
);

/** Mount the sheet inside a controlled listing provider, exposing what Apply commits. */
function renderSheet() {
  const onFiltersChange = jest.fn();
  const onClose = jest.fn();

  render(
    <ProductListingProvider
      filterGroups={filterGroups}
      filters={createEmptyProductFilters(filterGroups)}
      onFiltersChange={onFiltersChange}
    >
      <MobileFilterSheet onClose={onClose} />
    </ProductListingProvider>,
  );

  return { onFiltersChange, onClose };
}

describe('MobileFilterSheet', () => {
  it('commits a manually typed price range on the first Apply tap (PW-622)', async () => {
    const user = userEvent.setup();
    const { onFiltersChange, onClose } = renderSheet();

    const minInput = screen.getByLabelText(/Minimum price for/i);
    await user.clear(minInput);
    await user.type(minInput, '2000');

    // A tap blurs the input and clicks Apply in the same batch — the handler must not
    // read a draft snapshot taken before the blur commit.
    act(() => {
      fireEvent.blur(minInput);
      fireEvent.click(screen.getByRole('button', { name: /Apply filters/i }));
    });

    expect(onFiltersChange).toHaveBeenCalledTimes(1);
    const committed = onFiltersChange.mock.calls[0]?.[0] as ProductFilters;
    const priceGroupId = filterGroups.find((group) => group.label === 'Price')?.id ?? '';
    expect(committed[priceGroupId]?.[0]).toContain('2000');
    expect(onClose).toHaveBeenCalled();
  });

  it('keeps the sheet rendered after selecting a Style option (PW-634)', async () => {
    const user = userEvent.setup();
    renderSheet();

    await user.click(screen.getByRole('button', { name: /^Style$/i }));
    await user.click(screen.getByLabelText(/^Filter by Band$/i));

    expect(screen.getByRole('button', { name: /Apply filters/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Filter by Band$/i)).toBeChecked();
  });

  it('anchors each option checkbox to its own row so focus cannot scroll the sheet away (PW-634)', async () => {
    const user = userEvent.setup();
    renderSheet();

    await user.click(screen.getByRole('button', { name: /^Style$/i }));

    const row = screen.getByLabelText(/^Filter by Band$/i).closest('label');
    expect(row).toHaveClass('relative');
  });

  it('does not commit filters when Apply is never tapped', async () => {
    const user = userEvent.setup();
    const { onFiltersChange } = renderSheet();

    await user.click(screen.getByRole('button', { name: /^Style$/i }));
    await user.click(screen.getByLabelText(/^Filter by Band$/i));

    expect(onFiltersChange).not.toHaveBeenCalled();
  });

  it('renders nothing extra when the listing has no filter groups', () => {
    const onClose = jest.fn();

    const { container } = render(
      <ProductListingProvider filterGroups={[]} filters={{}} onFiltersChange={jest.fn()}>
        <MobileFilterSheet onClose={onClose} />
      </ProductListingProvider>,
    );

    expect(screen.queryByRole('button', { name: /Apply filters/i })).not.toBeInTheDocument();
    expect(container).toBeInTheDocument();
  });
});
