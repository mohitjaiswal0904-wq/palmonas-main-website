import { useState, useSyncExternalStore } from 'react';

import {
  dismissMobileAppNudge,
  isMobileAppNudgeDismissed,
} from '@/lib/layout/mobile-app-nudge-storage';

const subscribeNoop = (): (() => void) => () => undefined;

interface UseMobileAppNudgeDismissedResult {
  isDismissed: boolean;
  dismiss: () => void;
}

/**
 * Reads mobile app nudge dismissal from localStorage without a mount effect.
 */
export function useMobileAppNudgeDismissed(): UseMobileAppNudgeDismissedResult {
  const storedDismissed = useSyncExternalStore(
    subscribeNoop,
    isMobileAppNudgeDismissed,
    () => true,
  );
  const [dismissedLocally, setDismissedLocally] = useState(false);

  return {
    isDismissed: storedDismissed || dismissedLocally,
    dismiss: () => {
      dismissMobileAppNudge();
      setDismissedLocally(true);
    },
  };
}
