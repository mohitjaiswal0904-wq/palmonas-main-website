"use client";

import { useState } from "react";

/** Filter categories and their options, matching the Figma filter design. */
const FILTER_GROUPS: { label: string; options: string[] }[] = [
  {
    label: "Product Type",
    options: [
      "Rings",
      "Pendants",
      "Chains",
      "Mangalsutra",
      "Necklaces",
      "Sets",
      "Earrings",
      "Bracelets",
    ],
  },
  {
    label: "Price",
    options: [
      "₹500 - ₹999",
      "₹1000 - ₹1999",
      "₹2000 - ₹2999",
      "₹3000 - ₹3999",
      "₹4000 - ₹4999",
      "₹5000 - ₹5999",
      "₹6000 - Above",
    ],
  },
  {
    label: "Stone",
    options: [
      "Coloured",
      "Coloured Stone",
      "Coloured Zircon",
      "Marcasite",
      "None",
      "Pearl",
      "Zircon",
    ],
  },
  { label: "Colour", options: ["Gold", "Rose Gold", "Silver"] },
  { label: "Style", options: ["Everyday", "Office", "Party", "Traditional", "Wedding"] },
  {
    label: "Metal",
    options: ["9K Gold", "14K Gold", "18K Gold", "925 Silver", "Demifine", "Sterling Silver"],
  },
];

/** Sort options, matching the Figma sort sheet. */
export const MOBILE_SORT_OPTIONS = [
  "Default",
  "New Arrivals",
  "Best Selling",
  "Price High to Low",
  "Price Low to High",
  "Alphabetically A - Z",
  "Alphabetically Z - A",
];

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  );
}

function SortIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M7 4v16M7 4 4 7m3-3 3 3M17 20V4m0 16 3-3m-3 3-3-3" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

type Props = {
  sortBy: string;
  onSortChange: (value: string) => void;
};

/**
 * Mobile-only bottom bar with Filter / Sort By actions for the collection page.
 * Tapping Filter opens a full-screen two-pane filter panel; tapping Sort By
 * opens a bottom sheet of sort options. Desktop keeps its own sidebar/dropdown.
 */
export default function CollectionMobileBar({ sortBy, onSortChange }: Props) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState(FILTER_GROUPS[0].label);
  const [selected, setSelected] = useState<Record<string, string[]>>({});

  const toggleOption = (group: string, option: string) =>
    setSelected((prev) => {
      const current = prev[group] ?? [];
      const next = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...prev, [group]: next };
    });

  const clearAll = () => setSelected({});

  const activeOptions =
    FILTER_GROUPS.find((g) => g.label === activeGroup)?.options ?? [];

  return (
    <>
      {/* Bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-black/10 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="flex items-center justify-center gap-2 border-r border-black/10 py-3.5 text-[15px] font-medium text-[#151515]"
        >
          <FilterIcon />
          Filter
        </button>
        <button
          type="button"
          onClick={() => setSortOpen(true)}
          className="flex items-center justify-center gap-2 py-3.5 text-[15px] font-medium text-[#151515]"
        >
          <SortIcon />
          Sort By
        </button>
      </div>

      {/* Filter panel */}
      {filterOpen ? (
        <div className="fixed inset-0 z-[60] flex flex-col bg-white lg:hidden">
          <div className="flex items-center justify-between border-b border-black/10 px-4 py-4">
            <h2 className="text-xl font-bold text-[#151515]">Filter</h2>
            <button
              type="button"
              aria-label="Close filters"
              onClick={() => setFilterOpen(false)}
              className="text-[#151515]"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="flex min-h-0 flex-1">
            {/* Category list */}
            <ul className="w-[42%] shrink-0 overflow-y-auto border-r border-black/10 bg-[#f7f7f7]">
              {FILTER_GROUPS.map((group) => {
                const count = selected[group.label]?.length ?? 0;
                const isActive = group.label === activeGroup;
                return (
                  <li key={group.label}>
                    <button
                      type="button"
                      onClick={() => setActiveGroup(group.label)}
                      className={`flex w-full items-center justify-between gap-1 px-4 py-4 text-left text-[15px] transition-colors ${
                        isActive
                          ? "bg-white font-semibold text-[#151515]"
                          : "text-[#5f5f5f]"
                      }`}
                    >
                      <span>{group.label}</span>
                      {count > 0 ? (
                        <span className="flex size-5 items-center justify-center rounded-full bg-[#151515] text-[11px] font-semibold text-white">
                          {count}
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Options for the active category */}
            <ul className="min-w-0 flex-1 overflow-y-auto">
              {activeOptions.map((option) => {
                const checked = selected[activeGroup]?.includes(option) ?? false;
                return (
                  <li key={option}>
                    <button
                      type="button"
                      onClick={() => toggleOption(activeGroup, option)}
                      className={`flex w-full items-center gap-3 px-4 py-3.5 text-left text-[15px] transition-colors ${
                        checked ? "bg-[#fbeef0]" : "bg-white"
                      }`}
                    >
                      <span
                        className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                          checked
                            ? "border-[#151515] bg-[#151515]"
                            : "border-black/30 bg-white"
                        }`}
                      >
                        {checked ? (
                          <span className="size-2 rounded-full bg-white" />
                        ) : null}
                      </span>
                      <span
                        className={checked ? "text-[#151515]" : "text-[#3a3a3a]"}
                      >
                        {option}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Footer actions */}
          <div className="grid grid-cols-2 gap-3 border-t border-black/10 px-4 py-4">
            <button
              type="button"
              onClick={clearAll}
              className="rounded-full border border-[#151515] py-3 text-[15px] font-semibold text-[#151515]"
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={() => setFilterOpen(false)}
              className="rounded-full bg-[#151515] py-3 text-[15px] font-semibold text-white"
            >
              Apply
            </button>
          </div>
        </div>
      ) : null}

      {/* Sort sheet */}
      {sortOpen ? (
        <div
          className="fixed inset-0 z-[60] flex flex-col justify-end bg-black/40 lg:hidden"
          onClick={() => setSortOpen(false)}
        >
          <div
            className="rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black/10 px-4 py-4">
              <h2 className="text-xl font-bold text-[#151515]">Sort By</h2>
              <button
                type="button"
                aria-label="Close sort options"
                onClick={() => setSortOpen(false)}
                className="text-[#151515]"
              >
                <CloseIcon />
              </button>
            </div>
            <ul>
              {MOBILE_SORT_OPTIONS.map((option) => {
                const isActive = sortBy === option;
                return (
                  <li key={option}>
                    <button
                      type="button"
                      onClick={() => {
                        onSortChange(option);
                        setSortOpen(false);
                      }}
                      className={`w-full px-4 py-4 text-left text-[15px] transition-colors ${
                        isActive
                          ? "bg-[#fbeef0] font-semibold text-[#151515]"
                          : "text-[#3a3a3a]"
                      }`}
                    >
                      {option}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
