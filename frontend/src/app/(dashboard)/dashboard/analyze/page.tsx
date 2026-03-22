"use client";

import { useState } from "react";
import OpinionInput from "@/components/OpinionInput";
import ResultCard from "@/components/ResultCard";
import { InterpretationResult, SourceType } from "@/lib/types";

export default function AnalyzePage() {
  const [result, setResult] = useState<InterpretationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: {
    text?: string;
    url?: string;
    ticker: string;
    source: SourceType;
  }) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Analysis failed. Please try again.");
      }

      const json: InterpretationResult = await res.json();
      setResult(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-8 py-12 space-y-10">
      <div className="space-y-3">
        <h1 className="text-4xl font-serif tracking-[-0.02em] text-foreground">
          Analyze
        </h1>
        <p className="text-muted text-[15px] leading-relaxed max-w-xl">
          Paste a professional financial opinion or article URL to get a simplified, beginner-friendly breakdown.
        </p>
      </div>

      <div className="rounded-3xl border border-card-border/60 bg-card p-8 sm:p-10 shadow-sm">
        <OpinionInput onSubmit={handleSubmit} loading={loading} />
      </div>

      {error && (
        <div className="rounded-xl border border-negative/20 bg-negative-bg p-4 text-sm text-negative">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-3">
          <h2 className="text-xs font-medium text-muted">Result</h2>
          <ResultCard result={result} />
        </div>
      )}
    </div>
  );
}
