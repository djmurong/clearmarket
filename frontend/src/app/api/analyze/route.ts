import { NextRequest, NextResponse } from "next/server";
import { InterpretationResult, SourceType } from "@/lib/types";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface AnalyzeBody {
  text?: string;
  url?: string;
  ticker?: string;
  source: SourceType;
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

  if (articleMatch) text = articleMatch[0];

  text = text.replace(/<[^>]+>/g, " ");
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&[a-z]+;/gi, " ");
  text = text.replace(/\s+/g, " ").trim();

  if (text.length > 5000) text = text.slice(0, 5000);
  return text;
}

async function fetchUrlContent(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; ClearMarketBot/1.0; +https://clearmarket.app)",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) throw new Error(`Failed to fetch URL (${res.status})`);

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
      return NextResponse.json({ error: "Invalid URL provided" }, { status: 400 });
    }

    try {
      articleText = await fetchUrlContent(body.url.trim());
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Could not read the article at that URL" },
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
    return NextResponse.json({ error: "Either text or a URL is required" }, { status: 400 });
  }

  const chat = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are a friendly financial coach who explains ANY financial topic to complete beginners.
This includes stocks, interest rates, market news, crypto, inflation, bonds, economic data, or anything finance-related.
You speak in warm, simple, conversational English — like a smart friend explaining money over coffee.
You never use jargon without explaining it. You are honest and never give direct buy/sell advice.
You always respond with a valid JSON object and nothing else.`,
      },
      {
        role: "user",
        content: `A beginner wants to understand this financial content${body.ticker ? ` (related to ${body.ticker})` : ""}:

"""
${articleText.slice(0, 4000)}
"""

Analyze it and return ONLY this JSON:
{
  "topic": "What is this actually about? (e.g. 'Apple stock downgrade', 'Federal Reserve rate hike')",
  "simpleSummary": "2-3 sentence plain English summary",
  "eli12Summary": "Explain it like the reader is 12 years old with a fun analogy.",
  "sentiment": "positive" or "negative" or "neutral",
  "sentimentReason": "One sentence: why is the sentiment what it is?",
  "keyPoints": ["3 to 5 key takeaways for a beginner"],
  "whatItMeans": "What does this mean for everyday people in plain English?",
  "watchOut": "One honest thing a beginner should be careful about",
  "reasonTags": ["relevant tags from: stocks, interest-rates, inflation, crypto, economy, earnings, regulation, bonds, housing, jobs, energy, tech, banking"]
}`,
      },
    ],
  });

  let parsed;
  try {
    const raw = chat.choices[0].message.content ?? "{}";
    const clean = raw.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(clean);
  } catch {
    return NextResponse.json({ error: "AI response could not be parsed." }, { status: 500 });
  }

  const result: InterpretationResult = {
    id: `analysis-${Date.now()}`,
    ticker: body.ticker || "N/A",
    source: body.source,
    originalText: articleText.length > 500 ? articleText.slice(0, 500) + "…" : articleText,
    simpleSummary: parsed.simpleSummary,
    eli12Summary: parsed.eli12Summary,
    sentiment: parsed.sentiment,
    sentimentReason: parsed.sentimentReason,
    keyPoints: parsed.keyPoints,
    whatItMeans: parsed.whatItMeans,
    watchOut: parsed.watchOut,
    reasonTags: parsed.reasonTags,
    topic: parsed.topic,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(result);
}
