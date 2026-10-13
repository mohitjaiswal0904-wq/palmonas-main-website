import { AppLink } from '@/components/ui/AppLink';
import { ACCOUNT_SUPPORT_HOME_URL } from '@/config/account/account.config';
import { shouldPrefetchAppRoute } from '@/lib/navigation/static-app-routes';

interface DrawerFooterProps {
  onClose: () => void;
}

const RETURNS_PORTAL_URL = 'https://returns.palmonas.com/login';

const drawerFooterLinkClass =
  'px-[clamp(0px,1vw,0.75rem)] py-1 text-[clamp(8px,12vw,10px)] font-medium text-[#4B5563]';

function FooterDivider() {
  return <span className="mx-3 h-4 w-px bg-[#C3BFAE]" aria-hidden="true" />;
}

export function DrawerFooter({ onClose }: DrawerFooterProps) {
  return (
    <footer className="flex items-center justify-center bg-[#E6E6E6] px-4 py-2">
      <a
        href={RETURNS_PORTAL_URL}
        className={drawerFooterLinkClass}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClose}
      >
        Return &amp; Exchange
      </a>
      <FooterDivider />
      <AppLink href="/palmonas-stores" className={drawerFooterLinkClass} onClick={onClose}>
        Stores
      </AppLink>
      <FooterDivider />
      <a
        href={ACCOUNT_SUPPORT_HOME_URL}
        className={drawerFooterLinkClass}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClose}
      >
        Support
      </a>
      <FooterDivider />
      <AppLink
        href="/about"
        prefetch={shouldPrefetchAppRoute('/about')}
        className={drawerFooterLinkClass}
        onClick={onClose}
      >
        About Us
      </AppLink>
    </footer>
  );
}
