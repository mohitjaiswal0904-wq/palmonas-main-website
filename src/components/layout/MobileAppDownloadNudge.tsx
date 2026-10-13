'use client';

import { X } from 'lucide-react';

import { PalmonasAppNudgeIcon } from '@/components/icons/PalmonasAppNudgeIcon';
import { analyticsCanonicalEvents } from '@/config/analytics/analytics.config';
import { mobileAppNudgeMessages } from '@/config/layout/mobile-app-nudge.config';
import { themeFonts } from '@/config/theme/fonts';
import { mobileAppNudgeTheme } from '@/config/theme/mobile-app-nudge.tokens';
import { useMobileAppNudgeDismissed } from '@/hooks/layout/useMobileAppNudgeDismissed';
import { useMobileAppStoreUrl } from '@/hooks/layout/useMobileAppStoreUrl';
import { cn } from '@/lib/utils/cn';

/**
 * Mobile-only app download nudge shown above the announcement bar (Figma / production parity).
 */
export function MobileAppDownloadNudge() {
  const appStoreUrl = useMobileAppStoreUrl();
  const { isDismissed, dismiss } = useMobileAppNudgeDismissed();

  if (!appStoreUrl || isDismissed) {
    return null;
  }

  const { labels, a11y } = mobileAppNudgeMessages;

  return (
    <div
      className={cn(
        'laptop:hidden px-3 py-2',
        mobileAppNudgeTheme.surfaceClass,
        mobileAppNudgeTheme.borderClass,
        themeFonts.sans.className,
      )}
      role="region"
      aria-label={a11y.regionLabel}
      data-testid="mobile-app-download-nudge"
    >
      <div className="flex items-center gap-2.5">
        <PalmonasAppNudgeIcon />

        <div className="min-w-0 flex-1">
          <p className={mobileAppNudgeTheme.titleClass}>{labels.title}</p>
          <p className={mobileAppNudgeTheme.subtitleClass}>{labels.subtitle}</p>
        </div>

        <a
          href={appStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={mobileAppNudgeTheme.ctaClass}
          aria-label={a11y.openInApp}
          data-analytics-event={analyticsCanonicalEvents.openInAppClicked}
        >
          {labels.cta}
        </a>

        <button
          type="button"
          onClick={dismiss}
          className={mobileAppNudgeTheme.closeClass}
          aria-label={a11y.close}
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
