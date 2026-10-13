import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { GoldLimitedTimeOffer } from '@/components/product/gold/GoldLimitedTimeOffer';
import { productMessages, productTheme } from '@/config/product/product.config';

import { goldLimitedTimeOfferFixture } from '../../../lib/product/gold-pdp.fixtures';

jest.mock('@/components/navigation/AppLink', () => ({
  AppLink: ({
    href,
    children,
    className,
    style,
    'aria-label': ariaLabel,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    'aria-label'?: string;
  }) => (
    <a href={href} className={className} style={style} aria-label={ariaLabel}>
      {children}
    </a>
  ),
}));

describe('GoldLimitedTimeOffer', () => {
  const writeText = jest.fn().mockResolvedValue(undefined);
  const offer = { ...goldLimitedTimeOfferFixture };

  beforeEach(() => {
    writeText.mockClear();
    Object.assign(navigator, {
      clipboard: { writeText },
    });
  });

  it('renders ribbon, API title, description, and copyable code', () => {
    render(<GoldLimitedTimeOffer offer={offer} />);

    expect(screen.getAllByText(productMessages.limitedTimeOffer).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Flat 15%').parentElement).toHaveTextContent(offer.title);
    expect(screen.getByText(offer.description)).toBeInTheDocument();
    expect(screen.getByText(offer.code)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
    expect(screen.queryByText(/Get it for just/i)).not.toBeInTheDocument();
  });

  it('bolds the leading Flat percent in the offer title', () => {
    render(<GoldLimitedTimeOffer offer={offer} />);

    expect(screen.getByText('Flat 15%')).toHaveClass('font-bold');
    expect(screen.getByText('Flat 15%').parentElement).toHaveTextContent('Flat 15% off on MRP');
  });

  it('leaves titles without a Flat percent unemphasized', () => {
    render(<GoldLimitedTimeOffer offer={{ ...offer, title: 'Extra 10% Off' }} />);

    expect(screen.getByText('Extra 10% Off')).toBeInTheDocument();
    expect(screen.getByText('Extra 10% Off')).not.toHaveClass('font-bold');
  });

  it('does not bold a percent that is not prefixed with Flat', () => {
    render(<GoldLimitedTimeOffer offer={{ ...offer, title: '15% off on MRP' }} />);

    expect(screen.getByText('15% off on MRP')).toBeInTheDocument();
    expect(screen.getByText('15% off on MRP').querySelector('.font-bold')).toBeNull();
  });

  it('bolds the rupee amount in a freebie title and paints it ink', () => {
    render(
      <GoldLimitedTimeOffer
        offer={{
          ...offer,
          title: 'Freebie worth ₹15500',
          freebieImageUrl: 'https://cdn.example.com/freebie.png',
          freebieRoute: '/products/heart-cluster',
          showViewDetails: true,
          showCouponCode: false,
          code: '',
        }}
      />,
    );

    const amount = screen.getByText('₹15500');
    expect(amount).toHaveClass('font-bold');
    expect(amount).toHaveStyle({ color: productTheme.limitedOffer.titleEmphasisColor });
    expect(amount.parentElement).toHaveTextContent('Freebie worth ₹15500');
  });

  it('does not emphasize a freebie title with no rupee amount', () => {
    render(
      <GoldLimitedTimeOffer
        offer={{
          ...offer,
          title: 'Freebie worth fifteen thousand',
          freebieImageUrl: 'https://cdn.example.com/freebie.png',
          freebieRoute: '/products/heart-cluster',
          showViewDetails: true,
          showCouponCode: false,
          code: '',
        }}
      />,
    );

    expect(screen.getByText('Freebie worth fifteen thousand')).toBeInTheDocument();
    expect(screen.getByText('Freebie worth fifteen thousand').querySelector('.font-bold')).toBeNull();
  });

  it('renders Figma flash PNG for the offer icon', () => {
    const { container } = render(<GoldLimitedTimeOffer offer={offer} />);

    const flash = container.querySelector('[aria-hidden="true"].bg-cover');
    expect(flash).toBeInTheDocument();
    expect(flash).toHaveStyle({
      backgroundImage: `url(${productTheme.limitedOffer.flashSrc})`,
    });
  });

  it('copies offer code to clipboard', async () => {
    render(<GoldLimitedTimeOffer offer={offer} />);

    fireEvent.click(screen.getByRole('button', { name: `Copy coupon code ${offer.code}` }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(offer.code);
      expect(screen.getByText(productMessages.copied)).toBeInTheDocument();
    });
  });

  it('handles clipboard write failures without showing copied state', async () => {
    writeText.mockRejectedValueOnce(new Error('denied'));

    render(<GoldLimitedTimeOffer offer={offer} />);

    fireEvent.click(screen.getByRole('button', { name: `Copy coupon code ${offer.code}` }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(offer.code);
    });
    expect(screen.queryByText(productMessages.copied)).not.toBeInTheDocument();
  });

  it('hides coupon box for display-only offers', () => {
    render(
      <GoldLimitedTimeOffer
        offer={{
          ...offer,
          code: 'MANGALSUTRA251',
          showCouponCode: false,
        }}
      />,
    );

    expect(screen.queryByText('MANGALSUTRA251')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /copy/i })).not.toBeInTheDocument();
    expect(screen.getByText('Flat 15%').parentElement).toHaveTextContent(offer.title);
  });

  it('renders freebie image and View Details link', () => {
    render(
      <GoldLimitedTimeOffer
        offer={{
          ...offer,
          title: 'Freebie worth ₹9200',
          description: productMessages.viewDetails,
          code: '',
          showCouponCode: false,
          freebieImageUrl: 'https://cdn.example.com/freebie.png',
          freebieRoute: '/products/8943146729729',
          showViewDetails: true,
        }}
      />,
    );

    const image = screen.getByTestId('gold-limited-offer-freebie-image');
    expect(image).toHaveAttribute('src', 'https://cdn.example.com/freebie.png');
    expect(image).toHaveClass('size-11', 'laptop:size-12');
    expect(screen.getByRole('link', { name: productMessages.viewDetails })).toHaveAttribute(
      'href',
      '/products/8943146729729',
    );
    expect(screen.getByRole('link', { name: 'Freebie worth ₹9200' })).toHaveAttribute(
      'href',
      '/products/8943146729729',
    );
    expect(screen.queryByRole('button', { name: /copy/i })).not.toBeInTheDocument();
  });

  it('opens enlarged freebie preview on image click without navigating', () => {
    render(
      <GoldLimitedTimeOffer
        offer={{
          ...offer,
          title: 'Freebie worth ₹9200',
          code: '',
          showCouponCode: false,
          freebieImageUrl: 'https://cdn.example.com/freebie.png',
          freebieRoute: '/products/8943146729729',
          showViewDetails: true,
        }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: productMessages.a11y.enlargeFreebieImage }));

    expect(screen.getByTestId('freebie-image-preview')).toHaveAttribute(
      'src',
      'https://cdn.example.com/freebie.png',
    );
    expect(screen.getByRole('dialog', { name: productMessages.a11y.enlargeFreebieImage })).toBeInTheDocument();
  });

  it('closes enlarged freebie preview', () => {
    render(
      <GoldLimitedTimeOffer
        offer={{
          ...offer,
          title: 'Freebie worth ₹9200',
          code: '',
          showCouponCode: false,
          freebieImageUrl: 'https://cdn.example.com/freebie.png',
          freebieRoute: '/products/8943146729729',
          showViewDetails: true,
        }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: productMessages.a11y.enlargeFreebieImage }));
    fireEvent.click(screen.getByRole('button', { name: productMessages.a11y.closeFreebieImage }));

    expect(screen.queryByTestId('freebie-image-preview')).not.toBeInTheDocument();
  });

  it('renders freebie image without link when route is missing', () => {
    render(
      <GoldLimitedTimeOffer
        offer={{
          ...offer,
          title: 'Freebie worth ₹9200',
          code: '',
          showCouponCode: false,
          freebieImageUrl: 'https://cdn.example.com/freebie.png',
          freebieRoute: '',
          showViewDetails: false,
        }}
      />,
    );

    expect(screen.getByTestId('gold-limited-offer-freebie-image')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: productMessages.viewDetails })).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: productMessages.a11y.enlargeFreebieImage }),
    ).toBeInTheDocument();
  });

  it('exposes limited-time offer region for assistive tech', () => {
    render(<GoldLimitedTimeOffer offer={offer} />);

    expect(screen.getByLabelText(productMessages.limitedTimeOffer)).toBeInTheDocument();
  });
});
