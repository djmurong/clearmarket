'use strict';

const FINNHUB_BASE = 'https://finnhub.io/api/v1';

const CATEGORY_MAP = {
    general: 'general',
    forex: 'forex',
    crypto: 'crypto',
    merger: 'merger',
};

const SOURCE_PRIORITY = {
    'Reuters': 10, 'Bloomberg': 10, 'CNBC': 9, 'MarketWatch': 8,
    'Yahoo Finance': 7, 'The Wall Street Journal': 10, 'Financial Times': 10,
};

async function fetchFinnhubMarketNews(category = 'general') {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) throw new Error('FINNHUB_API_KEY is not set');

    const url = `${FINNHUB_BASE}/news?category=${encodeURIComponent(category)}&token=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Finnhub request failed: ${res.status}`);
    return res.json();
}

function computeHotnessScore(article) {
    const ageMs = Date.now() - article.datetime * 1000;
    const ageHours = ageMs / 3_600_000;
    const recencyBoost = Math.max(0, 100 - ageHours * 4);

    const symbolBoost = (article.related || '').split(',').filter(Boolean).length * 5;

    const sourceName = article.source || '';
    const sourceBoost = SOURCE_PRIORITY[sourceName] || 3;

    return Math.round((recencyBoost + symbolBoost + sourceBoost) * 100) / 100;
}

function normalizeFinnhubArticle(raw) {
    const symbols = (raw.related || '')
        .split(',')
        .map(s => s.trim().toUpperCase())
        .filter(Boolean);

    return {
        finnhub_id: raw.id,
        title: raw.headline || '',
        summary: raw.summary || '',
        url: raw.url || '',
        source: raw.source || 'Unknown',
        published_at: new Date(raw.datetime * 1000).toISOString(),
        image_url: raw.image || null,
        symbols,
        category: raw.category || 'general',
        hotness_score: computeHotnessScore(raw),
    };
}

module.exports = {
    fetchFinnhubMarketNews,
    normalizeFinnhubArticle,
    computeHotnessScore,
    CATEGORY_MAP,
};
