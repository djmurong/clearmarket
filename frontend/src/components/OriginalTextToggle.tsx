"use client";

import { useState } from "react";

export default function OriginalTextToggle({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-muted hover:text-foreground transition-colors flex items-center gap-1.5"
        aria-expanded={open}
      >
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-90" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {open ? "Hide" : "Show"} original text
      </button>
      {open && (
        <div className="mt-3 rounded-xl border border-card-border bg-surface p-4">
          <p className="text-xs text-muted italic leading-relaxed">
            &ldquo;{text}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
