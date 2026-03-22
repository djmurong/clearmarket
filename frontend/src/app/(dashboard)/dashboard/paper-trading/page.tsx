"use client";

import { useState, useEffect, useCallback } from "react";
import { Portfolio, TradeAction } from "@/lib/types";
import {
  loadPortfolio,
  resetPortfolio,
  executeTrade,
} from "@/lib/paperTradingStore";
import PortfolioSummary from "@/components/paper-trading/PortfolioSummary";
import PositionsList from "@/components/paper-trading/PositionsList";
import TradeForm from "@/components/paper-trading/TradeForm";
import TradeHistory from "@/components/paper-trading/TradeHistory";

type Tab = "portfolio" | "trade" | "history";

const tabs: { id: Tab; label: string }[] = [
  { id: "portfolio", label: "Portfolio" },
  { id: "trade", label: "Trade" },
  { id: "history", label: "History" },
];

export default function PaperTradingPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("portfolio");
  const [tradeError, setTradeError] = useState<string | null>(null);
  const [tradeSuccess, setTradeSuccess] = useState<string | null>(null);

  useEffect(() => {
    setPortfolio(loadPortfolio());
  }, []);

  const handleReset = useCallback(() => {
    if (window.confirm("Reset your portfolio? This will erase all positions and trade history.")) {
      setPortfolio(resetPortfolio());
      setTradeError(null);
      setTradeSuccess(null);
    }
  }, []);

  const handleTrade = useCallback(
    (ticker: string, action: TradeAction, shares: number) => {
      if (!portfolio) return;
      setTradeError(null);
      setTradeSuccess(null);

      const result = executeTrade(portfolio, ticker, action, shares);

      if (result.error) {
        setTradeError(result.error);
      } else {
        setTradeSuccess(
          `${action === "buy" ? "Bought" : "Sold"} ${shares} share${
            shares !== 1 ? "s" : ""
          } of ${ticker}.`
        );
        setTimeout(() => setTradeSuccess(null), 4000);
      }

      setPortfolio(result.portfolio);
    },
    [portfolio]
  );

  const getOwnedShares = useCallback(
    (ticker: string) => {
      if (!portfolio) return 0;
      const pos = portfolio.positions.find(
        (p) => p.ticker === ticker.toUpperCase()
      );
      return pos?.shares ?? 0;
    },
    [portfolio]
  );

  if (!portfolio) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-card-border rounded-lg" />
          <div className="h-40 bg-card-border rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-8 py-12 space-y-10">
      <div className="space-y-3">
        <h1 className="text-4xl font-serif tracking-[-0.02em] text-foreground">
          Paper Trading
        </h1>
        <p className="text-muted text-[15px] leading-relaxed max-w-xl">
          Practice trading with $100,000 in simulated funds. No real money involved.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-card-border bg-surface p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setTradeError(null);
              setTradeSuccess(null);
            }}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "portfolio" && (
        <div className="space-y-6">
          <PortfolioSummary portfolio={portfolio} onReset={handleReset} />
          <div className="space-y-3">
            <h2 className="text-xs font-medium text-muted uppercase tracking-wider">
              Positions
            </h2>
            <PositionsList positions={portfolio.positions} />
          </div>
        </div>
      )}

      {activeTab === "trade" && (
        <div className="max-w-md">
          <TradeForm
            cashBalance={portfolio.cashBalance}
            ownedShares={getOwnedShares}
            onTrade={handleTrade}
            error={tradeError}
            success={tradeSuccess}
          />
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-medium text-muted uppercase tracking-wider">
              Trade History
            </h2>
            <span className="text-xs text-muted-dim">
              {portfolio.trades.length} trade{portfolio.trades.length !== 1 ? "s" : ""}
            </span>
          </div>
          <TradeHistory trades={portfolio.trades} />
        </div>
      )}
    </div>
  );
}
