"use client";

import { Position } from "@/lib/types";

function fmt(n: number | undefined): string {
  if (!n || isNaN(n)) return "0.00";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function PositionsList({
  positions,
}: {
  positions: Position[];
}) {
  if (positions.length === 0) {
    return (
      <div className="rounded-2xl border border-card-border bg-card p-10 text-center">
        <p className="text-muted text-sm">
          No positions yet. Place a trade to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-card-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-card-border bg-surface text-left">
              <th className="px-5 py-3 text-[11px] font-medium text-muted uppercase tracking-wider">
                Name
              </th>
              <th className="px-5 py-3 text-[11px] font-medium text-muted uppercase tracking-wider text-right">
                Price
              </th>
              <th className="px-5 py-3 text-[11px] font-medium text-muted uppercase tracking-wider text-right">
                Shares
              </th>
              <th className="px-5 py-3 text-[11px] font-medium text-muted uppercase tracking-wider text-right">
                Avg Cost
              </th>
              <th className="px-5 py-3 text-[11px] font-medium text-muted uppercase tracking-wider text-right">
                Market Value
              </th>
              <th className="px-5 py-3 text-[11px] font-medium text-muted uppercase tracking-wider text-right">
                Gain / Loss
              </th>
            </tr>
          </thead>
          <tbody>
            {positions.map((pos) => {
              const marketValue = pos.currentPrice * pos.shares;
              const costBasis = pos.avgCost * pos.shares;
              const gain = marketValue - costBasis;
              const gainPct =
                costBasis > 0
                  ? Math.round((gain / costBasis) * 10000) / 100
                  : 0;
              const isUp = gain >= 0;

              return (
                <tr
                  key={pos.ticker}
                  className="border-b border-card-border last:border-0 hover:bg-surface/50 transition-colors"
                >
                  <td className="px-5 py-4">
                    <span className="font-mono font-bold text-foreground">
                      {pos.ticker}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right text-foreground">
                    ${fmt(pos.currentPrice)}
                  </td>
                  <td className="px-5 py-4 text-right text-foreground">
                    {pos.shares}
                  </td>
                  <td className="px-5 py-4 text-right text-muted">
                    ${fmt(pos.avgCost)}
                  </td>
                  <td className="px-5 py-4 text-right font-medium text-foreground">
                    ${fmt(marketValue)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span
                      className={`font-medium ${
                        isUp ? "text-positive" : "text-negative"
                      }`}
                    >
                      {isUp ? "+" : ""}${fmt(gain)}
                    </span>
                    <span className="text-muted-dim text-xs ml-1">
                      ({isUp ? "+" : ""}
                      {gainPct}%)
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
