require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { getTrending, getStockPrice, getSentiment, explainStock, signUp, logIn, logOut } = require('./api');
const supabase = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

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
            .slice(0, 5);
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

// GET /api/news
app.get('/api/news', async (req, res) => {
    try {
        const { data, error } = await supabase.from('news').select('*').order('publish_date', { ascending: false });
        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
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

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

server.on('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
});

// Keep the process alive
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});
