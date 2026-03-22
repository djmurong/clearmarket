'use strict';

const FETCH_TIMEOUT_MS = 8000;
const CONCURRENCY = 5;
const GOOGLE_NEWS_IMAGE_PLACEHOLDER =
    'https://lh3.googleusercontent.com/J6_coFbogxhRI9iM864NL_liGXvsQp2AupsKei7z0cNNfDvGUmWUy20nuUhkREQyrpY4bEeIBuc=s0-w300';
const GOOGLE_NEWS_PREFIX = Buffer.from([0x08, 0x13, 0x22]).toString('binary');
const GOOGLE_NEWS_SUFFIX = Buffer.from([0xd2, 0x01, 0x00]).toString('binary');

const OG_IMAGE_PATTERNS = [
    /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
    /<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i,
];

function decodeHtmlEntities(str) {
    return str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
}

function isFinnhubPlaceholder(url) {
    if (!url) return true;
    return /static\d*\.finnhub\.io\/file\/finnhub\/logo\//i.test(url);
}

function isGoogleNewsUrl(articleUrl) {
    try {
        return new URL(articleUrl).hostname === 'news.google.com';
    } catch {
        return false;
    }
}

function isGoogleNewsPlaceholder(imageUrl) {
    return imageUrl === GOOGLE_NEWS_IMAGE_PLACEHOLDER;
}

function getGoogleNewsId(articleUrl) {
    if (!isGoogleNewsUrl(articleUrl)) return null;

    const parts = new URL(articleUrl).pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] || null;
}

function decodeGoogleNewsId(articleUrl) {
    const id = getGoogleNewsId(articleUrl);
    if (!id) return null;

    let decoded = Buffer.from(id, 'base64url').toString('binary');

    if (decoded.startsWith(GOOGLE_NEWS_PREFIX)) {
        decoded = decoded.slice(GOOGLE_NEWS_PREFIX.length);
    }

    if (decoded.endsWith(GOOGLE_NEWS_SUFFIX)) {
        decoded = decoded.slice(0, -GOOGLE_NEWS_SUFFIX.length);
    }

    const bytes = Uint8Array.from(decoded, char => char.charCodeAt(0));
    const len = bytes.at(0);
    if (len == null) return null;

    if (len >= 0x80) {
        decoded = decoded.substring(2, len + 2);
    } else {
        decoded = decoded.substring(1, len + 1);
    }

    return decoded;
}

async function fetchText(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
        const res = await fetch(url, {
            redirect: 'follow',
            signal: controller.signal,
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (compatible; NewsBot/1.0; +https://example.com/bot)',
                Accept: 'text/html,application/xhtml+xml',
                'Accept-Language': 'en-US,en;q=0.9',
                Referer: 'https://news.google.com/',
            },
        });

        if (!res.ok) return null;
        return await res.text();
    } catch {
        return null;
    } finally {
        clearTimeout(timer);
    }
}

async function decodeGoogleNewsUrl(articleUrl) {
    const offlineDecoded = decodeGoogleNewsId(articleUrl);
    if (!offlineDecoded) return articleUrl;
    if (!offlineDecoded.startsWith('AU_yqL')) return offlineDecoded;

    const id = getGoogleNewsId(articleUrl);
    if (!id) return articleUrl;

    const articleHtml = await fetchText(`https://news.google.com/articles/${id}`);
    if (!articleHtml) return articleUrl;

    const timestamp = articleHtml.match(/data-n-a-ts="([^"]+)"/)?.[1];
    const signature = articleHtml.match(/data-n-a-sg="([^"]+)"/)?.[1];
    if (!timestamp || !signature) return articleUrl;

    const rpc = [[[
        'Fbv4je',
        `["garturlreq",[["X","X",["X","X"],null,null,1,1,"US:en",null,1,null,null,null,null,null,0,1],"X","X",1,[1,1,1],1,1,null,0,0,null,0],"${id}",${timestamp},"${signature}"]`,
        null,
        'generic',
    ]]];

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
        const res = await fetch('https://news.google.com/_/DotsSplashUi/data/batchexecute', {
            method: 'POST',
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'User-Agent':
                    'Mozilla/5.0 (compatible; NewsBot/1.0; +https://example.com/bot)',
                Referer: 'https://news.google.com/',
            },
            body: `f.req=${encodeURIComponent(JSON.stringify(rpc))}`,
        });

        if (!res.ok) return articleUrl;

        const text = await res.text();
        const payload = text.split('\n\n')[1];
        if (!payload) return articleUrl;

        const parsed = JSON.parse(payload);
        const result = parsed.find(entry => entry?.[1] === 'Fbv4je');
        if (!result?.[2]) return articleUrl;

        const decoded = JSON.parse(result[2])?.[1];
        return typeof decoded === 'string' && decoded.startsWith('http') ? decoded : articleUrl;
    } catch {
        return articleUrl;
    } finally {
        clearTimeout(timer);
    }
}

async function extractOgImage(articleUrl) {
    if (!articleUrl) return null;

    try {
        const html = await fetchText(articleUrl);
        if (!html) return null;

        for (const pattern of OG_IMAGE_PATTERNS) {
            const match = html.match(pattern);
            if (match && match[1]) {
                const decoded = decodeHtmlEntities(match[1].trim());
                if (decoded.startsWith('http')) return decoded;
            }
        }

        return null;
    } catch {
        return null;
    }
}

async function enrichArticlesWithOgImages(articles) {
    const results = [];

    for (let i = 0; i < articles.length; i += CONCURRENCY) {
        const batch = articles.slice(i, i + CONCURRENCY);
        const settled = await Promise.allSettled(
            batch.map(async (article) => {
                if (!isFinnhubPlaceholder(article.image_url)) {
                    return article;
                }

                let targetUrl = article.url;
                if (isGoogleNewsUrl(article.url)) {
                    targetUrl = await decodeGoogleNewsUrl(article.url);
                }

                const ogImage = await extractOgImage(targetUrl);
                if (ogImage && !isGoogleNewsPlaceholder(ogImage)) {
                    return { ...article, image_url: ogImage, url: targetUrl };
                }

                if (targetUrl !== article.url) {
                    return { ...article, url: targetUrl };
                }

                return article;
            }),
        );

        for (const result of settled) {
            results.push(result.status === 'fulfilled' ? result.value : batch.shift());
        }
    }

    return results;
}

module.exports = {
    extractOgImage,
    enrichArticlesWithOgImages,
    isFinnhubPlaceholder,
    decodeGoogleNewsUrl,
};
