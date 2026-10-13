import { fireEvent, render, screen } from '@testing-library/react';

import { CartAddressBar } from '@/components/cart/CartAddressBar';
import { CartBundleDealCard, CartFreeGiftCard } from '@/components/cart/cart-offer-banners';
import { CartHeader } from '@/components/cart/CartHeader';
import { CartLimitedTimeOffers } from '@/components/cart/CartLimitedTimeOffers';
import { CartWalletToggleRow } from '@/components/cart/CartWalletToggleRow';
import { cartConfig, cartMessages, cartTheme } from '@/config/cart/cart.config';

jest.mock('@/config/cart/cart.config', () => ({
  ...jest.requireActual('@/config/cart/cart.config'),
  isCartFeatureEnabled: jest.fn(() => true),
}));

const mockBack = jest.fn();
const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ back: mockBack, push: mockPush }),
}));

jest.mock('@/hooks/auth/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: true }),
}));

describe('CartHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'history', {
      configurable: true,
      value: { length: 2 },
    });
  });

  it('calls router.back when history exists', () => {
    render(<CartHeader />);
    fireEvent.click(screen.getByTestId('cart-header-back'));
    expect(mockBack).toHaveBeenCalled();
  });

  it('renders back on the left before title on mobile', () => {
    render(<CartHeader />);

    const header = screen.getByTestId('cart-header');
    const back = screen.getByTestId('cart-header-back');
    const title = screen.getByText(cartMessages.pageTitle);

    expect(header).not.toHaveClass('justify-between');
    expect(back).toHaveClass('h-10', 'w-10');
    expect(back).not.toHaveClass('border');
    expect(header.firstChild).toBe(back);
    expect(title).toBeInTheDocument();
    expect(screen.getByRole('heading')).toHaveClass(
      'text-base',
      'font-semibold',
      'leading-6',
      'text-[#151515]',
    );
  });

  it('renders desktop back button with rounded touch target', () => {
    render(<CartHeader />);

    const back = screen.getByTestId('cart-header-back');

    expect(back).toHaveClass('laptop:rounded-lg', 'laptop:h-9', 'laptop:w-9');
    expect(screen.getByRole('heading')).toHaveClass('text-base', 'font-semibold');
  });

  it('renders empty variant with same back-left layout', () => {
    render(<CartHeader variant="empty" />);

    const header = screen.getByTestId('cart-header');
    const back = screen.getByTestId('cart-header-back');

    expect(header).toHaveClass('shrink-0');
    expect(header.firstChild).toBe(back);
    expect(screen.getByText(cartMessages.pageTitle)).not.toHaveClass('text-center');
  });
});

describe('CartAddressBar', () => {
  it('renders empty state with muted label and Add Address CTA', () => {
    render(<CartAddressBar onChange={jest.fn()} />);

    expect(screen.getByText(cartMessages.deliveryAddress)).toHaveClass('text-[#9b9b9b]');
    expect(screen.getByText(cartMessages.addAddress)).toBeInTheDocument();
    expect(screen.getByTestId('cart-address-bar')).toHaveStyle({
      backgroundColor: '#f8fafc',
    });
  });

  it('renders filled state with name and Change CTA', () => {
    render(
      <CartAddressBar
        name="Priya Sharma"
        addressLine="12 Palm Grove, Bengaluru 560095"
        onChange={jest.fn()}
      />,
    );

    expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
    expect(screen.getByText(cartMessages.changeAddress)).toBeInTheDocument();
  });

  it('renders mobile filled state with inline name next to label', () => {
    render(
      <CartAddressBar
        variant="mobile"
        name="Priya Sharma"
        addressLine="12 Palm Grove, Bengaluru 560095"
        onChange={jest.fn()}
      />,
    );

    const bar = screen.getByTestId('cart-address-bar');
    expect(bar).toHaveTextContent(cartMessages.deliveryAddress);
    expect(bar).toHaveTextContent('Priya Sharma');
    expect(bar).toHaveTextContent('12 Palm Grove, Bengaluru 560095');
  });
});

