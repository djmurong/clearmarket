import { ReasonTag } from "@/lib/types";

const tagLabels: Record<ReasonTag, string> = {
  earnings: "Earnings",
  economy: "Economy",
  competition: "Competition",
  regulation: "Regulation",
};

export default function ReasonTags({ tags }: { tags: ReasonTag[] }) {
  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full border border-card-border bg-surface px-2.5 py-0.5 text-[11px] text-muted"
        >
          {tagLabels[tag]}
        </span>
      ))}
    </div>
  );
}
