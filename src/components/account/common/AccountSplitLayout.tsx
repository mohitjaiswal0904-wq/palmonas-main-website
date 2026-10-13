'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

import { AccountBackHeader } from '@/components/account/common/AccountBackHeader';
import { AccountHub } from '@/components/account/common/AccountHub';
import { AccountPanelRenderer } from '@/components/account/common/AccountPanelRenderer';
import { AccountPanelSkeleton } from '@/components/account/common/AccountPanelSkeleton';
import { ACCOUNT_HUB_PAGE_CLASS } from '@/components/account/common/account-layout';
import {
  getAccountPanelHref,
  isAccountNestedDetailPath,
  panelIdFromMenuItemId,
  resolveAccountPanel,
  type AccountPanelId,
} from '@/components/account/common/account-panels';
import {
  ACCOUNT_ROUTES,
  isExternalAccountMenuHref,
} from '@/components/account/common/account-routes';
import { accountMessages } from '@/config/account/account.config';
import { AccountShellNavProvider } from '@/providers/account/AccountShellNavProvider';

/** Minimum time the panel skeleton stays visible so tab switches feel intentional. */
const PANEL_SKELETON_MS = 320;

const ACCOUNT_SHELL_STATE_KEY = '__accountShell';

type AccountShellMarker = 'hub' | 'panel';

interface AccountShellHistoryState {
  [ACCOUNT_SHELL_STATE_KEY]?: AccountShellMarker;
}

interface AccountSplitLayoutProps {
  children: ReactNode;
}

/** Hub page chrome — back + Account title (mobile only; laptop uses site header). */
function AccountHubBackHeader() {
  return (
    <AccountBackHeader
      title={accountMessages.labels.hubTitle}
      backHref="/"
      backLabel={accountMessages.a11y.backFromHub}
      className="laptop:hidden mb-6"
    />
  );
}

/**
 * Read the account-shell history marker from the current history entry.
 */
function getShellMarker(): AccountShellMarker | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const state = window.history.state;
  if (state == null || typeof state !== 'object') {
    return null;
  }

  const marker = (state as AccountShellHistoryState)[ACCOUNT_SHELL_STATE_KEY];
  return marker === 'hub' || marker === 'panel' ? marker : null;
}

/**
 * Merge a shell marker into the current history state object.
 */
function shellHistoryState(marker: AccountShellMarker): AccountShellHistoryState {
  const current = window.history.state;
  const base =
    current != null && typeof current === 'object' && !Array.isArray(current)
      ? (current as AccountShellHistoryState)
      : {};

  return { ...base, [ACCOUNT_SHELL_STATE_KEY]: marker };
}

/**
 * Soft-update the URL without a Next.js RSC navigation (avoids account tab refreshes).
 */
function replaceAccountUrl(href: string, marker: AccountShellMarker): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.history.replaceState(shellHistoryState(marker), '', href);
}

/**
 * Push a soft account URL so native Back can return to the previous shell entry.
 */
function pushAccountUrl(href: string, marker: AccountShellMarker): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.history.pushState(shellHistoryState(marker), '', href);
}

/**
 * Account workspace — hub stays mounted; menu selections swap panels with a skeleton.
 * External menu hrefs (Plan of Purchase → `/pop`) leave the shell via Next navigation.
 */
