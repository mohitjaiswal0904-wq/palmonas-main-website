import { render, screen } from '@testing-library/react';

import { VariantSelector } from '@/components/product/VariantSelector';
import { productMessages } from '@/config/product/product.config';
import type { ProductVariant } from '@/types/product';

const mockOpenSizeGuide = jest.fn();

jest.mock('@/providers/product/SizeGuideProvider', () => ({
  useSizeGuide: () => ({
    isOpen: false,
    params: null,
    openSizeGuide: mockOpenSizeGuide,
    closeSizeGuide: jest.fn(),
  }),
}));

const ringVariants: ProductVariant[] = [
  {
    id: 'size-6',
    title: '6',
    price: 1000,
    availableForSale: true,
    selectedOptions: [{ name: 'Ring Size', value: '6' }],
  },
  {
    id: 'size-7',
    title: '7',
    price: 1000,
    availableForSale: true,
    selectedOptions: [{ name: 'Ring Size', value: '7' }],
  },
];

const chainVariants: ProductVariant[] = [
  {
    id: 'rope-60-6',
    title: '60cm / 6mm',
    price: 1111,
    availableForSale: true,
    selectedOptions: [{ name: 'Size', value: '60cm / 6mm' }],
  },
  {
    id: 'rope-50-6',
    title: '50cm / 6mm',
    price: 999,
    availableForSale: true,
    selectedOptions: [{ name: 'Size', value: '50cm / 6mm' }],
  },
];

describe('VariantSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows ring-size chips and the size guide for numeric ring sizes', () => {
    render(<VariantSelector variants={ringVariants} />);

    expect(screen.getByText(productMessages.selectRingSize)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: productMessages.a11y.openSizeGuide })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select size 6' })).toHaveClass('text-xs');
  });

  it('renders chain measurements as pills instead of ring-size chips', () => {
    render(<VariantSelector variants={chainVariants} />);

    expect(screen.queryByText(productMessages.selectRingSize)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: productMessages.a11y.openSizeGuide }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '60cm / 6mm' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '50cm / 6mm' })).toBeInTheDocument();
  });

  it('returns nothing when there is only one selectable variant', () => {
    const { container } = render(
      <VariantSelector
        variants={[
          {
            id: 'only',
            title: 'Default Title',
            price: 100,
            availableForSale: true,
            selectedOptions: [],
          },
        ]}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('hides the picker when every variant shares the same measurement', () => {
    const { container } = render(
      <VariantSelector
        variants={[
          {
            id: 'a',
            title: '60cm / 6mm',
            price: 100,
            availableForSale: true,
            selectedOptions: [{ name: 'Size', value: '60cm / 6mm' }],
          },
          {
            id: 'b',
            title: '60cm / 6mm',
            price: 110,
            availableForSale: true,
            selectedOptions: [{ name: 'Size', value: '60cm / 6mm' }],
          },
        ]}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
