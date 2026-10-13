/**
 * Return whether a mouse/pointer click should skip client soft-nav (open new tab, etc.).
 *
 * @param event - Click-like event with modifier and button fields.
 */
export function isModifiedClick(event: {
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  button?: number;
}): boolean {
  const isNonPrimaryButton = event.button !== undefined && event.button !== 0;
  if (isNonPrimaryButton) {
    return true;
  }
  return Boolean(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);
}
