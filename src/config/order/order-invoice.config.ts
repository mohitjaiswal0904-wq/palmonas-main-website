import accountConfig from '@/config/account/account.config.json';
import {
  CONTACT_COMPANY_NAME,
  CONTACT_CORPORATE_OFFICE,
  CONTACT_SUPPORT_PHONE_DISPLAY,
  CONTACT_SUPPORT_URL,
} from '@/config/contact.config';

/** Public path for the Palmonas logo used on printable order invoices. */
export const ORDER_INVOICE_LOGO_PATH = '/images/palmonas-logo.png';

export const orderInvoiceMessages = accountConfig.messages.orderHistory.invoice;

/** Resolved branding payload for printable order invoices. */
export interface OrderInvoicePrintBranding {
  logoUrl: string;
  brandName: string;
  tagline: string;
  documentTitle: string;
  companyName: string;
  companyAddress: string;
  supportEmail: string;
  supportPhone: string;
  supportUrl: string;
  websiteUrl: string;
  footerNote: string;
}

/**
 * Builds invoice branding using site origin for the logo and shared contact constants.
 *
 * @param origin - Current site origin, e.g. `https://palmonas.com`.
 */
export function buildOrderInvoicePrintBranding(origin: string): OrderInvoicePrintBranding {
  return {
    logoUrl: `${origin}${ORDER_INVOICE_LOGO_PATH}`,
    brandName: orderInvoiceMessages.brandName,
    tagline: orderInvoiceMessages.tagline,
    documentTitle: orderInvoiceMessages.documentTitle,
    companyName: CONTACT_COMPANY_NAME,
    companyAddress: CONTACT_CORPORATE_OFFICE,
    supportEmail: orderInvoiceMessages.supportEmail,
    supportPhone: CONTACT_SUPPORT_PHONE_DISPLAY,
    supportUrl: CONTACT_SUPPORT_URL,
    websiteUrl: orderInvoiceMessages.websiteUrl,
    footerNote: orderInvoiceMessages.footerNote,
  };
}

/** Default branding for unit tests and non-browser contexts. */
export function getDefaultOrderInvoicePrintBranding(): OrderInvoicePrintBranding {
  return buildOrderInvoicePrintBranding('https://palmonas.com');
}
