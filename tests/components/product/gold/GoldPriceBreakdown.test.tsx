import { fireEvent, render, screen } from '@testing-library/react';

import { GoldPriceBreakupContent } from '@/components/product/gold/GoldPriceBreakdown';
import { productMessages } from '@/config/product/product.config';
import type { MtoPrice } from '@/types/mto-price';

const basePrice: MtoPrice = {
  basePrice: 45_000,
  diamondPrice: 8_000,
  diamondWeightCarat: 0.15,
  flatDiscount: 0,
  goldWeightGrams: 2.5,
  gst: 1_590,
  makingCharge: 2_500,
  makingChargeCut: 0,
  makingChargeShow: 2_500,
  metal: 'Yellow',
  noOfDiamonds: 12,
  pricePerGram: 5_500,
  purity: '9kt',
  purityDisplay: '9KT',
  purityRatio: 0.375,
  showCalculation: true,
  showMakingChargeDiscount: false,
  status: 'ok',
  subtotal: 53_000,
  title: '9KT Yellow Gold',
  totalPrice: 57_090,
  totalPriceWithoutMaking: 54_590,
};

describe('GoldPriceBreakupContent', () => {
  it('insets text rows while leaving wrappers full-bleed for hairlines', () => {
    const { container } = render(<GoldPriceBreakupContent price={basePrice} />);

    const root = container.firstChild as HTMLElement;
    expect(root.className).not.toContain('px-2');
    expect(screen.getByText('9KT Yellow Gold').className).toContain('px-2');
    expect(screen.getByText('Rate').closest('div')?.parentElement?.className).toContain('px-2');
  });

  it('keeps charge row labels on the same inset as metric rows', () => {
    render(<GoldPriceBreakupContent price={basePrice} />);

    const chargeRow = screen.getByText('Making Charges').closest('div');

    expect(chargeRow?.className).toContain('px-2');
    expect(chargeRow?.parentElement?.className).toContain('border-b');
  });

  it('renders diamond metrics in the same full-width grid layout', () => {
    render(<GoldPriceBreakupContent price={basePrice} />);

    expect(screen.getByText('Diamond')).toBeInTheDocument();
    expect(screen.getByText('Count')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('hides diamond section when no diamond data is present', () => {
    render(
      <GoldPriceBreakupContent
        price={{ ...basePrice, diamondPrice: 0, noOfDiamonds: 0, diamondWeightCarat: 0 }}
      />,
    );

    expect(screen.queryByText('Diamond')).not.toBeInTheDocument();
  });

  it('renders charge rows including grand total', () => {
    render(<GoldPriceBreakupContent price={basePrice} />);

    expect(screen.getByText('Making Charges')).toBeInTheDocument();
    expect(screen.getByText(productMessages.grandTotal)).toBeInTheDocument();
  });

  it('shows final price below grand total when the without-making total is lower', () => {
    render(<GoldPriceBreakupContent price={basePrice} />);

    expect(screen.getByText(productMessages.finalPrice)).toBeInTheDocument();
    expect(screen.getByText('₹54,590')).toBeInTheDocument();
  });

  it('hides final price when without-making is not lower than grand total', () => {
    render(
      <GoldPriceBreakupContent price={{ ...basePrice, totalPriceWithoutMaking: 57_090 }} />,
    );

    expect(screen.queryByText(productMessages.finalPrice)).not.toBeInTheDocument();
  });

  it('hides final price when without-making is missing', () => {
    render(<GoldPriceBreakupContent price={{ ...basePrice, totalPriceWithoutMaking: 0 }} />);

    expect(screen.queryByText(productMessages.finalPrice)).not.toBeInTheDocument();
  });

  it('shows price estimation copy when grand total info is opened', () => {
    render(<GoldPriceBreakupContent price={basePrice} />);

    fireEvent.click(screen.getByLabelText(productMessages.a11y.grandTotalInfo));

    expect(screen.getByRole('status')).toHaveTextContent(productMessages.grandTotalInfo);
  });

  it('hides price estimation copy when grand total info is toggled closed', () => {
    render(<GoldPriceBreakupContent price={basePrice} />);

    const infoButton = screen.getByLabelText(productMessages.a11y.grandTotalInfo);
    fireEvent.click(infoButton);
    fireEvent.click(infoButton);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
