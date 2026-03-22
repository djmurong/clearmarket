import { Portfolio, Position, Trade, TradeAction } from "./types";

const STORAGE_KEY = "clearmarket_portfolio";
const STARTING_CASH = 100_000;

const MOCK_PRICES: Record<string, number> = {
  AAPL: 178.72,
  TSLA: 171.05,
  MSFT: 420.55,
  GOOGL: 155.37,
  AMZN: 182.41,
  NVDA: 875.28,
  META: 502.30,
  JPM: 198.47,
  V: 278.93,
  DIS: 112.64,
};

export function getPrice(ticker: string): number | null {
  return MOCK_PRICES[ticker.toUpperCase()] ?? null;
}

export function getAllTickers(): string[] {
  return Object.keys(MOCK_PRICES).sort();
}

export function loadPortfolio(): Portfolio {
  if (typeof window === "undefined") {
    return { cashBalance: STARTING_CASH, positions: [], trades: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Portfolio;
      return {
        cashBalance: parsed.cashBalance,
        positions: parsed.positions.map((p) => ({
          ...p,
          currentPrice: MOCK_PRICES[p.ticker] ?? p.currentPrice,
        })),
        trades: parsed.trades,
      };
    }
  } catch {
    // corrupted data, start fresh
  }
  return { cashBalance: STARTING_CASH, positions: [], trades: [] };
}

function savePortfolio(portfolio: Portfolio) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
}

export function resetPortfolio(): Portfolio {
  const fresh: Portfolio = {
    cashBalance: STARTING_CASH,
    positions: [],
    trades: [],
  };
  savePortfolio(fresh);
  return fresh;
}

export function executeTrade(
  portfolio: Portfolio,
  ticker: string,
  action: TradeAction,
  shares: number
): { portfolio: Portfolio; error?: string } {
  const upperTicker = ticker.toUpperCase();
  const price = getPrice(upperTicker);

  if (!price) {
    return { portfolio, error: `Ticker ${upperTicker} is not available for paper trading.` };
  }

  if (shares <= 0 || !Number.isFinite(shares)) {
    return { portfolio, error: "Share count must be a positive number." };
  }

  const total = Math.round(price * shares * 100) / 100;

  if (action === "buy") {
    if (total > portfolio.cashBalance) {
      return {
        portfolio,
        error: `Insufficient funds. You need $${total.toLocaleString()} but have $${portfolio.cashBalance.toLocaleString()}.`,
      };
    }

    const existingIdx = portfolio.positions.findIndex(
      (p) => p.ticker === upperTicker
    );
    const newPositions = [...portfolio.positions];

    if (existingIdx >= 0) {
      const existing = newPositions[existingIdx];
      const totalShares = existing.shares + shares;
      const totalCost = existing.avgCost * existing.shares + price * shares;
      newPositions[existingIdx] = {
        ticker: upperTicker,
        shares: totalShares,
        avgCost: Math.round((totalCost / totalShares) * 100) / 100,
        currentPrice: price,
      };
    } else {
      newPositions.push({
        ticker: upperTicker,
        shares,
        avgCost: price,
        currentPrice: price,
      });
    }

    const trade: Trade = {
      id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ticker: upperTicker,
      action: "buy",
      shares,
      pricePerShare: price,
      total,
      timestamp: new Date().toISOString(),
    };

    const updated: Portfolio = {
      cashBalance: Math.round((portfolio.cashBalance - total) * 100) / 100,
      positions: newPositions,
      trades: [trade, ...portfolio.trades],
    };

    savePortfolio(updated);
    return { portfolio: updated };
  }

  // sell
  const existingIdx = portfolio.positions.findIndex(
    (p) => p.ticker === upperTicker
  );

  if (existingIdx < 0) {
    return { portfolio, error: `You don't own any shares of ${upperTicker}.` };
  }

  const existing = portfolio.positions[existingIdx];
  if (shares > existing.shares) {
    return {
      portfolio,
      error: `You only own ${existing.shares} shares of ${upperTicker}.`,
    };
  }

  const newPositions = [...portfolio.positions];
  if (shares === existing.shares) {
    newPositions.splice(existingIdx, 1);
  } else {
    newPositions[existingIdx] = {
      ...existing,
      shares: existing.shares - shares,
      currentPrice: price,
    };
  }

  const trade: Trade = {
    id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ticker: upperTicker,
    action: "sell",
    shares,
    pricePerShare: price,
    total,
    timestamp: new Date().toISOString(),
  };

  const updated: Portfolio = {
    cashBalance: Math.round((portfolio.cashBalance + total) * 100) / 100,
    positions: newPositions,
    trades: [trade, ...portfolio.trades],
  };

  savePortfolio(updated);
  return { portfolio: updated };
}

export function getPortfolioValue(portfolio: Portfolio): number {
  const positionsValue = portfolio.positions.reduce(
    (sum, p) => sum + p.currentPrice * p.shares,
    0
  );
  return Math.round((portfolio.cashBalance + positionsValue) * 100) / 100;
}

export function getPortfolioGain(portfolio: Portfolio): {
  amount: number;
  percent: number;
} {
  const totalValue = getPortfolioValue(portfolio);
  const amount = Math.round((totalValue - STARTING_CASH) * 100) / 100;
  const percent =
    STARTING_CASH > 0
      ? Math.round((amount / STARTING_CASH) * 10000) / 100
      : 0;
  return { amount, percent };
}
