"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/apiClient";

interface TrendingSymbol {
  symbol: string;
  watchlistCount: number;
}

export default function StocksIndex() {
  const [symbols, setSymbols] = useState<TrendingSymbol[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.trending()
      .then((data: { symbols: TrendingSymbol[] }) => setSymbols(data.symbols || []))
      .catch(() => setSymbols([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-8 py-12 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-positive opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-positive" />
          </span>
          <p className="text-xs font-semibold text-muted uppercase tracking-widest">Trending Now</p>
        </div>
        <h1 className="text-4xl font-serif tracking-[-0.02em] text-foreground">
          Trending Stocks
        </h1>
        <p className="text-muted text-[15px]">
          Most-watched stocks on the market right now. Click any to see price, sentiment, and AI analysis.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-card-border animate-pulse" />
          ))}
        </div>
      ) : symbols.length === 0 ? (
        <div className="rounded-xl border border-card-border/60 bg-card p-8 text-center text-muted text-sm">
          Could not load trending stocks. Check your backend connection.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {symbols.map((s, i) => (
            <Link
              key={s.symbol}
              href={`/dashboard/stocks/${s.symbol}`}
              className="group rounded-2xl border border-card-border/60 bg-card p-5 space-y-3 hover:border-card-border hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted">#{i + 1}</span>
                {i < 3 && (
                  <span className="text-[10px] font-bold text-positive border border-positive/30 bg-positive/5 rounded-full px-2 py-0.5 uppercase tracking-wide">
                    HOT
                  </span>
                )}
              </div>
              <div>
                <p className="text-2xl font-mono font-bold text-foreground group-hover:text-accent transition-colors">
                  {s.symbol}
                </p>
                {s.watchlistCount != null && (
                  <p className="text-xs text-muted mt-1">{s.watchlistCount.toLocaleString()} watching</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
