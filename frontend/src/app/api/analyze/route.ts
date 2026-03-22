import { NextRequest, NextResponse } from "next/server";
import { InterpretationResult, SourceType } from "@/lib/types";

interface AnalyzeBody {
  text?: string;
  url?: string;
  ticker?: string;
  source: SourceType;
}

const negativeKeywords = [
  "downgrade",
  "cut",
  "lower",
  "risk",
  "headwind",
  "compression",
  "decline",
  "weak",
  "concern",
  "investigation",
  "scrutiny",
];
const positiveKeywords = [
  "upgrade",
  "buy",
  "overweight",
  "strong",
  "beat",
  "growth",
  "improve",
  "momentum",
  "outperform",
  "raise",
];

function detectSentiment(text: string): InterpretationResult["sentiment"] {
  const lower = text.toLowerCase();
  const pos = positiveKeywords.filter((w) => lower.includes(w)).length;
  const neg = negativeKeywords.filter((w) => lower.includes(w)).length;
  if (pos > neg) return "positive";
  if (neg > pos) return "negative";
  return "neutral";
}

function detectReasons(text: string): InterpretationResult["reasonTags"] {
  const lower = text.toLowerCase();
  const tags: InterpretationResult["reasonTags"] = [];
  if (/margin|revenue|earning|profit|eps/i.test(lower)) tags.push("earnings");
  if (/macro|economy|gdp|inflation|interest rate/i.test(lower)) tags.push("economy");
  if (/compet|rival|market share/i.test(lower)) tags.push("competition");
  if (/regulat|compliance|sec|fda|nhtsa|investigat/i.test(lower)) tags.push("regulation");
  return tags.length > 0 ? tags : ["earnings"];
}

function extractTextFromHtml(html: string): string {
  let text = html;

  text = text.replace(/<script[\s\S]*?<\/script>/gi, " ");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, " ");
  text = text.replace(/<nav[\s\S]*?<\/nav>/gi, " ");
  text = text.replace(/<footer[\s\S]*?<\/footer>/gi, " ");
  text = text.replace(/<header[\s\S]*?<\/header>/gi, " ");

  const articleMatch =
    text.match(/<article[\s\S]*?<\/article>/i) ||
    text.match(/<main[\s\S]*?<\/main>/i) ||
    text.match(/<div[^>]*class="[^"]*(?:article|content|story|post)[^"]*"[\s\S]*?<\/div>/i);

  if (articleMatch) {
    text = articleMatch[0];
  }

  text = text.replace(/<[^>]+>/g, " ");

  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&[a-z]+;/gi, " ");

  text = text.replace(/\s+/g, " ").trim();

  const MAX_LENGTH = 5000;
  if (text.length > MAX_LENGTH) {
    text = text.slice(0, MAX_LENGTH);
  }

  return text;
}

async function fetchUrlContent(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; ClearMarketBot/1.0; +https://clearmarket.app)",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch URL (${res.status})`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
    throw new Error("URL does not point to a readable article");
  }

  const html = await res.text();
  return extractTextFromHtml(html);
}

export async function POST(request: NextRequest) {
  const body: AnalyzeBody = await request.json();

  let articleText: string;

  if (body.url && body.url.trim().length > 0) {
    try {
      new URL(body.url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL provided" },
        { status: 400 },
      );
    }

    try {
      articleText = await fetchUrlContent(body.url.trim());
    } catch (err) {
      return NextResponse.json(
        {
          error:
            err instanceof Error
              ? err.message
              : "Could not read the article at that URL",
        },
        { status: 422 },
      );
    }

    if (articleText.length < 20) {
      return NextResponse.json(
        { error: "Could not extract enough text from that URL. Try pasting the text directly." },
        { status: 422 },
      );
    }
  } else if (body.text && body.text.trim().length > 0) {
    articleText = body.text.trim();
  } else {
    return NextResponse.json(
      { error: "Either text or a URL is required" },
      { status: 400 },
    );
  }

  await new Promise((resolve) => setTimeout(resolve, 800));

  const sentiment = detectSentiment(articleText);
  const reasonTags = detectReasons(articleText);

  const sentimentPhrases = {
    positive: {
      simple: "Experts are optimistic about this company's outlook.",
      eli12: "People who study this company think things are looking good for it!",
      context: "This usually makes investors more confident in the stock.",
    },
    negative: {
      simple: "Experts are concerned about this company's near-term prospects.",
      eli12: "The people who study this company are a bit worried about how it'll do.",
      context: "This kind of outlook usually makes investors feel less confident in the stock.",
    },
    neutral: {
      simple: "Experts have a mixed or cautious view on this company right now.",
      eli12: "The experts aren't sure if things will get better or worse for this company.",
      context: "A neutral outlook means investors may wait for more information before acting.",
    },
  };

  const phrases = sentimentPhrases[sentiment];

  const result: InterpretationResult = {
    id: `analysis-${Date.now()}`,
    ticker: body.ticker || "N/A",
    source: body.source,
    originalText: articleText.length > 500 ? articleText.slice(0, 500) + "…" : articleText,
    simpleSummary: phrases.simple,
    eli12Summary: phrases.eli12,
    sentiment,
    reasonTags,
    whatItMeans: phrases.context,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(result);
}
