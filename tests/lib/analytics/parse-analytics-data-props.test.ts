import { parseAnalyticsDataProps, truncateAnalyticsLabel } from '@/lib/analytics/parse-analytics-data-props';

describe('parseAnalyticsDataProps', () => {
  it('parses valid JSON objects', () => {
    expect(parseAnalyticsDataProps('{"sku":"abc","qty":2}')).toEqual({
      sku: 'abc',
      qty: 2,
    });
  });

  it('returns an empty object for invalid JSON', () => {
    expect(parseAnalyticsDataProps('{bad json')).toEqual({});
  });

  it('returns an empty object for arrays and null', () => {
    expect(parseAnalyticsDataProps('[]')).toEqual({});
    expect(parseAnalyticsDataProps('null')).toEqual({});
  });
});

describe('truncateAnalyticsLabel', () => {
  it('trims whitespace and caps long labels', () => {
    expect(truncateAnalyticsLabel('  Hello   world  ')).toBe('Hello world');
    expect(truncateAnalyticsLabel('a'.repeat(130)).length).toBe(120);
  });
});
