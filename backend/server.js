require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { getTrending, getStockPrice, getSentiment, explainStock, signUp, logIn, logOut } = require('./api');
const supabase = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// GET /api/trending
app.get('/api/trending', async (req, res) => {
    const data = await getTrending();
    res.json(data);
});

// GET /api/price/:symbol
app.get('/api/price/:symbol', async (req, res) => {
    const data = await getStockPrice(req.params.symbol);
    res.json(data);
});

// GET /api/sentiment?symbols=AAPL,TSLA,MSFT
app.get('/api/sentiment', async (req, res) => {
    if (!req.query.symbols) {
        return res.status(400).json({ error: 'symbols query param required' });
    }
    const symbols = req.query.symbols.split(',');
    const data = await getSentiment(symbols);
    res.json(data);
});

// GET /api/explain/:symbol
app.get('/api/explain/:symbol', async (req, res) => {
    const stockData = await getStockPrice(req.params.symbol);
    const explanation = await explainStock(stockData);
    res.json({ ...stockData, explanation });
});

// GET /api/portfolio/:userId
// Returns all holdings and current token balance for a user
app.get('/api/portfolio/:userId', async (req, res) => {
    const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', req.params.userId);

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// POST /api/trade/buy
// Body: { user_id, ticker, company_name, shares }
app.post('/api/trade/buy', async (req, res) => {
    const { user_id, ticker, company_name, shares } = req.body;
    if (!user_id || !ticker || !shares) {
        return res.status(400).json({ error: 'user_id, ticker, and shares are required' });
    }

    // Get current stock price
    const stockData = await getStockPrice(ticker);
    const cost = stockData.price * shares;

    // Get user's current holdings to check balance
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

    // Check if user already holds this ticker
    const existing = holdings.find(h => h.ticker === ticker);

    if (existing) {
        // Update avg_cost and shares
        const totalShares = existing.shares + shares;
        const newAvgCost = ((existing.avg_cost * existing.shares) + cost) / totalShares;

        const { error: updateError } = await supabase
            .from('portfolios')
            .update({
                shares: totalShares,
                avg_cost: newAvgCost,
                account_value: newBalance,
                updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);

        if (updateError) return res.status(500).json({ error: updateError.message });
    } else {
        // Insert new holding
        const { error: insertError } = await supabase
            .from('portfolios')
            .insert({
                user_id,
                ticker,
                company_name,
                shares,
                avg_cost: stockData.price,
                account_value: newBalance,
                is_simulated: true
            });

        if (insertError) return res.status(500).json({ error: insertError.message });
    }

    // Update balance on all other holdings for this user
    if (holdings.length > 1) {
        await supabase
            .from('portfolios')
            .update({ account_value: newBalance })
            .eq('user_id', user_id)
            .neq('ticker', ticker);
    }

    // Log to activity
    await supabase.from('activity').insert({
        user_id,
        action: `Bought ${shares} shares of ${ticker} at $${stockData.price}`,
        amount: cost
    });

    res.json({ message: 'Buy successful', remaining_balance: newBalance });
});

// POST /api/trade/sell
// Body: { user_id, ticker, shares }
app.post('/api/trade/sell', async (req, res) => {
    const { user_id, ticker, shares } = req.body;
    if (!user_id || !ticker || !shares) {
        return res.status(400).json({ error: 'user_id, ticker, and shares are required' });
    }

    // Get current stock price
    const stockData = await getStockPrice(ticker);
    const proceeds = stockData.price * shares;

    // Get the user's holding for this ticker
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
        // Remove the holding entirely
        const { error: deleteError } = await supabase
            .from('portfolios')
            .delete()
            .eq('id', holding.id);

        if (deleteError) return res.status(500).json({ error: deleteError.message });
    } else {
        const { error: updateError } = await supabase
            .from('portfolios')
            .update({ shares: newShares, account_value: newBalance, updated_at: new Date().toISOString() })
            .eq('id', holding.id);

        if (updateError) return res.status(500).json({ error: updateError.message });
    }

    // Update balance on all other holdings for this user
    const otherHoldings = holdings.filter(h => h.ticker !== ticker);
    if (otherHoldings.length > 0) {
        await supabase
            .from('portfolios')
            .update({ account_value: newBalance })
            .eq('user_id', user_id)
            .neq('ticker', ticker);
    }

    // Log to activity
    await supabase.from('activity').insert({
        user_id,
        action: `Sold ${shares} shares of ${ticker} at $${stockData.price}`,
        amount: proceeds
    });

    res.json({ message: 'Sell successful', remaining_balance: newBalance });
});

// POST /api/auth/signup
// Body: { email, password, username }
app.post('/api/auth/signup', async (req, res) => {
    const { email, password, username } = req.body;
    if (!email || !password || !username) {
        return res.status(400).json({ error: 'email, password, and username are required' });
    }
    try {
        const user = await signUp(email, password, username);
        res.json({ message: 'Account created successfully', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/login
// Body: { email, password }
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'email and password are required' });
    }
    try {
        const user = await logIn(email, password);
        res.json({ message: 'Logged in successfully', user });
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
});

// POST /api/auth/logout
app.post('/api/auth/logout', async (req, res) => {
    try {
        await logOut();
        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
