import { Sentiment } from "@/lib/types";

const config: Record<Sentiment, { label: string; dot: string; bg: string; text: string }> = {
  positive: {
    label: "Positive",
    dot: "bg-positive",
    bg: "bg-positive-bg",
    text: "text-positive",
  },
  negative: {
    label: "Negative",
    dot: "bg-negative",
    bg: "bg-negative-bg",
    text: "text-negative",
  },
  neutral: {
    label: "Neutral",
    dot: "bg-neutral-sentiment",
    bg: "bg-neutral-bg",
    text: "text-neutral-sentiment",
  },
};

export default function SentimentBadge({ sentiment }: { sentiment: Sentiment }) {
  const c = config[sentiment];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${c.bg} ${c.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
