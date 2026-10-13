import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ProductPriceRangeFilter } from '@/components/global/product-listing/ProductPriceRangeFilter';
import { withFilterApplyCommit } from '@/lib/utils/filter-apply-commit';
import type { ProductFilterGroup } from '@/types/product-listing';

const mockShowError = jest.fn();

jest.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    showError: mockShowError,
    showSuccess: jest.fn(),
    showInfo: jest.fn(),
    showWarning: jest.fn(),
  }),
}));

const priceGroup: ProductFilterGroup = {
  id: 'filter.v.price',
  label: 'Price',
  options: [
    { id: '0-3499', label: '₹0 - ₹3,499', min: 0, max: 3499 },
    { id: '3500-6999', label: '₹3,500 - ₹6,999', min: 3500, max: 6999 },
  ],
  min: 0,
  max: 14067,
};

describe('ProductPriceRangeFilter', () => {
  it('renders a full-bleed end-to-end slider track (sheet)', () => {
    const { container } = render(
      <ProductPriceRangeFilter
        group={priceGroup}
        selectedOptionIds={[]}
        onRangeChange={jest.fn()}
        onRangeClear={jest.fn()}
        onBucketToggle={jest.fn()}
        optionLabelClassName="font-nunito-sans text-xs"
      />,
    );

    const slider = container.querySelector('.overflow-visible.h-4.mx-2');
    expect(slider).toBeInTheDocument();
    expect(slider?.querySelector('.bg-palmonas-border.inset-x-0')).toBeInTheDocument();
  });

  it('renders a full-bleed end-to-end slider track on desktop sidebar', () => {
    const { container } = render(
      <ProductPriceRangeFilter
        group={priceGroup}
        selectedOptionIds={[]}
        onRangeChange={jest.fn()}
        onRangeClear={jest.fn()}
        onBucketToggle={jest.fn()}
      />,
    );

    const slider = container.querySelector('.overflow-visible.h-4.mx-2');
    expect(slider).toBeInTheDocument();
    expect(slider?.querySelector('.bg-palmonas-border.inset-x-0')).toBeInTheDocument();
  });

  it('keeps price inputs padded separately from the slider', () => {
    const { container } = render(
      <ProductPriceRangeFilter
        group={priceGroup}
        selectedOptionIds={[]}
        onRangeChange={jest.fn()}
        onRangeClear={jest.fn()}
        onBucketToggle={jest.fn()}
        optionLabelClassName="font-nunito-sans text-xs"
      />,
    );

    const minInput = screen.getByLabelText(/Minimum price ₹/i);
    const inputRow = minInput.closest('.pt-4');
    const slider = container.querySelector('.overflow-visible.h-4.mx-2');

    expect(inputRow).toHaveClass('px-2');
    expect(inputRow).not.toContainElement(slider as HTMLElement);
  });

  it('renders min and max range inputs', () => {
    render(
      <ProductPriceRangeFilter
        group={priceGroup}
        selectedOptionIds={[]}
        onRangeChange={jest.fn()}
        onRangeClear={jest.fn()}
        onBucketToggle={jest.fn()}
      />,
    );

    const minSlider = screen.getByLabelText(/Minimum price slider/i);
    expect(minSlider).toBeInTheDocument();
    expect(minSlider).toHaveAttribute('min', '0');
    expect(minSlider).toHaveAttribute('aria-valuemin', '0');
    expect(screen.getByLabelText(/Maximum price slider/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('₹0')).toBeInTheDocument();
  });

  it('renders bucket options for the price group', () => {
    render(
      <ProductPriceRangeFilter
        group={priceGroup}
        selectedOptionIds={[]}
        onRangeChange={jest.fn()}
        onRangeClear={jest.fn()}
        onBucketToggle={jest.fn()}
      />,
    );

    expect(screen.getByLabelText(/Filter by ₹0 - ₹3,499/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Filter by ₹3,500 - ₹6,999/i)).toBeInTheDocument();
  });

  it('retains exact starting amounts from the text input without ₹100 snapping', async () => {
    const user = userEvent.setup();
    const onRangeChange = jest.fn();

    render(
      <ProductPriceRangeFilter
        group={priceGroup}
        selectedOptionIds={[]}
        onRangeChange={onRangeChange}
        onRangeClear={jest.fn()}
        onBucketToggle={jest.fn()}
      />,
    );

    const minInput = screen.getByRole('textbox', { name: /Minimum price ₹/i });
    await user.clear(minInput);
    await user.type(minInput, '999');
    await user.tab();

    expect(minInput).toHaveValue('₹999');
    expect(onRangeChange).toHaveBeenCalledWith(999, priceGroup.max);

    await user.clear(minInput);
    await user.type(minInput, '500');
    await user.tab();

    expect(minInput).toHaveValue('₹500');
    expect(onRangeChange).toHaveBeenCalledWith(500, priceGroup.max);
  });

  it('keeps the rupee prefix while typing (PW-622)', async () => {
    const user = userEvent.setup();

    render(
      <ProductPriceRangeFilter
        group={priceGroup}
        selectedOptionIds={[]}
        onRangeChange={jest.fn()}
        onRangeClear={jest.fn()}
        onBucketToggle={jest.fn()}
      />,
    );

    const minInput = screen.getByRole('textbox', { name: /Minimum price ₹/i });
    await user.clear(minInput);
    await user.type(minInput, '12');

    expect(minInput).toHaveValue('₹12');
  });

  it('shows an error toast and does not apply when min equals max (PW-623)', async () => {
    const user = userEvent.setup();
    const onRangeChange = jest.fn();
    mockShowError.mockClear();

    render(
      <ProductPriceRangeFilter
        group={priceGroup}
        selectedOptionIds={['price-range:2000:5000']}
        onRangeChange={onRangeChange}
        onRangeClear={jest.fn()}
        onBucketToggle={jest.fn()}
      />,
    );

    const minInput = screen.getByRole('textbox', { name: /Minimum price ₹/i });
    const maxInput = screen.getByRole('textbox', { name: /Maximum price ₹/i });

    await user.clear(minInput);
    await user.type(minInput, '3000');
    await user.clear(maxInput);
    await user.type(maxInput, '3000');
    await user.tab();

    expect(mockShowError).toHaveBeenCalledWith(
      'Starting and ending price cannot be the same,',
    );
    expect(onRangeChange).not.toHaveBeenCalledWith(3000, 3000);
  });

  it('does not toast equal price when Apply flushes input blur (PW-623)', async () => {
    const user = userEvent.setup();
    const onRangeChange = jest.fn();
    mockShowError.mockClear();

    render(
      <ProductPriceRangeFilter
        group={priceGroup}
        selectedOptionIds={['price-range:2000:5000']}
        onRangeChange={onRangeChange}
        onRangeClear={jest.fn()}
        onBucketToggle={jest.fn()}
      />,
    );

    const maxInput = screen.getByRole('textbox', { name: /Maximum price ₹/i });
    await user.clear(maxInput);
    await user.type(maxInput, '2000');

    withFilterApplyCommit(() => {
      maxInput.blur();
    });

    expect(mockShowError).not.toHaveBeenCalled();
    expect(onRangeChange).not.toHaveBeenCalledWith(2000, 2000);
  });

  it('toggles an open-ended Above bucket without equal-price toast (PW-623)', async () => {
    const user = userEvent.setup();
    const onBucketToggle = jest.fn();
    mockShowError.mockClear();

    const groupWithAbove: ProductFilterGroup = {
      id: 'filter.v.price',
      label: 'Price',
      options: [
        { id: 'price-0-3499', label: '₹0 - ₹3,499', min: 0, max: 3499 },
        { id: 'price-5000-above', label: '₹5,000 - Above', min: 5000, max: 5397 },
      ],
      min: 0,
      max: 5397,
    };

    render(
      <ProductPriceRangeFilter
        group={groupWithAbove}
        selectedOptionIds={[]}
        onRangeChange={jest.fn()}
        onRangeClear={jest.fn()}
        onBucketToggle={onBucketToggle}
      />,
    );

    await user.click(screen.getByLabelText(/Filter by ₹5,000 - Above/i));

    expect(onBucketToggle).toHaveBeenCalledWith('price-5000-above');
    expect(mockShowError).not.toHaveBeenCalled();
  });
});
