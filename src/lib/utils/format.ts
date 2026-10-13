export const formatCurrency = (value: number, currency = 'USD', locale = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
};

export const formatDate = (date: string | Date, locale = 'en-US') => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) {
    return 'th';
  }

  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

/** e.g. "15th July" for delivery estimates. */
export function formatOrdinalDeliveryDate(date: string | Date, locale = 'en-IN'): string {
  const parsed = new Date(date);
  const day = parsed.getDate();
  const month = parsed.toLocaleDateString(locale, { month: 'long' });

  return `${day}${getOrdinalSuffix(day)} ${month}`;
}
