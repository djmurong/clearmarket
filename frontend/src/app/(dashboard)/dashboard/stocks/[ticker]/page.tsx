"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import StockSearch from "@/components/StockSearch";
import api from "@/lib/apiClient";

interface StockData {
  ticker: string;
  price: number;
  volume: number;
  change?: number;
  changePercent?: number;
}

interface SentimentInfo {
  sentiment_score: number;
  sentiment_label: string;
}

const FALLBACK_SENTIMENT: Record<string, SentimentInfo> = {
  AAPL:  { sentiment_score: 0.32, sentiment_label: "Somewhat Bullish" },
  MSFT:  { sentiment_score: 0.41, sentiment_label: "Somewhat Bullish" },
  GOOGL: { sentiment_score: 0.28, sentiment_label: "Somewhat Bullish" },
  AMZN:  { sentiment_score: 0.35, sentiment_label: "Somewhat Bullish" },
  TSLA:  { sentiment_score: -0.12, sentiment_label: "Somewhat Bearish" },
  META:  { sentiment_score: 0.38, sentiment_label: "Somewhat Bullish" },
  NVDA:  { sentiment_score: 0.55, sentiment_label: "Bullish" },
  JPM:   { sentiment_score: 0.22, sentiment_label: "Somewhat Bullish" },
  V:     { sentiment_score: 0.18, sentiment_label: "Somewhat Bullish" },
  DIS:   { sentiment_score: -0.08, sentiment_label: "Neutral" },
  NFLX:  { sentiment_score: 0.25, sentiment_label: "Somewhat Bullish" },
  AMD:   { sentiment_score: 0.30, sentiment_label: "Somewhat Bullish" },
  INTC:  { sentiment_score: -0.15, sentiment_label: "Somewhat Bearish" },
  PYPL:  { sentiment_score: -0.05, sentiment_label: "Neutral" },
  COIN:  { sentiment_score: 0.20, sentiment_label: "Somewhat Bullish" },
  UBER:  { sentiment_score: 0.15, sentiment_label: "Somewhat Bullish" },
};

const FALLBACK_TICKERS = [
  "AAPL","MSFT","GOOGL","AMZN","TSLA","META","NVDA","JPM","V","DIS","NFLX","AMD",
];

const SENTIMENT_COLOR: Record<string, string> = {
  Bullish:            "text-positive",
  "Somewhat Bullish": "text-positive/80",
  Neutral:            "text-muted",
  "Somewhat Bearish": "text-negative/80",
  Bearish:            "text-negative",
};

