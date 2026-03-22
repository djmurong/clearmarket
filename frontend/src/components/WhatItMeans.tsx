export default function WhatItMeans({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-accent-border bg-accent-surface p-4">
      <p className="text-[10px] font-semibold text-accent uppercase tracking-widest mb-1.5">
        What this means
      </p>
      <p className="text-sm text-foreground leading-relaxed">{text}</p>
    </div>
  );
}