export function AccountSplitLayout({ children }: AccountSplitLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const skeletonTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPanelLoading, setIsPanelLoading] = useState(false);
  const [activePanelId, setActivePanelId] = useState<AccountPanelId | null>(() =>
    resolveAccountPanel(pathname),
  );
  const [syncedPathname, setSyncedPathname] = useState(pathname);

  const isNestedDetail = isAccountNestedDetailPath(pathname);

  // Align panel state when Next navigates (deep link, back header, nested routes).
  if (pathname !== syncedPathname) {
    setSyncedPathname(pathname);
    setIsPanelLoading(false);
    setActivePanelId(isAccountNestedDetailPath(pathname) ? null : resolveAccountPanel(pathname));
  }

  // Drop the skeleton timer on route change / unmount (external timer, not React state).
  useEffect(() => {
    if (skeletonTimerRef.current) {
      clearTimeout(skeletonTimerRef.current);
      skeletonTimerRef.current = null;
    }

    return () => {
      if (skeletonTimerRef.current) {
        clearTimeout(skeletonTimerRef.current);
      }
    };
  }, [pathname]);

  // Seed hub under a deep-linked panel so native Back lands on My Account (PW-474).
  useLayoutEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const locationPath = window.location.pathname;
    if (isAccountNestedDetailPath(locationPath)) {
      return;
    }

    const panelId = resolveAccountPanel(locationPath);
    if (!panelId) {
      return;
    }

    if (getShellMarker() === 'panel') {
      return;
    }

    const panelHref = `${locationPath}${window.location.search}${window.location.hash}`;
    replaceAccountUrl(ACCOUNT_ROUTES.hub, 'hub');
    pushAccountUrl(panelHref, 'panel');
  }, [pathname]);

  // Browser back/forward after history push/replace panel swaps.
  useEffect(() => {
    const onPopState = () => {
      const nextPath = window.location.pathname;
      if (isAccountNestedDetailPath(nextPath)) {
        setActivePanelId(null);
        setIsPanelLoading(false);
        return;
      }

      setActivePanelId(resolveAccountPanel(nextPath));
      setIsPanelLoading(false);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const showPanel = activePanelId != null || isNestedDetail;
  const isHubOnly = !showPanel;

  const openPanel = useCallback(
    (panelId: AccountPanelId) => {
      if (panelId === activePanelId && !isPanelLoading) {
        return;
      }

      if (skeletonTimerRef.current) {
        clearTimeout(skeletonTimerRef.current);
      }

      setIsPanelLoading(true);
      setActivePanelId(panelId);

      const href = getAccountPanelHref(panelId);
      // Panel→panel: replace so native Back always returns to hub (not prior panel).
      if (activePanelId != null) {
        replaceAccountUrl(href, 'panel');
      } else {
        pushAccountUrl(href, 'panel');
      }

      skeletonTimerRef.current = setTimeout(() => {
        setIsPanelLoading(false);
        skeletonTimerRef.current = null;
      }, PANEL_SKELETON_MS);
    },
    [activePanelId, isPanelLoading],
  );

  const selectPanel = useCallback(
    (menuItemId: string, href: string) => {
      if (
        isExternalAccountMenuHref(href) ||
        menuItemId === 'plan-of-purchase' ||
        menuItemId === 'wishlist'
      ) {
        router.push(href || ACCOUNT_ROUTES.planOfPurchase);
        return;
      }

      const panelId = panelIdFromMenuItemId(menuItemId);
      if (!panelId) {
        return;
      }

      openPanel(panelId);
    },
    [openPanel, router],
  );

  const selectProfile = useCallback(() => {
    openPanel('profile');
  }, [openPanel]);

  const closeToHub = useCallback(() => {
    if (skeletonTimerRef.current) {
      clearTimeout(skeletonTimerRef.current);
      skeletonTimerRef.current = null;
    }

    setIsPanelLoading(false);
    setActivePanelId(null);

    // Prefer real Back when we pushed a panel entry (keeps stack + PW-473 soft close).
    if (getShellMarker() === 'panel') {
      window.history.back();
      return;
    }

    replaceAccountUrl(ACCOUNT_ROUTES.hub, 'hub');
  }, []);

  const hub = (
    <AccountHub
      activePanelId={activePanelId}
      onSelectPanel={selectPanel}
      onSelectProfile={selectProfile}
    />
  );

  let panelContent: ReactNode = null;
  if (isPanelLoading) {
    panelContent = <AccountPanelSkeleton />;
  } else if (isNestedDetail) {
    panelContent = children;
  } else if (activePanelId) {
    panelContent = <AccountPanelRenderer panelId={activePanelId} />;
  }

  const shellNav = { closeToHub };

  if (isHubOnly) {
    return (
      <AccountShellNavProvider value={shellNav}>
        <div className={ACCOUNT_HUB_PAGE_CLASS}>
          <AccountHubBackHeader />
          {hub}
          {/* Keep the page segment mounted — omitting it blanks /account (instant-unrendered-segment). */}
          <div hidden>{children}</div>
        </div>
      </AccountShellNavProvider>
    );
  }

  return (
    <AccountShellNavProvider value={shellNav}>
      <div className="flex gap-[2vw]">
        <div className="laptop:sticky laptop:top-8 laptop:flex ml-[6vw] hidden w-[45vw] justify-end self-start">
          <div className="w-[28.5vw]">{hub}</div>
        </div>

        {/* Figma 960:47859 — soft column separator between hub and open section */}
        <div className="laptop:flex-1 w-full min-w-0" data-testid="account-panel-column">
          {panelContent}
        </div>
      </div>
    </AccountShellNavProvider>
  );
}
