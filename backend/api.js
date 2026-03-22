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

// --- Stock Price (Financial Modeling Prep) ---

async function getStockPrice(ticker) {
    if (!ticker || typeof ticker !== 'string') {
        throw new Error('Invalid ticker: must be a non-empty string.');
    }
    const symbol = ticker.trim().toUpperCase();
    const url = `https://financialmodelingprep.com/api/v3/quote-short/${encodeURIComponent(symbol)}?apikey=${encodeURIComponent(process.env.AV_API)}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
        throw new Error(`No data found for "${symbol}".`);
    }

    const quote = data[0];
    return {
        ticker: quote.symbol,
        price: quote.price,
        volume: quote.volume,
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
        const scores = data?.feed?.map((article) => article?.overall_sentiment_score);
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

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// --- Sign up a new user ---
async function signUp(email, password, username) {
  const { data, error } = await supabase.auth.signUp({ email, password }); // Supabase handles hashing and salting internally, so we just pass the plain password here
  if (error) throw new Error(error.message);

  // Create their profile row in the database
  const { error: profileError } = await supabase // We use the user ID from the auth response to link the profile to the user
    .from('profiles')
    .insert({ id: data.user.id, username });

  if (profileError) throw new Error(profileError.message);
  return data.user;
}

// --- Log in an existing user ---
async function logIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ // Again, we just pass the plain password and let Supabase handle the security
    email,
    password
  });
  if (error) throw new Error(error.message);
  return data.user;
}

// --- Log out ---
async function logOut() {
  const { error } = await supabase.auth.signOut();  // Supabase will handle clearing the session and cookies securely
  if (error) throw new Error(error.message);
}


module.exports = { getTrending, getStockPrice, getSentiment, explainStock, signUp, logIn, logOut };