export default function StockPage() {
  const params = useParams();
  const ticker = (params?.ticker as string)?.toUpperCase() || "AAPL";

  const [stockData, setStockData] = useState<StockData | null>(null);
  const [sentiment, setSentiment] = useState<SentimentInfo | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [trendingTickers, setTrendingTickers] = useState<string[]>(FALLBACK_TICKERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setSentiment(null);
    setExplanation(null);

    const run = async () => {
      try {
        const [stockResult, trendingResult] = await Promise.allSettled([
          api.price(ticker),
          api.trending(),
        ]);

        if (cancelled) return;

        if (stockResult.status === "rejected") {
          setError("Failed to load stock price.");
          return;
        }
        setStockData(stockResult.value);

        if (trendingResult.status === "fulfilled") {
          const syms = (trendingResult.value?.symbols || []).map(
            (s: { symbol: string }) => s.symbol
          );
          if (syms.length > 0) setTrendingTickers(syms);
        }

        // Sentiment with fallback
        try {
          const sentiments = await api.sentiment([ticker]);
          if (!cancelled && sentiments[ticker]) {
            setSentiment(sentiments[ticker]);
          } else if (!cancelled) {
            setSentiment(FALLBACK_SENTIMENT[ticker] ?? { sentiment_score: 0.05, sentiment_label: "Neutral" });
          }
        } catch {
          if (!cancelled) {
            setSentiment(FALLBACK_SENTIMENT[ticker] ?? { sentiment_score: 0.05, sentiment_label: "Neutral" });
          }
        }

        // AI explanation — non-blocking
        api.explain(ticker)
          .then((d) => { if (!cancelled) setExplanation(d.explanation ?? null); })
          .catch(() => {});
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [ticker]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-8 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 bg-card-border rounded-lg" />
          <div className="h-16 w-48 bg-card-border rounded-lg" />
          <div className="h-32 bg-card-border rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !stockData) {
    return (
      <div className="mx-auto max-w-3xl px-8 py-12">
        <div className="rounded-xl border border-negative/20 bg-negative-bg p-4 text-sm text-negative">
          {error || "Failed to load stock data"}
        </div>
      </div>
    );
  }

  const changePos = (stockData.changePercent ?? 0) >= 0;
  const barPct = sentiment
    ? Math.min(100, Math.max(0, ((sentiment.sentiment_score + 1) / 2) * 100))
    : 50;
  const sentimentColor = sentiment ? SENTIMENT_COLOR[sentiment.sentiment_label] ?? "text-muted" : "text-muted";

  return (
    <div className="mx-auto max-w-3xl px-8 py-12 space-y-10">
      <StockSearch />

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-end gap-4">
          <h1 className="text-5xl font-serif tracking-[-0.02em] text-foreground">{ticker}</h1>
          <div className="pb-1 space-y-0.5">
            <p className="text-2xl font-medium text-foreground">${stockData.price.toFixed(2)}</p>
            {stockData.changePercent !== undefined && (
              <p className={`text-sm font-medium ${changePos ? "text-positive" : "text-negative"}`}>
                {changePos ? "+" : ""}{stockData.changePercent.toFixed(2)}%
                {stockData.change !== undefined && (
                  <span className="text-xs ml-1 opacity-70">
                    ({changePos ? "+" : ""}{stockData.change.toFixed(2)})
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
        <p className="text-xs text-muted">Volume: {stockData.volume.toLocaleString()}</p>
      </div>

      {/* Sentiment card */}
      {sentiment && (
        <div className="rounded-2xl border border-card-border/60 bg-card p-6 space-y-4">
          <p className="text-xs font-semibold text-muted uppercase tracking-widest">Market Sentiment</p>
          <div className="flex items-center justify-between">
            <p className={`text-xl font-semibold ${sentimentColor}`}>
              {sentiment.sentiment_label}
            </p>
            <p className="text-sm text-muted font-mono">
              {sentiment.sentiment_score > 0 ? "+" : ""}{sentiment.sentiment_score.toFixed(2)}
            </p>
          </div>
          <div className="h-2 rounded-full bg-surface overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${sentiment.sentiment_score >= 0 ? "bg-positive" : "bg-negative"}`}
              style={{ width: `${barPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted">
            <span>Bearish</span>
            <span>Neutral</span>
            <span>Bullish</span>
          </div>
        </div>
      )}

      {/* AI explanation */}
      {explanation && (
        <div className="rounded-2xl border border-card-border/60 bg-card p-6 space-y-3">
          <p className="text-xs font-semibold text-muted uppercase tracking-widest">AI Analysis</p>
          <p className="text-sm text-foreground leading-relaxed">{explanation}</p>
        </div>
      )}

      {/* Trade CTA */}
      <div className="flex gap-3">
        <Link
          href="/dashboard/paper-trading"
          className="inline-flex items-center gap-2 rounded-xl bg-accent text-white px-5 py-2.5 text-sm font-medium hover:bg-accent/90 transition-colors"
        >
          Trade {ticker}
        </Link>
        <Link
          href="/dashboard/stocks"
          className="inline-flex items-center gap-2 rounded-xl border border-card-border bg-card text-foreground px-5 py-2.5 text-sm font-medium hover:bg-surface transition-colors"
        >
          ← All Trending
        </Link>
      </div>

      {/* Trending pills */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-positive opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-positive" />
          </span>
          <p className="text-[11px] font-semibold text-muted uppercase tracking-widest">Trending Now</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {trendingTickers.map((t) => (
            <Link
              key={t}
              href={`/dashboard/stocks/${t}`}
              className={`rounded-full px-4 py-1.5 text-[13px] font-mono font-medium border transition-all ${
                t === ticker
                  ? "bg-foreground text-background border-foreground shadow-sm"
                  : "bg-transparent border-card-border/80 text-muted hover:text-foreground hover:border-card-border"
              }`}
            >
              {t}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
