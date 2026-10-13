import { postFooterNewsletter } from '@/lib/layout/footer-newsletter';

describe('postFooterNewsletter', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('POSTs urlencoded email to the action URL', async () => {
    fetchMock.mockResolvedValue({ ok: true });

    await postFooterNewsletter('https://example.com/subscribe', 'a@b.com');

    expect(fetchMock).toHaveBeenCalledWith('https://example.com/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: expect.any(URLSearchParams),
    });
    const body = fetchMock.mock.calls[0]?.[1]?.body as URLSearchParams;
    expect(body.get('email')).toBe('a@b.com');
  });

  it('resolves when the response is OK', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200 });
    await expect(
      postFooterNewsletter('https://example.com/subscribe', 'ok@test.com'),
    ).resolves.toBeUndefined();
  });

  it('throws when the response is not OK', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500 });
    await expect(
      postFooterNewsletter('https://example.com/subscribe', 'fail@test.com'),
    ).rejects.toThrow('Newsletter subscribe failed: 500');
  });

  it('throws when fetch rejects', async () => {
    fetchMock.mockRejectedValue(new Error('network'));
    await expect(
      postFooterNewsletter('https://example.com/subscribe', 'x@y.com'),
    ).rejects.toThrow('network');
  });
});
