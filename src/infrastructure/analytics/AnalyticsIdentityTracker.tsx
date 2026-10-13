'use client';

import { useEffect, useRef } from 'react';

import { useAuth } from '@/hooks/auth/useAuth';
import {
  identifyAnalyticsUser,
  resetAnalyticsUser,
} from '@/infrastructure/analytics/analytics-client';
import {
  clearAnalyticsAuthContext,
  setAnalyticsAuthContext,
} from '@/lib/analytics/analytics-auth-context';
import { trackUserLoggedIn } from '@/lib/analytics/analytics-trackers';
import { encodeMixpanelDistinctIdFromPhone } from '@/lib/analytics/encode-mixpanel-distinct-id';
import {
  buildMetaPixelIdentityFromAuthUser,
  setMetaPixelIdentity,
} from '@/lib/analytics/meta-pixel-identity';

/**
 * Syncs Mixpanel, WebEngage, and Meta Pixel identity from the authenticated user profile.
 */
export function AnalyticsIdentityTracker() {
  const { user, isGuest, isLoading, claims } = useAuth();
  const lastDistinctId = useRef<string | null>(null);

  // Sync auth claims into analytics base payloads for all track* calls.
  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!claims) {
      clearAnalyticsAuthContext();
      return;
    }

    if (isGuest || !claims.userId) {
      setAnalyticsAuthContext({
        sessionId: claims.sessionId,
        isGuest: true,
      });
      return;
    }

    setAnalyticsAuthContext({
      userId: claims.userId,
      sessionId: claims.sessionId,
      isGuest: claims.isGuest,
    });
  }, [claims, isGuest, isLoading]);

  // Identify on login/profile hydration; reset on logout/guest.
  useEffect(() => {
    if (isLoading) {
      return;
    }

    const phone = user?.phoneNumber?.trim();

    if (isGuest || !phone || !user) {
      setMetaPixelIdentity(null);

      if (lastDistinctId.current !== null) {
        lastDistinctId.current = null;
        clearAnalyticsAuthContext();
        void resetAnalyticsUser().catch(() => {
          // ponytail: identity reset failures must not block auth flows.
        });
      }

      return;
    }

    setMetaPixelIdentity(buildMetaPixelIdentityFromAuthUser(user, claims?.userId ?? user.id));

    const distinctId = encodeMixpanelDistinctIdFromPhone(phone);

    if (!distinctId || distinctId === lastDistinctId.current) {
      return;
    }

    lastDistinctId.current = distinctId;

    void identifyAnalyticsUser(distinctId, {
      webengageUserId: claims?.userId ?? user.id,
      webengageProfile: user,
    }).catch(() => {
      // ponytail: identify failures must not block auth flows.
    });

    trackUserLoggedIn({ login_method: 'phone' });
  }, [claims?.userId, isGuest, isLoading, user]);

  return null;
}
