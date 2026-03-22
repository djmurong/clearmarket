"use client";

import { useState } from "react";
import { NewsArticle, getCategoryColor, getTimeAgo } from "@/lib/mockNews";

type ActivePanel = null | "summary" | "link";

export default function TrendingStory({ article }: { article: NewsArticle }) {
  const [active, setActive] = useState<ActivePanel>(null);
  const color = getCategoryColor(article.category);

  function toggle(panel: ActivePanel) {
    setActive((prev) => (prev === panel ? null : panel));
  }

  return (
    <article className="group rounded-2xl border border-card-border bg-card overflow-hidden hover:shadow-sm transition-shadow flex flex-col">
      <div
        className="h-36 flex items-end p-4 bg-cover bg-center relative"
        style={article.image_url
          ? { backgroundImage: `url(${article.image_url})` }
          : { background: `linear-gradient(135deg, ${color}, ${color}cc)` }
        }
      >
        {article.image_url && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        )}
        <span className="relative rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-0.5 text-[11px] font-medium text-white">
          Trending
        </span>
      </div>

      <div className="p-4 space-y-2.5 flex-1">
        <div className="flex items-center gap-2 text-[11px] text-muted">
          <span className="font-medium">{article.source}</span>
          <span>&middot;</span>
          <span>{getTimeAgo(article.published_at)}</span>
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

      <div className="flex border-t border-card-border divide-x divide-card-border mt-auto">
        <button
          onClick={() => toggle("summary")}
          className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-[11px] font-medium transition-colors ${
            active === "summary"
              ? "bg-accent-surface text-accent"
              : "text-muted hover:text-foreground hover:bg-surface"
          }`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Summary
        </button>
        <button
          onClick={() => toggle("link")}
          className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-[11px] font-medium transition-colors ${
            active === "link"
              ? "bg-accent-surface text-accent"
              : "text-muted hover:text-foreground hover:bg-surface"
          }`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Read
        </button>
      </div>

      {active === "summary" && (
        <div className="border-t border-accent-border bg-accent-surface px-4 py-3 space-y-1">
          <p className="text-[10px] font-semibold text-accent uppercase tracking-widest">
            Summary
          </p>
          <p className="text-xs text-foreground leading-relaxed">
            {article.summary}
          </p>
          <p className="text-[10px] text-muted mt-1">
            Hotness: {article.hotness_score.toFixed(0)}
          </p>
        </div>
      )}

      {active === "link" && (
        <div className="border-t border-accent-border bg-accent-surface px-4 py-3 space-y-1">
          <p className="text-[10px] font-semibold text-accent uppercase tracking-widest">
            Full Article
          </p>
          <p className="text-xs text-foreground leading-relaxed">
            {article.url && (
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-accent"
              >
                Read full article at {article.source}
              </a>
            )}
          </p>
        </div>
      )}
    </article>
  );
}
