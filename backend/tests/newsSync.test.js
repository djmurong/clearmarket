'use strict';

const { normalizeFinnhubArticle, computeHotnessScore } = require('../finnhub');

function assert(condition, msg) {
    if (!condition) throw new Error(`FAIL: ${msg}`);
}

function runTests() {
    const results = { passed: 0, failed: 0 };

    function test(name, fn) {
        try {
            fn();
            results.passed++;
            console.log(`  PASS  ${name}`);
        } catch (err) {
            results.failed++;
            console.error(`  FAIL  ${name}: ${err.message}`);
        }
    }

    console.log('\n=== News Sync Tests ===\n');

    // --- normalizeFinnhubArticle ---

    test('normalizes basic Finnhub article', () => {
        const raw = {
            id: 12345,
            headline: 'Apple beats earnings',
            summary: 'Apple reported strong Q3 results.',
            url: 'https://example.com/article',
            source: 'Reuters',
            datetime: 1711100400,
            image: 'https://example.com/img.jpg',
            category: 'general',
            related: 'AAPL,MSFT',
        };
        const article = normalizeFinnhubArticle(raw);

        assert(article.finnhub_id === 12345, 'finnhub_id');
        assert(article.title === 'Apple beats earnings', 'title');
        assert(article.summary === 'Apple reported strong Q3 results.', 'summary');
        assert(article.url === 'https://example.com/article', 'url');
        assert(article.source === 'Reuters', 'source');
        assert(article.image_url === 'https://example.com/img.jpg', 'image_url');
        assert(article.category === 'general', 'category');
        assert(Array.isArray(article.symbols), 'symbols is array');
        assert(article.symbols.includes('AAPL'), 'symbols includes AAPL');
        assert(article.symbols.includes('MSFT'), 'symbols includes MSFT');
        assert(typeof article.hotness_score === 'number', 'hotness_score is number');
        assert(typeof article.published_at === 'string', 'published_at is string');
    });

    test('handles missing fields gracefully', () => {
        const raw = { id: 99999, datetime: 1711100400 };
        const article = normalizeFinnhubArticle(raw);

        assert(article.finnhub_id === 99999, 'finnhub_id');
        assert(article.title === '', 'title defaults to empty');
        assert(article.summary === '', 'summary defaults to empty');
        assert(article.url === '', 'url defaults to empty');
        assert(article.source === 'Unknown', 'source defaults to Unknown');
        assert(article.image_url === null, 'image_url defaults to null');
        assert(article.symbols.length === 0, 'symbols defaults to empty array');
    });

    test('uppercases symbol tickers', () => {
        const raw = { id: 1, datetime: 1711100400, related: 'aapl,tsla' };
        const article = normalizeFinnhubArticle(raw);

        assert(article.symbols[0] === 'AAPL', 'first symbol uppercased');
        assert(article.symbols[1] === 'TSLA', 'second symbol uppercased');
    });

    test('filters empty symbols from related', () => {
        const raw = { id: 2, datetime: 1711100400, related: ',AAPL,,,' };
        const article = normalizeFinnhubArticle(raw);

        assert(article.symbols.length === 1, 'only AAPL remains');
        assert(article.symbols[0] === 'AAPL', 'AAPL present');
    });

    // --- computeHotnessScore ---

    test('newer articles score higher than older ones', () => {
        const now = Math.floor(Date.now() / 1000);
        const recent = { datetime: now - 300, related: '', source: 'Test' };
        const old = { datetime: now - 86400, related: '', source: 'Test' };

        const recentScore = computeHotnessScore(recent);
        const oldScore = computeHotnessScore(old);

        assert(recentScore > oldScore, `recent (${recentScore}) > old (${oldScore})`);
    });

    test('more related symbols increase hotness', () => {
        const now = Math.floor(Date.now() / 1000);
        const base = { datetime: now, source: 'Test' };
        const few = { ...base, related: 'AAPL' };
        const many = { ...base, related: 'AAPL,MSFT,GOOG,TSLA' };

        const fewScore = computeHotnessScore(few);
        const manyScore = computeHotnessScore(many);

        assert(manyScore > fewScore, `many symbols (${manyScore}) > few (${fewScore})`);
    });

    test('high-priority sources score higher', () => {
        const now = Math.floor(Date.now() / 1000);
        const base = { datetime: now, related: 'AAPL' };
        const reuters = { ...base, source: 'Reuters' };
        const unknown = { ...base, source: 'SomeRandomBlog' };

        const reutersScore = computeHotnessScore(reuters);
        const unknownScore = computeHotnessScore(unknown);

        assert(reutersScore > unknownScore, `Reuters (${reutersScore}) > unknown (${unknownScore})`);
    });

    test('score is always a number', () => {
        const score = computeHotnessScore({ datetime: 0, related: '', source: '' });
        assert(typeof score === 'number', 'score is number');
        assert(!isNaN(score), 'score is not NaN');
    });

    // --- published_at ISO format ---

    test('published_at is valid ISO date', () => {
        const raw = { id: 3, datetime: 1711100400 };
        const article = normalizeFinnhubArticle(raw);
        const parsed = new Date(article.published_at);

        assert(!isNaN(parsed.getTime()), 'published_at parses to valid date');
    });

    console.log(`\n${results.passed} passed, ${results.failed} failed\n`);
    if (results.failed > 0) process.exit(1);
}

runTests();
