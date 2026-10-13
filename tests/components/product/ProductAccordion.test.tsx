import { render, screen } from '@testing-library/react';

import { ProductAccordion } from '@/components/product/ProductAccordion';
import { productMessages } from '@/config/product/product.config';
import { PRODUCT_CATEGORY, type Product } from '@/types/product';
import type { MtoPrice } from '@/types/mto-price';

const demifineProduct: Product = {
  id: '1',
  handle: 'demo',
  name: 'Demo',
  description: 'A demifine piece.',
  price: 1000,
  image: 'https://cdn.example.com/img.jpg',
  images: ['https://cdn.example.com/img.jpg'],
  category: 'rings',
  productCategory: PRODUCT_CATEGORY.DEMIFINE,
  offers: [],
  variants: [],
  supplierInfo: 'Supplier',
  returnInfo: 'Returns ok',
};

const goldProduct: Product = {
  ...demifineProduct,
  productCategory: PRODUCT_CATEGORY.GOLD,
};

const emptyMtoPrice: MtoPrice = {
  basePrice: 0,
  diamondPrice: 0,
  diamondWeightCarat: 0,
  flatDiscount: 0,
  goldWeightGrams: 0,
  gst: 0,
  makingCharge: 0,
  makingChargeCut: 0,
  makingChargeShow: 0,
  metal: '',
  noOfDiamonds: 0,
  pricePerGram: 0,
  purity: '',
  purityDisplay: '',
  purityRatio: 0,
  showCalculation: false,
  showMakingChargeDiscount: false,
  status: '',
  subtotal: 0,
  title: '',
  totalPrice: 0,
  totalPriceWithoutMaking: 0,
};

describe('ProductAccordion', () => {
  it('keeps demifine accordion full-bleed without gold radius card', () => {
    render(<ProductAccordion product={demifineProduct} />);

    const region = screen.getByRole('region', { name: /product details/i });
    expect(region.className).not.toContain('rounded-[12px]');
    expect(region.className).not.toContain('border-y');
  });

  it('applies Figma radius card chrome on gold', () => {
    render(<ProductAccordion product={goldProduct} />);

    const region = screen.getByRole('region', { name: /product details/i });
    expect(region.className).toContain('rounded-[12px]');
    expect(region.className).toContain('p-1.5');
  });

  it('renders description when present', () => {
    render(<ProductAccordion product={demifineProduct} />);

    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('uses mild desktop type bump, py-3 text-to-border gap, bottom border only', () => {
    const { container } = render(<ProductAccordion product={demifineProduct} />);
    const summary = container.querySelector('summary');
    const details = container.querySelector('details');

    expect(summary?.className).toContain('text-sm');
    expect(summary?.className).toContain('laptop:text-base');
    expect(summary?.className).toContain('py-3');
    expect(details).toHaveStyle({ borderBottomWidth: '0.5px' });
  });

  it('hides empty optional sections', () => {
    const empty: Product = {
      ...demifineProduct,
      description: '',
      supplierInfo: '',
      returnInfo: '',
      specifications: '',
    };

    const { container } = render(<ProductAccordion product={empty} />);

    expect(container.querySelector('details')).toBeNull();
  });

  it('hides gold price breakup when MTO price is missing', () => {
    render(<ProductAccordion product={goldProduct} mtoPrice={emptyMtoPrice} />);

    expect(screen.queryByText(productMessages.priceDetails)).not.toBeInTheDocument();
  });

  it('shows gold price breakup when MTO price is available', () => {
    render(
      <ProductAccordion
        product={goldProduct}
        mtoPrice={{ ...emptyMtoPrice, showCalculation: true, totalPrice: 12_000, pricePerGram: 5_500 }}
      />,
    );

    expect(screen.getByText(productMessages.priceDetails)).toBeInTheDocument();
  });
});
