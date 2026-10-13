/** Parses CMS inline CSS strings like `gap: 16px; row-gap: 8px` into React style objects. */
export function parseInlineCss(css?: string): Record<string, string> | undefined {
  if (!css?.trim()) {
    return undefined;
  }

  const style: Record<string, string> = {};

  css.split(';').forEach((rule) => {
    const colonIndex = rule.indexOf(':');
    if (colonIndex === -1) {
      return;
    }

    const key = rule.slice(0, colonIndex).trim();
    const value = rule.slice(colonIndex + 1).trim();

    if (!key || !value) {
      return;
    }

    const camelKey = key.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
    style[camelKey] = value;
  });

  return Object.keys(style).length > 0 ? style : undefined;
}
