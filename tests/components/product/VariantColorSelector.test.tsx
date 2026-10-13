import { fireEvent, render, screen } from '@testing-library/react';

import { VariantColorSelector } from '@/components/product/VariantColorSelector';
import { productMessages, productTheme } from '@/config/product/product.config';
import { PRODUCT_CATEGORY } from '@/types/product';

const mockOpenSizeGuide = jest.fn();

jest.mock('@/providers/product/SizeGuideProvider', () => ({
  useSizeGuide: () => ({
    isOpen: false,
    params: null,
    openSizeGuide: mockOpenSizeGuide,
    closeSizeGuide: jest.fn(),
  }),
}));

describe('VariantColorSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('selects a colour swatch on press', () => {
    const onChange = jest.fn();
    render(
      <VariantColorSelector
        values={['Rose Gold', 'Yellow Gold']}
        selectedValue="Rose Gold"
        onChange={onChange}
        productCategory={PRODUCT_CATEGORY.GOLD}
        inStock
      />,
    );

    fireEvent.click(screen.getByLabelText('Select Yellow Gold'));
    expect(onChange).toHaveBeenCalledWith('Yellow Gold');
  });

  it('centers colour swatch fills inside their rings', () => {
    render(
      <VariantColorSelector
        values={['Yellow Gold', 'Rose Gold', 'Silver']}
        selectedValue="Silver"
        onChange={jest.fn()}
        productCategory={PRODUCT_CATEGORY.GOLD}
        inStock
      />,
    );

    const swatch = screen.getByLabelText('Select Silver');
    expect(swatch).toHaveClass('inline-flex', 'items-center', 'justify-center', 'size-[26px]');
    expect(swatch.firstElementChild).toHaveClass('size-[18px]', 'shrink-0', 'rounded-full');
  });

  it('shows the selected metal colour name for gold', () => {
    render(
      <VariantColorSelector
        values={['Rose Gold', 'Yellow Gold']}
        selectedValue="Yellow Gold"
        onChange={jest.fn()}
        productCategory={PRODUCT_CATEGORY.GOLD}
        inStock
      />,
    );

    expect(screen.getByTestId('selected-metal-colour')).toHaveTextContent('(Yellow Gold)');
    expect(screen.getByTestId('selected-metal-colour')).toHaveStyle({
      color: productTheme.selectedColourHint,
    });
  });

  it('updates the selected metal colour name when selection changes', () => {
    const { rerender } = render(
      <VariantColorSelector
        values={['Rose Gold', 'Yellow Gold']}
        selectedValue="Yellow Gold"
        onChange={jest.fn()}
        productCategory={PRODUCT_CATEGORY.GOLD}
        inStock
      />,
    );

    expect(screen.getByTestId('selected-metal-colour')).toHaveTextContent('(Yellow Gold)');

    rerender(
      <VariantColorSelector
        values={['Rose Gold', 'Yellow Gold']}
        selectedValue="Rose Gold"
        onChange={jest.fn()}
        productCategory={PRODUCT_CATEGORY.GOLD}
        inStock
      />,
    );

    expect(screen.getByTestId('selected-metal-colour')).toHaveTextContent('(Rose Gold)');
  });

  it('opens diamond guide via context for gold when enabled', () => {
    render(
      <VariantColorSelector
        values={['Rose Gold']}
        selectedValue="Rose Gold"
        onChange={jest.fn()}
        productCategory={PRODUCT_CATEGORY.GOLD}
        inStock
      />,
    );

    expect(screen.getByText(productMessages.inStock)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(productMessages.a11y.openDiamondGuide));
    expect(mockOpenSizeGuide).toHaveBeenCalledWith({ kind: 'diamond' });
  });

  it('hides diamond guide for demifine products', () => {
    render(
      <VariantColorSelector
        values={['Rose Gold']}
        selectedValue="Rose Gold"
        onChange={jest.fn()}
        productCategory={PRODUCT_CATEGORY.DEMIFINE}
        inStock
      />,
    );

    expect(screen.queryByLabelText(productMessages.a11y.openDiamondGuide)).not.toBeInTheDocument();
  });

  it('hides the selected metal colour name for demifine products', () => {
    render(
      <VariantColorSelector
        values={['Rose Gold']}
        selectedValue="Rose Gold"
        onChange={jest.fn()}
        productCategory={PRODUCT_CATEGORY.DEMIFINE}
        inStock
      />,
    );

    expect(screen.queryByTestId('selected-metal-colour')).not.toBeInTheDocument();
  });

  it('hides the selected metal colour name when selection is empty', () => {
    render(
      <VariantColorSelector
        values={['Rose Gold', 'Yellow Gold']}
        selectedValue="   "
        onChange={jest.fn()}
        productCategory={PRODUCT_CATEGORY.GOLD}
        inStock
      />,
    );

    expect(screen.queryByTestId('selected-metal-colour')).not.toBeInTheDocument();
  });

  it('shows out of stock label when variant is not saleable', () => {
    render(
      <VariantColorSelector
        values={['Rose Gold']}
        selectedValue="Rose Gold"
        onChange={jest.fn()}
        productCategory={PRODUCT_CATEGORY.GOLD}
        inStock={false}
      />,
    );

    expect(screen.getByText(productMessages.outOfStock)).toBeInTheDocument();
    expect(screen.getByText(productMessages.outOfStock)).toHaveStyle({
      color: productTheme.compareAt,
    });
  });
});
