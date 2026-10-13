import {
  buildOrderInvoicePrintBranding,
  getDefaultOrderInvoicePrintBranding,
  type OrderInvoicePrintBranding,
} from '@/config/order/order-invoice.config';
import { paletteTokens } from '@/config/theme/palette.tokens';
import { productTokens } from '@/config/theme/product.tokens';
import {
  formatOrderCurrency,
  formatOrderDisplayDate,
  formatOrderDeduction,
} from '@/lib/order/order-format';
import type { UserOrderInvoice } from '@/types/user';

/** Escapes user-controlled strings before injecting into printable invoice HTML. */
function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/**
 * Builds printable invoice HTML from the invoice API payload.
 *
 * @param invoice - Normalised order invoice DTO.
 * @param branding - Palmonas logo and company branding for the print layout.
 * @returns HTML document string for browser print preview.
 */
export function buildOrderInvoiceHtml(
  invoice: UserOrderInvoice,
  branding: OrderInvoicePrintBranding = getDefaultOrderInvoicePrintBranding(),
): string {
  const itemRows = invoice.lineItems
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.title)}${item.sku ? `<br /><small>SKU: ${escapeHtml(item.sku)}</small>` : ''}</td>
          <td>${item.quantity}</td>
          <td>${escapeHtml(formatOrderCurrency(item.mrp))}</td>
          <td>${escapeHtml(formatOrderCurrency(item.sellingPrice))}</td>
        </tr>
      `,
    )
    .join('');

  const discountLabel = invoice.pricing.discountCode
    ? `Discount (${escapeHtml(invoice.pricing.discountCode)})`
    : 'Discount';

  const brandNavy = paletteTokens.brand.navy;
  const brandInk = productTokens.ink;
  const brandBlush = paletteTokens.brand.blush;
  const brandMuted = paletteTokens.brand.stoneMuted;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(branding.documentTitle)} ${escapeHtml(invoice.orderNumber)}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        font-family: Arial, Helvetica, sans-serif;
        color: ${brandInk};
        margin: 0;
        padding: 32px;
        background: #ffffff;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 24px;
        padding: 20px 24px;
        margin: -32px -32px 28px;
        background: ${brandBlush};
        border-bottom: 3px solid ${brandNavy};
      }
      .brand-block { min-width: 0; }
      .logo { display: block; height: 40px; width: auto; max-width: 220px; }
      .brand-name {
        margin: 10px 0 0;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.14em;
        color: ${brandNavy};
      }
      .tagline {
        margin: 4px 0 0;
        font-size: 11px;
        color: ${brandMuted};
      }
      .company-block {
        max-width: 280px;
        text-align: right;
        font-size: 11px;
        line-height: 1.5;
        color: ${brandMuted};
      }
      .company-block strong {
        display: block;
        margin-bottom: 4px;
        font-size: 12px;
        color: ${brandInk};
      }
      .doc-title {
        margin: 0 0 20px;
        font-size: 24px;
        font-weight: 700;
        color: ${brandNavy};
      }
      .meta-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px 24px;
        margin-bottom: 24px;
        padding: 16px;
        border: 1px solid #efefef;
        border-radius: 8px;
        background: #fafafa;
      }
      .meta-item { font-size: 12px; line-height: 1.5; }
      .meta-label {
        display: block;
        margin-bottom: 2px;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: ${brandMuted};
      }
      h2 {
        margin: 24px 0 8px;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: ${brandNavy};
      }
      p { margin: 0 0 6px; font-size: 12px; line-height: 1.5; }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 8px;
        font-size: 12px;
      }
      th, td {
        border: 1px solid #e5e5e5;
        padding: 10px 8px;
        text-align: left;
        vertical-align: top;
      }
      th {
        background: ${brandBlush};
        color: ${brandNavy};
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .summary {
        margin-top: 24px;
        width: 100%;
        max-width: 320px;
        margin-left: auto;
        padding-top: 8px;
      }
      .summary-row {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        padding: 5px 0;
        font-size: 12px;
      }
      .summary-row.total {
        border-top: 2px solid ${brandNavy};
        margin-top: 8px;
        padding-top: 10px;
        font-size: 14px;
        font-weight: 700;
        color: ${brandNavy};
      }
      .footer {
        margin-top: 36px;
        padding-top: 16px;
        border-top: 1px solid #efefef;
        text-align: center;
        font-size: 11px;
        line-height: 1.6;
        color: ${brandMuted};
      }
      .footer strong { color: ${brandNavy}; }
      @media print {
        body { padding: 24px; }
        .header { margin: -24px -24px 24px; }
      }
    </style>
  </head>
  <body>
    <header class="header">
      <div class="brand-block">
        <img class="logo" src="${escapeHtml(branding.logoUrl)}" alt="${escapeHtml(branding.brandName)}" />
        <p class="brand-name">${escapeHtml(branding.brandName)}</p>
        <p class="tagline">${escapeHtml(branding.tagline)}</p>
      </div>
      <div class="company-block">
        <strong>${escapeHtml(branding.companyName)}</strong>
        <span>${escapeHtml(branding.companyAddress)}</span>
      </div>
    </header>

    <h1 class="doc-title">${escapeHtml(branding.documentTitle)}</h1>

    <div class="meta-grid">
      <div class="meta-item">
        <span class="meta-label">Order</span>
        ${escapeHtml(invoice.orderName)}
      </div>
      <div class="meta-item">
        <span class="meta-label">Date</span>
        ${escapeHtml(formatOrderDisplayDate(invoice.orderDate))}
      </div>
      <div class="meta-item">
        <span class="meta-label">Status</span>
        ${escapeHtml(invoice.status)}
      </div>
      <div class="meta-item">
        <span class="meta-label">Payment</span>
        ${escapeHtml(invoice.paymentMethod)}
      </div>
    </div>

    <h2>Customer</h2>
    <p>${escapeHtml(invoice.customer.name)}</p>
    <p>${escapeHtml(invoice.customer.email || invoice.email)}</p>
    <p>${escapeHtml(invoice.customer.phone)}</p>

    ${
      invoice.billingAddress
        ? `<h2>Billing address</h2><p>${escapeHtml(invoice.billingAddress)}</p>`
        : ''
    }
    ${
      invoice.deliveryAddress
        ? `<h2>Delivery address</h2><p>${escapeHtml(invoice.deliveryAddress)}</p>`
        : ''
    }

    <h2>Items</h2>
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>Qty</th>
          <th>MRP</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <div class="summary">
      <div class="summary-row"><span>Sub total</span><span>${escapeHtml(formatOrderCurrency(invoice.pricing.subtotal))}</span></div>
      <div class="summary-row"><span>${discountLabel}</span><span>${escapeHtml(formatOrderDeduction(invoice.pricing.discountAmount))}</span></div>
      <div class="summary-row"><span>Wallet amount</span><span>${escapeHtml(formatOrderDeduction(invoice.pricing.walletAmount))}</span></div>
      <div class="summary-row"><span>Shipping cost</span><span>${escapeHtml(formatOrderCurrency(invoice.pricing.shippingCost))}</span></div>
      <div class="summary-row"><span>SGST</span><span>${escapeHtml(formatOrderCurrency(invoice.pricing.sgst))}</span></div>
      <div class="summary-row"><span>CGST</span><span>${escapeHtml(formatOrderCurrency(invoice.pricing.cgst))}</span></div>
      <div class="summary-row total"><span>Grand total</span><span>${escapeHtml(formatOrderCurrency(invoice.pricing.grandTotal))}</span></div>
    </div>

    <footer class="footer">
      <p><strong>${escapeHtml(branding.footerNote)}</strong></p>
      <p>
        ${escapeHtml(branding.websiteUrl.replace(/^https?:\/\//, ''))}
        · ${escapeHtml(branding.supportEmail)}
        · ${escapeHtml(branding.supportPhone)}
      </p>
    </footer>
  </body>
</html>`;
}

