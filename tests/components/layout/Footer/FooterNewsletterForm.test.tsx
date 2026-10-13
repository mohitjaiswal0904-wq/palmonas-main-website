import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { FooterNewsletterForm } from '@/components/layout/Footer/FooterNewsletterForm';
import { footerMessages } from '@/config/layout/footer.config';

const showSuccess = jest.fn();
const showError = jest.fn();

jest.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    showSuccess,
    showError,
    showWarning: jest.fn(),
    showInfo: jest.fn(),
    show: jest.fn(),
  }),
}));

jest.mock('@/lib/layout/footer-newsletter', () => ({
  postFooterNewsletter: jest.fn(),
}));

import { postFooterNewsletter } from '@/lib/layout/footer-newsletter';

const postMock = postFooterNewsletter as jest.MockedFunction<typeof postFooterNewsletter>;

describe('FooterNewsletterForm', () => {
  beforeEach(() => {
    showSuccess.mockReset();
    showError.mockReset();
    postMock.mockReset();
  });

  it('shows unavailable toast when action URL is missing', async () => {
    render(
      <FooterNewsletterForm
        heading="Subscribe"
        placeholder="Your email address"
        actionUrl={null}
        borderColor="#f1f1f1"
      />,
    );

    fireEvent.change(screen.getByPlaceholderText('Your email address'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Subscribe' }).closest('form')!);

    await waitFor(() => {
      expect(showError).toHaveBeenCalledWith(footerMessages.toasts.unavailable);
    });
    expect(postMock).not.toHaveBeenCalled();
  });

  it('shows validation toast for invalid email without calling the API', async () => {
    render(
      <FooterNewsletterForm
        heading="Subscribe"
        placeholder="Your email address"
        actionUrl="https://example.com/subscribe"
        borderColor="#f1f1f1"
      />,
    );

    fireEvent.change(screen.getByPlaceholderText('Your email address'), {
      target: { value: 'not-an-email' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Subscribe' }));

    await waitFor(() => {
      expect(showError).toHaveBeenCalledWith(footerMessages.validation.emailInvalid);
    });
    expect(postMock).not.toHaveBeenCalled();
  });

  it('POSTs and shows success toast when action URL is set', async () => {
    postMock.mockResolvedValue(undefined);

    render(
      <FooterNewsletterForm
        heading="Subscribe"
        placeholder="Your email address"
        actionUrl="https://example.com/subscribe"
        borderColor="#f1f1f1"
      />,
    );

    const input = screen.getByPlaceholderText('Your email address');
    fireEvent.change(input, { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Subscribe' }));

    await waitFor(() => {
      expect(postMock).toHaveBeenCalledWith(
        'https://example.com/subscribe',
        'user@example.com',
      );
      expect(showSuccess).toHaveBeenCalledWith(footerMessages.toasts.success);
    });
    expect(input).toHaveValue('');
  });

  it('shows error toast when the subscribe request fails', async () => {
    postMock.mockRejectedValue(new Error('fail'));

    render(
      <FooterNewsletterForm
        heading="Subscribe"
        placeholder="Your email address"
        actionUrl="https://example.com/subscribe"
        borderColor="#f1f1f1"
      />,
    );

    fireEvent.change(screen.getByPlaceholderText('Your email address'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Subscribe' }));

    await waitFor(() => {
      expect(showError).toHaveBeenCalledWith(footerMessages.toasts.error);
    });
    expect(showSuccess).not.toHaveBeenCalled();
  });
});
