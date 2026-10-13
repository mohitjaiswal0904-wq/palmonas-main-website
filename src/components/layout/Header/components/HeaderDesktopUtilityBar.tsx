'use client';

import { ShoppingCart, X } from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from 'react';

import { HeaderAuthMenu } from '@/components/auth/HeaderAuthMenu';
import { HeartMenu, MapPincode, MenuIcon, SearchIcon, StoreHeader } from '@/components/icons';
import { CartBackIcon } from '@/components/icons/cart-icons';
import { HeaderSearch } from '@/components/layout/HeaderSearch';
import { buildNavCountAriaLabel, NavCountBadge } from '@/components/layout/NavCountBadge';
import { AppLink } from '@/components/ui/AppLink';
import { cartMessages } from '@/config/cart/cart.config';
import {
  headerUtilityBarMessages,
  type HeaderUtilityBarVisibility,
} from '@/config/layout/header-utility-bar.config';
import { useCartStats } from '@/hooks/cart/useCartStats';
import { useAfterHydration } from '@/hooks/useAfterHydration';
import { CART_FLY_TARGET_ID } from '@/lib/cart/add-to-cart-flight';
import {
  resolveHeaderBackNavTitle,
  resolveHeaderUtilityBarVisibility,
  shouldShowHeaderDropShadow,
} from '@/lib/layout/header-utility-bar';
import {
  getPdpMobileHeaderTitle,
  subscribePdpMobileHeaderTitle,
} from '@/lib/layout/pdp-mobile-header-title';
import {
  getSearchDraftQuery,
  setSearchDraftQuery,
  subscribeSearchDraftQuery,
} from '@/lib/search/search-draft-query';
import { requestSearchMobileSlideExit } from '@/lib/search/search-mobile-slide';
import {
  captureSearchReturnPathFromLocation,
  consumeSearchReturnPath,
} from '@/lib/search/search-return-path';
import { cn } from '@/lib/utils/cn';
import { normalizeSearchQuery } from '@/lib/utils/search-query';
import { buildSearchPagePath } from '@/lib/utils/search-search-params';
import { useDeliveryPincode } from '@/providers/PincodeProvider';
import type { SearchSuggestions } from '@/types/search-suggestions';

const HEADER_BACK_FALLBACK_MS = 150;
const HEADER_BACK_FALLBACK_HREF = '/';
const MOBILE_SEARCH_FIELD_ID = 'header-mobile-search-field';

const DESKTOP_HEADER_LOGO_SRC =
  'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/07/Frame%202613859-189051b5.webp';

interface HeaderDesktopUtilityBarProps {
  className?: string;
  mobileMenuOpen?: boolean;
  onMobileMenuToggle?: () => void;
  suggestions: SearchSuggestions;
  /**
   * Mobile search-row visibility (1 = expanded). Desktop ignores and always shows search inline.
   * Driven by scroll reveal in HeaderRenderer (PW-853).
   */
  searchChromeVisibility?: number;
}

type UtilityBarBreakpoint = 'mobile' | 'laptop';

interface HeaderUtilityBarActionsProps {
  breakpoint: UtilityBarBreakpoint;
  visibility: HeaderUtilityBarVisibility;
  cartBadgeCount: number;
  showCartBadge: boolean;
  wishlistBadgeCount: number;
  showWishlistBadge: boolean;
  /** Search/wishlist Figma: 24px icons. Home/collection keep the smaller set. */
  useInternalIconSize?: boolean;
}

function HeaderCountBadge({ count }: { count: number }) {
  return <NavCountBadge count={count} />;
}

/**
 * Prefer history back; fall back to home when back does not leave the current route.
 *
 * @param router - Next.js app router.
 */
function navigateHeaderBack(router: ReturnType<typeof useRouter>): void {
  if (typeof window === 'undefined') {
    router.push(HEADER_BACK_FALLBACK_HREF);
    return;
  }

  const pathBefore = `${window.location.pathname}${window.location.search}`;

  if (window.history.length > 1) {
    router.back();
    window.setTimeout(() => {
      const pathAfter = `${window.location.pathname}${window.location.search}`;
      if (pathAfter === pathBefore) {
        router.push(HEADER_BACK_FALLBACK_HREF);
      }
    }, HEADER_BACK_FALLBACK_MS);
    return;
  }

  router.push(HEADER_BACK_FALLBACK_HREF);
}

