'use client';

import { useCallback, useState } from 'react';

import { accountMessages } from '@/config/account/account.config';
import { useUserOrderInvoice } from '@/hooks/user/useUserOrderInvoice';
import { isOrderDelivered } from '@/lib/order/order-format';
import { printOrderInvoice } from '@/lib/order/order-invoice-print';

interface OrderInvoiceButtonProps {
  orderId: string;
  status: string;
}

/** Fetches order invoice from API and opens browser print preview. */
export function OrderInvoiceButton({ orderId, status }: OrderInvoiceButtonProps) {
  const { fetchInvoice, isPending } = useUserOrderInvoice();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClick = useCallback(async () => {
    setErrorMessage(null);

    try {
      const invoice = await fetchInvoice(orderId);
      printOrderInvoice(invoice);
    } catch {
      setErrorMessage(accountMessages.orderHistory.getInvoiceError);
    }
  }, [fetchInvoice, orderId]);

  if (!isOrderDelivered(status)) {
    return null;
  }

  return (
    <div className="flex flex-col items-end gap-1 pt-2">
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={isPending}
        className="text-sm font-normal text-[#2563EB] underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        aria-label={accountMessages.orderHistory.a11y.getInvoice}
      >
        {isPending
          ? accountMessages.orderHistory.getInvoiceLoading
          : accountMessages.orderHistory.getInvoice}
      </button>
      {errorMessage ? (
        <p className="text-xs text-[#C62828]" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
