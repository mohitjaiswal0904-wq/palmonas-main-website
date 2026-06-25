"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { menuTabs, type MenuEntry } from "@/constants/megaMenu";

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

const FOOTER_LINKS = [
  { label: "Return & Exchange", href: "#" },
  { label: "Store", href: "#" },
  { label: "Support", href: "#" },
  { label: "About Us", href: "#" },
];

/** Full-screen mega-menu drawer; rendered only when `open` is true. */
export default function MobileNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [tabKey, setTabKey] = useState<"demifine" | "gold">("demifine");
  const [entryKey, setEntryKey] = useState("category");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const tab = menuTabs.find((t) => t.key === tabKey) ?? menuTabs[0];
  const activeEntry =
    tab.entries.find((e) => e.key === entryKey && e.type === "panel") ??
    tab.entries.find((e) => e.type === "panel");

  const switchTab = (key: "demifine" | "gold") => {
    setTabKey(key);
    setEntryKey("category");
  };

  return (
    <div className="fixed inset-0 z-[70] lg:hidden">
      {/* Backdrop (visible on wider screens where the panel is capped at 360px) */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      <div className="absolute inset-y-0 left-0 flex w-full max-w-[360px] flex-col bg-white [animation:menu-slide-in_0.28s_cubic-bezier(0.22,0.61,0.36,1)]">
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between px-4">
          <Link href="/" onClick={onClose} aria-label="Palmonas home">
            <Image
              src="/palmonas-logo.svg"
              alt="Palmonas"
              width={208}
              height={21}
              className="h-[15px] w-auto"
            />
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="flex size-10 items-center justify-center text-[#151515]"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Tab toggle */}
        <div className="mx-3 mb-2 flex shrink-0 rounded-full bg-[#f1f1f1] p-1">
          {menuTabs.map((t) => {
            const active = t.key === tabKey;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => switchTab(t.key)}
                className={`h-10 flex-1 rounded-full text-sm font-medium transition-colors ${
                  active ? "bg-[#151515] text-white" : "text-[#8a8a8a]"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Body: rail + panel */}
        <div className="flex min-h-0 flex-1">
          {/* Category rail */}
          <div className="w-[124px] shrink-0 overflow-y-auto border-r border-black/5">
            {tab.entries.map((entry) => (
              <RailItem
                key={entry.key}
                entry={entry}
                active={activeEntry?.key === entry.key && entry.type === "panel"}
                onSelect={() => setEntryKey(entry.key)}
                onClose={onClose}
              />
            ))}
          </div>

          {/* Content panel */}
          <div className="min-w-0 flex-1 overflow-y-auto p-3">
            {activeEntry && activeEntry.type === "panel" ? (
              <>
                <div className="grid grid-cols-2 gap-x-2 gap-y-3">
                  {activeEntry.tiles.map((tile) => (
                    <Link
                      key={tile.label}
                      href={tile.href}
                      onClick={onClose}
                      className="group flex flex-col items-center gap-2"
                    >
                      <div className="aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-br from-[#faf4ea] to-[#efe6d6] ring-1 ring-black/5 transition-transform group-hover:scale-[1.02]" />
                      <span className="text-center text-[13px] text-[#151515]">
                        {tile.label}
                      </span>
                    </Link>
                  ))}
                </div>
                {activeEntry.viewAllHref ? (
                  <Link
                    href={activeEntry.viewAllHref}
                    onClick={onClose}
                    className="mx-auto mt-4 block w-fit text-sm font-medium text-[#151515] underline underline-offset-2"
                  >
                    View all
                  </Link>
                ) : null}
              </>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-black/5 px-4 py-3.5">
          {FOOTER_LINKS.map((link, i) => (
            <div key={link.label} className="flex items-center">
              {i > 0 ? <span className="mr-2 h-3 w-px bg-black/15 sm:mr-3" /> : null}
              <Link
                href={link.href}
                onClick={onClose}
                className="text-[11px] text-[#454545] sm:text-xs"
              >
                {link.label}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RailItem({
  entry,
  active,
  onSelect,
  onClose,
}: {
  entry: MenuEntry;
  active: boolean;
  onSelect: () => void;
  onClose: () => void;
}) {
  const inner = (
    <>
      <span className="text-[15px] text-[#151515]">{entry.label}</span>
      {entry.badge ? (
        <span className="rounded bg-[#f5c542] px-1.5 py-0.5 text-[9px] font-semibold text-[#151515]">
          {entry.badge}
        </span>
      ) : null}
      {entry.type === "link" ? (
        <span className="text-[#9a9a9a]">
          <ExternalIcon />
        </span>
      ) : null}
    </>
  );

  if (entry.type === "link") {
    return (
      <Link
        href={entry.href}
        onClick={onClose}
        className="flex h-[58px] items-center gap-1.5 px-4"
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex h-[58px] w-full items-center gap-1.5 px-4 text-left transition-colors ${
        active ? "bg-[#f4f4f4] font-medium" : ""
      }`}
    >
      {inner}
    </button>
  );
}
