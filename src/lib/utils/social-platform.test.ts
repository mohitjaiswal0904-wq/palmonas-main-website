import { normalizeSocialPlatformKey, resolveSocialPlatformKey } from '@/lib/utils/social-platform';

describe('normalizeSocialPlatformKey', () => {
  it('normalizes known platform keys', () => {
    expect(normalizeSocialPlatformKey('Facebook')).toBe('facebook');
    expect(normalizeSocialPlatformKey('INSTAGRAM')).toBe('instagram');
    expect(normalizeSocialPlatformKey('linked-in')).toBe('linkedin');
    expect(normalizeSocialPlatformKey('yt')).toBe('youtube');
  });
});

describe('resolveSocialPlatformKey', () => {
  it('returns the first non-empty platform value', () => {
    expect(resolveSocialPlatformKey(null, 'instagram', 'facebook')).toBe('instagram');
    expect(resolveSocialPlatformKey(undefined, '', 'YouTube')).toBe('youtube');
  });

  it('returns empty string when no values are provided', () => {
    expect(resolveSocialPlatformKey(null, undefined, '')).toBe('');
  });
});
