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
    <article className="rounded-2xl border border-card-border bg-card p-5 sm:p-6 space-y-4 hover:shadow-sm transition-shadow">
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

      <p className="text-sm sm:text-[15px] leading-relaxed text-foreground">
        {eli12 ? result.eli12Summary : result.simpleSummary}
      </p>

      <ReasonTags tags={result.reasonTags} />
      <WhatItMeans text={result.whatItMeans} />
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
