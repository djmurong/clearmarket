"use client";

import { Trade } from "@/lib/types";

function fmt(n: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function TradeHistory({ trades }: { trades: Trade[] }) {
  if (trades.length === 0) {
    return (
      <div className="rounded-2xl border border-card-border bg-card p-10 text-center">
        <p className="text-muted text-sm">No trades yet.</p>
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
                Date
              </th>
              <th className="px-5 py-3 text-[11px] font-medium text-muted uppercase tracking-wider">
                Type
              </th>
              <th className="px-5 py-3 text-[11px] font-medium text-muted uppercase tracking-wider">
                Ticker
              </th>
              <th className="px-5 py-3 text-[11px] font-medium text-muted uppercase tracking-wider text-right">
                Shares
              </th>
              <th className="px-5 py-3 text-[11px] font-medium text-muted uppercase tracking-wider text-right">
                Price
              </th>
              <th className="px-5 py-3 text-[11px] font-medium text-muted uppercase tracking-wider text-right">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr
                key={trade.id}
                className="border-b border-card-border last:border-0 hover:bg-surface/50 transition-colors"
              >
                <td className="px-5 py-4 text-muted whitespace-nowrap">
                  {new Date(trade.timestamp).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      trade.action === "buy"
                        ? "bg-positive-bg text-positive"
                        : "bg-negative-bg text-negative"
                    }`}
                  >
                    {trade.action === "buy" ? "Buy" : "Sell"}
                  </span>
                </td>
                <td className="px-5 py-4 font-mono font-bold text-foreground">
                  {trade.ticker}
                </td>
                <td className="px-5 py-4 text-right text-foreground">
                  {trade.shares}
                </td>
                <td className="px-5 py-4 text-right text-muted">
                  ${fmt(trade.pricePerShare)}
                </td>
                <td className="px-5 py-4 text-right font-medium text-foreground">
                  ${fmt(trade.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
