import { trackGokwikCheckoutEvent } from '@/lib/analytics/track-gokwik-events';

const mockTrackAnalyticsEvent = jest.fn().mockResolvedValue(undefined);

jest.mock('@/infrastructure/analytics/analytics-client', () => ({
  trackAnalyticsEvent: (...args: unknown[]) => mockTrackAnalyticsEvent(...args),
}));

describe('trackGokwikCheckoutEvent', () => {
  beforeEach(() => {
    mockTrackAnalyticsEvent.mockClear();
  });

  it('tracks Order_Placed_GK with commerce fields', () => {
    trackGokwikCheckoutEvent({
      eventName: 'Order_Placed_GK',
      data: { total_price: 903, currency: 'INR', 'Order Id': 'PW-40' },
    });

    expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith({
      name: 'Order_Placed_gk',
      properties: { order_id: 'PW-40' },
      value: 903,
      currency: 'INR',
      passthroughEventName: true,
    });
  });

  it('tracks other GoKwik events by name', () => {
    trackGokwikCheckoutEvent({ eventName: 'otpEntered', data: { method: 'sms' } });

    expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith({
      name: 'otpEntered_gk',
      properties: { method: 'sms' },
      passthroughEventName: true,
    });
  });
});
