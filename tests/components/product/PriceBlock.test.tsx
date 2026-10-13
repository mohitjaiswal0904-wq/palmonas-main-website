import { render, screen } from '@testing-library/react';

import { PriceBlock } from '@/components/product/PriceBlock';
import { productMessages, productTheme } from '@/config/product/product.config';
import type { ProductOffer } from '@/types/product';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, width, height }: { alt: string; width: number; height: number }) => (
    // eslint-disable-next-line @next/next/no-img-element -- test stub for next/image
    <img alt={alt} width={width} height={height} />
  ),
}));

const mockOffers: ProductOffer[] = [
  {
    key: 'offer-1',
    name: 'Extra 10% off',
    description: 'Use at checkout.',
    code: 'EXTRA10',
    type: 'DISCOUNT',
    discountValue: 10,
    placeholder: [{ text: 'Limited Time Offer', style: 'normal' }],
  },
  {
    key: 'offer-2',
    name: 'Buy 1 Get 1 Free',
    description: 'Add two items.',
    code: 'B1G1',
    type: 'FREEBIE',
    discountValue: 3266,
    placeholder: [{ text: 'Perfect Time to Stock Up', style: 'normal' }],
  },
  {
    key: 'offer-3',
    name: 'Free Gift',
    description: 'Limited stock.',
    code: 'GIFT',
    type: 'DISCOUNT',
    discountValue: null,
    placeholder: [{ text: 'Gift with purchase', style: 'normal' }],
  },
];

