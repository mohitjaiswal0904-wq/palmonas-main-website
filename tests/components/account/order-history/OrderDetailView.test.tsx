import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

import { OrderDetailView } from '@/components/account/order-history/OrderDetailView';
import { accountMessages } from '@/config/account/account.config';
import type { UserOrderDetail } from '@/types/user';

const mockUseUserOrderDetail = jest.fn();
const mockUseUserProfile = jest.fn();

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element -- test stub for next/image
    <img alt={alt} src={src} />
  ),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children?: ReactNode;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={typeof href === 'string' ? href : '#'} {...rest}>
      {children}
    </a>
  ),
}));

jest.mock('@/providers/navigation/NavigationPendingProvider', () => ({
  useNavigationPending: () => ({
    pendingHref: null,
    startNavigation: jest.fn(),
    clearNavigation: jest.fn(),
  }),
}));

jest.mock('@/components/account/common/AccountBackHeader', () => ({
  AccountBackHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

jest.mock('@/hooks/user', () => ({
  useUserOrderDetail: (orderId: string) => mockUseUserOrderDetail(orderId),
  useUserProfile: () => mockUseUserProfile(),
}));

const orderDetail: UserOrderDetail = {
  orderNumber: '#PM123',
  orderDate: '2026-09-01',
  totalItems: 1,
  paymentMethod: 'UPI',
  status: 'delivered',
  deliveredTo: 'Priya',
  deliveryAddress: 'Mumbai',
  lineItems: [
    {
      productId: '7978403299585',
      title: 'Classic Emerald Necklace',
      quantity: 1,
      mrp: 3175,
      sellingPrice: 999,
      image: 'https://cdn.example.com/necklace.jpg',
    },
  ],
  pricing: {
    subtotal: 999,
    discountCode: '',
    discountAmount: 0,
    walletAmount: 0,
    shippingCost: 0,
    sgst: 0,
    cgst: 0,
    grandTotal: 999,
  },
  invoiceUrl: '',
};

describe('OrderDetailView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUserProfile.mockReturnValue({ profile: { firstName: 'Priya' } });
  });

  it('links ordered product cards to PDP by product id', () => {
    mockUseUserOrderDetail.mockReturnValue({
      order: orderDetail,
      isLoading: false,
      error: null,
    });

    render(<OrderDetailView orderId="order-1" />);

    expect(
      screen.getByRole('link', {
        name: accountMessages.orderHistory.a11y.viewProduct.replace(
          '{name}',
          'Classic Emerald Necklace',
        ),
      }),
    ).toHaveAttribute('href', '/products/7978403299585');
  });

  it('encodes product id in the PDP href', () => {
    mockUseUserOrderDetail.mockReturnValue({
      order: {
        ...orderDetail,
        lineItems: [
          {
            ...orderDetail.lineItems[0]!,
            productId: '7978403299585 extra',
          },
        ],
      },
      isLoading: false,
      error: null,
    });

    render(<OrderDetailView orderId="order-1" />);

    expect(
      screen.getByRole('link', { name: 'View Classic Emerald Necklace' }),
    ).toHaveAttribute('href', '/products/7978403299585%20extra');
  });

  it('does not link when product id is missing', () => {
    mockUseUserOrderDetail.mockReturnValue({
      order: {
        ...orderDetail,
        lineItems: [
          {
            ...orderDetail.lineItems[0]!,
            productId: '   ',
          },
        ],
      },
      isLoading: false,
      error: null,
    });

    render(<OrderDetailView orderId="order-1" />);

    expect(screen.queryByRole('link', { name: 'View Classic Emerald Necklace' })).not.toBeInTheDocument();
    expect(screen.getByText('Classic Emerald Necklace')).toBeInTheDocument();
  });

  it('shows not-found when the order cannot be loaded', () => {
    mockUseUserOrderDetail.mockReturnValue({
      order: undefined,
      isLoading: false,
      error: { message: 'missing' },
    });

    render(<OrderDetailView orderId="order-1" />);

    expect(screen.getByText('Order not found')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /View / })).not.toBeInTheDocument();
  });
});
