import { render, screen } from '@testing-library/react';

import { ChooseOptionsSheetHost } from '@/components/product/ChooseOptionsSheetHost';
import type { Product } from '@/types/product';

const mockClose = jest.fn();
const mockParams = jest.fn();

jest.mock('@/providers/product/ChooseOptionsProvider', () => ({
  useChooseOptions: () => ({
    isOpen: true,
    params: mockParams(),
    closeChooseOptions: mockClose,
  }),
}));

jest.mock('@/components/product/ChooseOptionsSheet', () => ({
  ChooseOptionsSheet: ({ intent }: { intent: string }) => (
    <div data-testid="choose-options-sheet">{intent}</div>
  ),
}));

jest.mock('@/components/product/RemoveCartVariantSheet', () => ({
  RemoveCartVariantSheet: () => <div data-testid="remove-cart-variant-sheet" />,
}));

const product = { id: 'prod-1' } as Product;

describe('ChooseOptionsSheetHost', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the add sheet for addToCart', () => {
    mockParams.mockReturnValue({ product, intent: 'addToCart' });
    render(<ChooseOptionsSheetHost />);
    expect(screen.getByTestId('choose-options-sheet')).toHaveTextContent('addToCart');
  });

  it('renders the remove sheet for removeFromCart', () => {
    mockParams.mockReturnValue({
      product,
      intent: 'removeFromCart',
      matchingLines: [{ id: 'line-1', quantity: 1, variantId: 'v1' }],
    });
    render(<ChooseOptionsSheetHost />);
    expect(screen.getByTestId('remove-cart-variant-sheet')).toBeInTheDocument();
    expect(screen.queryByTestId('choose-options-sheet')).not.toBeInTheDocument();
  });

  it('renders nothing when the sheet is closed', () => {
    mockParams.mockReturnValue(null);
    const { container } = render(<ChooseOptionsSheetHost />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the buy-now sheet without the remove list', () => {
    mockParams.mockReturnValue({ product, intent: 'buyNow' });
    render(<ChooseOptionsSheetHost />);
    expect(screen.getByTestId('choose-options-sheet')).toHaveTextContent('buyNow');
    expect(screen.queryByTestId('remove-cart-variant-sheet')).not.toBeInTheDocument();
  });
});
