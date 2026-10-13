'use client';

import { ChevronDown, Share2, ShoppingCart } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';

import { HeaderAuthMenu } from '@/components/auth/HeaderAuthMenu';
import { CmsAnnouncementBars } from '@/components/cms/CmsAnnouncementBars';
import { CmsMedia } from '@/components/cms/shared/CmsMedia';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { HeaderDesktopUtilityBar } from '@/components/layout/Header/components/HeaderDesktopUtilityBar';
import { HeaderSearch } from '@/components/layout/HeaderSearch';
// import { MobileAppDownloadNudge } from '@/components/layout/MobileAppDownloadNudge';
import { DrawerSidebar } from '@/components/layout/drawer';
import { AppLink } from '@/components/ui/AppLink';
import { headerMobileSearchReveal } from '@/config/layout/header-utility-bar.config';
import { layoutTokens } from '@/config/theme';
import { useAuth } from '@/hooks/auth/useAuth';
import { useCartStats } from '@/hooks/cart/useCartStats';
import { useAfterHydration } from '@/hooks/useAfterHydration';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useRevealOnScrollUp } from '@/hooks/useRevealOnScrollUp';
import { shouldShowHeaderDropShadow } from '@/lib/layout/header-utility-bar';
import { groupMegaMenuColumns, resolveMegaMenuVariant } from '@/lib/layout/mega-menu';
import {
  resolveLayoutIconSources,
  resolveLayoutImageSources,
  resolveMediaUrl,
} from '@/lib/utils/cms-media';
import type { CmsAnnouncementBarViewModel } from '@/lib/utils/cms-page-layouts';
import { cn } from '@/lib/utils/cn';
import {
  applyTabOverflow,
  buildHeaderRows,
  buildItemTree,
  headerItemLabel,
  headerRootStyle,
  isTabItem,
  isUtilityItem,
  justifyClass,
  resolveHeaderTheme,
  resolveLayoutItemHref,
  shouldUseMultiRowLayout,
} from '@/lib/utils/header';
// import { shouldPrefetchAppRoute } from '@/lib/navigation/static-app-routes';
import type { HeaderConfig, HeaderRowShell, LayoutItem } from '@/types/layout';
import type { SearchSuggestions } from '@/types/search-suggestions';

const megaMenuTheme = layoutTokens.megaMenu;
const headerNavInteractiveClass = layoutTokens.headerNav.interactiveClass;
const headerNavDropdownItemClass = layoutTokens.headerNav.dropdownItemClass;
/** Top-nav trigger chrome shared by mini/large/more menus. */
const headerNavTriggerClass = cn(
  'inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-[var(--header-link)]',
  headerNavInteractiveClass,
);

interface HeaderRendererProps {
  config: HeaderConfig;
  items: LayoutItem[];
  rows?: HeaderRowShell[];
  platform?: 'web' | 'app';
  className?: string;
  suggestions: SearchSuggestions;
  /** When false, skip the static placeholder bar (shell announcement bars render via `cmsAnnouncementBars`). */
  showDefaultAnnouncementBar?: boolean;
  /** CMS shell announcement bars — rendered in-flow above the sticky pin (PW-853). */
  cmsAnnouncementBars?: CmsAnnouncementBarViewModel[];
}

function isVisibleForPlatform(item: LayoutItem, platform: 'web' | 'app'): boolean {
  if (item.is_visible === false) {
    return false;
  }

  const key = platform === 'app' ? 'app' : 'web';
  return item.visibility?.[key] !== false;
}

function isVisibleForAuth(item: LayoutItem, isAuthenticated: boolean): boolean {
  const auth = item.extra_metadata?.auth;

  if (!auth || typeof auth !== 'object') {
    return true;
  }

  const authMeta = auth as { requires_auth?: boolean; guest_only?: boolean };

  if (authMeta.requires_auth === true && !isAuthenticated) {
    return false;
  }

  if (authMeta.guest_only === true && isAuthenticated) {
    return false;
  }

  return true;
}

function filterItems(
  list: LayoutItem[],
  platform: 'web' | 'app',
  isAuthenticated: boolean,
): LayoutItem[] {
  return list
    .filter(
      (item) => isVisibleForPlatform(item, platform) && isVisibleForAuth(item, isAuthenticated),
    )
    .map((item) => ({
      ...item,
      children: item.children ? filterItems(item.children, platform, isAuthenticated) : [],
    }))
    .filter((item) => {
      if (item.item_type === 'more') {
        return true;
      }

      if (['mini_menu', 'large_page'].includes(item.item_type || '')) {
        return (item.children?.length ?? 0) > 0;
      }

      return true;
    });
}

