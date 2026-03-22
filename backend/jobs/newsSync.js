'use strict';

const supabase = require('../db');
const { fetchFinnhubMarketNews, normalizeFinnhubArticle, CATEGORY_MAP } = require('../finnhub');
const { enrichArticlesWithOgImages } = require('../ogImage');

const DEFAULT_INTERVAL_MS = 5 * 60 * 1000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 3000;

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function removeMissingColumn(payload, message) {
    const match = message && message.match(/Could not find the '([^']+)' column/);
    if (!match) return null;
    const col = match[1];
    if (!(col in payload)) return null;
    const next = { ...payload };
    delete next[col];
    return next;
}

async function insertWithSchemaFallback(payload) {
    let attemptPayload = { ...payload };
    let lastError = null;
    const maxAttempts = Object.keys(attemptPayload).length + 2;

    for (let i = 0; i < maxAttempts; i++) {
        const { error } = await supabase.from('news').insert(attemptPayload);
        if (!error) return null;
        lastError = error;
        const next = removeMissingColumn(attemptPayload, error.message);
        if (!next) return error;
        attemptPayload = next;
    }

    return lastError;
}

async function updateWithSchemaFallback(id, payload) {
    let attemptPayload = { ...payload };
    let lastError = null;
    const maxAttempts = Object.keys(attemptPayload).length + 2;

    for (let i = 0; i < maxAttempts; i++) {
        const { error } = await supabase.from('news').update(attemptPayload).eq('id', id);
        if (!error) return null;
        lastError = error;
        const next = removeMissingColumn(attemptPayload, error.message);
        if (!next) return error;
        attemptPayload = next;
    }

    return lastError;
}

async function syncNews(category) {
    const cat = CATEGORY_MAP[category] || 'general';
    console.log(`[newsSync] Fetching Finnhub market news (category: ${cat})...`);

    let rawArticles;
    let lastError;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            rawArticles = await fetchFinnhubMarketNews(cat);
            break;
        } catch (err) {
            lastError = err;
            console.error(`[newsSync] Fetch attempt ${attempt + 1} failed:`, err.message);
            if (attempt < MAX_RETRIES) await sleep(RETRY_DELAY_MS * (attempt + 1));
        }
    }

    if (!rawArticles) {
        throw new Error(`[newsSync] All fetch attempts failed: ${lastError?.message}`);
    }

    if (!Array.isArray(rawArticles) || rawArticles.length === 0) {
        console.log('[newsSync] No articles returned from Finnhub');
        return { inserted: 0, updated: 0, total: 0 };
    }

    const normalized = rawArticles.map(normalizeFinnhubArticle);
    console.log(`[newsSync] Normalized ${normalized.length} articles`);

    console.log('[newsSync] Extracting OG images from article pages...');
    const enriched = await enrichArticlesWithOgImages(normalized);
    const ogCount = enriched.filter((a, i) => a.image_url !== normalized[i].image_url).length;
    console.log(`[newsSync] Replaced ${ogCount} placeholder images with real OG images`);

    let inserted = 0;
    let updated = 0;

    for (const article of enriched) {
        const { data: existing } = await supabase
            .from('news')
            .select('id')
            .eq('finnhub_id', article.finnhub_id)
            .maybeSingle();

        if (existing) {
            const error = await updateWithSchemaFallback(existing.id, {
                title: article.title,
                summary: article.summary,
                image_url: article.image_url,
                hotness_score: article.hotness_score,
                symbols: article.symbols,
                category: article.category,
                published_at: article.published_at,
                publish_date: article.published_at,
                url: article.url,
                source: article.source,
            });
            if (error) {
                console.error(`[newsSync] Update failed for finnhub_id=${article.finnhub_id}:`, error.message);
            } else {
                updated++;
            }
        } else {
            const error = await insertWithSchemaFallback({
                ...article,
                publish_date: article.published_at,
            });
            if (error) {
                if (error.code === '23505') {
                    updated++;
                } else {
                    console.error(`[newsSync] Insert failed for finnhub_id=${article.finnhub_id}:`, error.message);
                }
            } else {
                inserted++;
            }
        }
    }

    const summary = { inserted, updated, total: normalized.length };
    console.log(`[newsSync] Done — inserted: ${inserted}, updated: ${updated}, total: ${normalized.length}`);
    return summary;
}

let syncTimer = null;

function startScheduledSync() {
    const intervalMs = parseInt(process.env.NEWS_SYNC_INTERVAL_MS, 10) || DEFAULT_INTERVAL_MS;
    const category = process.env.NEWS_SYNC_CATEGORY || 'general';

    console.log(`[newsSync] Starting scheduled sync every ${intervalMs / 1000}s (category: ${category})`);

    syncNews(category).catch(err => {
        console.error('[newsSync] Initial sync failed:', err.message);
    });

    syncTimer = setInterval(() => {
        syncNews(category).catch(err => {
            console.error('[newsSync] Scheduled sync failed:', err.message);
        });
    }, intervalMs);
}

function stopScheduledSync() {
    if (syncTimer) {
        clearInterval(syncTimer);
        syncTimer = null;
        console.log('[newsSync] Scheduled sync stopped');
    }
}

module.exports = { syncNews, startScheduledSync, stopScheduledSync };
