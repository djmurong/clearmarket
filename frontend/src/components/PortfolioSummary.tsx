"use client";

import { Portfolio } from "@/lib/types";
import { getPortfolioValue, getPortfolioGain } from "@/lib/paperTradingStore";

function fmt(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function PortfolioSummary({
  portfolio,
  onReset,
}: {
  portfolio: Portfolio;
  onReset: () => void;
}) {
  const totalValue = getPortfolioValue(portfolio);
  const { amount: gainAmt, percent: gainPct } = getPortfolioGain(portfolio);
  const isUp = gainAmt >= 0;

  const positionsValue = totalValue - portfolio.cashBalance;

  return (
    <div className="space-y-6">
      {/* Total value card */}
      <div className="rounded-2xl border border-card-border bg-card p-6 sm:p-8">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">
            Total Portfolio Value
          </p>
          <p className="text-4xl font-serif tracking-[-0.02em] text-foreground">
            ${fmt(totalValue)}
          </p>
          <p
            className={`text-sm font-medium ${
              isUp ? "text-positive" : "text-negative"
            }`}
          >
            {isUp ? "+" : ""}${fmt(gainAmt)} ({isUp ? "+" : ""}
            {gainPct}%) all time
          </p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-card-border bg-card p-4 space-y-1">
          <p className="text-[11px] text-muted uppercase tracking-wider">Cash</p>
          <p className="text-lg font-semibold">${fmt(portfolio.cashBalance)}</p>
        </div>
        <div className="rounded-xl border border-card-border bg-card p-4 space-y-1">
          <p className="text-[11px] text-muted uppercase tracking-wider">Invested</p>
          <p className="text-lg font-semibold">${fmt(positionsValue)}</p>
        </div>
        <div className="rounded-xl border border-card-border bg-card p-4 space-y-1">
          <p className="text-[11px] text-muted uppercase tracking-wider">Positions</p>
          <p className="text-lg font-semibold">{portfolio.positions.length}</p>
        </div>
      </div>

      {/* Reset */}
      <div className="flex justify-end">
        <button
          onClick={onReset}
          className="text-xs text-muted-dim hover:text-negative transition-colors"
        >
          Reset portfolio to $100,000
        </button>
      </div>
    </div>
  );
}
