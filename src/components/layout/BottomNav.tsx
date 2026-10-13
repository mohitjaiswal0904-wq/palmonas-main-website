"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BagIcon } from "@/components/ui/icons";
import { useCart } from "@/hooks/useCart";

type IconProps = { className?: string; active?: boolean };

/** House icon — the "Home" tab on the default (all) bar. */
function HomeIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  );
}

/** Circled back-arrow — the "Home" tab when inside a category context. */
function BackCircleIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m12 8-4 4 4 4" />
      <path d="M16 12H8" />
    </svg>
  );
}

/** Faceted gem — metal collections (Gold / Silver). Stays outlined; the active
 * state simply turns it black via the parent text colour. */
function GemIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M10.5 3 8 9l4 13 4-13-2.5-6" />
      <path d="M17 3a2 2 0 0 1 1.6.8l3 4a2 2 0 0 1 .013 2.382l-7.99 10.986a2 2 0 0 1-3.247 0l-7.99-10.986A2 2 0 0 1 2.4 7.8l2.998-3.997A2 2 0 0 1 7 3z" />
      <path d="M2 9h20" />
    </svg>
  );
}

/** Engagement ring — the gold-context "Proposal Ring" tab. */
function RingIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="15" r="6" />
      <path d="M9 6.5 12 3l3 3.5-3 3z" />
    </svg>
  );
}

/** Marquise gem inside a circle — the "Demi-fine" tab in its own context. */
function DemifineMarkIcon({ className, active }: IconProps) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="7" />
      <path
        d="M12 2c1.6 5.5 1.6 14.5 0 20-1.6-5.5-1.6-14.5 0-20Z"
        fill={active ? "currentColor" : "none"}
      />
    </svg>
  );
}

/** Five-point star — the demi-fine-context "Bestsellers" tab. */
function StarIcon({ className, active }: IconProps) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />
    </svg>
  );
}

/** Percent badge in a circle — the demi-fine-context "Offers" tab. */
function OffersIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m9 15 6-6" />
      <circle cx="9.2" cy="9.2" r="1.1" />
      <circle cx="14.8" cy="14.8" r="1.1" />
    </svg>
  );
}

/** Four-point sparkle — "Demi-fine" tab and the gold-context "9KT" tab. */
function SparkleIcon({ className, active }: IconProps) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3c.4 4.2 1.8 5.6 6 6-4.2.4-5.6 1.8-6 6-.4-4.2-1.8-5.6-6-6 4.2-.4 5.6-1.8 6-6Z" />
    </svg>
  );
}

type NavItem = {
  key: string;
  label: string;
  href: string;
  Icon: (props: IconProps) => React.JSX.Element;
  active: boolean;
};

/**
 * Build the five bottom-nav items for the current route. The bar is contextual,
 * mirroring the Figma design: each category landing page swaps the middle tabs
 * for shortcuts relevant to that collection, while Home (left) and Cart (right)
 * stay anchored.
 */
function getItems(pathname: string): NavItem[] {
  const cartActive = pathname === "/cart" || pathname.startsWith("/cart/");
  const cartItem: NavItem = {
    key: "cart",
    label: "Cart",
    href: "/cart",
    Icon: BagIcon,
    active: cartActive,
  };

  // Gold context — back to home, then gold-specific shortcuts.
  if (pathname === "/gold" || pathname.startsWith("/gold/")) {
    return [
      { key: "home", label: "Home", href: "/", Icon: BackCircleIcon, active: false },
      { key: "gold", label: "Gold", href: "/gold", Icon: GemIcon, active: true },
      {
        key: "proposal",
        label: "Proposal Ring",
        href: "/collection",
        Icon: RingIcon,
        active: false,
      },
      { key: "9kt", label: "9KT", href: "/collection", Icon: SparkleIcon, active: false },
      cartItem,
    ];
  }

  // Silver context — mirrors the gold bar with silver-specific shortcuts.
  if (pathname === "/silver" || pathname.startsWith("/silver/")) {
    return [
      { key: "home", label: "Home", href: "/", Icon: BackCircleIcon, active: false },
      { key: "silver", label: "Silver", href: "/silver", Icon: GemIcon, active: true },
      {
        key: "bestsellers",
        label: "Bestsellers",
        href: "/collection",
        Icon: StarIcon,
        active: false,
      },
      { key: "925", label: "925", href: "/collection", Icon: SparkleIcon, active: false },
      cartItem,
    ];
  }

  // Demi-fine context — back to home, then demi-fine-specific shortcuts.
  if (pathname === "/demifine" || pathname.startsWith("/demifine/")) {
    return [
      { key: "home", label: "Home", href: "/", Icon: BackCircleIcon, active: false },
      {
        key: "demifine",
        label: "Demifine",
        href: "/demifine",
        Icon: DemifineMarkIcon,
        active: true,
      },
      {
        key: "bestsellers",
        label: "Bestsellers",
        href: "/collection",
        Icon: StarIcon,
        active: false,
      },
      {
        key: "offers",
        label: "Offers",
        href: "/collection",
        Icon: OffersIcon,
        active: false,
      },
      cartItem,
    ];
  }

  // Default bar — used on the all/home page and elsewhere.
  return [
    {
      key: "home",
      label: "Home",
      href: "/",
      Icon: HomeIcon,
      active: pathname === "/",
    },
    {
      key: "gold",
      label: "Gold",
      href: "/gold",
      Icon: GemIcon,
      active: pathname === "/gold" || pathname.startsWith("/gold/"),
    },
    {
      key: "silver",
      label: "Silver",
      href: "/silver",
      Icon: GemIcon,
      active: pathname === "/silver" || pathname.startsWith("/silver/"),
    },
    {
      key: "demifine",
      label: "Demifine",
      href: "/demifine",
      Icon: SparkleIcon,
      active: pathname === "/demifine" || pathname.startsWith("/demifine/"),
    },
    cartItem,
  ];
}

export default function BottomNav() {
  const pathname = usePathname();
  const { count: cartCount } = useCart();

  // Collection pages show a Filter / Sort By bar instead of the nav.
  if (pathname === "/collection" || pathname.startsWith("/collection/")) {
    return null;
  }

  // Product pages show a Buy Now / Add to Cart bar instead of the nav.
  if (pathname.startsWith("/product/")) {
    return null;
  }

  // No bottom nav on the search results page.
  if (pathname === "/search" || pathname.startsWith("/search/")) {
    return null;
  }

  // Cart shows a "Continue to Checkout" CTA bar instead of the nav.
  if (pathname === "/cart" || pathname.startsWith("/cart/")) {
    return null;
  }

  const items = getItems(pathname);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="mx-auto flex max-w-[480px] items-stretch">
        {items.map((item) => {
          const showCartBadge =
            item.key === "cart" && cartCount > 0 && pathname !== "/cart";
          return (
            <li key={item.key} className="flex-1">
              <Link
                href={item.href}
                aria-current={item.active ? "page" : undefined}
                className={`flex flex-col items-center justify-center gap-1 py-2.5 transition-colors ${
                  item.active ? "text-[#151515]" : "text-[#8a8a8a]"
                }`}
              >
                <span className="relative">
                  <item.Icon className="size-[22px]" active={item.active} />
                  {showCartBadge ? (
                    <span className="absolute -right-2.5 -top-2 flex min-w-[16px] items-center justify-center rounded-full bg-[#151515] px-1 text-[10px] font-semibold leading-4 text-white">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  ) : null}
                </span>
                <span
                  className={`max-w-full truncate px-0.5 text-[11px] leading-none ${
                    item.active ? "font-bold" : "font-normal"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
