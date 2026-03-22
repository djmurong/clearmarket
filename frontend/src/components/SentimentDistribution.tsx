import { InterpretationResult } from "@/lib/types";

export default function SentimentDistribution({
  opinions,
}: {
  opinions: InterpretationResult[];
}) {
  const total = opinions.length;
  if (total === 0) return null;

  const positive = opinions.filter((o) => o.sentiment === "positive").length;
  const negative = opinions.filter((o) => o.sentiment === "negative").length;
  const neutral = total - positive - negative;

  const pct = (n: number) => Math.round((n / total) * 100);

  return (
    <div className="rounded-2xl border border-card-border bg-card p-5 space-y-4">
      <h3 className="text-xs font-medium text-muted">
        Sentiment Overview
      </h3>
      <div className="flex h-2 rounded-full overflow-hidden bg-surface">
        {positive > 0 && (
          <div className="bg-positive transition-all" style={{ width: `${pct(positive)}%` }} />
        )}
        {neutral > 0 && (
          <div className="bg-neutral-sentiment transition-all" style={{ width: `${pct(neutral)}%` }} />
        )}
        {negative > 0 && (
          <div className="bg-negative transition-all" style={{ width: `${pct(negative)}%` }} />
        )}
      </div>
      <div className="flex gap-5 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-positive" />
          Positive {pct(positive)}%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-neutral-sentiment" />
          Neutral {pct(neutral)}%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-negative" />
          Negative {pct(negative)}%
        </span>
      </div>
    </div>
  );
}
