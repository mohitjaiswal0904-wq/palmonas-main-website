import {
  buildOrderInvoicePrintBranding,
  ORDER_INVOICE_LOGO_PATH,
  orderInvoiceMessages,
} from '@/config/order/order-invoice.config';
import { CONTACT_COMPANY_NAME } from '@/config/contact.config';

describe('order-invoice.config', () => {
  it('builds branding with logo path and contact details', () => {
    const branding = buildOrderInvoicePrintBranding('https://palmonas.com');

    expect(branding.logoUrl).toBe(`https://palmonas.com${ORDER_INVOICE_LOGO_PATH}`);
    expect(branding.brandName).toBe(orderInvoiceMessages.brandName);
    expect(branding.tagline).toBe(orderInvoiceMessages.tagline);
    expect(branding.companyName).toBe(CONTACT_COMPANY_NAME);
    expect(branding.supportEmail).toBe(orderInvoiceMessages.supportEmail);
  });

  it('uses provided origin for logo url', () => {
    const branding = buildOrderInvoicePrintBranding('http://localhost:3000');

    expect(branding.logoUrl).toBe(`http://localhost:3000${ORDER_INVOICE_LOGO_PATH}`);
  });
});
