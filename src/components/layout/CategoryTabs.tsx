"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = {
  label: string;
  href: string;
};

const tabs: Tab[] = [
  { label: "Demi-fine Jewellery", href: "/demifine" },
  { label: "Gold Jewellery", href: "/gold" },
  { label: "Silver Jewellery", href: "/silver" },
  { label: "Explore All", href: "/" },
];

// Tabs only appear on the category landing pages, not on collection/search/etc.
const visibleOn = ["/", "/gold", "/silver", "/demifine"];

export default function CategoryTabs() {
  const pathname = usePathname();

  if (!visibleOn.includes(pathname)) return null;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    // Desktop only — on mobile the bottom navigation bar handles this.
    <nav className="hidden w-full bg-white px-4 py-3 lg:block">
      <div className="mx-auto flex max-w-[810px] items-center gap-1 rounded-full bg-[#fff7ef] p-1.5 shadow-[inset_0_0_4px_rgba(0,0,0,0.18)]">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.label}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`flex h-9 flex-1 items-center justify-center whitespace-nowrap rounded-full px-4 text-[15px] capitalize transition-colors duration-200 ${
                active
                  ? "border border-[#d8ad5b] bg-[#ffe8d0] text-black"
                  : "border border-transparent text-[#868686] hover:text-black"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
