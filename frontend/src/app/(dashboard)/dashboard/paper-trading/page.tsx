"use client";

import { useState, useEffect, useCallback } from "react";
import { Portfolio, TradeAction } from "@/lib/types";
import api from "@/lib/apiClient";
import PortfolioSummary from "@/components/paper-trading/PortfolioSummary";
import PositionsList from "@/components/paper-trading/PositionsList";
import TradeForm from "@/components/paper-trading/TradeForm";
import LeaderboardPanel from "@/components/paper-trading/LeaderboardPanel";

type Tab = "portfolio" | "trade" | "leaderboard";

const tabs: { id: Tab; label: string }[] = [
  { id: "portfolio", label: "Portfolio" },
  { id: "trade", label: "Trade" },
  { id: "leaderboard", label: "Leaderboard" },
];

export default function PaperTradingPage() {
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("portfolio");
  const [tradeError, setTradeError] = useState<string | null>(null);
  const [tradeSuccess, setTradeSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Load userId and portfolio on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (!storedUserId) {
      setTradeError("User not logged in. Please log in first.");
      setLoading(false);
      return;
    }
    
    setUserId(storedUserId);
    fetchPortfolio(storedUserId);
  }, []);

  // Transform portfolio data when it changes
  useEffect(() => {
    const transformPositions = async () => {
      if (!portfolioItems.length) {
        setPositions([]);
        return;
      }
      
      const transformed = await Promise.all(
        portfolioItems.map(async (item: any) => {
          try {
            const stockData = await api.price(item.ticker);
            return {
              ticker: item.ticker,
              shares: item.shares || 0,
              avgCost: item.avg_cost || 0,
              currentPrice: stockData.price || 0,
            };
          } catch (err) {
            return {
              ticker: item.ticker,
              shares: item.shares || 0,
              avgCost: item.avg_cost || 0,
              currentPrice: 0,
            };
          }
        })
      );
      setPositions(transformed);
    };

    transformPositions();
  }, [portfolioItems]);

  const fetchPortfolio = async (id: string) => {
    try {
      setLoading(true);
      const data = await api.portfolio(id);
      setPortfolioItems(data || []);
    } catch (err) {
      setTradeError(err instanceof Error ? err.message : "Failed to load portfolio");
    } finally {
      setLoading(false);
    }
  };

  const handleTrade = useCallback(
    async (ticker: string, action: TradeAction, shares: number) => {
      if (!userId) {
        setTradeError("User ID not found");
        return;
      }

      setTradeError(null);
      setTradeSuccess(null);

      try {
        if (action === "buy") {
          await api.buyStock({
            user_id: userId,
            ticker: ticker.toUpperCase(),
            company_name: ticker,
            shares,
          });
        } else {
          await api.sellStock({
            user_id: userId,
            ticker: ticker.toUpperCase(),
            company_name: ticker,
            shares,
          });
        }

        setTradeSuccess(
          `${action === "buy" ? "Bought" : "Sold"} ${shares} share${
            shares !== 1 ? "s" : ""
          } of ${ticker}.`
        );
        setTimeout(() => setTradeSuccess(null), 4000);

        // Refresh portfolio
        await fetchPortfolio(userId);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Trade failed";
        setTradeError(message);
      }
    },
    [userId]
  );

  const getOwnedShares = useCallback(
    (ticker: string) => {
      const position = portfolioItems.find(
        (p) => p.ticker?.toUpperCase() === ticker.toUpperCase()
      );
      return position?.shares ?? 0;
    },
    [portfolioItems]
  );

  const getTotalValue = useCallback(
    () => portfolioItems.reduce((sum, p) => sum + (p.account_value || 0), 0),
    [portfolioItems]
  );

  if (loading) {
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
          Trade stocks using real-time prices from your backend API.
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
          <div className="rounded-2xl border border-card-border bg-card p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted uppercase tracking-widest">
                  Portfolio Value
                </p>
                <p className="text-4xl font-serif tracking-[-0.02em] text-foreground">
                  ${getTotalValue().toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <button
                onClick={() => {
                  if (confirm("Reset portfolio?")) {
                    setPortfolioItems([]);
                  }
                }}
                className="text-xs font-medium text-muted hover:text-negative px-3 py-2 rounded-lg hover:bg-surface transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-xs font-medium text-muted uppercase tracking-wider">
              Positions ({positions.length})
            </h2>
            {positions.length === 0 ? (
              <div className="rounded-xl border border-card-border/60 bg-card p-6 text-center text-muted text-sm">
                No positions yet. Start trading to build your portfolio.
              </div>
            ) : (
              <PositionsList positions={positions} />
            )}
          </div>
        </div>
      )}

      {activeTab === "trade" && (
        <div className="max-w-md">
          <TradeForm
            cashBalance={getTotalValue()}
            ownedShares={getOwnedShares}
            onTrade={handleTrade}
            error={tradeError}
            success={tradeSuccess}
          />
        </div>
      )}

      {activeTab === "leaderboard" && userId && (
        <div className="max-w-2xl">
          <LeaderboardPanel
            userId={userId}
            onCopyComplete={() => fetchPortfolio(userId)}
          />
        </div>
      )}
    </div>
  );
}
