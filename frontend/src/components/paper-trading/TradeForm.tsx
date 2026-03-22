"use client";

import { useState, useEffect } from "react";
import { TradeAction } from "@/lib/types";
import api from "@/lib/apiClient";

function fmt(n: number | undefined): string {
  if (!n || isNaN(n)) return "0.00";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// List of common tickers to trade
const DEFAULT_TICKERS = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA", "JPM"];

interface TradeFormProps {
  cashBalance: number;
  ownedShares: (ticker: string) => number;
  onTrade: (ticker: string, action: TradeAction, shares: number) => void;
  error: string | null;
  success: string | null;
}

export default function TradeForm({
  cashBalance,
  ownedShares,
  onTrade,
  error,
  success,
}: TradeFormProps) {
  const [ticker, setTicker] = useState(DEFAULT_TICKERS[0]);
  const [action, setAction] = useState<TradeAction>("buy");
  const [sharesStr, setSharesStr] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);

  // Fetch price when ticker changes
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setLoadingPrice(true);
        setPriceError(null);
        const stockData = await api.price(ticker);
        setPrice(stockData.price);
      } catch (err) {
        setPriceError(err instanceof Error ? err.message : "Failed to load price");
        setPrice(null);
      } finally {
        setLoadingPrice(false);
      }
    };

    fetchPrice();
  }, [ticker]);

  const shares = parseInt(sharesStr, 10);
  const estimatedTotal =
    price && shares > 0 ? Math.round(price * shares * 100) / 100 : 0;
  const currentlyOwned = ownedShares(ticker);
  const hasInsufficientFunds = action === "buy" && estimatedTotal > cashBalance;
  const hasInsufficientShares = action === "sell" && shares > currentlyOwned;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shares || shares <= 0 || !price) return;
    if (hasInsufficientFunds || hasInsufficientShares) return;
    onTrade(ticker, action, shares);
    setSharesStr("");
  };

  return (
    <div className="rounded-2xl border border-card-border bg-card p-6 space-y-5">
      <h3 className="text-sm font-semibold text-foreground">Place a Trade</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Buy / Sell toggle */}
        <div className="flex rounded-lg border border-card-border overflow-hidden">
          {(["buy", "sell"] as TradeAction[]).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAction(a)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                action === a
                  ? a === "buy"
                    ? "bg-positive text-white"
                    : "bg-negative text-white"
                  : "bg-transparent text-muted hover:bg-surface"
              }`}
            >
              {a === "buy" ? "Buy" : "Sell"}
            </button>
          ))}
        </div>

        {/* Ticker */}
        <div>
          <label
            htmlFor="pt-ticker"
            className="block text-xs font-medium text-muted mb-2"
          >
            Ticker
          </label>
          <select
            id="pt-ticker"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            className="w-full rounded-xl border border-card-border bg-background px-4 py-2.5 text-sm font-mono text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-colors"
          >
            {DEFAULT_TICKERS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Current Price */}
        {loadingPrice && (
          <div className="text-xs text-muted animate-pulse">Loading price...</div>
        )}
        {priceError && (
          <div className="text-xs text-negative">{priceError}</div>
        )}

        {/* Shares */}
        <div>
          <label
            htmlFor="pt-shares"
            className="block text-xs font-medium text-muted mb-2"
          >
            Shares
          </label>
          <input
            id="pt-shares"
            type="number"
            min="1"
            step="1"
            value={sharesStr}
            onChange={(e) => setSharesStr(e.target.value)}
            placeholder="0"
            disabled={!price || loadingPrice}
            className="w-full rounded-xl border border-card-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-dim focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-colors disabled:opacity-50"
            required
          />
        </div>

        {/* Order preview */}
        <div className="rounded-xl bg-surface border border-card-border p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Price per share</span>
            <span className="text-foreground font-medium">
              {price ? `$${fmt(price)}` : "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Estimated total</span>
            <span className="text-foreground font-medium">
              {estimatedTotal > 0 ? `$${fmt(estimatedTotal)}` : "—"}
            </span>
          </div>
          {action === "buy" && (
            <div className="flex justify-between">
              <span className="text-muted">Buying power</span>
              <span className={`font-medium ${hasInsufficientFunds ? "text-negative" : "text-foreground"}`}>
                ${fmt(cashBalance)}
              </span>
            </div>
          )}
          {action === "sell" && (
            <div className="flex justify-between">
              <span className="text-muted">Shares owned</span>
              <span className={`font-medium ${hasInsufficientShares ? "text-negative" : "text-foreground"}`}>
                {currentlyOwned}
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-negative/20 bg-negative-bg p-3 text-xs text-negative">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-positive/20 bg-positive-bg p-3 text-xs text-positive">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={!price || loadingPrice || shares <= 0 || hasInsufficientFunds || hasInsufficientShares}
          className={`w-full py-3 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            action === "buy"
              ? "bg-positive text-white hover:bg-positive/90"
              : "bg-negative text-white hover:bg-negative/90"
          }`}
        >
          {loadingPrice ? "Loading price..." : `${action === "buy" ? "Buy" : "Sell"} ${ticker}`}
        </button>
      </form>
    </div>
  );
}
