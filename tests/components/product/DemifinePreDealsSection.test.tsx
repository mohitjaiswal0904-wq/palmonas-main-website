import { render, screen } from '@testing-library/react';

import { DemifinePreDealsSection } from '@/components/product/DemifinePreDealsSection';
import { productMessages, productTheme, productUspBadges } from '@/config/product/product.config';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}));

describe('DemifinePreDealsSection', () => {
  it('renders USP badges and selling-fast strip', () => {
    render(<DemifinePreDealsSection quantityOrdered30Days={135} />);

    expect(screen.getByRole('img', { name: productMessages.usps.anti_tarnish })).toHaveAttribute(
      'src',
      productUspBadges.anti_tarnish.src,
    );
    expect(screen.getByRole('img', { name: productMessages.usps.skin_safe_jewellery })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: productMessages.usps.gold_tone_plated })).toBeInTheDocument();
    expect(screen.getByText('135')).toHaveClass('font-bold');
    expect(screen.getByText('135')).toHaveStyle({ color: productTheme.sellingFastBanner.countColor });
    expect(screen.getByText(/sold in the last 7 days/)).toBeInTheDocument();
    expect(screen.getByRole('status').querySelector('svg')).not.toBeInTheDocument();
    expect(screen.getByRole('status').firstElementChild).toHaveClass('selling-fast-shine');
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      productMessages.a11y.sellingFastStatus,
    );
    expect(screen.queryByText(/cashback in your wallet/)).not.toBeInTheDocument();
  });

  it('does not render selling-fast strip when API quantity is missing', () => {
    render(<DemifinePreDealsSection />);

    expect(screen.queryByText(/sold in the last 7 days/)).not.toBeInTheDocument();
  });

  it('exposes trust accessibility labels', () => {
    render(<DemifinePreDealsSection />);

    expect(
      screen.getByRole('region', { name: productMessages.a11y.demifineTrustPills }),
    ).toBeInTheDocument();
  });

  it('groups ships-in-24h with the USP strip when tags are provided', () => {
    render(<DemifinePreDealsSection tags={[{ name: 'badge', value: 'Selling Fast' }]} />);

    const trust = screen.getByRole('region', { name: productMessages.a11y.demifineTrustPills });
    expect(trust).toContainElement(screen.getByText(productMessages.shipsIn24Hours));
    expect(trust).toContainElement(screen.getByRole('img', { name: productMessages.usps.anti_tarnish }));
  });

  it('uses API usps for the badge strip when provided', () => {
    render(
      <DemifinePreDealsSection usps={['anti_tarnish', 'skin_safe_jewellery', 'platinum_plated']} />,
    );

    expect(screen.getByRole('img', { name: productMessages.usps.platinum_plated })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: productMessages.usps.gold_tone_plated })).not.toBeInTheDocument();
  });

  it('falls back to the default gold-tone badge when usps is omitted', () => {
    render(<DemifinePreDealsSection />);

    expect(screen.getByRole('img', { name: productMessages.usps.gold_tone_plated })).toBeInTheDocument();
  });

  it('renders offer children in the promo cluster', () => {
    render(
      <DemifinePreDealsSection>
        <p>Limited time offers</p>
      </DemifinePreDealsSection>,
    );

    const offers = screen.getByText('Limited time offers');
    const promo = offers.closest('div.flex.w-full.min-w-0.flex-col');
    expect(promo).toContainElement(offers);
    expect(promo?.className).toContain('gap-3');
  });
});
