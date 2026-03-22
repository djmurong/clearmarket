require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { getTrending, getStockPrice, getSentiment, explainStock, signUp, logIn, logOut } = require('./api');
const supabase = require('./db');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3001;

app.use(cors());
app.use(express.json());

// Error handling for uncaught errors
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// GET /api/trending
app.get('/api/trending', async (req, res) => {
    try {
        const data = await getTrending();
        const top5 = data.symbols
            .filter(s => !s.symbol.includes('.'))
            .slice(0, 15);
        res.json({ symbols: top5 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/price/:symbol
app.get('/api/price/:symbol', async (req, res) => {
    try {
        const data = await getStockPrice(req.params.symbol);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/sentiment?symbols=AAPL,TSLA,MSFT
app.get('/api/sentiment', async (req, res) => {
    try {
        if (!req.query.symbols) {
            return res.status(400).json({ error: 'symbols query param required' });
        }
        const symbols = req.query.symbols.split(',').slice(0, 3);
        const data = await getSentiment(symbols);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/explain/:symbol
app.get('/api/explain/:symbol', async (req, res) => {
    try {
        const stockData = await getStockPrice(req.params.symbol);
        const explanation = await explainStock(stockData);
        res.json({ ...stockData, explanation });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/signup
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, password, username } = req.body;
        if (!email || !password || !username) {
            return res.status(400).json({ error: 'email, password, and username are required' });
        }
        const user = await signUp(email, password, username);
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'email and password are required' });
        }
        const user = await logIn(email, password);
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/logout
app.post('/api/auth/logout', async (req, res) => {
    try {
        await logOut();
        res.json({ message: 'Logged out' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/portfolio/:userId
app.get('/api/portfolio/:userId', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('portfolios')
            .select('*')
            .eq('user_id', req.params.userId);
        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/trade/buy
app.post('/api/trade/buy', async (req, res) => {
    try {
        const { user_id, ticker, company_name, shares } = req.body;
        if (!user_id || !ticker || !shares) {
            return res.status(400).json({ error: 'user_id, ticker, and shares are required' });
        }

        const stockData = await getStockPrice(ticker);
        const cost = stockData.price * shares;

        const { data: holdings, error: fetchError } = await supabase
            .from('portfolios')
            .select('*')
            .eq('user_id', user_id);
        if (fetchError) return res.status(500).json({ error: fetchError.message });

        const currentBalance = holdings.length > 0 ? holdings[0].account_value : 10000;
        if (currentBalance < cost) {
            return res.status(400).json({ error: `Insufficient tokens. Need ${cost}, have ${currentBalance}` });
        }

        const newBalance = currentBalance - cost;
        const existing = holdings.find(h => h.ticker === ticker);

        if (existing) {
            const totalShares = existing.shares + shares;
            const newAvgCost = ((existing.avg_cost * existing.shares) + cost) / totalShares;
            const { error: updateError } = await supabase
                .from('portfolios')
                .update({ shares: totalShares, avg_cost: newAvgCost, account_value: newBalance, updated_at: new Date().toISOString() })
                .eq('id', existing.id);
            if (updateError) return res.status(500).json({ error: updateError.message });
        } else {
            const { error: insertError } = await supabase
                .from('portfolios')
                .insert({ user_id, ticker, company_name, shares, avg_cost: stockData.price, account_value: newBalance, is_simulated: true });
            if (insertError) return res.status(500).json({ error: insertError.message });
        }

        if (holdings.length > 1) {
            await supabase.from('portfolios').update({ account_value: newBalance }).eq('user_id', user_id).neq('ticker', ticker);
        }

        await supabase.from('activity').insert({ user_id, action: 'buy', amount: cost });
        res.json({ message: 'Buy successful', remaining_balance: newBalance });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/trade/sell
app.post('/api/trade/sell', async (req, res) => {
    try {
        const { user_id, ticker, shares } = req.body;
        if (!user_id || !ticker || !shares) {
            return res.status(400).json({ error: 'user_id, ticker, and shares are required' });
        }

        const stockData = await getStockPrice(ticker);
        const proceeds = stockData.price * shares;

        const { data: holdings, error: fetchError } = await supabase
            .from('portfolios')
            .select('*')
            .eq('user_id', user_id);
        if (fetchError) return res.status(500).json({ error: fetchError.message });

        const holding = holdings.find(h => h.ticker === ticker);
        if (!holding) return res.status(400).json({ error: `You don't own any ${ticker}` });
        if (holding.shares < shares) return res.status(400).json({ error: `You only have ${holding.shares} shares of ${ticker}` });

        const newBalance = holding.account_value + proceeds;
        const newShares = holding.shares - shares;

        if (newShares === 0) {
            const { error: deleteError } = await supabase.from('portfolios').delete().eq('id', holding.id);
            if (deleteError) return res.status(500).json({ error: deleteError.message });
        } else {
            const { error: updateError } = await supabase
                .from('portfolios')
                .update({ shares: newShares, account_value: newBalance, updated_at: new Date().toISOString() })
                .eq('id', holding.id);
            if (updateError) return res.status(500).json({ error: updateError.message });
        }

        const otherHoldings = holdings.filter(h => h.ticker !== ticker);
        if (otherHoldings.length > 0) {
            await supabase.from('portfolios').update({ account_value: newBalance }).eq('user_id', user_id).neq('ticker', ticker);
        }

        await supabase.from('activity').insert({ user_id, action: 'sell', amount: proceeds });
        res.json({ message: 'Sell successful', remaining_balance: newBalance });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/activity/:userId
app.get('/api/activity/:userId', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 100;
        const { data, error } = await supabase
            .from('activity')
            .select('*')
            .eq('user_id', req.params.userId)
            .order('created_at', { ascending: false })
            .limit(limit);
        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/activity
app.post('/api/activity', async (req, res) => {
    try {
        const { user_id, action, amount } = req.body;
        if (!user_id || !action) {
            return res.status(400).json({ error: 'user_id and action are required' });
        }
        if (!['buy', 'sell', 'watch'].includes(action)) {
            return res.status(400).json({ error: "action must be one of 'buy','sell','watch'" });
        }
        const { data, error } = await supabase.from('activity').insert({ user_id, action, amount });
        if (error) return res.status(500).json({ error: error.message });
        res.json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/watchlist/:userId
app.get('/api/watchlist/:userId', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('watchlists')
            .select('*')
            .eq('user_id', req.params.userId)
            .order('company_name', { ascending: true });
        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/watchlist
app.post('/api/watchlist', async (req, res) => {
    try {
        const { user_id, ticker, company_name, current_price, percent_change } = req.body;
        if (!user_id || !ticker) return res.status(400).json({ error: 'user_id and ticker are required' });
        const { data, error } = await supabase.from('watchlists').insert({ user_id, ticker, company_name, current_price, percent_change });
        if (error) return res.status(500).json({ error: error.message });
        await supabase.from('activity').insert({ user_id, action: 'watch', amount: 0 });
        res.json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/watchlist/:id
app.delete('/api/watchlist/:id', async (req, res) => {
    try {
        const { error } = await supabase.from('watchlists').delete().eq('id', req.params.id);
        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/news?sort=latest|hottest&limit=30&category=general
app.get('/api/news', async (req, res) => {
    try {
        const sort = req.query.sort === 'hottest' ? 'hottest' : 'latest';
        const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);
        const category = req.query.category ? String(req.query.category) : null;
        const symbol = req.query.symbol ? String(req.query.symbol).toUpperCase() : null;

        const { data, error } = await supabase
            .from('news')
            .select('*')
            .limit(300);

        if (error) return res.status(500).json({ error: error.message });

        const normalized = (data || []).map((row) => {
            const publishedAt = row.published_at || row.publish_date || row.created_at || new Date(0).toISOString();
            const symbols = Array.isArray(row.symbols)
                ? row.symbols
                : typeof row.symbols === 'string' && row.symbols.length > 0
                    ? row.symbols.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean)
                    : [];

            return {
                id: String(row.id ?? row.finnhub_id ?? `${row.url}-${publishedAt}`),
                finnhub_id: row.finnhub_id ?? 0,
                title: row.title || '',
                summary: row.summary || '',
                url: row.url || '',
                source: row.source || 'Unknown',
                published_at: publishedAt,
                image_url: row.image_url || row.image || null,
                symbols,
                category: row.category || 'general',
                hotness_score: Number(row.hotness_score ?? 0),
            };
        });

        const filtered = normalized.filter((article) => {
            if (category && article.category !== category) return false;
            if (symbol && !article.symbols.includes(symbol)) return false;
            return true;
        });

        const sorted = filtered.sort((a, b) => {
            if (sort === 'hottest') {
                if (b.hotness_score !== a.hotness_score) return b.hotness_score - a.hotness_score;
            }
            return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
        });

        res.json(sorted.slice(0, limit));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/admin/news/sync — disabled (news sync module not available)
app.post('/api/admin/news/sync', (_req, res) => {
    res.status(501).json({ error: 'News sync not available' });
});

// GET /api/leaderboard
app.get('/api/leaderboard', async (req, res) => {
    try {
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, username');
        if (profilesError) return res.status(500).json({ error: profilesError.message });

        const { data: portfolios, error: portfoliosError } = await supabase
            .from('portfolios')
            .select('user_id, ticker, shares, avg_cost, account_value');
        if (portfoliosError) return res.status(500).json({ error: portfoliosError.message });

        const STARTING_BALANCE = 10000;
        const leaderboard = await Promise.all(
            (profiles || []).map(async (profile) => {
                const userHoldings = portfolios.filter(p => p.user_id === profile.id);
                let portfolioValue = 0;
                for (const holding of userHoldings) {
                    try {
                        const stockData = await getStockPrice(holding.ticker);
                        portfolioValue += stockData.price * holding.shares;
                    } catch {
                        portfolioValue += holding.avg_cost * holding.shares;
                    }
                }
                const cashBalance = userHoldings.length > 0 ? userHoldings[0].account_value : STARTING_BALANCE;
                const totalValue = cashBalance + portfolioValue;
                const percentGain = ((totalValue - STARTING_BALANCE) / STARTING_BALANCE) * 100;
                return {
                    user_id: profile.id,
                    username: profile.username || 'Anonymous',
                    total_value: Math.round(totalValue * 100) / 100,
                    percent_gain: Math.round(percentGain * 100) / 100,
                };
            })
        );

        leaderboard.sort((a, b) => b.percent_gain - a.percent_gain);
        res.json(leaderboard);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/portfolio/copy
app.post('/api/portfolio/copy', async (req, res) => {
    try {
        const { from_user_id, to_user_id } = req.body;
        if (!from_user_id || !to_user_id) {
            return res.status(400).json({ error: 'from_user_id and to_user_id are required' });
        }

        const { data: sourceHoldings, error: sourceError } = await supabase
            .from('portfolios')
            .select('*')
            .eq('user_id', from_user_id);
        if (sourceError) return res.status(500).json({ error: sourceError.message });

        const { error: deleteError } = await supabase
            .from('portfolios')
            .delete()
            .eq('user_id', to_user_id);
        if (deleteError) return res.status(500).json({ error: deleteError.message });

        if (sourceHoldings && sourceHoldings.length > 0) {
            const newHoldings = sourceHoldings.map(h => ({
                user_id: to_user_id,
                ticker: h.ticker,
                company_name: h.company_name,
                shares: h.shares,
                avg_cost: h.avg_cost,
                account_value: h.account_value,
                is_simulated: true,
            }));
            const { error: insertError } = await supabase.from('portfolios').insert(newHoldings);
            if (insertError) return res.status(500).json({ error: insertError.message });
        }

        res.json({ message: 'Portfolio copied successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/user_news/:userId
app.get('/api/user_news/:userId', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('user_news')
            .select('*, news(*)')
            .eq('user_id', req.params.userId)
            .order('news.publish_date', { ascending: false });
        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/user_news/mark-seen
app.post('/api/user_news/mark-seen', async (req, res) => {
    try {
        const { user_id, news_id } = req.body;
        if (!user_id || !news_id) return res.status(400).json({ error: 'user_id and news_id are required' });
        const { error } = await supabase
            .from('user_news')
            .update({ seen: true })
            .eq('user_id', user_id)
            .eq('news_id', news_id);
        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: 'marked as seen' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

let server;

function nextPort(port) {
    const current = Number(port);
    if (current === 3000) return 3001;
    if (current === 3001) return 3002;
    return current + 1;
}

function startServer(port, attempt = 0) {
    const activeServer = app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });

    activeServer.on('error', (err) => {
        if (err.code === 'EADDRINUSE' && attempt < 3) {
            const fallbackPort = nextPort(port);
            console.warn(`Port ${port} is in use. Retrying on port ${fallbackPort}...`);
            server = startServer(fallbackPort, attempt + 1);
            return;
        }
        console.error('Server error:', err);
        process.exit(1);
    });

    return activeServer;
}

server = startServer(PORT, 0);

// Keep the process alive
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});
