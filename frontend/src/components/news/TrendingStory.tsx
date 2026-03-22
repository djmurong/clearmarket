"use client";

import { useState } from "react";
import { NewsArticle, getTimeAgo } from "@/lib/mockNews";

type ActivePanel = null | "simplified" | "takeaway";

export default function TrendingStory({ article }: { article: NewsArticle }) {
  const [active, setActive] = useState<ActivePanel>(null);

  function toggle(panel: ActivePanel) {
    setActive((prev) => (prev === panel ? null : panel));
  }

  return (
    <article className="group rounded-2xl border border-card-border bg-card overflow-hidden hover:shadow-sm transition-shadow flex flex-col">
      {/* Color banner */}
      <div
        className="h-28 flex items-end p-4"
        style={{ background: `linear-gradient(135deg, ${article.imageColor}, ${article.imageColor}cc)` }}
      >
        <span className="rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-0.5 text-[11px] font-medium text-white">
          Trending
        </span>
      </div>

      <div className="p-4 space-y-2.5 flex-1">
        <div className="flex items-center gap-2 text-[11px] text-muted">
          <span className="font-medium">{article.source}</span>
          <span>&middot;</span>
          <span>{getTimeAgo(article.publishedAt)}</span>
        </div>

        <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-accent transition-colors">
          {article.title}
        </h3>

        <p className="text-xs text-muted leading-relaxed line-clamp-2">
          {article.summary}
        </p>

        {article.symbols.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {article.symbols.map((t) => (
              <span
                key={t}
                className="rounded-full bg-surface border border-card-border px-2 py-0.5 text-[10px] font-mono text-muted"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex border-t border-card-border divide-x divide-card-border mt-auto">
        <button
          onClick={() => toggle("simplified")}
          className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-[11px] font-medium transition-colors ${
            active === "simplified"
              ? "bg-accent-surface text-accent"
              : "text-muted hover:text-foreground hover:bg-surface"
          }`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Simplify
        </button>
        <button
          onClick={() => toggle("takeaway")}
          className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-[11px] font-medium transition-colors ${
            active === "takeaway"
              ? "bg-accent-surface text-accent"
              : "text-muted hover:text-foreground hover:bg-surface"
          }`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Takeaway
        </button>
      </div>

      {/* Expandable panels */}
      {active === "simplified" && (
        <div className="border-t border-accent-border bg-accent-surface px-4 py-3 space-y-1">
          <p className="text-[10px] font-semibold text-accent uppercase tracking-widest">
            Sentiment
          </p>
          <p className="text-xs text-foreground leading-relaxed">
            {article.sentimentLabel} (score: {article.sentimentScore.toFixed(2)})
          </p>
        </div>
      )}

      {active === "takeaway" && (
        <div className="border-t border-accent-border bg-accent-surface px-4 py-3 space-y-1">
          <p className="text-[10px] font-semibold text-accent uppercase tracking-widest">
            Key Info
          </p>
          <p className="text-xs text-foreground leading-relaxed">
            Relevance: {(article.relevanceScore * 100).toFixed(0)}%
            {article.url && (
              <>
                {" — "}
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-accent"
                >
                  Read full article
                </a>
              </>
            )}
          </p>
        </div>
      )}
    </article>
  );
}
