"use client";

import { useState } from "react";
import { NewsArticle, categoryLabels, getTimeAgo } from "@/lib/mockNews";

type ActivePanel = null | "simplified" | "takeaway";

export default function NewsCard({ article }: { article: NewsArticle }) {
  const [active, setActive] = useState<ActivePanel>(null);

  function toggle(panel: ActivePanel) {
    setActive((prev) => (prev === panel ? null : panel));
  }

  return (
    <article className="rounded-xl border border-card-border bg-card overflow-hidden hover:shadow-sm transition-shadow">
      <div className="flex gap-4 p-4">
        {/* Color swatch */}
        <div
          className="hidden sm:flex flex-shrink-0 w-16 h-16 rounded-lg items-center justify-center"
          style={{ background: `${article.imageColor}15` }}
        >
          <span
            className="text-xs font-bold font-mono"
            style={{ color: article.imageColor }}
          >
            {article.symbols[0] || categoryLabels[article.category].slice(0, 3).toUpperCase()}
          </span>
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] text-muted">
            <span className="font-medium">{article.source}</span>
            <span>&middot;</span>
            <span>{getTimeAgo(article.publishedAt)}</span>
          </div>

          <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
            {article.title}
          </h3>

          <p className="text-xs text-muted leading-relaxed line-clamp-2">
            {article.summary}
          </p>

          <div className="flex items-center gap-2 pt-0.5 flex-wrap">
            <span className="rounded-full bg-accent-surface border border-accent-border px-2 py-0.5 text-[10px] font-medium text-accent">
              {categoryLabels[article.category]}
            </span>
            {article.symbols.slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-full bg-surface border border-card-border px-2 py-0.5 text-[10px] font-mono text-muted"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex border-t border-card-border divide-x divide-card-border">
        <button
          onClick={() => toggle("simplified")}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors ${
            active === "simplified"
              ? "bg-accent-surface text-accent"
              : "text-muted hover:text-foreground hover:bg-surface"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Simplify
        </button>
        <button
          onClick={() => toggle("takeaway")}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors ${
            active === "takeaway"
              ? "bg-accent-surface text-accent"
              : "text-muted hover:text-foreground hover:bg-surface"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Key Takeaway
        </button>
      </div>

      {/* Expandable panels */}
      {active === "simplified" && (
        <div className="border-t border-accent-border bg-accent-surface px-5 py-4 space-y-1.5">
          <p className="text-[10px] font-semibold text-accent uppercase tracking-widest">
            Sentiment
          </p>
          <p className="text-sm text-foreground leading-relaxed">
            {article.sentimentLabel} (score: {article.sentimentScore.toFixed(2)})
          </p>
        </div>
      )}

      {active === "takeaway" && (
        <div className="border-t border-accent-border bg-accent-surface px-5 py-4 space-y-1.5">
          <p className="text-[10px] font-semibold text-accent uppercase tracking-widest">
            Full Article
          </p>
          <p className="text-sm text-foreground leading-relaxed">
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
                  Read the full article
                </a>
              </>
            )}
          </p>
        </div>
      )}
    </article>
  );
}
