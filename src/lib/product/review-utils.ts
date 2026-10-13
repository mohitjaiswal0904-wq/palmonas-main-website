/**
 * Derive two-letter avatar initials from a reviewer display name.
 *
 * @param name - Reviewer name from API `title` field.
 * @returns Uppercase initials (max 2 chars).
 */
export function getReviewerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return '?';
  }

  if (parts.length === 1) {
    const first = parts[0] ?? '';
    return first.slice(0, 2).toUpperCase();
  }

  const firstInitial = parts[0]?.[0] ?? '';
  const secondInitial = parts[1]?.[0] ?? '';
  return `${firstInitial}${secondInitial}`.toUpperCase();
}

/**
 * Format review created timestamp for PDP cards (e.g. "25 Oct 2025").
 *
 * @param isoDate - ISO-8601 timestamp from API.
 * @returns Localised short date string, or empty when invalid.
 */
export function formatReviewDate(isoDate: string): string {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Resolve filled star count for summary display (rounded, clamped 0–5).
 *
 * @param averageRating - Product average rating.
 * @returns Whole star count for icon row.
 */
export function getSummaryStarCount(averageRating: number): number {
  if (!Number.isFinite(averageRating) || averageRating <= 0) {
    return 0;
  }

  return Math.min(5, Math.max(0, Math.round(averageRating)));
}
