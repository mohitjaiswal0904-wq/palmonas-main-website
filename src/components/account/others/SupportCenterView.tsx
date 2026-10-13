import { AccountDocumentShell } from '@/components/account/others/AccountDocumentShell';
import { AccountRichFaqList } from '@/components/account/others/AccountRichFaqList';
import {
  ACCOUNT_SUPPORT_HOME_URL,
  ACCOUNT_SUPPORT_TICKET_URL,
  accountMessages,
  accountSupportContent,
} from '@/config/account/account.config';
import { CONTACT_SUPPORT_PHONE_DISPLAY, CONTACT_SUPPORT_PHONE_HREF } from '@/config/contact.config';

const a11y = accountMessages.a11y;

/**
 * Support Center: live hero + CTAs + full FAQ dump (theme tokens / account width).
 */
export function SupportCenterView() {
  const copy = accountSupportContent;

  return (
    <AccountDocumentShell title={copy.pageTitle}>
      <p className="text-brand-navy text-lg font-semibold sm:text-xl">{copy.heroTitle}</p>

      <div className="rounded-palmonas-lg bg-surface-panel px-4 py-4">
        <p className="text-brand-navy text-xs font-semibold tracking-wide uppercase">
          {copy.hoursLabel}
        </p>
        <p className="text-brand-navy mt-1 text-sm font-medium">{copy.hoursDays}</p>
        <p className="text-sm text-[var(--color-text-muted)]">{copy.hoursTime}</p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        <li>
          <a
            href={CONTACT_SUPPORT_PHONE_HREF}
            className="rounded-palmonas-lg border-border-subtle bg-surface-elevated shadow-palmonas-soft hover:bg-surface-panel flex h-full flex-col border px-4 py-4 transition-colors"
            aria-label={a11y.callSupport}
          >
            <span className="text-brand-navy text-sm font-semibold">{copy.callTitle}</span>
            <span className="mt-1 text-xs text-[var(--color-text-muted)]">
              {copy.callDescription}
            </span>
            <span className="text-brand-navy mt-3 text-sm font-medium">
              {CONTACT_SUPPORT_PHONE_DISPLAY}
            </span>
          </a>
        </li>
        <li>
          <a
            href={ACCOUNT_SUPPORT_TICKET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-palmonas-lg border-border-subtle bg-surface-elevated shadow-palmonas-soft hover:bg-surface-panel flex h-full flex-col border px-4 py-4 transition-colors"
            aria-label={a11y.openSupportTicket}
          >
            <span className="text-brand-navy text-sm font-semibold">{copy.ticketTitle}</span>
            <span className="mt-1 text-xs text-[var(--color-text-muted)]">
              {copy.ticketDescription}
            </span>
          </a>
        </li>
      </ul>

      <AccountRichFaqList heading={copy.faqHeading} items={copy.items} defaultOpenFirst={false} />

      <a
        href={ACCOUNT_SUPPORT_HOME_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-brand-navy inline-flex text-sm font-medium underline underline-offset-2"
      >
        {ACCOUNT_SUPPORT_HOME_URL}
      </a>
    </AccountDocumentShell>
  );
}
