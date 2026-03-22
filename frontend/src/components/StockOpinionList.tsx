import { InterpretationResult } from "@/lib/types";
import ResultCard from "./ResultCard";

export default function StockOpinionList({
  opinions,
}: {
  opinions: InterpretationResult[];
}) {
  if (opinions.length === 0) {
    return (
      <div className="rounded-2xl border border-card-border bg-card p-12 text-center">
        <p className="text-muted text-sm">
          No interpreted opinions for this ticker yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {opinions.map((opinion) => (
        <ResultCard key={opinion.id} result={opinion} />
      ))}
    </div>
  );
}
