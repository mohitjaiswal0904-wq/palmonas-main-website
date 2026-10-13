import { subscribeGokwikAnalyticsEvents } from '@/lib/analytics/subscribe-gokwik-events';

describe('subscribeGokwikAnalyticsEvents', () => {
  it('emits Shopify-style gokwik_events custom events', () => {
    const onEvent = jest.fn();
    const unsubscribe = subscribeGokwikAnalyticsEvents(onEvent);

    window.dispatchEvent(
      new CustomEvent('gokwik_events', {
        detail: {
          customData: {
            name: 'Order_Placed_GK',
            data: {
              data: { total_price: 500, currency: 'INR', 'Order Id': 'PW-2' },
            },
          },
        },
      }),
    );

    expect(onEvent).toHaveBeenCalledWith({
      eventName: 'Order_Placed_GK',
      data: { total_price: 500, currency: 'INR', 'Order Id': 'PW-2' },
    });
    unsubscribe();
  });

  it('emits checkout-initiated from postMessage', () => {
    const onEvent = jest.fn();
    const unsubscribe = subscribeGokwikAnalyticsEvents(onEvent);

    window.dispatchEvent(
      new MessageEvent('message', {
        data: {
          customData: {
            name: 'checkout-initiated',
            data: {},
          },
        },
      }),
    );

    expect(onEvent).toHaveBeenCalledWith({
      eventName: 'checkout-initiated',
      data: {},
    });
    unsubscribe();
  });

  it('emits otpEntered from postMessage', () => {
    const onEvent = jest.fn();
    const unsubscribe = subscribeGokwikAnalyticsEvents(onEvent);

    window.dispatchEvent(
      new MessageEvent('message', {
        data: { eventName: 'otpEntered', data: { method: 'sms' } },
      }),
    );

    expect(onEvent).toHaveBeenCalledWith({
      eventName: 'otpEntered',
      data: { method: 'sms' },
    });
    unsubscribe();
  });

  it('ignores unnamed messages', () => {
    const onEvent = jest.fn();
    const unsubscribe = subscribeGokwikAnalyticsEvents(onEvent);

    window.dispatchEvent(new MessageEvent('message', { data: { foo: 1 } }));

    expect(onEvent).not.toHaveBeenCalled();
    unsubscribe();
  });

  it('stops emitting after unsubscribe', () => {
    const onEvent = jest.fn();
    const unsubscribe = subscribeGokwikAnalyticsEvents(onEvent);
    unsubscribe();

    window.dispatchEvent(
      new CustomEvent('Order_Placed_GK', {
        detail: { total_price: 1, 'Order Id': 'x' },
      }),
    );

    expect(onEvent).not.toHaveBeenCalled();
  });
});
