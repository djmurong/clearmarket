"use client";

import { useCallback, useEffect, useState } from "react";
import {
  categoryLabels,
  type NewsArticle,
  type NewsCategory,
  type NewsResponse,
} from "@/lib/mockNews";
import TrendingStory from "@/components/news/TrendingStory";
import NewsCard from "@/components/news/NewsCard";

const allCategories: ("all" | NewsCategory)[] = [
  "all",
  "markets",
  "earnings",
  "economy",
  "crypto",
  "tech",
  "commodities",
];

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState<"all" | NewsCategory>(
    "all"
  );
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [hottest, setHottest] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/news?mode=both&limit=30`);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data: NewsResponse = await res.json();
      if (data.error && (!data.latest || data.latest.length === 0)) {
        setError(data.error);
      }
      setArticles(data.latest || []);
      setHottest(data.hottest?.slice(0, 4) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load news");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const filtered =
    activeCategory === "all"
      ? articles
      : articles.filter(
          (a) => a.category === activeCategory
        );

  return (
    <div className="mx-auto max-w-5xl px-8 py-12 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-4xl font-serif tracking-[-0.02em] text-foreground">
          News
        </h1>
        <p className="text-muted text-[15px] max-w-xl">
          Latest financial news and market updates.
        </p>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-card-border bg-card overflow-hidden animate-pulse"
              >
                <div className="h-28 bg-surface" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-surface rounded w-1/3" />
                  <div className="h-4 bg-surface rounded w-full" />
                  <div className="h-3 bg-surface rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-card-border bg-card p-4 animate-pulse"
              >
                <div className="flex gap-4">
                  <div className="hidden sm:block w-16 h-16 bg-surface rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-surface rounded w-1/4" />
                    <div className="h-4 bg-surface rounded w-3/4" />
                    <div className="h-3 bg-surface rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="rounded-2xl border border-card-border bg-card p-10 text-center space-y-3">
          <p className="text-muted text-sm">{error}</p>
          <button
            onClick={fetchNews}
            className="rounded-full bg-foreground text-background px-4 py-1.5 text-xs font-medium hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      )}

      {/* Content when loaded */}
      {!loading && !error && (
        <>
      {/* Trending section */}
      {activeCategory === "all" && hottest.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-negative opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-negative" />
            </span>
            <h2 className="text-xs font-medium text-muted uppercase tracking-wider">
              Trending Now
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {hottest.map((article) => (
              <TrendingStory key={article.id} article={article} />
            ))}
          </div>
        </div>
      )}

      {/* Category filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${
              activeCategory === cat
                ? "bg-foreground text-background border-foreground"
                : "bg-transparent border-card-border text-muted hover:text-foreground hover:border-muted"
            }`}
          >
            {cat === "all" ? "All" : categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* News feed */}
      <div className="space-y-3">
        <h2 className="text-xs font-medium text-muted uppercase tracking-wider">
          {activeCategory === "all" ? "Latest" : categoryLabels[activeCategory]}
        </h2>
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-card-border bg-card p-10 text-center">
            <p className="text-muted text-sm">
              No articles in this category right now.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
}
