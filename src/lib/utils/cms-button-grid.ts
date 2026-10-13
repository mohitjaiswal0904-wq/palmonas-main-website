export function resolveButtonGridMobileColumns(columns?: number, fallback = 2): number {
  if (typeof columns === 'number' && columns > 0) {
    return columns;
  }

  return fallback;
}

export function buildButtonGridContainerStyle(
  mobileColumns: number,
  spacing?: Record<string, string>,
): Record<string, string> {
  return {
    gridTemplateColumns: `repeat(${mobileColumns}, minmax(0, 1fr))`,
    ...spacing,
  };
}
