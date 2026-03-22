import { InterpretationResult } from "./types";

export const mockResults: InterpretationResult[] = [
  {
    id: "1",
    ticker: "AAPL",
    source: "analyst_report",
    originalText:
      "Goldman Sachs downgraded the stock citing margin compression and macro headwinds.",
    simpleSummary:
      "Experts think the company may make less profit, and the overall economy isn't helping.",
    eli12Summary:
      "The company is earning less money, and the world economy is making things harder for it.",
    sentiment: "negative",
    reasonTags: ["earnings", "economy"],
    whatItMeans:
      "This kind of downgrade usually means investors may feel less confident in the stock.",
    timestamp: "2026-03-21T10:30:00Z",
  },
  {
    id: "2",
    ticker: "AAPL",
    source: "earnings_summary",
    originalText:
      "Morgan Stanley maintains overweight rating citing strong revenue growth and improving margins.",
    simpleSummary:
      "Experts think the company is making more money and becoming more profitable.",
    eli12Summary:
      "The company is selling more stuff and keeping more of the money it earns.",
    sentiment: "positive",
    reasonTags: ["earnings"],
    whatItMeans:
      "This usually makes investors more confident in the stock.",
    timestamp: "2026-03-20T14:15:00Z",
  },
  {
    id: "3",
    ticker: "TSLA",
    source: "news",
    originalText:
      "Tesla faces increasing competition in the EV market as legacy automakers ramp up production of electric vehicles.",
    simpleSummary:
      "More car companies are making electric vehicles, which could make it harder for Tesla to stay ahead.",
    eli12Summary:
      "Other big car companies are now making electric cars too, so Tesla has more competition.",
    sentiment: "negative",
    reasonTags: ["competition"],
    whatItMeans:
      "When competition increases, a company may have to lower prices or spend more to keep its customers.",
    timestamp: "2026-03-19T09:00:00Z",
  },
  {
    id: "4",
    ticker: "MSFT",
    source: "analyst_report",
    originalText:
      "Upgraded to buy on accelerating cloud revenue and AI integration momentum across enterprise products.",
    simpleSummary:
      "Experts are optimistic because the company's cloud business is growing fast and its AI features are attracting more customers.",
    eli12Summary:
      "Microsoft's online services are getting more popular, and the AI tools they're adding are really helping them grow.",
    sentiment: "positive",
    reasonTags: ["earnings", "competition"],
    whatItMeans:
      "An upgrade to 'buy' signals that analysts expect the stock price to go up.",
    timestamp: "2026-03-18T11:45:00Z",
  },
  {
    id: "5",
    ticker: "TSLA",
    source: "analyst_report",
    originalText:
      "Regulatory scrutiny intensifies as NHTSA opens new investigation into autopilot-related incidents.",
    simpleSummary:
      "Government agencies are looking more closely at Tesla's self-driving technology after some safety concerns.",
    eli12Summary:
      "The government is investigating Tesla's autopilot because there have been some accidents, and they want to make sure it's safe.",
    sentiment: "negative",
    reasonTags: ["regulation"],
    whatItMeans:
      "Regulatory investigations can lead to costly recalls or restrictions, which may hurt the company's finances.",
    timestamp: "2026-03-17T16:30:00Z",
  },
  {
    id: "6",
    ticker: "MSFT",
    source: "news",
    originalText:
      "Microsoft Azure revenue grew 29% year-over-year, beating consensus estimates by 3 percentage points.",
    simpleSummary:
      "Microsoft's cloud service made a lot more money than expected compared to last year.",
    eli12Summary:
      "Microsoft's online cloud business grew really fast -- even faster than experts thought it would.",
    sentiment: "positive",
    reasonTags: ["earnings"],
    whatItMeans:
      "Beating expectations often leads to a short-term boost in stock price as investors become more optimistic.",
    timestamp: "2026-03-16T08:20:00Z",
  },
];

export interface StockMeta {
  ticker: string;
  name: string;
}

export const stockDirectory: StockMeta[] = [
  { ticker: "AAPL", name: "Apple Inc." },
  { ticker: "TSLA", name: "Tesla Inc." },
  { ticker: "MSFT", name: "Microsoft Corp." },
  { ticker: "GOOGL", name: "Alphabet Inc." },
  { ticker: "AMZN", name: "Amazon.com Inc." },
  { ticker: "NVDA", name: "NVIDIA Corp." },
  { ticker: "META", name: "Meta Platforms Inc." },
  { ticker: "JPM", name: "JPMorgan Chase & Co." },
  { ticker: "V", name: "Visa Inc." },
  { ticker: "DIS", name: "The Walt Disney Co." },
];

export const availableTickers = stockDirectory.map((s) => s.ticker);

export function getMockResultsForTicker(ticker: string): InterpretationResult[] {
  return mockResults.filter(
    (r) => r.ticker.toUpperCase() === ticker.toUpperCase()
  );
}

export const mockAnalyzeResponse: InterpretationResult = {
  id: "mock-live",
  ticker: "AAPL",
  source: "analyst_report",
  originalText:
    "Goldman Sachs downgraded the stock citing margin compression and macro headwinds.",
  simpleSummary:
    "Experts think the company may make less profit, and the overall economy isn't helping.",
  eli12Summary:
    "The company is earning less money, and the world economy is making things harder for it.",
  sentiment: "negative",
  reasonTags: ["earnings", "economy"],
  whatItMeans:
    "This kind of downgrade usually means investors may feel less confident in the stock.",
  timestamp: new Date().toISOString(),
};
