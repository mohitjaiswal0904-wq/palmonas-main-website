/**
 * POST email to CMS newsletter action URL as form body (`email` field).
 *
 * @param actionUrl - Absolute or same-origin subscribe endpoint from CMS.
 * @param email - Trimmed subscriber email.
 * @throws When the response is not OK.
 */
export async function postFooterNewsletter(actionUrl: string, email: string): Promise<void> {
  const body = new URLSearchParams({ email });
  const response = await fetch(actionUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    throw new Error(`Newsletter subscribe failed: ${response.status}`);
  }
}
