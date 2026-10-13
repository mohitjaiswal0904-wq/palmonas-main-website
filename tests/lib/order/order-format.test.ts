import {
  formatOrderDisplayDate,
  getOrderStatusHeadline,
  getOrderStatusHeadlineParts,
  getOrderStatusRecipientTextClass,
  getOrderStatusTone,
  isOrderDelivered,
} from '@/lib/order/order-format';
import { transformUserOrderDetail } from '@/types/user';

describe('order-format', () => {
  it('formats order dates as DD/MM/YYYY', () => {
    expect(formatOrderDisplayDate('2025-09-11')).toBe('11/09/2025');
  });

  it('builds delivered status headline with first name', () => {
    expect(getOrderStatusHeadline('delivered', 'Priya Kumari')).toBe('Delivered to Priya');
    expect(getOrderStatusHeadlineParts('delivered', 'Priya Kumari')).toEqual({
      prefix: 'Delivered to',
      recipientName: 'Priya',
    });
  });

  it('uses black text class for delivered recipient names', () => {
    expect(getOrderStatusRecipientTextClass()).toBe('text-[#151515]');
  });

  it('maps cancelled and in transit tones', () => {
    expect(getOrderStatusTone('cancelled')).toBe('cancelled');
    expect(getOrderStatusTone('in_transit')).toBe('in_transit');
  });

  it('detects delivered orders', () => {
    expect(isOrderDelivered('delivered')).toBe(true);
    expect(isOrderDelivered('in_transit')).toBe(false);
  });
});

describe('transformUserOrderDetail', () => {
  it('transforms order detail payload', () => {
    const detail = transformUserOrderDetail({
      orderId: '#PM1570518616',
      orderDate: '2025-09-11',
      totalItems: 2,
      paymentMethod: 'Paid (UPI)',
      deliveryAddress: {
        addressLine: '5 TH Floor, Verdant 84',
        lane: null,
        city: 'PUNE',
        state: 'Maharashtra',
        pincode: '411036',
      },
      items: [
        {
          productId: '8052690878721',
          title: 'Featherlight Beauty Ring',
          qty: 1,
          mrp: 699,
          sellingPrice: 699,
          image: 'https://example.com/image.jpg',
        },
      ],
      pricing: {
        subtotal: 1398,
        discount: { code: 'Palmonas20', amount: 200 },
        walletAmount: 100,
        shippingCost: 0,
        taxes: { sgst: 21.45, cgst: 21.45 },
        grandTotal: 1098,
      },
      invoiceUrl: 'https://example.com/invoice',
      status: 'delivered',
      deliveredTo: 'Pranav Arya',
    });

    expect(detail.orderNumber).toBe('#PM1570518616');
    expect(detail.lineItems).toHaveLength(1);
    expect(detail.deliveryAddress).toContain('PUNE');
    expect(detail.pricing.discountCode).toBe('Palmonas20');
  });
});
