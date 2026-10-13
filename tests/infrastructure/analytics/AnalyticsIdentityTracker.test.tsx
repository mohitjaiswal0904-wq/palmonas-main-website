/** @jest-environment jsdom */

import { render } from '@testing-library/react';

const mockIdentify = jest.fn().mockResolvedValue(undefined);
const mockReset = jest.fn().mockResolvedValue(undefined);
const mockTrackUserLoggedIn = jest.fn();
const mockUseAuth = jest.fn();

jest.mock('@/hooks/auth/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('@/infrastructure/analytics/analytics-client', () => ({
  identifyAnalyticsUser: (...args: unknown[]) => mockIdentify(...args),
  resetAnalyticsUser: (...args: unknown[]) => mockReset(...args),
}));

jest.mock('@/lib/analytics/analytics-trackers', () => ({
  trackUserLoggedIn: (...args: unknown[]) => mockTrackUserLoggedIn(...args),
}));

jest.mock('@/lib/analytics/analytics-auth-context', () => ({
  clearAnalyticsAuthContext: jest.fn(),
  setAnalyticsAuthContext: jest.fn(),
}));

jest.mock('@/lib/analytics/meta-pixel-identity', () => ({
  buildMetaPixelIdentityFromAuthUser: jest.fn(() => null),
  setMetaPixelIdentity: jest.fn(),
}));

describe('AnalyticsIdentityTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('identifies once per distinct id and skips repeat auth effect runs', async () => {
    const { AnalyticsIdentityTracker } = await import(
      '@/infrastructure/analytics/AnalyticsIdentityTracker'
    );

    const user = {
      id: 'user-1',
      phoneNumber: '+919833290022',
    };

    mockUseAuth.mockReturnValue({
      user,
      isGuest: false,
      isLoading: false,
      claims: { userId: 'user-1', sessionId: 'sess-1', isGuest: false },
    });

    const { rerender } = render(<AnalyticsIdentityTracker />);

    expect(mockIdentify).toHaveBeenCalledTimes(1);
    expect(mockTrackUserLoggedIn).toHaveBeenCalledTimes(1);

    mockUseAuth.mockReturnValue({
      user: { ...user },
      isGuest: false,
      isLoading: false,
      claims: { userId: 'user-1', sessionId: 'sess-2', isGuest: false },
    });
    rerender(<AnalyticsIdentityTracker />);

    expect(mockIdentify).toHaveBeenCalledTimes(1);
    expect(mockTrackUserLoggedIn).toHaveBeenCalledTimes(1);
  });

  it('resets identity when the session becomes guest', async () => {
    const { AnalyticsIdentityTracker } = await import(
      '@/infrastructure/analytics/AnalyticsIdentityTracker'
    );

    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', phoneNumber: '+919833290022' },
      isGuest: false,
      isLoading: false,
      claims: { userId: 'user-1', sessionId: 'sess-1', isGuest: false },
    });

    const { rerender } = render(<AnalyticsIdentityTracker />);
    expect(mockIdentify).toHaveBeenCalledTimes(1);

    mockUseAuth.mockReturnValue({
      user: null,
      isGuest: true,
      isLoading: false,
      claims: { sessionId: 'guest-sess', isGuest: true },
    });
    rerender(<AnalyticsIdentityTracker />);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });
});
