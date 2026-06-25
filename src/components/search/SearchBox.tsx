"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  popularSearches,
  searchCollections,
  searchProducts,
} from "@/data/catalog";

type Suggestion =
  | { type: "collection"; label: string; sub: string; href: string }
  | { type: "product"; label: string; sub: string; term: string }
  | { type: "popular"; label: string; term: string };

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CollectionIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#999]">
      {children}
    </p>
  );
}

function Row({
  selected,
  onMouseEnter,
  onClick,
  icon,
  label,
  sub,
}: {
  selected: boolean;
  onMouseEnter: () => void;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  sub?: string;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-3 px-4 py-2 text-left ${
        selected ? "bg-[#faf7f2]" : ""
      }`}
    >
      <span className="flex items-center gap-3">
        {icon}
        <span className="text-sm text-black">{label}</span>
      </span>
      {sub ? <span className="text-xs text-[#999]">{sub}</span> : null}
    </button>
  );
}

export default function SearchBox({
  className = "",
  inputClassName = "",
  autoFocus = false,
  defaultValue = "",
  onSearch,
  onClose,
}: {
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
  /** Prefill the input (e.g. with the previous search term). */
  defaultValue?: string;
  /** Called with the term once a text search is submitted. */
  onSearch?: (term: string) => void;
  /** Called when a suggestion navigation completes (e.g. a collection). */
  onClose?: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const matchedCollections = useMemo(
    () => searchCollections(query),
    [query],
  );
  const matchedProducts = useMemo(
    () => searchProducts(query).slice(0, 6),
    [query],
  );
  const showPopular = query.trim().length === 0;

  const suggestions = useMemo<Suggestion[]>(() => {
    if (showPopular) {
      return popularSearches.map((term) => ({
        type: "popular",
        label: term,
        term,
      }));
    }
    return [
      ...matchedProducts.map<Suggestion>((p) => ({
        type: "product",
        label: p.name,
        sub: `${p.category} · ${p.collection}`,
        term: p.name,
      })),
      ...matchedCollections.map<Suggestion>((c) => ({
        type: "collection",
        label: c.name,
        sub: c.description,
        href: c.href,
      })),
    ];
  }, [showPopular, matchedCollections, matchedProducts]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function close() {
    setOpen(false);
    setHighlight(-1);
  }

  function go(term: string) {
    const q = term.trim();
    if (!q) return;
    close();
    setQuery(q);
    router.push(`/search?q=${encodeURIComponent(q)}`);
    onSearch?.(q);
  }

  function select(s: Suggestion) {
    if (s.type === "collection") {
      close();
      router.push(s.href);
      onClose?.();
    } else {
      go(s.term);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const active = highlight >= 0 ? suggestions[highlight] : undefined;
    if (active) {
      select(active);
    } else {
      go(query);
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, -1));
    } else if (e.key === "Escape") {
      close();
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form
        onSubmit={onSubmit}
        role="search"
        className={`flex h-full items-center rounded-xl border border-[#e6e6e6] bg-white px-3 ${inputClassName}`}
      >
        <input
          type="text"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlight(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search for rings, earrings, mangalsutra…"
          aria-label="Search products"
          aria-expanded={open}
          aria-controls={listId}
          autoComplete="off"
          className="h-full flex-1 bg-transparent text-[13px] text-black outline-none placeholder:text-[#c7c7c7]"
        />
        {query ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setHighlight(-1);
            }}
            className="mr-1 text-[#999] transition-colors hover:text-black"
          >
            ✕
          </button>
        ) : null}
        <button type="submit" aria-label="Search" className="text-[#555]">
          <SearchIcon />
        </button>
      </form>

      {open ? (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-[#eee] bg-white py-2 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
        >
          {showPopular ? (
            <>
              <GroupLabel>Popular searches</GroupLabel>
              {suggestions.map((s, i) => (
                <Row
                  key={`pop-${s.label}`}
                  selected={highlight === i}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => select(s)}
                  icon={<SearchIcon className="text-[#bbb]" />}
                  label={s.label}
                />
              ))}
            </>
          ) : suggestions.length > 0 ? (
            <>
              {matchedProducts.length > 0 ? (
                <GroupLabel>Top results</GroupLabel>
              ) : null}
              {matchedProducts.map((p, i) => (
                <Row
                  key={p.id}
                  selected={highlight === i}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => select(suggestions[i])}
                  icon={<SearchIcon className="text-[#bbb]" />}
                  label={p.name}
                  sub={`${p.category} · ${p.collection}`}
                />
              ))}
              {matchedCollections.length > 0 ? (
                <GroupLabel>Collections</GroupLabel>
              ) : null}
              {matchedCollections.map((c, idx) => {
                const i = matchedProducts.length + idx;
                return (
                  <Row
                    key={`col-${c.name}`}
                    selected={highlight === i}
                    onMouseEnter={() => setHighlight(i)}
                    onClick={() => select(suggestions[i])}
                    icon={<CollectionIcon className="text-[#b8956a]" />}
                    label={`Shop ${c.name}`}
                    sub={c.description}
                  />
                );
              })}
            </>
          ) : (
            <p className="px-4 py-3 text-sm text-[#999]">
              No matches for &ldquo;{query.trim()}&rdquo; — press Enter to search
              anyway.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