describe('PriceBlock', () => {
  it('renders API offer promo and additional offer count on cards', () => {
    render(<PriceBlock price={3266} compareAtPrice={4500} offers={mockOffers} variant="card" />);

    expect(screen.getByText(/Extra 10% off/)).toBeInTheDocument();
    expect(screen.getByText('+ 2 more')).toBeInTheDocument();
    expect(screen.queryByText(productMessages.limitedStock.highlight)).not.toBeInTheDocument();
  });

  it('cycles the gold Get-it-for pill with a cheaper offer price', () => {
    render(
      <PriceBlock
        price={1700}
        compareAtPrice={2299}
        offers={[
          mockOffers[0]!,
          { ...mockOffers[0]!, key: 'offer-price', name: 'Get it for ₹1,111 with offers' },
        ]}
        variant="card"
      />,
    );

    expect(screen.getByText(/Extra 10% off/)).toBeInTheDocument();
    expect(screen.getByText(/Get it for/)).toBeInTheDocument();
    expect(screen.getByText('₹1,111')).toBeInTheDocument();
    expect(screen.getByRole('status').parentElement).toHaveClass('col-span-2');
  });

  it('cycles the gold Get-it-for pill using the first discount payable price', () => {
    render(
      <PriceBlock
        price={999}
        compareAtPrice={3184}
        offers={[
          {
            ...mockOffers[0]!,
            name: 'Buy 6 At ₹4999',
            discountValue: 4999,
            payablePrice: 833,
          },
        ]}
        variant="card"
      />,
    );

    expect(screen.getByText(/Buy 6 At/)).toBeInTheDocument();
    expect(screen.getByText(/Get it for/)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      'Buy 6 At ₹4999. Get it for ₹833 with offers',
    );
  });

  it('cycles the gold Get-it-for pill using the selling price when copy has no cheaper rupee', () => {
    render(<PriceBlock price={3266} compareAtPrice={4500} offers={mockOffers} variant="card" />);

    expect(screen.getByText(/Get it for/)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      'Extra 10% off + 2 more. Get it for ₹3,266 with offers',
    );
  });

  it('shows limited-stock copy on cards when no offer is applicable', () => {
    render(<PriceBlock price={3266} compareAtPrice={4500} offers={[]} variant="card" />);

    expect(
      screen.getByText(productMessages.limitedStock.highlight).parentElement,
    ).toHaveTextContent('Only a few items left');
    expect(screen.queryByText('+ 2 more')).not.toBeInTheDocument();
    expect(screen.queryByText(/Extra 10% off/)).not.toBeInTheDocument();
  });

  it('shows New Arrivals when the product is a new arrival and no offer applies', () => {
    render(<PriceBlock price={3266} offers={[]} variant="card" isNewArrival />);

    expect(screen.getByText(productMessages.newArrivals)).toBeInTheDocument();
    expect(screen.queryByText(productMessages.limitedStock.highlight)).not.toBeInTheDocument();
  });

  it('keeps offer promo ahead of the New Arrivals fallback', () => {
    render(<PriceBlock price={3266} offers={[mockOffers[0]!]} variant="card" isNewArrival />);

    expect(screen.getByText(/Extra 10% off/)).toBeInTheDocument();
    expect(screen.queryByText(productMessages.newArrivals)).not.toBeInTheDocument();
  });

  it('shows the platinum plated pill instead of offer copy', () => {
    render(
      <PriceBlock
        price={1700}
        compareAtPrice={2299}
        offers={mockOffers}
        variant="card"
        showPlatinumPlated
      />,
    );

    expect(screen.getByText(productMessages.platinumPlated)).toBeInTheDocument();
    expect(screen.queryByText(/Extra 10% off/)).not.toBeInTheDocument();
    expect(screen.queryByText(productMessages.limitedStock.highlight)).not.toBeInTheDocument();
    expect(screen.getByText(productMessages.platinumPlated).closest('div')).toHaveClass('col-span-2');
  });

  it('keeps out-of-stock status ahead of the platinum plated pill', () => {
    render(
      <PriceBlock
        price={1700}
        variant="card"
        showPlatinumPlated
        statusLabel="Out of Stock"
        statusLabelClassName="text-[#C4554D]"
      />,
    );

    expect(screen.getByTestId('price-block-status')).toHaveTextContent('Out of Stock');
    expect(screen.queryByText(productMessages.platinumPlated)).not.toBeInTheDocument();
  });

  it('hides all promo copy when showOfferPromo is false', () => {
    render(
      <PriceBlock
        price={3266}
        compareAtPrice={4500}
        offers={mockOffers}
        variant="card"
        isNewArrival
        showOfferPromo={false}
      />,
    );

    expect(screen.getByText('₹3,266')).toBeInTheDocument();
    expect(screen.getByText('₹4,500')).toBeInTheDocument();
    expect(screen.queryByText(/Extra 10% off/)).not.toBeInTheDocument();
    expect(screen.queryByText(productMessages.newArrivals)).not.toBeInTheDocument();
    expect(screen.queryByText(productMessages.limitedStock.highlight)).not.toBeInTheDocument();
  });

  it('shows a status label in the promo slot and mutes prices when disabled', () => {
    render(
      <PriceBlock
        price={999}
        compareAtPrice={4157}
        offers={mockOffers}
        variant="card"
        showOfferPromo={false}
        disabled
        statusLabel="Out of Stock"
        statusLabelClassName="text-[#A33B35]"
      />,
    );

    expect(screen.getByTestId('price-block-status')).toHaveTextContent('Out of Stock');
    expect(screen.getByTestId('price-block-status')).toHaveClass(
      'text-xs',
      'tab:text-xs',
      'laptop:text-sm',
      'text-[#A33B35]',
    );
    expect(screen.getByText('₹999')).toHaveClass('text-[#9CA3AF]');
    expect(screen.getByText('₹4,157')).toHaveClass('text-[#C4C4C4]');
    expect(screen.queryByText(/Extra 10% off/)).not.toBeInTheDocument();
  });

  it('highlights the item count in red bold and keeps the rest black', () => {
    render(<PriceBlock price={3266} offers={[]} variant="card" />);

    const highlight = screen.getByText(productMessages.limitedStock.highlight);
    expect(highlight).toHaveClass('font-bold');
    expect(highlight).toHaveStyle({ color: productTheme.sellingFastAccent });
    expect(highlight.parentElement).toHaveStyle({ color: productTheme.ink });
  });

  it('shows limited-stock copy when offer payloads have no displayable text', () => {
    render(
      <PriceBlock
        price={3266}
        offers={[
          {
            key: 'blank',
            name: '',
            description: '',
            code: '',
            type: 'DISCOUNT',
            discountValue: null,
            placeholder: [],
          },
        ]}
        variant="card"
      />,
    );

    expect(
      screen.getByText(productMessages.limitedStock.highlight).parentElement,
    ).toHaveTextContent('Only a few items left');
  });

  it('renders demifine percent-off chip on PDP default variant', () => {
    render(
      <PriceBlock price={3266} compareAtPrice={4500} offers={mockOffers} themeVariant="demifine" />,
    );

    expect(screen.getByText(`27${productMessages.percentOff}`)).toHaveClass('text-[11px]');
    expect(screen.getByText(productMessages.inclusiveOfTaxes)).toHaveClass('text-xs');
  });

  it('uses listing promo colour and regular weight on cards', () => {
    render(<PriceBlock price={3266} offers={mockOffers} variant="card" />);

    const promo = screen.getByText(/Extra 10% off/);
    expect(promo).toHaveClass('font-bold');
    expect(promo).not.toHaveClass('tab:font-semibold');
    expect(promo).toHaveStyle({ color: productTheme.cardOfferPromo });

    const more = screen.getByText('+ 2 more');
    expect(more).toHaveClass('font-normal');
    expect(more).not.toHaveClass('font-bold', 'tab:font-semibold');
    expect(more).toHaveStyle({ color: productTheme.cardOfferMore });
  });

  it('keeps default card offer promo type scale on desktop', () => {
    render(<PriceBlock price={3266} offers={[mockOffers[0]!]} variant="card" />);

    expect(screen.getByText(/Extra 10% off/)).toHaveClass('laptop:text-sm', 'text-xs');
  });

  it('uses compact offer promo type for narrow cards', () => {
    render(
      <PriceBlock
        price={3266}
        offers={[mockOffers[0]!]}
        variant="card"
        compactOfferPromo
      />,
    );

    const promo = screen.getByText(/Extra 10% off/);
    expect(promo).toHaveClass('text-xxs', 'leading-tight');
    expect(promo).not.toHaveClass('laptop:text-sm', 'tab:text-xs');
  });

  it('uses compact type for limited-stock fallback on narrow cards', () => {
    render(<PriceBlock price={3266} offers={[]} variant="card" compactOfferPromo />);

    expect(screen.getByText(productMessages.limitedStock.highlight).parentElement).toHaveClass(
      'text-xxs',
      'leading-tight',
    );
  });

  it('hides PDP strikethrough when selling price and MRP are identical', () => {
    const { container } = render(<PriceBlock price={41192} compareAtPrice={41192} />);

    expect(screen.getByText('₹41,192')).toBeInTheDocument();
    expect(container.querySelector('.line-through')).toBeNull();
  });

  it('hides card strikethrough when selling price and MRP are identical', () => {
    const { container } = render(
      <PriceBlock price={29844} compareAtPrice={29844} variant="card" showOfferPromo={false} />,
    );

    expect(screen.getByText(/₹29,844/)).toBeInTheDocument();
    expect(container.querySelector('.line-through')).toBeNull();
  });

  it('keeps PDP strikethrough when MRP is higher than selling price', () => {
    const { container } = render(<PriceBlock price={3266} compareAtPrice={4500} />);

    expect(screen.getByText('₹3,266')).toBeInTheDocument();
    expect(container.querySelector('.line-through')).toHaveTextContent('₹4,500');
  });

  it('renders the PDP strikethrough before the selling price', () => {
    const { container } = render(<PriceBlock price={1199} compareAtPrice={3184} />);
    const row = container.querySelector('.flex-wrap');

    expect(row?.textContent?.replace(/\s+/g, '')).toMatch(/^₹3,184₹1,199/);
  });

  it('hides strikethrough when MRP is not higher than selling price', () => {
    const { container } = render(
      <PriceBlock price={41192} compareAtPrice={40000} variant="card" showOfferPromo={false} />,
    );

    expect(screen.getByText(/₹41,192/)).toBeInTheDocument();
    expect(container.querySelector('.line-through')).toBeNull();
  });

  it('anchors the PDP price for the sticky bar observer', () => {
    const { container } = render(
      <PriceBlock price={3266} compareAtPrice={4500} anchorId="product-pdp-price" />,
    );

    const node = container.querySelector('#product-pdp-price');
    expect(node).toHaveAttribute('data-selling-price', '3266');
    expect(node).toHaveAttribute('data-compare-at-price', '4500');
  });

  it('omits compare-at data when the PDP price is not discounted', () => {
    const { container } = render(
      <PriceBlock price={3266} compareAtPrice={3266} anchorId="product-pdp-price" />,
    );

    const node = container.querySelector('#product-pdp-price');
    expect(node).toHaveAttribute('data-selling-price', '3266');
    expect(node).not.toHaveAttribute('data-compare-at-price');
  });

  it('does not anchor listing-card prices', () => {
    const { container } = render(
      <PriceBlock price={3266} variant="card" showOfferPromo={false} anchorId="product-pdp-price" />,
    );

    expect(container.querySelector('#product-pdp-price')).toBeNull();
  });
});
