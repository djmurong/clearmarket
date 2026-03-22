export type Sentiment = "positive" | "negative" | "neutral";

export type ReasonTag = "earnings" | "economy" | "competition" | "regulation";

export type SourceType = "analyst_report" | "news" | "earnings_summary";

export interface OpinionInput {
  text: string;
  ticker?: string;
  source: SourceType;
}

export interface InterpretationResult {
  id: string;
  ticker: string;
  source: SourceType;
  originalText: string;
  simpleSummary: string;
  eli12Summary: string;
  sentiment: Sentiment;
  reasonTags: ReasonTag[];
  whatItMeans: string;
  timestamp: string;
}

// Paper Trading

export type TradeAction = "buy" | "sell";

export interface Trade {
  id: string;
  ticker: string;
  action: TradeAction;
  shares: number;
  pricePerShare: number;
  total: number;
  timestamp: string;
}

export interface Position {
  ticker: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
}

export interface Portfolio {
  cashBalance: number;
  positions: Position[];
  trades: Trade[];
}
