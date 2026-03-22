"use client";

export default function Eli12Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium border transition-colors ${
        enabled
          ? "bg-accent text-white border-accent"
          : "bg-transparent text-muted border-card-border hover:border-muted-dim hover:text-foreground"
      }`}
      aria-pressed={enabled}
    >
      ELI12
      <span
        className={`relative inline-flex h-3.5 w-6 rounded-full transition-colors ${
          enabled ? "bg-white/30" : "bg-card-border"
        }`}
      >
        <span
          className={`absolute top-0.5 h-2.5 w-2.5 rounded-full transition-transform ${
            enabled
              ? "translate-x-3 bg-white"
              : "translate-x-0.5 bg-muted-dim"
          }`}
        />
      </span>
    </button>
  );
}
