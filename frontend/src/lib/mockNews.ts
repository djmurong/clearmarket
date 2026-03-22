export interface NewsArticle {
  id: string;
  finnhub_id: number;
  title: string;
  summary: string;
  url: string;
  source: string;
  published_at: string;
  image_url: string | null;
  symbols: string[];
  category: NewsCategory;
  hotness_score: number;
}

export type NewsCategory =
  | "general"
  | "forex"
  | "crypto"
  | "merger";

export const categoryLabels: Record<NewsCategory, string> = {
  general: "General",
  forex: "Forex",
  crypto: "Crypto",
  merger: "M&A",
};

const CATEGORY_COLORS: Record<NewsCategory, string> = {
  general: "#3b82f6",
  forex: "#10b981",
  crypto: "#f59e0b",
  merger: "#8b5cf6",
};

export function getCategoryColor(category: NewsCategory): string {
  return CATEGORY_COLORS[category] || "#6b7280";
}

export function getTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
