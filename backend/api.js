'use strict';

const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// --- Trending ---

async function getTrending() {
    const url = 'https://api.stocktwits.com/api/2/trending/symbols.json';
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
    return res.json();
}

// --- Stock Price (Yahoo Finance) ---

async function getStockPrice(ticker) {
    if (!ticker || typeof ticker !== 'string') {
        throw new Error('Invalid ticker: must be a non-empty string.');
    }
    const symbol = ticker.trim().toUpperCase();
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta?.regularMarketPrice) throw new Error(`No data found for "${symbol}".`);
    return {
        ticker: symbol,
        price: meta.regularMarketPrice,
        volume: meta.regularMarketVolume ?? 0,
        change: meta.regularMarketPrice - meta.chartPreviousClose,
        changePercent: ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100,
    };
}

// --- Sentiment (AlphaVantage) ---

async function getSentiment(symbols) {
    const sentiments = {};
    for (const symbol of symbols) {
        const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${symbol}&apikey=${process.env.AV_API}&time_from=20260101T0000`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

        const data = await res.json();
        if (data?.Information) {
            console.log(`[AV ${symbol}] Rate limited:`, data.Information);
            continue;
        }
        const scores = data?.feed?.map((article) => article?.overall_sentiment_score);
        if (!scores || scores.length === 0) continue;
        const score = scores.reduce((acc, val) => acc + val, 0) / scores.length;

        let label;
        if (score <= -0.35)                          label = 'Bearish';
        else if (score > -0.35 && score <= -0.15)    label = 'Somewhat Bearish';
        else if (score > -0.15 && score < 0.15)      label = 'Neutral';
        else if (score >= 0.15 && score < 0.35)      label = 'Somewhat Bullish';
        else                                          label = 'Bullish';

        sentiments[symbol] = { sentiment_score: score, sentiment_label: label };
    }
    return sentiments;
}

// --- AI Explanation (Groq) ---

async function explainStock(stockData) {
    const chat = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{
            role: 'user',
            content: `Here is stock data for ${stockData.ticker}:
- Current Price: $${stockData.price}
- Change Today: ${stockData.change ?? 'N/A'}

Explain this to someone who has zero knowledge of stocks or finance.
Use simple everyday language and analogies.
Keep it short, friendly and easy to understand.`
        }]
    });
    return chat.choices[0].message.content;
}

// --- Auth (Supabase) ---

const supabase = require('./db');

async function signUp(email, password, username) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);
    const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: data.user.id, username });
    if (profileError) throw new Error(profileError.message);
    return data.user;
}

async function logIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return data.user;
}

async function logOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
}

module.exports = { getTrending, getStockPrice, getSentiment, explainStock, signUp, logIn, logOut };
