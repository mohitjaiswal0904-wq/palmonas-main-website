import { AppLink } from '@/components/ui/AppLink';
import { menuConfig } from '@/config/menu.config';
import { layoutTokens } from '@/config/theme';
import { cn } from '@/lib/utils/cn';

export function MegaMenu() {
  return (
    <nav className="laptop:flex hidden items-center gap-6 text-sm" aria-label="Main navigation">
      {menuConfig.map((item) => (
        <AppLink
          key={item.href}
          href={item.href}
          className={cn('px-2 py-1', layoutTokens.headerNav.interactiveClass)}
        >
          {item.label}
        </AppLink>
      ))}
    </nav>
  );
}