describe('CartBundleDealCard', () => {
  it('renders compact footer variant with chip and banner', () => {
    render(<CartBundleDealCard compact variant="footer" />);

    expect(screen.getByTestId('cart-bundle-deal')).toBeInTheDocument();
    expect(screen.getByTestId('cart-bundle-deal')).toHaveClass('isolate', 'w-full');
    expect(screen.getByTestId('cart-bundle-deal-chip')).toBeInTheDocument();
    expect(screen.getByTestId('cart-bundle-deal-banner')).toHaveClass('h-[60px]', 'gap-1');
  });

  it('renders sidebar variant with chip and banner stacked', () => {
    render(<CartBundleDealCard variant="sidebar" />);

    expect(screen.getByTestId('cart-bundle-deal')).toBeInTheDocument();
    expect(screen.getByTestId('cart-bundle-deal').querySelector('.mb-\\[-5px\\]')).toBeTruthy();
    expect(screen.getByTestId('cart-bundle-deal-chip')).toHaveClass('w-full', 'py-1.5');
    expect(screen.getByTestId('cart-bundle-deal-banner')).toBeInTheDocument();
    expect(
      screen.getByTestId('cart-bundle-deal-banner').querySelector('.h-\\[6px\\]'),
    ).toBeTruthy();
  });
});

describe('CartFreeGiftCard', () => {
  it('renders the one-item nudge when remaining is close', () => {
    render(<CartFreeGiftCard cartTotal={1500} />);

    expect(screen.getByTestId('cart-free-gift-nudge')).toBeInTheDocument();
  });

  it('renders compact one-item nudge', () => {
    render(<CartFreeGiftCard compact cartTotal={1500} />);

    expect(screen.getByTestId('cart-free-gift-nudge')).toBeInTheDocument();
    expect(screen.queryByTestId('cart-free-gift-chip')).not.toBeInTheDocument();
  });
});

describe('CartLimitedTimeOffers', () => {
  it('renders full-section gradient, fade badge, no header border, and scrollbar-hide carousel', () => {
    render(<CartLimitedTimeOffers />);

    const root = screen.getByTestId('cart-limited-time-offers');
    expect(root).toBeInTheDocument();
    expect(root).toHaveStyle({ backgroundImage: cartTheme.ltoGradient });
    expect(screen.getByText(cartConfig.mock.limitedTimeOffers!.title)).toBeInTheDocument();
    expect(screen.getByTestId('lto-badge')).toHaveTextContent('70% off');
    expect(screen.getByTestId('lto-badge')).toHaveClass(
      'w-full',
      'rounded-[17px]',
      'px-[9px]',
      'py-2',
      'text-sm',
      'font-bold',
    );
    expect(screen.getByTestId('lto-badge')).not.toHaveClass('self-start');
    expect(screen.getByTestId('lto-badge')).toHaveStyle({
      background: cartTheme.ltoBadgeGradient,
    });
    expect(root.querySelector('.border-b')).toBeNull();
    expect(screen.getAllByTestId('lto-product-card').length).toBeGreaterThan(0);
    const card = screen.getAllByTestId('lto-product-card')[0]!;
    expect(card).toHaveClass('border-black/10', 'w-[126px]', 'gap-3');
    expect(card.querySelector('p')).toHaveClass('text-[8px]', 'capitalize');
    const addButton = screen.getAllByTestId('lto-add-button')[0]!;
    expect(addButton).toHaveClass('border', 'size-5', 'rounded-[4px]');
    expect(addButton.querySelector('svg')).toBeTruthy();
    expect(addButton).not.toHaveTextContent('+');
    expect(screen.getAllByTestId('product-card-rating-compact').length).toBeGreaterThan(0);
    expect(root.querySelector('.scrollbar-hide')).toBeTruthy();
    expect(screen.queryByTestId('lto-footer-band')).not.toBeInTheDocument();
  });
});

describe('CartWalletToggleRow', () => {
  it('renders balance and toggles wallet checkbox', () => {
    const onChange = jest.fn();
    render(<CartWalletToggleRow applied={false} onChange={onChange} balance={700} />);

    const toggle = screen.getByTestId('cart-wallet-toggle');
    expect(toggle).toHaveTextContent('₹700');
    expect(toggle).toHaveClass('border-y', 'border-[#e2e8f0]', 'py-5');
    expect(toggle.querySelector('span')).toHaveClass('text-sm', 'text-[#45556c]');
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('shows loading placeholder for balance', () => {
    render(<CartWalletToggleRow applied balance={700} loading onChange={jest.fn()} />);

    expect(screen.getByTestId('cart-wallet-toggle-skeleton')).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });
});
