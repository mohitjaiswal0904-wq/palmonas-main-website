import {
  buildOrderInvoiceHtml,
  printOrderInvoice,
} from '@/lib/order/order-invoice-print';
import { getDefaultOrderInvoicePrintBranding } from '@/config/order/order-invoice.config';
import type { UserOrderInvoice } from '@/types/user';

const mockInvoice: UserOrderInvoice = {
  orderNumber: '#1234',
  orderName: '#1234',
  orderDate: '2026-07-20',
  invoiceUrl: 'https://example.com/invoice.pdf',
  currency: 'INR',
  email: 'user@example.com',
  customer: {
    name: 'Priya Kumari',
    email: 'user@example.com',
    phone: '+919999999999',
  },
  billingAddress: '5 TH Floor, Verdant 84, PUNE, Maharashtra, 411036',
  deliveryAddress: '5 TH Floor, Verdant 84, PUNE, Maharashtra, 411036',
  lineItems: [
    {
      title: 'Featherlight Beauty Ring',
      quantity: 1,
      sku: 'SKU-1',
      mrp: 999,
      sellingPrice: 799,
    },
  ],
  pricing: {
    subtotal: 999,
    discountCode: 'SAVE10',
    discountAmount: 200,
    walletAmount: 0,
    shippingCost: 0,
    sgst: 21.45,
    cgst: 21.45,
    grandTotal: 799,
  },
  paymentMethod: 'Paid (UPI)',
  status: 'delivered',
};

describe('order-invoice-print', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('builds printable invoice html with Palmonas branding and order details', () => {
    const branding = getDefaultOrderInvoicePrintBranding();
    const html = buildOrderInvoiceHtml(mockInvoice, branding);

    expect(html).toContain('Tax Invoice');
    expect(html).toContain(branding.brandName);
    expect(html).toContain(branding.tagline);
    expect(html).toContain(branding.companyName);
    expect(html).toContain(branding.logoUrl);
    expect(html).toContain(branding.footerNote);
    expect(html).toContain('#1234');
    expect(html).toContain('Featherlight Beauty Ring');
    expect(html).toContain('SKU: SKU-1');
  });

  it('prints invoice from a hidden iframe', () => {
    const printMock = jest.fn();
    const writeMock = jest.fn();
    const printDocument = {
      open: jest.fn(),
      write: writeMock,
      close: jest.fn(),
      readyState: 'complete',
    };
    const printWindow = {
      document: printDocument,
      focus: jest.fn(),
      print: printMock,
      addEventListener: jest.fn(),
    };
    const iframe = {
      contentWindow: printWindow,
      contentDocument: printDocument,
      style: {} as CSSStyleDeclaration,
      setAttribute: jest.fn(),
      addEventListener: jest.fn(),
      remove: jest.fn(),
    };

    jest.spyOn(document, 'createElement').mockReturnValue(iframe as unknown as HTMLIFrameElement);
    jest.spyOn(document.body, 'appendChild').mockImplementation(() => iframe as unknown as Node);

    printOrderInvoice(mockInvoice);

    expect(writeMock).toHaveBeenCalled();
    expect(printMock).toHaveBeenCalled();

    jest.runOnlyPendingTimers();
    expect(iframe.remove).toHaveBeenCalled();
  });

  it('throws when the print iframe is unavailable', () => {
    const iframe = {
      contentWindow: null,
      contentDocument: null,
      style: {} as CSSStyleDeclaration,
      setAttribute: jest.fn(),
      remove: jest.fn(),
    };

    jest.spyOn(document, 'createElement').mockReturnValue(iframe as unknown as HTMLIFrameElement);
    jest.spyOn(document.body, 'appendChild').mockImplementation(() => iframe as unknown as Node);

    expect(() => printOrderInvoice(mockInvoice)).toThrow('PRINT_FRAME_UNAVAILABLE');
    expect(iframe.remove).toHaveBeenCalled();
  });
});
