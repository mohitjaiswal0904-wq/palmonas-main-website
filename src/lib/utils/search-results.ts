export function formatSearchResultCount(loadedCount: number, hasMoreProducts: boolean): string {
  if (loadedCount <= 0) {
    return '0';
  }

  if (hasMoreProducts) {
    return `${loadedCount}+`;
  }

  return String(loadedCount);
}

export function searchResultCountLabel(loadedCount: number, hasMoreProducts: boolean): string {
  if (loadedCount === 1 && !hasMoreProducts) {
    return 'result';
  }

  return 'results';
}
