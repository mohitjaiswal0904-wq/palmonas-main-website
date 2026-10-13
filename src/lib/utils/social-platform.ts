const SOCIAL_PLATFORM_ALIASES: Record<string, string> = {
  'fb': 'facebook',
  'ig': 'instagram',
  'insta': 'instagram',
  'linkedin': 'linkedin',
  'linked-in': 'linkedin',
  'yt': 'youtube',
  'x': 'twitter',
  'twitter-x': 'twitter',
};

export function normalizeSocialPlatformKey(value: string | null | undefined): string {
  if (!value) {
    return '';
  }

  const normalized = value.trim().toLowerCase().replace(/\s+/g, '-');
  return SOCIAL_PLATFORM_ALIASES[normalized] ?? normalized;
}

export function resolveSocialPlatformKey(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    const key = normalizeSocialPlatformKey(value);

    if (key) {
      return key;
    }
  }

  return '';
}
