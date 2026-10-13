import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { OfferItem } from '@/components/product/OfferItem';
import { productMessages, productTheme } from '@/config/product/product.config';
import type { ProductOffer } from '@/types/product';
import { createUseToastMock } from '@tests/test-utils/mock-use-toast';

const toastMock = createUseToastMock();

jest.mock('@/hooks/useToast', () => ({
  useToast: () => toastMock,
}));

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

const mockOffer: ProductOffer = {
  key: 'MONSOON4',
  name: 'Get it for ₹3,266',
  description: 'Note: You need to add minimum 2 products to avail this discount.',
  code: 'MONSOON4',
  type: 'DISCOUNT',
  discountValue: 3266,
  placeholder: [{ text: 'Perfect Time to Stock Up', style: 'normal' }],
};

describe('OfferItem', () => {
  const writeText = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    writeText.mockClear();
    toastMock.showSuccess.mockClear();
    Object.assign(navigator, {
      clipboard: { writeText },
    });
  });

  it('renders offer name, description, and coupon key', () => {
    render(<OfferItem offer={mockOffer} />);

    expect(screen.getByText('Get it for ₹3,266')).toBeInTheDocument();
    expect(screen.getByText(/Note: You need to add minimum 2 products/)).toBeInTheDocument();
    expect(screen.getByText('MONSOON4')).toHaveClass('text-[13px]');
    expect(screen.getByText(productMessages.collectOffer)).toBeInTheDocument();
    expect(screen.queryByText(/Perfect Time to Stock Up/)).not.toBeInTheDocument();
  });

  it('shows unit price and API description for Buy-N-At offers', () => {
    render(
      <OfferItem
        offer={{
          ...mockOffer,
          name: 'Buy 4 At ₹2999',
          description: 'Special discount on purchase of 4 items',
          code: 'BLING4',
        }}
      />,
    );

    expect(screen.getByText('Get it for ₹750')).toBeInTheDocument();
    expect(screen.getByText('Special discount on purchase of 4 items')).toBeInTheDocument();
    expect(screen.queryByText('Buy 4 At ₹2999')).not.toBeInTheDocument();
    expect(screen.queryByText(/Add 3 more products/)).not.toBeInTheDocument();
  });

  it('shows unit price and API description for Get-any-N offers', () => {
    render(
      <OfferItem
        offer={{
          ...mockOffer,
          name: 'Get any 2 for ₹1899',
          description: 'Special discount on purchase of 2 items',
          code: 'BLING2',
        }}
      />,
    );

    expect(screen.getByText('Get it for ₹950')).toBeInTheDocument();
    expect(screen.getByText('Special discount on purchase of 2 items')).toBeInTheDocument();
    expect(screen.queryByText('Get any 2 for ₹1899')).not.toBeInTheDocument();
    expect(screen.queryByText(/Add 1 more product/)).not.toBeInTheDocument();
  });

  it('falls back to add-more copy when a Buy-N-At offer has no API description', () => {
    render(
      <OfferItem
        offer={{
          ...mockOffer,
          name: 'Buy 4 At ₹2999',
          description: '',
          placeholder: [],
          code: 'BLING4',
        }}
      />,
    );

    expect(screen.getByText('Get it for ₹750')).toBeInTheDocument();
    expect(screen.getByText('Add 3 more products to get it for ₹750.')).toBeInTheDocument();
  });

  it('uses ticket chrome and description colors', () => {
    render(<OfferItem offer={mockOffer} />);
    const description = screen.getByText(/Note: You need to add minimum 2 products/);
    const collect = screen.getByRole('button', { name: 'Copy coupon code MONSOON4' });

    expect(description).toHaveStyle({ color: productTheme.offerDescription });
    expect(collect).toHaveStyle({ color: productTheme.offerCard.collect });
    expect(description.closest('article')).toHaveStyle({
      boxShadow: 'none',
      backgroundImage: 'none',
    });
    expect(screen.queryByText(/Save upto/)).not.toBeInTheDocument();
  });

  it('uses placeholder text when description is empty', () => {
    render(<OfferItem offer={{ ...mockOffer, description: '' }} />);

    expect(screen.getByText('Perfect Time to Stock Up')).toBeInTheDocument();
    expect(screen.queryByText(/Note: You need to add minimum 2 products/)).not.toBeInTheDocument();
  });

  it('omits description row when description and placeholder are empty', () => {
    render(<OfferItem offer={{ ...mockOffer, description: '', placeholder: [] }} />);

    expect(screen.queryByText(/Note: You need to add minimum 2 products/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Perfect Time to Stock Up/)).not.toBeInTheDocument();
  });

  it('prefers coupon code over key', () => {
    render(<OfferItem offer={{ ...mockOffer, key: 'api-offer-1', code: 'B1G1' }} />);

    expect(screen.getByText('B1G1')).toBeInTheDocument();
    expect(screen.queryByText('api-offer-1')).not.toBeInTheDocument();
  });

  it('does not throw when description and key are omitted after Flight clone', () => {
    render(
      <OfferItem
        offer={
          {
            name: mockOffer.name,
            code: 'MONSOON4',
            type: mockOffer.type,
            placeholder: mockOffer.placeholder,
          } as ProductOffer
        }
      />,
    );

    expect(screen.getByText('MONSOON4')).toBeInTheDocument();
    expect(screen.getByText('Perfect Time to Stock Up')).toBeInTheDocument();
  });

  it('hides coupon code when discount category is display', () => {
    render(<OfferItem offer={{ ...mockOffer, discountCategory: 'display' }} />);

    expect(screen.getByText('Get it for ₹3,266')).toBeInTheDocument();
    expect(screen.queryByText('MONSOON4')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Copy coupon code/ })).not.toBeInTheDocument();
  });

  it('copies offer key to clipboard', async () => {
    render(<OfferItem offer={mockOffer} />);

    fireEvent.click(screen.getByRole('button', { name: 'Copy coupon code MONSOON4' }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('MONSOON4');
      expect(toastMock.showSuccess).toHaveBeenCalledWith(productMessages.copied);
      expect(screen.getByText(productMessages.copied)).toBeInTheDocument();
    });
  });

  it('handles clipboard write failures without showing copied state', async () => {
    writeText.mockRejectedValueOnce(new Error('denied'));

    render(<OfferItem offer={mockOffer} />);

    fireEvent.click(screen.getByRole('button', { name: 'Copy coupon code MONSOON4' }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('MONSOON4');
    });
    expect(toastMock.showSuccess).not.toHaveBeenCalled();
    expect(screen.queryByText(productMessages.copied)).not.toBeInTheDocument();
  });

  it('renders freebie image and View Details when freebie fields are present', () => {
    render(
      <OfferItem
        offer={{
          ...mockOffer,
          key: 'MANGALSUTRA252',
          name: 'Freebie worth ₹9200',
          type: 'FREEBIE',
          discountCategory: 'display',
          freebieImageUrl: 'https://cdn.example.com/freebie.png',
          freebieRoute: '/products/8943146729729',
        }}
      />,
    );

    expect(screen.getByTestId('offer-item-freebie-image')).toHaveAttribute(
      'src',
      'https://cdn.example.com/freebie.png',
    );
    expect(screen.getByRole('link', { name: productMessages.seeDetails })).toHaveAttribute(
      'href',
      '/products/8943146729729',
    );
    expect(screen.getByRole('link', { name: 'Freebie worth ₹9200' })).toHaveAttribute(
      'href',
      '/products/8943146729729',
    );
    expect(screen.queryByText('MONSOON4')).not.toBeInTheDocument();
  });

  it('opens enlarged freebie preview on image click', () => {
    render(
      <OfferItem
        offer={{
          ...mockOffer,
          type: 'FREEBIE',
          discountCategory: 'display',
          freebieImageUrl: 'https://cdn.example.com/freebie.png',
          freebieRoute: '/products/8943146729729',
        }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: productMessages.a11y.enlargeFreebieImage }));

    expect(screen.getByTestId('freebie-image-preview')).toHaveAttribute(
      'src',
      'https://cdn.example.com/freebie.png',
    );
  });

  it('renders freebie image without View Details when route is missing', () => {
    render(
      <OfferItem
        offer={{
          ...mockOffer,
          type: 'FREEBIE',
          discountCategory: 'display',
          description: 'Free gold pendant',
          freebieImageUrl: 'https://cdn.example.com/freebie.png',
        }}
      />,
    );

    expect(screen.getByTestId('offer-item-freebie-image')).toBeInTheDocument();
    expect(screen.getByText('Free gold pendant')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: productMessages.seeDetails })).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: productMessages.a11y.enlargeFreebieImage }),
    ).toBeInTheDocument();
  });
});
