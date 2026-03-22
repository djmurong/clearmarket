import Link from "next/link";
import {
  getMockResultsForTicker,
  availableTickers,
  stockDirectory,
} from "@/lib/mockData";
import StockOpinionList from "@/components/StockOpinionList";
import SentimentDistribution from "@/components/SentimentDistribution";
import StockSearch from "@/components/StockSearch";

interface StockPageProps {
  params: Promise<{ ticker: string }>;
}

export default async function StockPage({ params }: StockPageProps) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();
  const opinions = getMockResultsForTicker(upperTicker);
  const stockMeta = stockDirectory.find((s) => s.ticker === upperTicker);

  return (
    <div className="mx-auto max-w-3xl px-8 py-12 space-y-10">
      <div className="space-y-6">
        <StockSearch />

        <div className="space-y-1">
          <p className="text-[13px] font-medium text-muted uppercase tracking-widest">
            {stockMeta?.name ?? "Stock"}
          </p>
          <h1 className="text-5xl font-serif tracking-[-0.02em] text-foreground">
            {upperTicker}
          </h1>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {availableTickers.map((t) => (
            <Link
              key={t}
              href={`/dashboard/stocks/${t}`}
              className={`rounded-full px-4 py-1.5 text-[13px] font-mono font-medium border transition-all ${
                t === upperTicker
                  ? "bg-foreground text-background border-foreground shadow-sm"
                  : "bg-transparent border-card-border/80 text-muted hover:text-foreground hover:border-card-border"
              }`}
            >
              {t}
            </Link>
          ))}
        </div>

        <p className="text-sm text-muted">
          {opinions.length} opinion{opinions.length !== 1 ? "s" : ""} available
        </p>
      </div>

      <SentimentDistribution opinions={opinions} />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-medium text-muted">
            Recent Opinions
          </h2>
        </div>
        <StockOpinionList opinions={opinions} />
      </div>
    </div>
  );
}