interface HeaderItemProps {
  item: LayoutItem;
  className?: string;
  onNavigate?: () => void;
}

function HeaderLink({ item, className, onNavigate }: HeaderItemProps) {
  const label = headerItemLabel(item);
  const href = resolveLayoutItemHref(item);
  const subtitle =
    typeof item.extra_metadata?.subtitle === 'string' ? item.extra_metadata.subtitle : null;
  const badge = typeof item.extra_metadata?.badge === 'string' ? item.extra_metadata.badge : null;
  const linkClass = cn(
    'inline-flex items-center gap-1 text-[var(--header-link)]',
    headerNavInteractiveClass,
    className,
  );

  const content = (
    <>
      <span>{label}</span>
      {subtitle ? <span className="text-xs opacity-70">{subtitle}</span> : null}
      {badge ? (
        <span className="rounded bg-amber-400 px-1 py-0.5 text-[10px] font-bold text-amber-950 uppercase">
          {badge}
        </span>
      ) : null}
    </>
  );

  if (!href) {
    return <span className={linkClass}>{content}</span>;
  }

  if (href.startsWith('http')) {
    return (
      <a
        href={href}
        className={linkClass}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNavigate}
      >
        {content}
      </a>
    );
  }

  return (
    <AppLink href={href} prefetch={false} className={linkClass} onClick={onNavigate}>
      {content}
    </AppLink>
  );
}

function HeaderLogo({ item }: { item: LayoutItem }) {
  const label = headerItemLabel(item) || 'Palmonas';
  const href = resolveLayoutItemHref(item) ?? '/';
  const imageUrl =
    item.resolved_image_url ?? item.image_url ?? item.resolved_icon_url ?? item.icon_url;
  const imageSources = resolveLayoutImageSources(item);
  const iconSources = resolveLayoutIconSources(item);
  const sources = imageSources.length > 0 ? imageSources : iconSources;
  const fallbackUrl = imageUrl ?? resolveMediaUrl(sources[0] ?? {});

  return (
    <AppLink
      href={href.startsWith('http') ? '/' : href}
      className="font-display tracking-palmonas-wide mobile:text-xl shrink-0 text-lg text-[var(--header-text)]"
      aria-label={`${label} home`}
    >
      {fallbackUrl ? (
        <CmsMedia
          url={fallbackUrl}
          sources={sources}
          alt=""
          className="h-8 w-auto max-w-[140px] object-contain"
        />
      ) : (
        label
      )}
    </AppLink>
  );
}

function HeaderCartButton({ item }: { item: LayoutItem }) {
  const badgesReady = useAfterHydration();
  const { cartCount, cartCountHydrated } = useCartStats();
  const href = resolveLayoutItemHref(item) ?? '/cart';
  const label = headerItemLabel(item) || 'Cart';
  const count = badgesReady && cartCountHydrated ? cartCount : 0;
  const hasCartBadge =
    item.extra_metadata?.dynamic &&
    typeof item.extra_metadata.dynamic === 'object' &&
    'fields' in item.extra_metadata.dynamic &&
    Array.isArray(item.extra_metadata.dynamic.fields) &&
    item.extra_metadata.dynamic.fields.includes('cart_count');

  return (
    <AppLink
      href={href}
      data-cart-fly-target="header"
      className="relative inline-flex h-9 min-w-9 items-center justify-center rounded-md p-2 text-[var(--header-link)] transition-colors hover:bg-black/5 hover:text-amber-700"
      aria-label={count > 0 ? `${label}, ${count} items` : label}
    >
      <ShoppingCart className="h-5 w-5" aria-hidden="true" />
      {hasCartBadge && count > 0 ? (
        <span
          data-nav-count-badge
          className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-stone-950 text-[10px] font-bold text-white"
        >
          {count}
        </span>
      ) : null}
    </AppLink>
  );
}

function HeaderProfileButton({ showAccount }: { item: LayoutItem; showAccount: boolean }) {
  if (showAccount === false) {
    return null;
  }

  return <HeaderAuthMenu />;
}

const HEADER_DROPDOWN_CLOSE_DELAY_MS = 200;