/**
 * Prefer history back so the previous page (home/PDP) restores from the soft cache.
 * Falls back to the stored return path when back does not leave `/search`.
 *
 * @param router - Next.js app router.
 * @param returnPath - Captured origin path from when search opened.
 */
function navigateSearchBack(router: ReturnType<typeof useRouter>, returnPath: string): void {
  if (typeof window === 'undefined') {
    router.replace(returnPath);
    return;
  }

  const pathBefore = `${window.location.pathname}${window.location.search}`;

  if (window.history.length > 1) {
    router.back();
    window.setTimeout(() => {
      const pathAfter = `${window.location.pathname}${window.location.search}`;
      if (pathAfter === pathBefore || pathAfter.startsWith('/search')) {
        router.replace(returnPath);
      }
    }, HEADER_BACK_FALLBACK_MS);
    return;
  }

  router.replace(returnPath);
}

interface HeaderMobileBackNavProps {
  title?: string;
}

/**
 * Mobile left chrome: back control + optional route title (e.g. Wishlist).
 */
function HeaderMobileBackNav({ title: routeTitle }: HeaderMobileBackNavProps) {
  const router = useRouter();
  const productTitle = useSyncExternalStore(
    subscribePdpMobileHeaderTitle,
    getPdpMobileHeaderTitle,
    () => '',
  );
  const title = routeTitle ?? productTitle;

  return (
    <div className="flex min-w-0 flex-1 items-center">
      <button
        type="button"
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-white text-[#121212]"
        aria-label={headerUtilityBarMessages.a11y.goBack}
        onClick={() => {
          navigateHeaderBack(router);
        }}
      >
        <CartBackIcon className="h-4 w-4" />
      </button>
      {title ? <p className="min-w-0 flex-1 truncate text-base text-[#151515]">{title}</p> : null}
    </div>
  );
}

/**
 * Mobile search-page chrome: back + rounded search field (Figma 2704:55557).
 * Empty and results both keep the field; X clears, back leaves search.
 */
function HeaderSearchMobileNavField() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q') ?? '';
  const [value, setValue] = useState(urlQuery);
  const [syncedQuery, setSyncedQuery] = useState(urlQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef(urlQuery);
  const draftQuery = useSyncExternalStore(
    subscribeSearchDraftQuery,
    getSearchDraftQuery,
    () => urlQuery,
  );

  // Realign the field with the URL when a search navigation lands (not on every keystroke).
  if (syncedQuery !== urlQuery) {
    setSyncedQuery(urlQuery);
    setValue(urlQuery);
    setSearchDraftQuery(urlQuery);
  }

  // Publish the URL query on mount/search-nav so the page can tell typing from results.
  useEffect(() => {
    setSearchDraftQuery(urlQuery);

    return () => {
      setSearchDraftQuery('');
    };
  }, [urlQuery]);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Apply suggestion terms written from the search-page panel.
  useEffect(() => {
    if (draftQuery === valueRef.current) {
      return;
    }

    setValue(draftQuery);
  }, [draftQuery]);

  // Focus the field when search chrome mounts (home search entry → /search).
  useEffect(() => {
    const input = inputRef.current;
    if (!input) {
      return undefined;
    }

    const frame = requestAnimationFrame(() => {
      input.focus({ preventScroll: true });
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  /** Submit the current query to the search results page. */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedQuery = normalizeSearchQuery(value);

    if (!normalizedQuery) {
      router.replace('/search');
      return;
    }

    router.replace(buildSearchPagePath(normalizedQuery, {}, 'featured'));
  }

  /** Clear the field and return to the bare search page. */
  function handleClear() {
    setValue('');
    setSearchDraftQuery('');
    router.replace('/search');
  }

  const hasValue = value.trim().length > 0;

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <button
        type="button"
        className="inline-flex h-10 w-[26px] shrink-0 items-center justify-center text-[#121212]"
        aria-label={headerUtilityBarMessages.a11y.goBack}
        onClick={() =>
          requestSearchMobileSlideExit(() => {
            navigateSearchBack(router, consumeSearchReturnPath());
          })
        }
      >
        <CartBackIcon className="h-4 w-4" />
      </button>

      <form
        className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#E6E6E6] bg-[rgba(246,246,246,0.3)] px-3 py-2"
        onSubmit={handleSubmit}
      >
        <label htmlFor={MOBILE_SEARCH_FIELD_ID} className="sr-only">
          {headerUtilityBarMessages.a11y.searchField}
        </label>
        <input
          ref={inputRef}
          id={MOBILE_SEARCH_FIELD_ID}
          type="search"
          inputMode="search"
          value={value}
          onChange={(event) => {
            const nextValue = event.target.value;
            setValue(nextValue);
            setSearchDraftQuery(nextValue);
          }}
          placeholder={headerUtilityBarMessages.labels.searchPlaceholder}
          className="min-w-0 flex-1 bg-transparent text-[13px] leading-normal text-[#151515] capitalize outline-none placeholder:text-[13px] placeholder:leading-normal placeholder:text-[#c7c7c7] placeholder:capitalize [&::-webkit-search-cancel-button]:hidden"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          autoFocus
        />
        {hasValue ? (
          <button
            type="button"
            className="inline-flex size-[19px] shrink-0 items-center justify-center text-[#151515]"
            aria-label={headerUtilityBarMessages.a11y.clearSearch}
            onClick={handleClear}
          >
            <X className="size-[9px]" strokeWidth={2.5} aria-hidden="true" />
          </button>
        ) : (
          <button
            type="submit"
            className="inline-flex size-[19px] shrink-0 items-center justify-center text-[#151515]"
            aria-label={headerUtilityBarMessages.a11y.submitSearch}
          >
            <SearchIcon className="size-[19px]" aria-hidden="true" />
          </button>
        )}
      </form>
    </div>
  );
}

function HeaderSearchMobileNav() {
  return (
    <Suspense
      fallback={
        <div className="flex min-w-0 flex-1 items-center gap-3" aria-hidden="true">
          <div className="h-10 w-[26px] shrink-0" />
          <div className="h-10 min-w-0 flex-1 rounded-xl border border-[#E6E6E6] bg-[rgba(246,246,246,0.3)]" />
        </div>
      }
    >
      <HeaderSearchMobileNavField />
    </Suspense>
  );
}

/**
 * Mobile home/header search entry — opens `/search` instead of the desktop dropdown.
 */
function HeaderMobileSearchPageEntry() {
  return (
    <AppLink
      href="/search"
      className="border-palmonas-border bg-palmonas-surface text-palmonas-ink relative flex h-9 w-full items-center rounded-lg border pr-9 pl-3"
      aria-label={headerUtilityBarMessages.a11y.searchField}
      onClick={() => {
        captureSearchReturnPathFromLocation();
      }}
    >
      <span className="truncate text-[13px] leading-normal text-[#c7c7c7] capitalize">
        {headerUtilityBarMessages.labels.homeSearchPlaceholder}
      </span>
      <span
        className="absolute top-1/2 right-3 flex h-7 w-7 -translate-y-1/2 items-center justify-center"
        aria-hidden="true"
      >
        <SearchIcon className="text-palmonas-subtle h-4 w-4" />
      </span>
    </AppLink>
  );
}

function HeaderUtilityBarPincodeRow({
  breakpoint,
  displayPincode,
  onOpenModal,
}: {
  breakpoint: UtilityBarBreakpoint;
  displayPincode: string | null;
  onOpenModal: () => void;
}) {
  const isMobile = breakpoint === 'mobile';

  return (
    <div className={cn('flex items-center', isMobile ? 'gap-1.5 px-4 pb-3' : 'gap-1')}>
      <MapPincode
        className={cn('shrink-0 text-stone-900', isMobile ? 'h-[0.72rem] w-[0.72rem]' : undefined)}
        aria-hidden="true"
      />
      <button
        type="button"
        className={cn(
          'text-stone-900 transition-colors hover:text-amber-700',
          isMobile ? 'text-xxs tab:text-sm' : 'text-xxs',
        )}
        aria-label={displayPincode ? 'Update delivery pincode' : 'Enter delivery pincode'}
        onClick={onOpenModal}
      >
        {displayPincode ? 'Update Pincode' : 'Enter Pincode'}
      </button>
      {displayPincode ? (
        <span
          className={cn(
            'bg-gradient-to-r from-[rgba(255,204,188,0.5)] to-[rgba(255,255,255,0.5)] text-stone-900',
            isMobile
              ? 'tab:!py-1 rounded-md px-1.5 !py-0 py-1 text-[0.52rem]'
              : 'rounded-lg px-2 py-1 text-xs',
          )}
        >
          <span className={cn('font-medium italic', !isMobile && 'text-xxs')}>Delivering to </span>
          <span className={cn('font-bold italic', !isMobile && 'text-xxs font-semibold')}>
            {displayPincode}
          </span>
        </span>
      ) : null}
    </div>
  );
}

function HeaderUtilityBarActions({
  breakpoint,
  visibility,
  cartBadgeCount,
  showCartBadge,
  wishlistBadgeCount,
  showWishlistBadge,
  useInternalIconSize = false,
}: HeaderUtilityBarActionsProps) {
  const isMobile = breakpoint === 'mobile';
  const mobileIconClass = useInternalIconSize ? 'h-6 w-6' : 'h-5 w-5';
  const hasVisibleAction =
    visibility.showSearchIcon ||
    visibility.showStoreLocator ||
    visibility.showCart ||
    visibility.showWishlist ||
    visibility.showAccount;

  if (!hasVisibleAction) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-end leading-none',
        isMobile ? 'h-6 gap-3' : 'gap-[1.35rem]',
      )}
    >
      {visibility.showSearchIcon ? (
        <AppLink
          href="/search"
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center text-stone-900"
          aria-label={headerUtilityBarMessages.a11y.openSearch}
          onClick={() => {
            captureSearchReturnPathFromLocation();
          }}
        >
          <SearchIcon
            className={cn(isMobile ? mobileIconClass : 'h-6 w-6')}
            strokeWidth={1.25}
            aria-hidden="true"
          />
        </AppLink>
      ) : null}

      {visibility.showStoreLocator ? (
        <AppLink
          href="/palmonas-stores"
          className={cn(
            'inline-flex shrink-0 items-center justify-center text-stone-900',
            isMobile ? 'h-6 w-6' : 'h-5 w-5',
          )}
          aria-label="Store locator"
        >
          <StoreHeader className={cn(isMobile ? 'h-5 w-5' : 'h-7 w-7')} aria-hidden="true" />
        </AppLink>
      ) : null}

      {visibility.showWishlist ? (
        <AppLink
          href="/wishlist"
          className="relative inline-flex h-6 w-6 shrink-0 items-center justify-center text-stone-900"
          aria-label={buildNavCountAriaLabel(
            cartMessages.a11y.openWishlist,
            wishlistBadgeCount,
            showWishlistBadge,
          )}
        >
          <HeartMenu className={cn(isMobile ? mobileIconClass : 'h-8 w-8')} aria-hidden="true" />
          <HeaderCountBadge count={wishlistBadgeCount} />
        </AppLink>
      ) : null}

      {visibility.showAccount ? <HeaderAuthMenu compact={isMobile} /> : null}

      {visibility.showCart ? (
        <AppLink
          id={CART_FLY_TARGET_ID}
          data-cart-fly-target="header"
          href="/cart"
          className={cn(
            'relative inline-flex shrink-0 items-center justify-center text-stone-900',
            isMobile ? 'h-6 w-6' : 'h-5 w-5',
          )}
          aria-label={buildNavCountAriaLabel(
            cartMessages.a11y.openCart,
            cartBadgeCount,
            showCartBadge,
          )}
        >
          <ShoppingCart
            className={cn(isMobile ? mobileIconClass : 'h-5 w-5')}
            strokeWidth={1.25}
            aria-hidden="true"
          />
          <HeaderCountBadge count={cartBadgeCount} />
        </AppLink>
      ) : null}
    </div>
  );
}

