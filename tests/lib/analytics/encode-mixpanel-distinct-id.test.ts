import { encodeMixpanelDistinctIdFromPhone } from '@/lib/analytics/encode-mixpanel-distinct-id';

describe('encodeMixpanelDistinctIdFromPhone', () => {
  it('returns base64 for a normalised phone number', () => {
    expect(encodeMixpanelDistinctIdFromPhone('+91 98332 90022')).toBe(
      Buffer.from('+919833290022', 'utf-8').toString('base64'),
    );
  });

  it('returns null for empty phone values', () => {
    expect(encodeMixpanelDistinctIdFromPhone('   ')).toBeNull();
  });
});
