import {
  buildRouteAnalyticsEvent,
  pathnameToScreenName,
} from '@/lib/analytics/build-route-analytics-event';
import { analyticsCanonicalEvents } from '@/config/analytics/analytics.config';

describe('pathnameToScreenName', () => {
  it('title-cases route segments', () => {
    expect(pathnameToScreenName('/')).toBe('Home');
    expect(pathnameToScreenName('/account/orders')).toBe('Account Orders');
  });
});

describe('buildRouteAnalyticsEvent search routes', () => {
  it('maps search with query to search_results_viewed', () => {
    expect(
      buildRouteAnalyticsEvent({
        pathname: '/search',
        search: 'q=ring',
      }),
    ).toEqual({
      name: analyticsCanonicalEvents.searchResultsViewed,
      properties: {
        path: '/search',
        search: 'q=ring',
        page_type: 'search',
        screen_name: 'Search Results',
        query: 'ring',
        results_count: 0,
      },
      value: 1,
      currency: 'INR',
    });
  });

  it('maps bare search route to search_opened', () => {
    expect(
      buildRouteAnalyticsEvent({
        pathname: '/search',
        search: '',
      }),
    ).toEqual({
      name: analyticsCanonicalEvents.searchOpened,
      properties: {
        path: '/search',
        page_type: 'search',
        screen_name: 'Search',
        entry_point: 'navigation',
      },
    });
  });
});
