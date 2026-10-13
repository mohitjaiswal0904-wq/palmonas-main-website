import { api } from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/endpoints';
import {
  deleteUserAddress,
  getUserAddresses,
  getUserOrderInvoice,
  getUserOrders,
  getUserProfile,
  getUserWallet,
} from '@/services/user.service';

jest.mock('@/lib/api-client', () => ({
  api: {
    get: jest.fn(),
    put: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

describe('user.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getUserProfile fetches and transforms profile', async () => {
    mockApi.get.mockResolvedValue({
      data: {
        status: 200,
        message: 'ok',
        data: {
          id: 8717832552705,
          email: 'test@example.com',
          first_name: 'Pranav',
          last_name: 'Arya',
          phone: '+919833290022',
          verified_email: true,
          orders_count: 94,
          total_spent: '54011.10',
          created_at: '2025-09-09T07:41:33+05:30',
          updated_at: '2026-07-09T10:45:49+05:30',
        },
      },
    });

    const profile = await getUserProfile();

    expect(mockApi.get).toHaveBeenCalledWith(ENDPOINTS.user.details);
    expect(profile.firstName).toBe('Pranav');
    expect(profile.email).toBe('test@example.com');
  });

  it('getUserAddresses maps address list', async () => {
    mockApi.get.mockResolvedValue({
      data: {
        status: 200,
        message: 'ok',
        data: [
          {
            id: 10878577115393,
            first_name: 'Pranav',
            last_name: 'Arya',
            address1: 'Parsik hill',
            city: 'THANE',
            province: 'Maharashtra',
            country: 'India',
            zip: '400614',
            default: true,
          },
        ],
      },
    });

    const addresses = await getUserAddresses();

    expect(mockApi.get).toHaveBeenCalledWith(ENDPOINTS.user.addresses);
    expect(addresses[0]?.isDefault).toBe(true);
    expect(addresses[0]?.city).toBe('THANE');
  });

  it('getUserOrders unwraps nested order list', async () => {
    mockApi.get.mockResolvedValue({
      data: {
        status: 200,
        message: 'ok',
        data: {
          data: [
            {
              id: '6500909089025',
              orderId: '#PM1570518616',
              deliveredTo: 'Pranav Arya',
              totalItems: 2,
              paymentMethod: 'UPI',
              orderDate: '2025-09-11',
              status: 'delivered',
              thumbnail: 'https://example.com/image.jpg',
            },
          ],
        },
      },
    });

    const orders = await getUserOrders({ limit: 3 });

    expect(mockApi.get).toHaveBeenCalledWith(ENDPOINTS.user.orders, {
      params: { limit: 3 },
    });
    expect(orders[0]?.orderNumber).toBe('#PM1570518616');
  });

  it('getUserOrderInvoice fetches and transforms invoice payload', async () => {
    mockApi.get.mockResolvedValue({
      data: {
        status: 200,
        message: 'ok',
        data: {
          orderId: '#1234',
          orderName: '#1234',
          orderDate: '2026-07-20',
          invoiceUrl: 'https://example.com/invoice.pdf',
          currency: 'INR',
          email: 'user@example.com',
          customer: { name: 'Priya Kumari', email: 'user@example.com', phone: '+919999999999' },
          billingAddress: {
            addressLine: '5 TH Floor, Verdant 84',
            city: 'PUNE',
            state: 'Maharashtra',
            pincode: '411036',
          },
          deliveryAddress: {
            addressLine: '5 TH Floor, Verdant 84',
            city: 'PUNE',
            state: 'Maharashtra',
            pincode: '411036',
          },
          items: [
            {
              title: 'Featherlight Beauty Ring',
              qty: 1,
              sku: 'SKU-1',
              mrp: 999,
              sellingPrice: 799,
            },
          ],
          pricing: {
            subtotal: 999,
            discount: { code: 'SAVE10', amount: 200 },
            walletAmount: 0,
            shippingCost: 0,
            taxes: { sgst: 21.45, cgst: 21.45 },
            grandTotal: 799,
          },
          paymentMethod: 'Paid (UPI)',
          status: 'delivered',
        },
      },
    });

    const invoice = await getUserOrderInvoice('6500909089025');

    expect(mockApi.get).toHaveBeenCalledWith(ENDPOINTS.user.orderInvoice('6500909089025'));
    expect(invoice.orderNumber).toBe('#1234');
    expect(invoice.lineItems[0]?.sku).toBe('SKU-1');
    expect(invoice.pricing.discountAmount).toBe(200);
  });

  it('getUserProfile normalises API errors', async () => {
    mockApi.get.mockRejectedValue(new Error('network'));

    await expect(getUserProfile()).rejects.toMatchObject({
      message: expect.any(String),
    });
  });

  it('getUserWallet transforms wallet payload', async () => {
    mockApi.get.mockResolvedValue({
      data: {
        status: 200,
        message: 'ok',
        data: {
          birthdate: '2025-04-02',
          customer_email: 'test@example.com',
          gender: '',
          loyalty_points_balance: 51542.47,
          name: 'Pranav Arya',
          phone_number: '+919833290022',
          referral_code: '338x0ewox',
          refund_store_credit_balance: 0,
          shopify_created_at: '2025-09-09 02:11:33',
          shopify_customer_id: 8717832552705,
        },
      },
    });

    const wallet = await getUserWallet();

    expect(wallet.loyaltyPointsBalance).toBe(51542.47);
    expect(wallet.referralCode).toBe('338x0ewox');
  });

  it('deleteUserAddress calls delete endpoint', async () => {
    mockApi.delete.mockResolvedValue({ data: { status: 200, message: 'ok' } });

    await deleteUserAddress('10878577115393');

    expect(mockApi.delete).toHaveBeenCalledWith(ENDPOINTS.user.addressById('10878577115393'));
  });
});