function useHeaderDropdown() {
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleMouseEnter = () => {
    clearCloseTimer();
    setOpen(true);
  };

  const handleMouseLeave = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = null;
    }, HEADER_DROPDOWN_CLOSE_DELAY_MS);
  };

  const toggle = () => setOpen((value) => !value);

  return { open, handleMouseEnter, handleMouseLeave, toggle };
}

const headerDropdownPanelClass =
  'shadow-palmonas-soft z-dropdown absolute top-full left-0 pt-1 before:absolute before:-top-1 before:right-0 before:left-0 before:h-1 before:content-[""]';

function HeaderMiniMenu({ item, onNavigate }: HeaderItemProps) {
  const { open, handleMouseEnter, handleMouseLeave, toggle } = useHeaderDropdown();
  const children = item.children ?? [];

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        type="button"
        className={headerNavTriggerClass}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={toggle}
      >
        {headerItemLabel(item)}
        <ChevronDown
          className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>
      {open && children.length > 0 ? (
        <div
          className={cn(
            headerDropdownPanelClass,
            'min-w-[180px] rounded-lg border border-[var(--header-border)] bg-white py-1 text-stone-900',
          )}
        >
          {children.map((child) => (
            <HeaderDropdownChild key={child.id} item={child} onNavigate={onNavigate} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function HeaderDropdownChild({ item, onNavigate }: HeaderItemProps) {
  if (item.item_type === 'divider') {
    return <hr className="my-1 border-stone-200" />;
  }

  if (item.item_type === 'mini_menu') {
    return (
      <div className="px-2 py-1">
        <p className="px-2 py-1 text-xs font-semibold text-stone-500 uppercase">
          {headerItemLabel(item)}
        </p>
        {(item.children ?? []).map((child) => (
          <HeaderDropdownChild key={child.id} item={child} onNavigate={onNavigate} />
        ))}
      </div>
    );
  }

  return (
    <div className="px-1 py-0.5">
      <HeaderLink
        item={item}
        className={cn(headerNavDropdownItemClass, 'text-sm text-stone-800')}
        onNavigate={onNavigate}
      />
    </div>
  );
}

function MegaMenuSection({
  item,
  linkColor,
  onNavigate,
}: {
  item: LayoutItem;
  linkColor: string;
  onNavigate?: () => void;
}) {
  const nestedMenus = (item.children ?? []).filter((child) => child.item_type === 'mini_menu');
  const links = (item.children ?? []).filter((child) => child.item_type !== 'mini_menu');

  if (item.item_type === 'link') {
    return (
      <div className={megaMenuTheme.sectionClass}>
        <HeaderLink
          item={item}
          className={cn(
            megaMenuTheme.linkClass,
            headerNavInteractiveClass,
            'text-inherit hover:no-underline',
          )}
          onNavigate={onNavigate}
        />
      </div>
    );
  }

  if (nestedMenus.length > 0) {
    return (
      <div className={megaMenuTheme.stackClass}>
        {nestedMenus.map((menu) => (
          <MegaMenuSection
            key={menu.id}
            item={menu}
            linkColor={linkColor}
            onNavigate={onNavigate}
          />
        ))}
        {links.length > 0 ? (
          <ul className={cn(megaMenuTheme.listClass, 'mt-0')}>
            {links.map((link) => (
              <li key={link.id} className="w-full">
                <HeaderLink
                  item={link}
                  className={cn(
                    megaMenuTheme.linkClass,
                    headerNavInteractiveClass,
                    'text-inherit hover:no-underline',
                  )}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  }

  return (
    <div className={megaMenuTheme.sectionClass}>
      <p
        className={megaMenuTheme.headingClass}
        style={{
          color: megaMenuTheme.heading,
          borderColor: megaMenuTheme.headingBorder,
        }}
      >
        {headerItemLabel(item)}
      </p>
      <ul className={megaMenuTheme.listClass}>
        {links.map((link) => (
          <li key={link.id} className="w-full" style={{ color: linkColor }}>
            <HeaderLink
              item={link}
              className={cn(
                megaMenuTheme.linkClass,
                headerNavInteractiveClass,
                'text-inherit hover:no-underline',
              )}
              onNavigate={onNavigate}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function HeaderLargePage({ item, onNavigate }: HeaderItemProps) {
  const { open, handleMouseEnter, handleMouseLeave, toggle } = useHeaderDropdown();
  const columns = (item.children ?? []).filter(
    (child) => child.item_type === 'mini_menu' || child.item_type === 'link',
  );
  const variant = resolveMegaMenuVariant(columns.length);
  const gridColumns = groupMegaMenuColumns(columns);
  const linkColor = variant === 'wide' ? megaMenuTheme.linkWide : megaMenuTheme.linkCompact;
  const isWide = variant === 'wide';

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        type="button"
        className={headerNavTriggerClass}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={toggle}
      >
        {headerItemLabel(item)}
        <ChevronDown
          className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>
      {open && gridColumns.length > 0 ? (
        <div className={cn(headerDropdownPanelClass, 'shadow-none', isWide && 'left-1/2 w-screen')}>
          <div
            className={cn(
              'shadow-palmonas-soft',
              isWide ? megaMenuTheme.panelClassWide : megaMenuTheme.panelClassCompact,
            )}
            style={{ backgroundColor: megaMenuTheme.panelBg, color: linkColor }}
          >
            <div
              className={
                isWide ? megaMenuTheme.columnsClassWide : megaMenuTheme.columnsClassCompact
              }
            >
              {gridColumns.map((sections) => (
                <div
                  key={sections.map((section) => section.id).join('-')}
                  className={megaMenuTheme.stackClass}
                >
                  {sections.map((section) => (
                    <MegaMenuSection
                      key={section.id}
                      item={section}
                      linkColor={linkColor}
                      onNavigate={onNavigate}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function HeaderMore({
  item,
  overflowTabs,
  onNavigate,
}: HeaderItemProps & { overflowTabs: LayoutItem[] }) {
  const { open, handleMouseEnter, handleMouseLeave, toggle } = useHeaderDropdown();
  const children = [...(item.children ?? []), ...overflowTabs];

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        type="button"
        className={headerNavTriggerClass}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={toggle}
      >
        {headerItemLabel(item)}
        <ChevronDown
          className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>
      {open && children.length > 0 ? (
        <div
          className={cn(
            headerDropdownPanelClass,
            'min-w-[160px] rounded-lg border border-[var(--header-border)] bg-white py-1',
          )}
        >
          {children.map((child) => (
            <div key={child.id} className="px-1 py-0.5">
              <HeaderLink
                item={child}
                className={cn(headerNavDropdownItemClass, 'text-sm text-stone-800')}
                onNavigate={onNavigate}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function HeaderTab({
  item,
  overflowTabs,
  onNavigate,
}: HeaderItemProps & { overflowTabs?: LayoutItem[] }) {
  const type = item.item_type || '';

  if (type === 'link') {
    return (
      <HeaderLink item={item} className="px-3 py-2 text-xs font-semibold" onNavigate={onNavigate} />
    );
  }

  if (type === 'mini_menu') {
    return <HeaderMiniMenu item={item} onNavigate={onNavigate} />;
  }

  if (type === 'large_page') {
    return <HeaderLargePage item={item} onNavigate={onNavigate} />;
  }

  if (type === 'more') {
    return <HeaderMore item={item} overflowTabs={overflowTabs ?? []} onNavigate={onNavigate} />;
  }

  return null;
}

function HeaderUtility({
  item,
  config,
  suggestions,
}: {
  item: LayoutItem;
  config: HeaderConfig;
  suggestions: SearchSuggestions;
}) {
  const type = item.item_type || '';

  if (type === 'logo') {
    return <HeaderLogo item={item} />;
  }

  if (type === 'search') {
    if (config.show_search === false) {
      return null;
    }

    return <HeaderSearch suggestions={suggestions} className="laptop:w-[20vw]" />;
  }

  if (type === 'cart') {
    if (config.show_cart === false) {
      return null;
    }

    return <HeaderCartButton item={item} />;
  }

  if (type === 'profile') {
    return <HeaderProfileButton item={item} showAccount={config.show_account !== false} />;
  }

  if (type === 'social') {
    const href = resolveLayoutItemHref(item);
    const icon = <Share2 className="h-4 w-4" aria-hidden="true" />;

    if (href) {
      return (
        <a
          href={href}
          className="rounded-md p-2 text-[var(--header-link)] transition-colors hover:bg-black/5"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={headerItemLabel(item) || 'Social'}
        >
          {icon}
        </a>
      );
    }

    return (
      <span className="rounded-md p-2 text-[var(--header-link)]" aria-hidden="true">
        {icon}
      </span>
    );
  }

  if (type === 'divider') {
    return (
      <div
        className="mx-1 h-6 w-px bg-current opacity-20"
        style={{ color: 'var(--header-text)' }}
        aria-hidden="true"
      />
    );
  }

  if (type === 'spacer') {
    return <div className="laptop:min-w-4 min-w-0" aria-hidden="true" />;
  }

  if (type === 'link') {
    return <HeaderLink item={item} className="text-sm" />;
  }

  return null;
}

function renderRowItem(
  item: LayoutItem,
  config: HeaderConfig,
  suggestions: SearchSuggestions,
  overflowTabs?: LayoutItem[],
  onNavigate?: () => void,
): ReactNode {
  if (isUtilityItem(item)) {
    return <HeaderUtility key={item.id} item={item} config={config} suggestions={suggestions} />;
  }

  if (isTabItem(item)) {
    return (
      <HeaderTab
        key={item.id}
        item={item}
        overflowTabs={item.item_type === 'more' ? overflowTabs : undefined}
        onNavigate={onNavigate}
      />
    );
  }

  if (item.item_type === 'link') {
    return <HeaderLink key={item.id} item={item} className="text-sm" onNavigate={onNavigate} />;
  }

  return null;
}

interface HeaderRowProps {
  row: HeaderRowShell;
  config: HeaderConfig;
  suggestions: SearchSuggestions;
  isNavRow?: boolean;
}

function HeaderRow({ row, config, suggestions, isNavRow = false }: HeaderRowProps) {
  const { items: rowItems, overflowTabs } = applyTabOverflow(row.items, config.max_visible_tabs);

  const rowStyle: CSSProperties = {
    backgroundColor: row.background_color ?? undefined,
    borderBottom: row.border_bottom_color ? `1px solid ${row.border_bottom_color}` : undefined,
    minHeight: row.min_height_px ? `${row.min_height_px}px` : undefined,
    paddingTop: row.padding?.top,
    paddingRight: row.padding?.right,
    paddingBottom: row.padding?.bottom,
    paddingLeft: row.padding?.left,
    gap: row.gap_px ? `${row.gap_px}px` : undefined,
  };

  return (
    <div className="laptop:block relative hidden">
      <div
        className={cn(
          'relative flex w-full items-center px-[15vw]',
          justifyClass(row.justify),
          row.wrap ? 'flex-wrap' : 'flex-nowrap',
        )}
        style={{ ...rowStyle, minHeight: rowStyle.minHeight ?? (isNavRow ? '2.75rem' : '3.5rem') }}
      >
        {isNavRow ? (
          <nav className="contents min-w-0 items-center" aria-label="Main navigation">
            {rowItems.map((item) => renderRowItem(item, config, suggestions, overflowTabs))}
          </nav>
        ) : (
          rowItems.map((item) => renderRowItem(item, config, suggestions, overflowTabs))
        )}
      </div>
    </div>
  );
}

export function HeaderRenderer({
  config,
  items,
  rows: shellRows,
  platform = 'web',
  className = '',
  suggestions,
  showDefaultAnnouncementBar = true,
  cmsAnnouncementBars = [],
}: HeaderRendererProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();
  const showHeaderDropShadow = shouldShowHeaderDropShadow(pathname);
  const { isAuthenticated } = useAuth();
  const isLaptop = useMediaQuery('laptop');
  const isHeaderSticky = config.sticky !== false;
  const searchChromeVisibility = useRevealOnScrollUp({
    enabled: isHeaderSticky && !isLaptop && !mobileNavOpen,
    snap: true,
    offset: headerMobileSearchReveal.offset,
    tolerance: headerMobileSearchReveal.tolerance,
    hideDistance: headerMobileSearchReveal.hideDistance,
    revealDistance: headerMobileSearchReveal.revealDistance,
    settleMs: headerMobileSearchReveal.settleMs,
  });
  const navSectionRef = useRef<HTMLDivElement>(null);
  const tree = useMemo(() => buildItemTree(items), [items]);
  const visible = useMemo(
    () => filterItems(tree, platform, isAuthenticated),
    [tree, platform, isAuthenticated],
  );

  const theme = useMemo(() => resolveHeaderTheme(config), [config]);
  const rootStyle = useMemo(() => headerRootStyle(theme), [theme]) as CSSProperties;
  const headerStyle = useMemo(
    () =>
      showHeaderDropShadow
        ? rootStyle
        : { ...rootStyle, backgroundColor: 'white', borderColor: 'transparent' },
    [showHeaderDropShadow, rootStyle],
  );
  const useRows = shouldUseMultiRowLayout(items, config) || (shellRows?.length ?? 0) > 0;

  const headerRows = useMemo(() => {
    if (shellRows?.length) {
      return shellRows.map((row) => ({
        ...row,
        items: filterItems(row.items, platform, isAuthenticated),
      }));
    }

    if (useRows) {
      return buildHeaderRows(visible, config);
    }

    return [];
  }, [shellRows, useRows, visible, config, platform, isAuthenticated]);

  const legacyLayout = useMemo(() => {
    const rootTabs = visible.filter(isTabItem);
    const utilities = visible.filter(isUtilityItem);
    const logo = utilities.find((item) => item.item_type === 'logo');
    const otherUtilities = utilities.filter((item) => item.item_type !== 'logo');
    const maxTabs = config.max_visible_tabs ?? rootTabs.length;
    const tabItems = rootTabs.filter((item) => item.item_type !== 'more');
    const moreItem = rootTabs.find((item) => item.item_type === 'more');
    const inlineTabs = tabItems.slice(0, maxTabs);
    const overflowTabs = tabItems.slice(maxTabs);
    const tabsToRender = moreItem ? [...inlineTabs, moreItem] : [...inlineTabs, ...overflowTabs];

    return { logo, otherUtilities, tabsToRender, overflowTabs, moreItem };
  }, [visible, config.max_visible_tabs]);

  const rowsToRender = useMemo(() => {
    if (headerRows.length === 0) {
      return headerRows;
    }

    const navRows = headerRows.filter((row) => row.items.some(isTabItem));

    return navRows.length > 0 ? navRows : headerRows;
  }, [headerRows]);

  const handleMobileMenuToggle = () => {
    setMobileNavOpen((current) => !current);
  };

  const navigation =
    useRows && rowsToRender.length > 0 ? (
      rowsToRender.map((row) => (
        <HeaderRow
          key={row.row}
          row={row}
          config={config}
          suggestions={suggestions}
          isNavRow={row.row === 1 || row.items.some(isTabItem)}
        />
      ))
    ) : (
      <div className="laptop:block relative hidden">
        <div
          className="mobile:h-16 laptop:min-h-[2.75rem] relative container flex h-14 w-full items-center justify-evenly"
          style={{ minHeight: '3.5rem' }}
        >
          <nav className="contents items-center" aria-label="Main navigation">
            {legacyLayout.tabsToRender.map((tab) => (
              <HeaderTab
                key={tab.id}
                item={tab}
                overflowTabs={tab.item_type === 'more' ? legacyLayout.overflowTabs : undefined}
              />
            ))}
          </nav>
        </div>
      </div>
    );

  const hasCmsAnnouncementBars = cmsAnnouncementBars.length > 0;

  return (
    <>
      {/* <MobileAppDownloadNudge /> */}
      <div data-testid="header-announcement-region">
        {hasCmsAnnouncementBars ? <CmsAnnouncementBars bars={cmsAnnouncementBars} /> : null}
        {!hasCmsAnnouncementBars && showDefaultAnnouncementBar ? <AnnouncementBar /> : null}
      </div>
      <header
        className={cn(
          'z-sticky w-full',
          showHeaderDropShadow
            ? 'border-b shadow-[0_2px_2px_rgba(0,0,0,0.1)] backdrop-blur-md'
            : 'bg-white',
          // Native sticky like prototype — announcement scrolls away; pin docks at top (PW-853).
          isHeaderSticky && 'sticky top-0',
          className,
        )}
        style={headerStyle}
        aria-label="Site header"
      >
        <HeaderDesktopUtilityBar
          suggestions={suggestions}
          mobileMenuOpen={mobileNavOpen}
          onMobileMenuToggle={handleMobileMenuToggle}
          searchChromeVisibility={isLaptop ? 1 : searchChromeVisibility}
        />
        <DrawerSidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

        <div
          className="overflow-visible"
          aria-hidden={false}
          data-testid="header-nav-collapse"
          ref={navSectionRef}
        >
          {navigation}
        </div>
      </header>
    </>
  );
}
