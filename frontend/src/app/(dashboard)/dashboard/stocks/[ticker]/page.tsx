"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import StockOpinionList from "@/components/StockOpinionList";
import SentimentDistribution from "@/components/SentimentDistribution";
import StockSearch from "@/components/StockSearch";
import api from "@/lib/apiClient";
import { availableTickers } from "@/lib/mockData";

interface StockData {
  ticker: string;
  price: number;
  volume: number;
}

interface SentimentInfo {
  sentiment_score: number;
  sentiment_label: string;
}

export default function StockPage() {
  const params = useParams();
  const ticker = (params?.ticker as string)?.toUpperCase() || "AAPL";
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [sentiment, setSentiment] = useState<SentimentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const stock = await api.price(ticker);
        setStockData(stock);
        
        const sentiments = await api.sentiment([ticker]);
        if (sentiments[ticker]) {
          setSentiment(sentiments[ticker]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load stock data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticker]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-8 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-card-border rounded-lg" />
          <div className="h-12 w-64 bg-card-border rounded-lg" />
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

  const upperTicker = ticker;

  return (
    <div className="mx-auto max-w-3xl px-8 py-12 space-y-10">
      <div className="space-y-6">
        <StockSearch />

        <div className="space-y-1">
          <p className="text-[13px] font-medium text-muted uppercase tracking-widest">
            ${stockData.price.toFixed(2)} • {stockData.volume.toLocaleString()} shares
          </p>
          <h1 className="text-5xl font-serif tracking-[-0.02em] text-foreground">
            {upperTicker}
          </h1>
        </div>
        {sentiment && (
          <div className="text-sm text-muted">
            Sentiment: <span className="font-medium text-foreground">{sentiment.sentiment_label}</span> ({sentiment.sentiment_score.toFixed(2)})
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          {availableTickers.map((t) => (
            <Link
              key={t}
              href={`/dashboard/stocks/${t}`}
              className={`rounded-full px-4 py-1.5 text-[13px] font-mono font-medium border transition-all ${
                t === upperTicker
                  ? "bg-foreground text-background border-foreground shadow-sm"
                  : "bg-transparent border-card-border/80 text-muted hover:text-foreground hover:border-card-border"
              }`}
            >
              {t}
            </Link>
          ))}
        </div>

      </div>

      <div className="rounded-xl border border-card-border/60 bg-card p-6 text-center space-y-3">
        <p className="text-sm text-muted">Real-time stock data loaded from API</p>
        <p className="text-xs text-muted/60">Price and sentiment data are now fetched from your backend</p>
      </div>
    </div>
  );
}
