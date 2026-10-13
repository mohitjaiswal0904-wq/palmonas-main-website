import {
  dismissMobileAppNudge,
  isMobileAppNudgeDismissed,
} from '@/lib/layout/mobile-app-nudge-storage';
import { mobileAppNudgeDismissStorageKey } from '@/config/layout/mobile-app-nudge.config';

describe('mobile-app-nudge-storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns false when the nudge has not been dismissed', () => {
    expect(isMobileAppNudgeDismissed()).toBe(false);
  });

  it('returns true after dismissMobileAppNudge is called', () => {
    dismissMobileAppNudge();

    expect(localStorage.getItem(mobileAppNudgeDismissStorageKey)).toBe('1');
    expect(isMobileAppNudgeDismissed()).toBe(true);
  });

  it('is safe to call dismiss multiple times', () => {
    dismissMobileAppNudge();
    dismissMobileAppNudge();

    expect(isMobileAppNudgeDismissed()).toBe(true);
  });
});
