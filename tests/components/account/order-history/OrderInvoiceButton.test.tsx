import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { OrderInvoiceButton } from '@/components/account/order-history/OrderInvoiceButton';
import { accountMessages } from '@/config/account/account.config';
import { printOrderInvoice } from '@/lib/order/order-invoice-print';

const fetchInvoiceMock = jest.fn();

jest.mock('@/hooks/user/useUserOrderInvoice', () => ({
  useUserOrderInvoice: () => ({
    fetchInvoice: fetchInvoiceMock,
    isPending: false,
    error: null,
  }),
}));

jest.mock('@/lib/order/order-invoice-print', () => ({
  printOrderInvoice: jest.fn(),
}));

describe('OrderInvoiceButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchInvoiceMock.mockResolvedValue({
      orderNumber: '#1234',
      orderName: '#1234',
    });
  });

  it('does not render when order is not delivered', () => {
    const { container } = render(
      <OrderInvoiceButton orderId="6500909089025" status="in_transit" />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('fetches invoice and opens print preview on click', async () => {
    const user = userEvent.setup();
    render(<OrderInvoiceButton orderId="6500909089025" status="delivered" />);

    await user.click(
      screen.getByRole('button', { name: accountMessages.orderHistory.a11y.getInvoice }),
    );

    await waitFor(() => {
      expect(fetchInvoiceMock).toHaveBeenCalledWith('6500909089025');
      expect(printOrderInvoice).toHaveBeenCalled();
    });
  });

  it('shows error message when invoice fetch fails', async () => {
    fetchInvoiceMock.mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup();
    render(<OrderInvoiceButton orderId="6500909089025" status="delivered" />);

    await user.click(
      screen.getByRole('button', { name: accountMessages.orderHistory.a11y.getInvoice }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      accountMessages.orderHistory.getInvoiceError,
    );
  });
});
