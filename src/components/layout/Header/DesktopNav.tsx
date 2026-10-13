"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDownIcon } from "@/components/ui/icons";
import { navItems } from "@/constants/navigation";

/** Desktop primary navigation row with hover dropdowns and mega-menus. */
export default function DesktopNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href !== "#" && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <nav className="mx-auto hidden w-full max-w-[1714px] items-center justify-center gap-1 px-6 pb-4 lg:flex xl:gap-2">
      {navItems.map((item) => {
        const active = isActive(item.href);

        if (item.hasDropdown) {
          const navigable = item.href !== "#";
          return (
            <div key={item.label} className="group relative">
              {navigable ? (
                <Link
                  href={item.href}
                  aria-haspopup="menu"
                  className="flex items-center gap-1.5 whitespace-nowrap p-2.5 text-[15px] text-black transition-colors group-hover:text-[#b8956a] xl:text-base"
                >
                  {item.label}
                  <ChevronDownIcon className="text-black transition-transform duration-200 group-hover:rotate-180 group-hover:text-[#b8956a]" />
                </Link>
              ) : (
                <button
                  type="button"
                  aria-haspopup="menu"
                  className="flex cursor-default items-center gap-1.5 whitespace-nowrap p-2.5 text-[15px] text-black transition-colors group-hover:text-[#b8956a] xl:text-base"
                >
                  {item.label}
                  <ChevronDownIcon className="text-black transition-transform duration-200 group-hover:rotate-180 group-hover:text-[#b8956a]" />
                </button>
              )}

              {item.dropdownGroups ? (
                /* Mega-menu (grouped) */
                <div className="invisible absolute left-0 top-full z-50 pt-2 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div
                    role="menu"
                    className="grid w-max max-w-[calc(100vw-3rem)] grid-cols-2 gap-x-8 gap-y-5 rounded-xl border border-black/10 bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.12)] sm:grid-cols-3 lg:grid-cols-5"
                  >
                    {item.dropdownGroups.map((group) => (
                      <div key={group.title} className="min-w-[150px]">
                        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-[#b8956a]">
                          {group.title}
                        </p>
                        <ul className="space-y-2">
                          {group.options.map((option) => (
                            <li key={option.label}>
                              <Link
                                href={option.href}
                                role="menuitem"
                                className="block text-sm text-[#3a3a3a] transition-colors hover:text-[#b8956a]"
                              >
                                {option.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Simple dropdown (flat list) */
                <div className="invisible absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 pt-2 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div
                    role="menu"
                    className="overflow-hidden rounded-xl border border-black/10 bg-white py-2 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
                  >
                    {(item.dropdownItems ?? []).map((option) => (
                      <Link
                        key={option.label}
                        href={option.href}
                        role="menuitem"
                        className="block px-4 py-2.5 text-sm text-[#3a3a3a] transition-colors hover:bg-[#faf3ec] hover:text-[#b8956a]"
                      >
                        {option.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`relative flex items-center gap-1.5 whitespace-nowrap p-2.5 text-[15px] transition-colors hover:text-[#b8956a] xl:text-base ${
              active ? "font-semibold text-[#b8956a]" : "text-black"
            } after:absolute after:inset-x-2.5 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-[#b8956a] after:transition-transform after:duration-200 ${
              active ? "after:scale-x-100" : "after:scale-x-0"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
