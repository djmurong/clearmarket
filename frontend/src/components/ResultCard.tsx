"use client";

import { useState } from "react";
import { InterpretationResult } from "@/lib/types";
import SentimentBadge from "./SentimentBadge";
import ReasonTags from "./ReasonTags";
import WhatItMeans from "./WhatItMeans";
import OriginalTextToggle from "./OriginalTextToggle";
import Eli12Toggle from "./Eli12Toggle";

interface ResultCardProps {
  result: InterpretationResult;
  defaultEli12?: boolean;
}

export default function ResultCard({
  result,
  defaultEli12 = false,
}: ResultCardProps) {
  const [eli12, setEli12] = useState(defaultEli12);

  const sourceLabel =
    result.source === "analyst_report"
      ? "Analyst Report"
      : result.source === "news"
      ? "News"
      : "Earnings";

  return (
    <article className="rounded-2xl border border-card-border bg-card p-5 sm:p-6 space-y-5 hover:shadow-sm transition-shadow">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {result.ticker && result.ticker !== "N/A" && (
            <span className="font-mono text-sm font-bold text-foreground">
              {result.ticker}
            </span>
          )}
          <SentimentBadge sentiment={result.sentiment} />
        </div>
        <div className="flex items-center gap-2.5">
          <Eli12Toggle enabled={eli12} onToggle={() => setEli12(!eli12)} />
          <span className="text-[11px] text-muted-dim">{sourceLabel}</span>
        </div>
      </div>

      {/* Topic */}
      {result.topic && (
        <p className="text-xs font-medium text-muted uppercase tracking-wide">
          {result.topic}
        </p>
      )}

      {/* Main Summary */}
      <p className="text-sm sm:text-[15px] leading-relaxed text-foreground">
        {eli12 ? result.eli12Summary : result.simpleSummary}
      </p>

      {/* Sentiment Reason */}
      {result.sentimentReason && (
        <div className="rounded-xl bg-muted/10 border border-card-border/50 px-4 py-3">
          <p className="text-xs font-medium text-muted mb-1">Why this sentiment?</p>
          <p className="text-sm text-foreground leading-relaxed">{result.sentimentReason}</p>
        </div>
      )}

      {/* Key Points */}
      {result.keyPoints && result.keyPoints.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted uppercase tracking-wide">Key Takeaways</p>
          <ul className="space-y-2">
            {result.keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground leading-relaxed">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-foreground/30 shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      <ReasonTags tags={result.reasonTags} />
      <WhatItMeans text={result.whatItMeans} />

      {/* Watch Out */}
      {result.watchOut && (
        <div className="rounded-xl border border-yellow-200/40 bg-yellow-50/30 px-4 py-3">
          <p className="text-xs font-medium text-yellow-700 mb-1">⚠️ Watch out</p>
          <p className="text-sm text-foreground leading-relaxed">{result.watchOut}</p>
        </div>
      )}

      <OriginalTextToggle text={result.originalText} />

      <time className="block text-[11px] text-muted-dim">
        {new Date(result.timestamp).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })}
      </time>
    </article>
  );
}
