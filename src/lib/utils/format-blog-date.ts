export interface BlogDateParts {
  day: string;
  month: string;
}

export function formatBlogDateParts(publishedAt: string): BlogDateParts {
  const date = new Date(publishedAt);

  return {
    day: String(date.getUTCDate()).padStart(2, '0'),
    month: date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase(),
  };
}
