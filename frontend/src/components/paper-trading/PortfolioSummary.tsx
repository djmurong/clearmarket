"use client";

import { Portfolio } from "@/lib/types";
import { getPortfolioValue, getPortfolioGain } from "@/lib/paperTradingStore";

function fmt(n: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function PortfolioSummary({
  portfolio,
  onReset,
}: {
  portfolio: Portfolio;
  onReset: () => void;
}) {
  const totalValue = getPortfolioValue(portfolio);
  const { amount: gainAmount, percent: gainPct } = getPortfolioGain(portfolio);
  const isUp = gainAmount >= 0;

  return (
    <div className="rounded-2xl border border-card-border bg-card p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">
            Portfolio Value
          </p>
          <p className="text-4xl font-serif tracking-[-0.02em] text-foreground">
            ${fmt(totalValue)}
          </p>
          <p
            className={`text-sm font-medium ${
              isUp ? "text-positive" : "text-negative"
            }`}
          >
            {isUp ? "+" : ""}
            ${fmt(gainAmount)} ({isUp ? "+" : ""}
            {gainPct}%)
          </p>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-muted-dim hover:text-negative transition-colors"
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-surface border border-card-border p-4 space-y-1">
          <p className="text-[11px] text-muted uppercase tracking-wider">
            Cash
          </p>
          <p className="text-lg font-semibold text-foreground">
            ${fmt(portfolio.cashBalance)}
          </p>
        </div>
        <div className="rounded-xl bg-surface border border-card-border p-4 space-y-1">
          <p className="text-[11px] text-muted uppercase tracking-wider">
            Invested
          </p>
          <p className="text-lg font-semibold text-foreground">
            ${fmt(totalValue - portfolio.cashBalance)}
          </p>
        </div>
      </div>
    </div>
  );
}
