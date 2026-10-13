import {
  clearAnalyticsAuthContext,
  getAnalyticsAuthContext,
  setAnalyticsAuthContext,
} from '@/lib/analytics/analytics-auth-context';

describe('analytics auth context', () => {
  afterEach(() => {
    clearAnalyticsAuthContext();
  });

  it('returns empty context by default', () => {
    expect(getAnalyticsAuthContext()).toEqual({});
  });

  it('stores and clears auth context', () => {
    setAnalyticsAuthContext({
      userId: 'user-1',
      sessionId: 'sess-1',
      isGuest: false,
    });

    expect(getAnalyticsAuthContext()).toEqual({
      userId: 'user-1',
      sessionId: 'sess-1',
      isGuest: false,
    });

    clearAnalyticsAuthContext();
    expect(getAnalyticsAuthContext()).toEqual({});
  });
});
