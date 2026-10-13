'use client';

import Link from 'next/link';

import { AccountBackHeader } from '@/components/account/common/AccountBackHeader';
import { ACCOUNT_DETAIL_PAGE_XL_CLASS } from '@/components/account/common/account-layout';
import { ACCOUNT_ROUTES } from '@/components/account/common/account-routes';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { ResourceNotFound } from '@/components/ui/ResourceNotFound';
import { usePopSubscriptionDetail } from '@/hooks/pop';
import { formatPopCurrency, formatPopStatus } from '@/lib/pop/pop-format';
import { cn } from '@/lib/utils/cn';

interface PopSubscriptionDetailViewProps {
  subscriptionId: string;
}

export function PopSubscriptionDetailView({ subscriptionId }: PopSubscriptionDetailViewProps) {
  const { detail, isLoading, error } = usePopSubscriptionDetail(subscriptionId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <ResourceNotFound
        title="Plan not found"
        description="This saving plan could not be loaded."
        ctaHref={ACCOUNT_ROUTES.planOfPurchase}
        ctaLabel="Back to plans"
      />
    );
  }

  const pendingInvoice = detail.invoices.find(
    (invoice) => invoice.status !== 'paid' && invoice.paymentUrl,
  );

  return (
    <div className={ACCOUNT_DETAIL_PAGE_XL_CLASS}>
      <AccountBackHeader title="Plan Details" backHref={ACCOUNT_ROUTES.planOfPurchase} />

      <div className="mt-6 space-y-4">
        <div className="rounded-2xl border border-[#EFEFEF] bg-white p-5">
          <p className="text-xs font-normal text-[#757575]">Reference</p>
          <p className="mt-1 text-sm font-bold text-[#151515]">{detail.omsReference}</p>
          <p className="mt-3 text-xs font-normal text-[#757575]">Status</p>
          <span className="mt-1 inline-block rounded-full bg-[#F5F5F5] px-2 py-0.5 text-xs font-medium text-[#757575] capitalize">
            {formatPopStatus(detail.status)}
          </span>
          <p className="mt-3 text-xs font-normal text-[#757575]">Phone</p>
          <p className="mt-1 text-sm font-normal text-[#151515]">{detail.phoneNumber}</p>
        </div>

        {pendingInvoice?.paymentUrl ? (
          <Button
            type="button"
            className="h-11 w-full rounded-md bg-[#151515] text-sm font-normal text-white hover:bg-[#151515]"
            aria-label="Pay pending instalment"
            onClick={() => {
              if (pendingInvoice.paymentUrl) {
                window.location.assign(pendingInvoice.paymentUrl);
              }
            }}
          >
            Pay {formatPopCurrency(pendingInvoice.amountDue)}
          </Button>
        ) : null}

        {detail.invoices.length ? (
          <section aria-label="Instalment invoices">
            <h2 className="text-sm font-bold text-[#151515]">Instalments</h2>
            <ul className="mt-3 divide-y divide-[#EFEFEF] rounded-2xl border border-[#EFEFEF] bg-white">
              {detail.invoices.map((invoice) => (
                <li key={invoice.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-normal text-[#151515]">{invoice.description}</p>
                      <p className="mt-1 text-xs font-normal text-[#757575]">
                        {new Date(invoice.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-[#151515]">
                        {formatPopCurrency(invoice.amount)}
                      </p>
                      <span
                        className={cn(
                          'mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                          invoice.status === 'paid'
                            ? 'bg-[#E8F5E9] text-[#2E7D32]'
                            : 'bg-[#FFF3E0] text-[#E65100]',
                        )}
                      >
                        {formatPopStatus(invoice.status)}
                      </span>
                    </div>
                  </div>
                  {invoice.paymentUrl && invoice.status !== 'paid' ? (
                    <Link
                      href={invoice.paymentUrl}
                      className="mt-2 inline-block text-xs font-medium text-[#7D3C98] underline"
                      aria-label={`Pay invoice ${invoice.id}`}
                    >
                      Pay now
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <p className="text-sm font-normal text-[#757575]">No instalments yet.</p>
        )}
      </div>
    </div>
  );
}
