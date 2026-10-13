import {
  buildGokwikMixpanelEvent,
  parseGokwikAnalyticsEvent,
  readGokwikOrderId,
  toGokwikTrackedEventName,
} from '@/lib/analytics/parse-gokwik-analytics-event';

describe('parseGokwikAnalyticsEvent', () => {
  it('parses Shopify-style gokwik_events customData', () => {
    expect(
      parseGokwikAnalyticsEvent({
        customData: {
          name: 'Order_Placed_GK',
          data: {
            data: {
              total_price: 1099,
              currency: 'INR',
              'Order Id': 'PW-1001',
            },
          },
        },
      }),
    ).toEqual({
      eventName: 'Order_Placed_GK',
      data: {
        total_price: 1099,
        currency: 'INR',
        'Order Id': 'PW-1001',
      },
    });
  });

  it('unwraps a gokwik_events channel envelope', () => {
    expect(
      parseGokwikAnalyticsEvent({
        event: 'gokwik_events',
        data: {
          customData: {
            name: 'payment-screen',
            data: { step: 2 },
          },
        },
      }),
    ).toEqual({
      eventName: 'payment-screen',
      data: { step: 2 },
    });
  });

  it('keeps otpEntered as the event name', () => {
    expect(
      parseGokwikAnalyticsEvent({
        eventName: 'otpEntered',
        data: { step: 'otp' },
      }),
    ).toEqual({
      eventName: 'otpEntered',
      data: { step: 'otp' },
    });
  });

  it('returns null for empty or unnamed payloads', () => {
    expect(parseGokwikAnalyticsEvent(null)).toBeNull();
    expect(parseGokwikAnalyticsEvent({})).toBeNull();
    expect(parseGokwikAnalyticsEvent('order')).toBeNull();
  });
});

describe('buildGokwikMixpanelEvent', () => {
  it('maps Order_Placed_GK to value, currency, and order_id', () => {
    expect(
      buildGokwikMixpanelEvent({
        eventName: 'Order_Placed_GK',
        data: {
          total_price: 1099,
          currency: 'INR',
          'Order Id': 'PW-1001',
        },
      }),
    ).toEqual({
      name: 'Order_Placed_gk',
      properties: { order_id: 'PW-1001' },
      value: 1099,
      currency: 'INR',
      passthroughEventName: true,
    });
  });

  it('tracks other GoKwik events with a _gk suffix', () => {
    expect(
      buildGokwikMixpanelEvent({ eventName: 'otpEntered', data: { foo: 1, nested: { a: 1 } } }),
    ).toEqual({
      name: 'otpEntered_gk',
      properties: { foo: 1 },
      passthroughEventName: true,
    });
  });
});

describe('toGokwikTrackedEventName', () => {
  it('appends _gk when the name has no suffix', () => {
    expect(toGokwikTrackedEventName('otpEntered')).toBe('otpEntered_gk');
    expect(toGokwikTrackedEventName('checkout-initiated')).toBe('checkout-initiated_gk');
  });

  it('replaces a trailing GK with _gk', () => {
    expect(toGokwikTrackedEventName('Order_Placed_GK')).toBe('Order_Placed_gk');
    expect(toGokwikTrackedEventName('otpEnteredGK')).toBe('otpEntered_gk');
  });

  it('keeps a name that already ends with _gk', () => {
    expect(toGokwikTrackedEventName('otpEntered_gk')).toBe('otpEntered_gk');
  });

  it('returns a blank name unchanged', () => {
    expect(toGokwikTrackedEventName('')).toBe('');
    expect(toGokwikTrackedEventName('   ')).toBe('');
  });
});

describe('readGokwikOrderId', () => {
  it('prefers Order Id from the GoKwik pixel payload', () => {
    expect(readGokwikOrderId({ 'Order Id': 'PW-9', order_id: 'other' })).toBe('PW-9');
  });

  it('returns undefined when no order id is present', () => {
    expect(readGokwikOrderId({ total_price: 10 })).toBeUndefined();
  });
});