/**
 * Renders invoice HTML in a hidden iframe and opens the browser print dialog.
 *
 * @param invoice - Normalised order invoice DTO from the invoice API.
 * @throws Error with code `PRINT_FRAME_UNAVAILABLE` when the iframe cannot be created.
 */
export function printOrderInvoice(invoice: UserOrderInvoice): void {
  if (typeof document === 'undefined') {
    return;
  }

  const branding = buildOrderInvoicePrintBranding(window.location.origin);
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const printWindow = iframe.contentWindow;
  const printDocument = iframe.contentDocument ?? printWindow?.document;

  if (!printWindow || !printDocument) {
    iframe.remove();
    throw new Error('PRINT_FRAME_UNAVAILABLE');
  }

  printDocument.open();
  printDocument.write(buildOrderInvoiceHtml(invoice, branding));
  printDocument.close();

  const cleanup = (): void => {
    iframe.remove();
  };

  const triggerPrint = (): void => {
    printWindow.focus();
    printWindow.print();
    printWindow.addEventListener('afterprint', cleanup, { once: true });
    window.setTimeout(cleanup, 1_000);
  };

  if (printDocument.readyState === 'complete') {
    triggerPrint();
    return;
  }

  iframe.addEventListener('load', triggerPrint, { once: true });
}
