'use client';

import { useCallback, useState } from 'react';

import { AccountPanelSkeleton } from '@/components/account/common/AccountPanelSkeleton';
import { AccountInfoLayout } from '@/components/account/others/AccountInfoLayout';
import { Button } from '@/components/ui/Button';
import { accountMessages } from '@/config/account/account.config';
import { useToast } from '@/hooks/useToast';
import { useUserWallet } from '@/hooks/user';

const copy = accountMessages.referAndEarn;
const a11y = accountMessages.a11y;
const toasts = accountMessages.toasts;

/**
 * Referral code from wallet API + link to live referral page.
 * Program steps stay off until live referral copy exists (feature flag).
 */
export function ReferAndEarnView() {
  const { wallet, isLoading } = useUserWallet();
  const { showSuccess, showError } = useToast();
  const [copied, setCopied] = useState(false);

  const referralCode = wallet?.referralCode?.trim() ?? '';

  /** Copy referral code to clipboard. */
  const handleCopy = useCallback(async () => {
    if (!referralCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      showSuccess(toasts.referralCopied);
    } catch {
      showError(toasts.referralCopyFailed);
    }
  }, [referralCode, showError, showSuccess]);

  if (isLoading) {
    return <AccountPanelSkeleton />;
  }

  return (
    <AccountInfoLayout title={copy.title} subtitle={copy.subtitle}>
      <div className="mt-6 rounded-2xl border border-[#EEEEEE] bg-[#FFF5F5] px-5 py-6">
        <p className="text-xs font-normal text-[#757575]">{copy.codeLabel}</p>
        <p className="mt-2 font-mono text-2xl font-bold tracking-wide text-[#151515]">
          {referralCode || copy.emptyCode}
        </p>
        {referralCode ? (
          <Button
            type="button"
            className="mt-4 w-full"
            onClick={() => void handleCopy()}
            aria-label={a11y.copyReferralCode}
          >
            {copied ? toasts.referralCopied : copy.copyLabel}
          </Button>
        ) : null}
      </div>

      <a
        href={copy.externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-stone-900 px-4 text-sm font-medium text-white hover:bg-stone-800"
      >
        {copy.externalCta}
      </a>
    </AccountInfoLayout>
  );
}
