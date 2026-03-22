"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { stockDirectory, type StockMeta } from "@/lib/mockData";

export default function StockSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results: StockMeta[] =
    query.trim().length === 0
      ? []
      : stockDirectory.filter((s) => {
          const q = query.toUpperCase();
          return (
            s.ticker.includes(q) || s.name.toUpperCase().includes(q)
          );
        });

  const navigate = useCallback(
    (ticker: string) => {
      router.push(`/dashboard/stocks/${ticker}`);
      setQuery("");
      setOpen(false);
      inputRef.current?.blur();
    },
    [router],
  );

  useEffect(() => {
    setHighlightIdx(0);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      navigate(results[highlightIdx].ticker);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <div className="relative">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-dim pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => query.trim().length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search stocks by ticker or name..."
          className="w-full rounded-xl border border-card-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-dim focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-colors"
        />
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1.5 w-full rounded-xl border border-card-border bg-card shadow-lg overflow-hidden">
          {results.map((stock, idx) => (
            <li key={stock.ticker}>
              <button
                type="button"
                onMouseDown={() => navigate(stock.ticker)}
                onMouseEnter={() => setHighlightIdx(idx)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  idx === highlightIdx
                    ? "bg-accent-surface"
                    : "hover:bg-surface"
                }`}
              >
                <span className="font-mono text-sm font-semibold text-foreground min-w-[52px]">
                  {stock.ticker}
                </span>
                <span className="text-sm text-muted truncate">
                  {stock.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && query.trim().length > 0 && results.length === 0 && (
        <div className="absolute z-50 mt-1.5 w-full rounded-xl border border-card-border bg-card shadow-lg p-4 text-sm text-muted text-center">
          No stocks found for &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}
