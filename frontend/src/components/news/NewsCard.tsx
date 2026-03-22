"use client";

import { useState } from "react";
import { NewsArticle, categoryLabels, getCategoryColor, getTimeAgo } from "@/lib/mockNews";

type ActivePanel = null | "summary" | "link";

export default function NewsCard({ article }: { article: NewsArticle }) {
  const [active, setActive] = useState<ActivePanel>(null);
  const color = getCategoryColor(article.category);
  const categoryLabel = categoryLabels[article.category] || "General";
  const categoryChip = categoryLabel.slice(0, 3).toUpperCase();

  function toggle(panel: ActivePanel) {
    setActive((prev) => (prev === panel ? null : panel));
  }

  return (
    <article className="rounded-xl border border-card-border bg-card overflow-hidden hover:shadow-sm transition-shadow">
      <div className="flex gap-4 p-4">
        {article.image_url ? (
          <div
            className="hidden sm:block flex-shrink-0 w-20 h-20 rounded-lg bg-cover bg-center"
            style={{ backgroundImage: `url(${article.image_url})` }}
          />
        ) : (
          <div
            className="hidden sm:flex flex-shrink-0 w-20 h-20 rounded-lg items-center justify-center"
            style={{ background: `${color}15` }}
          >
            <span
              className="text-xs font-bold font-mono"
              style={{ color }}
            >
              {article.symbols[0] || categoryChip}
            </span>
          </div>
        )}

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] text-muted">
            <span className="font-medium">{article.source}</span>
            <span>&middot;</span>
            <span>{getTimeAgo(article.published_at)}</span>
          </div>

          <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
            {article.title}
          </h3>

          <p className="text-xs text-muted leading-relaxed line-clamp-2">
            {article.summary}
          </p>

          <div className="flex items-center gap-2 pt-0.5 flex-wrap">
            <span className="rounded-full bg-accent-surface border border-accent-border px-2 py-0.5 text-[10px] font-medium text-accent">
              {categoryLabel}
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

      <div className="flex border-t border-card-border divide-x divide-card-border">
        <button
          onClick={() => toggle("summary")}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors ${
            active === "summary"
              ? "bg-accent-surface text-accent"
              : "text-muted hover:text-foreground hover:bg-surface"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Summary
        </button>
        <button
          onClick={() => toggle("link")}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors ${
            active === "link"
              ? "bg-accent-surface text-accent"
              : "text-muted hover:text-foreground hover:bg-surface"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Read More
        </button>
      </div>

      {active === "summary" && (
        <div className="border-t border-accent-border bg-accent-surface px-5 py-4 space-y-1.5">
          <p className="text-[10px] font-semibold text-accent uppercase tracking-widest">
            Summary
          </p>
          <p className="text-sm text-foreground leading-relaxed">
            {article.summary}
          </p>
          <p className="text-[11px] text-muted mt-1">
            Hotness: {article.hotness_score.toFixed(0)}
          </p>
        </div>
      )}

      {active === "link" && (
        <div className="border-t border-accent-border bg-accent-surface px-5 py-4 space-y-1.5">
          <p className="text-[10px] font-semibold text-accent uppercase tracking-widest">
            Full Article
          </p>
          <p className="text-sm text-foreground leading-relaxed">
            {article.url && (
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-accent"
              >
                Read the full article at {article.source}
              </a>
            )}
          </p>
        </div>
      )}
    </article>
  );
}
