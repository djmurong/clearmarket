"use client";

import { Position } from "@/lib/types";

function fmt(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function PositionsList({
  positions,
}: {
  positions: Position[];
}) {
  if (positions.length === 0) {
    return (
      <div className="rounded-2xl border border-card-border bg-card p-12 text-center">
        <p className="text-muted text-sm">
          No positions yet. Place a trade to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-card-border bg-card overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-5 gap-2 px-5 py-3 text-[11px] font-medium text-muted uppercase tracking-wider border-b border-card-border bg-surface">
        <span>Ticker</span>
        <span className="text-right">Shares</span>
        <span className="text-right">Avg Cost</span>
        <span className="text-right">Price</span>
        <span className="text-right">P&L</span>
      </div>

      {/* Rows */}
      {positions.map((pos) => {
        const marketValue = pos.currentPrice * pos.shares;
        const costBasis = pos.avgCost * pos.shares;
        const pl = marketValue - costBasis;
        const plPct = costBasis > 0 ? (pl / costBasis) * 100 : 0;
        const isUp = pl >= 0;

        return (
          <div
            key={pos.ticker}
            className="grid grid-cols-5 gap-2 px-5 py-3.5 items-center border-b border-card-border last:border-b-0 hover:bg-surface/50 transition-colors"
          >
            <span className="font-mono text-sm font-bold text-foreground">
              {pos.ticker}
            </span>
            <span className="text-right text-sm text-foreground">
              {pos.shares}
            </span>
            <span className="text-right text-sm text-muted">
              ${fmt(pos.avgCost)}
            </span>
            <span className="text-right text-sm text-foreground">
              ${fmt(pos.currentPrice)}
            </span>
            <div className="text-right">
              <span
                className={`text-sm font-medium ${
                  isUp ? "text-positive" : "text-negative"
                }`}
              >
                {isUp ? "+" : ""}${fmt(pl)}
              </span>
              <span
                className={`block text-[11px] ${
                  isUp ? "text-positive" : "text-negative"
                }`}
              >
                {isUp ? "+" : ""}{plPct.toFixed(2)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
