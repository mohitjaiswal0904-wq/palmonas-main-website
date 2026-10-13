'use client';

import Link from 'next/link';

import { planOfPurchaseDetailPath } from '@/components/account/common/account-routes';
import { Loader } from '@/components/ui/Loader';
import { usePopSubscriptions } from '@/hooks/pop';
import { formatPopCurrency, formatPopStatus } from '@/lib/pop/pop-format';
import { cn } from '@/lib/utils/cn';

export function PopSubscriptionsSection() {
  const { subscriptions, isLoading, error } = usePopSubscriptions({ limit: 10, offset: 0 });

  if (isLoading) {
    return (
      <div className="mt-6 flex justify-center py-6">
        <Loader />
      </div>
    );
  }

  if (error || !subscriptions?.items.length) {
    return null;
  }

  return (
    <section className="mt-6" aria-labelledby="pop-my-plans-heading">
      <h2 id="pop-my-plans-heading" className="text-base font-bold text-[#151515]">
        My Plans
      </h2>
      <ul className="mt-4 space-y-3" aria-label="Active POP subscriptions">
        {subscriptions.items.map((subscription) => (
          <li key={subscription.subscriptionId}>
            <Link
              href={planOfPurchaseDetailPath(subscription.subscriptionId)}
              className="block rounded-2xl border border-[#EFEFEF] bg-white p-4 transition-colors hover:bg-[#FAFAFA]"
              aria-label={`View plan ${subscription.reference}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-[#151515]">
                    {formatPopCurrency(subscription.monthlyAmount)}/month
                  </p>
                  <p className="mt-1 text-xs font-normal text-[#757575]">
                    {subscription.paidCount}/{subscription.totalCount} paid ·{' '}
                    {subscription.remainingCount} remaining
                  </p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                    subscription.status === 'active'
                      ? 'bg-[#E8F5E9] text-[#2E7D32]'
                      : 'bg-[#F5F5F5] text-[#757575]',
                  )}
                >
                  {formatPopStatus(subscription.status)}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
