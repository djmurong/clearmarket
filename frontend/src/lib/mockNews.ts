export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl: string | null;
  sentimentLabel: string;
  sentimentScore: number;
  symbols: string[];
  relevanceScore: number;
  category: NewsCategory;
  imageColor: string;
}

export interface NewsMeta {
  provider: string;
  fetchedAt: string;
  query: { tickers?: string; topics?: string; limit: number };
  total: number;
}

export interface NewsResponse {
  latest?: NewsArticle[];
  hottest?: NewsArticle[];
  meta: NewsMeta;
  error?: string;
}

export type NewsCategory =
  | "markets"
  | "earnings"
  | "economy"
  | "crypto"
  | "tech"
  | "commodities";

export const categoryLabels: Record<NewsCategory, string> = {
  markets: "Markets",
  earnings: "Earnings",
  economy: "Economy",
  crypto: "Crypto",
  tech: "Tech",
  commodities: "Commodities",
};

// Kept for compatibility with existing imports.
export const mockNews: NewsArticle[] = [];

export function getTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
