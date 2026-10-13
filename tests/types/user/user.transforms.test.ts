import {
  transformUserOrder,
  transformUserOrderInvoice,
  transformUserOrdersList,
  transformUserProfile,
  transformUserWallet,
  transformWalletTransactions,
} from '@/types/user';

describe('user.transforms', () => {
  it('transforms user profile from API shape', () => {
    const profile = transformUserProfile({
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
    });

    expect(profile.firstName).toBe('Pranav');
    expect(profile.lastName).toBe('Arya');
    expect(profile.ordersCount).toBe(94);
  });

  it('transforms order list envelope', () => {
    const orders = transformUserOrdersList({
      data: [
        {
          id: '6503894024449',
          orderId: '#PM1570522247',
          deliveredTo: 'Customer',
          totalItems: 1,
          paymentMethod: 'Paid (UPI)',
          orderDate: '2025-09-13',
          status: 'cancelled',
          thumbnail: 'https://example.com/image.jpg',
        },
      ],
    });

    expect(orders).toHaveLength(1);
    expect(orders[0]?.orderNumber).toBe('#PM1570522247');
  });

  it('transforms wallet and transactions', () => {
    const wallet = transformUserWallet({
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
    });

    expect(wallet.loyaltyPointsBalance).toBe(51542.47);
    expect(wallet.referralCode).toBe('338x0ewox');

    const transactions = transformWalletTransactions({
      status: true,
      customer: {
        credits: 100,
        credit_log: [{ id: 1, credits: -100, comment: 'Spent in order' }],
        referral_code: 'abc',
        name: 'Test',
        email: 'test@example.com',
        phone: '+911234567890',
      },
    });

    expect(transactions[0]?.description).toBe('Spent in order');
    expect(transactions[0]?.title).toBe('Order Payment');
    expect(transactions[0]?.type).toBe('debit');
    expect(transactions[0]?.amountRupees).toBe(-1);
  });

  it('transforms single order', () => {
    const order = transformUserOrder({
      id: '1',
      orderId: '#PM1',
      deliveredTo: 'Customer',
      totalItems: 2,
      paymentMethod: 'UPI',
      orderDate: '2025-09-13',
      status: 'delivered',
      thumbnail: '',
    });

    expect(order.status).toBe('delivered');
  });

  it('transforms order invoice payload for printing', () => {
    const invoice = transformUserOrderInvoice({
      orderId: '#1234',
      orderDate: '2026-07-20',
      items: [{ title: 'Ring', qty: 1, mrp: 999, sellingPrice: 799 }],
      pricing: {
        subtotal: 999,
        discount: 200,
        grandTotal: 799,
      },
      paymentMethod: 'Paid (UPI)',
      status: 'delivered',
      deliveryAddress: { addressLine: 'Line 1', city: 'PUNE', state: 'MH', pincode: '411036' },
    });

    expect(invoice.orderNumber).toBe('#1234');
    expect(invoice.pricing.discountAmount).toBe(200);
    expect(invoice.deliveryAddress).toContain('PUNE');
  });
});