export function HeaderDesktopUtilityBar({
  className,
  mobileMenuOpen = false,
  onMobileMenuToggle,
  suggestions,
  searchChromeVisibility = 1,
}: HeaderDesktopUtilityBarProps) {
  const pathname = usePathname();
  const visibility = useMemo(() => resolveHeaderUtilityBarVisibility(pathname), [pathname]);
  const showHeaderElevation = shouldShowHeaderDropShadow(pathname);
  const backNavTitle = resolveHeaderBackNavTitle(pathname);
  const componentHydrated = useAfterHydration();
  const { cartCount, cartCountHydrated, wishlistCount, wishlistCountHydrated } = useCartStats();
  const showCartBadge = componentHydrated && cartCountHydrated;
  const showWishlistBadge = componentHydrated && wishlistCountHydrated;
  const cartBadgeCount = showCartBadge ? cartCount : 0;
  const wishlistBadgeCount = showWishlistBadge ? wishlistCount : 0;
  const { pincode, pincodeHydrated, openModal } = useDeliveryPincode();
  const displayPincode = componentHydrated && pincodeHydrated ? pincode : null;
  const searchExpanded = searchChromeVisibility >= 1;
  const searchCollapsed = searchChromeVisibility <= 0.05;

  const actionProps = {
    cartBadgeCount,
    showCartBadge,
    wishlistBadgeCount,
    showWishlistBadge,
  };

  return (
    <div className={cn('bg-white', showHeaderElevation && 'border-b border-stone-100', className)}>
      <div className="laptop:hidden">
        <div
          className={cn('flex items-center gap-3 px-4', showHeaderElevation ? 'py-3' : 'pt-5 pb-3')}
        >
          {visibility.mobile.showBackNav ? (
            visibility.mobile.showMobileSearchField ? (
              <HeaderSearchMobileNav />
            ) : (
              <HeaderMobileBackNav title={backNavTitle} />
            )
          ) : (
            <div className="flex min-w-0 flex-1 items-center gap-1.5">
              <button
                type="button"
                className="inline-flex shrink-0 items-center justify-center p-1 text-stone-900"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
                aria-controls="header-mobile-navigation"
                onClick={onMobileMenuToggle}
              >
                <MenuIcon className="h-5 w-5" />
              </button>

              <AppLink
                href="/"
                prefetch
                className="font-display tracking-palmonas-wide block w-[137px] max-w-full shrink-0"
                aria-label="Palmonas home"
              >
                <Image
                  src={DESKTOP_HEADER_LOGO_SRC}
                  alt="Palmonas"
                  width={833}
                  height={83}
                  priority
                  className="block h-auto w-full object-contain"
                />
              </AppLink>
            </div>
          )}

          <HeaderUtilityBarActions
            breakpoint="mobile"
            visibility={visibility.mobile}
            useInternalIconSize={!showHeaderElevation}
            {...actionProps}
          />
        </div>
        {visibility.mobile.showSearch ? (
          <div
            data-testid="header-mobile-search-collapse"
            className={cn(
              'grid transition-[grid-template-rows] duration-300 ease-out',
              searchExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
            )}
            aria-hidden={searchCollapsed}
          >
            <div
              className={cn(
                'min-h-0 overflow-hidden transition-opacity duration-300 ease-out',
                searchExpanded ? 'opacity-100' : 'opacity-0',
              )}
            >
              <div className="relative px-4 pt-px pb-2.5">
                <HeaderMobileSearchPageEntry />
              </div>
            </div>
          </div>
        ) : null}
        {visibility.mobile.showPincode ? (
          <HeaderUtilityBarPincodeRow
            breakpoint="mobile"
            displayPincode={displayPincode}
            onOpenModal={openModal}
          />
        ) : null}
      </div>

      <div className="laptop:block hidden px-[2vw]">
        <div className="flex justify-between py-3 pl-12">
          <div className="flex items-center">
            <AppLink
              href="/"
              prefetch
              aria-label="Palmonas home"
              className="relative block w-[11vw] shrink-0"
            >
              <Image
                src={DESKTOP_HEADER_LOGO_SRC}
                alt="Palmonas"
                width={833}
                height={83}
                priority
                className="block h-auto w-full object-contain"
              />
            </AppLink>

            {visibility.laptop.showSearch ? (
              <HeaderSearch suggestions={suggestions} className="ml-[1vw] w-[36vw]" />
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-[1.35rem]">
            {visibility.laptop.showPincode ? (
              <HeaderUtilityBarPincodeRow
                breakpoint="laptop"
                displayPincode={displayPincode}
                onOpenModal={openModal}
              />
            ) : null}

            <HeaderUtilityBarActions
              breakpoint="laptop"
              visibility={visibility.laptop}
              {...actionProps}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
