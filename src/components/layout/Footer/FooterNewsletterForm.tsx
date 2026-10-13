'use client';

import { Mail } from 'lucide-react';
import { useCallback, useState, type CSSProperties, type FormEvent } from 'react';

import { footerMessages } from '@/config/layout/footer.config';
import { useToast } from '@/hooks/useToast';
import { postFooterNewsletter } from '@/lib/layout/footer-newsletter';
import { emailValidator } from '@/lib/validators';

export interface FooterNewsletterFormProps {
  heading: string;
  placeholder: string;
  /** CMS subscribe URL; when null/empty, submit shows unavailable toast only. */
  actionUrl: string | null | undefined;
  borderColor: string;
}

/**
 * Footer newsletter field — blocks native navigation and toasts result.
 */
export function FooterNewsletterForm({
  heading,
  placeholder,
  actionUrl,
  borderColor,
}: FooterNewsletterFormProps) {
  const { showSuccess, showError } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const trimmed = email.trim();
      if (!emailValidator.safeParse(trimmed).success) {
        showError(footerMessages.validation.emailInvalid);
        return;
      }

      const url = actionUrl?.trim() ?? '';
      if (!url) {
        showError(footerMessages.toasts.unavailable);
        return;
      }

      setIsSubmitting(true);
      try {
        await postFooterNewsletter(url, trimmed);
        showSuccess(footerMessages.toasts.success);
        setEmail('');
      } catch {
        showError(footerMessages.toasts.error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [actionUrl, email, showError, showSuccess],
  );

  const formStyle: CSSProperties = { borderColor };

  return (
    <div>
      <p className="text-base leading-5 font-semibold text-[var(--footer-text)]">{heading}</p>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-5 flex h-12 w-full overflow-hidden border bg-white"
        style={formStyle}
        aria-busy={isSubmitting}
      >
        <label htmlFor="footer-newsletter-email" className="sr-only">
          {footerMessages.labels.emailLabel}
        </label>
        <input
          id="footer-newsletter-email"
          type="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={placeholder}
          disabled={isSubmitting}
          autoComplete="email"
          className="min-w-0 flex-1 px-5 text-[13px] text-stone-900 outline-none placeholder:text-[#868686]/50 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-[68px] shrink-0 items-center justify-center border-l border-[#f1f1f1] text-[#222] disabled:opacity-60"
          aria-label={isSubmitting ? footerMessages.a11y.submitting : heading}
        >
          <Mail className="h-[23px] w-[22px]" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
