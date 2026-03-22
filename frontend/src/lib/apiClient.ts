/**
 * API Client for Backend Integration
 * Centralizes all API calls from frontend to backend
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// ==================== TYPES ====================

export interface StockData {
  ticker: string;
  price: number;
  volume: number;
}

export interface SentimentData {
  [symbol: string]: {
    sentiment_score: number;
    sentiment_label: 'Bullish' | 'Somewhat Bullish' | 'Neutral' | 'Somewhat Bearish' | 'Bearish';
  };
}

export interface StockExplanation {
  ticker: string;
  price: number;
  volume: number;
  explanation: string;
}

export interface Portfolio {
  id: string;
  user_id: string;
  ticker: string;
  company_name: string;
  shares: number;
  avg_cost: number;
  account_value: number;
  updated_at: string;
}

export interface TradeRequest {
  user_id: string;
  ticker: string;
  company_name: string;
  shares: number;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
  };
  token: string;
}

// ==================== UTILITY FUNCTIONS ====================

async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = new Error(`API Error: ${response.status}`);
    throw error;
  }
  return response.json();
}

// ==================== STOCK DATA APIs ====================

export const api = {
  // Get trending stocks
  trending: async () => {
    const response = await fetch(`${BACKEND_URL}/api/trending`);
    return handleResponse(response);
  },

  // Get price for a specific stock
  price: async (symbol: string): Promise<StockData> => {
    if (!symbol) throw new Error('Symbol is required');
    const response = await fetch(`${BACKEND_URL}/api/price/${symbol.toUpperCase()}`);
    return handleResponse(response);
  },

  // Get sentiment for multiple stocks
  sentiment: async (symbols: string[]): Promise<SentimentData> => {
    if (!symbols.length) throw new Error('At least one symbol is required');
    const symbolString = symbols.map(s => s.toUpperCase()).join(',');
    const response = await fetch(`${BACKEND_URL}/api/sentiment?symbols=${encodeURIComponent(symbolString)}`);
    return handleResponse(response);
  },

  // Get AI explanation for a stock
  explain: async (symbol: string): Promise<StockExplanation> => {
    if (!symbol) throw new Error('Symbol is required');
    const response = await fetch(`${BACKEND_URL}/api/explain/${symbol.toUpperCase()}`);
    return handleResponse(response);
  },

  // ==================== PORTFOLIO APIs ====================

  // Get user's portfolio
  portfolio: async (userId: string): Promise<Portfolio[]> => {
    if (!userId) throw new Error('User ID is required');
    const response = await fetch(`${BACKEND_URL}/api/portfolio/${userId}`);
    return handleResponse(response);
  },

  // ==================== TRADING APIs ====================

  // Buy stocks
  buyStock: async (data: TradeRequest): Promise<Portfolio> => {
    if (!data.user_id || !data.ticker || !data.shares) {
      throw new Error('user_id, ticker, and shares are required');
    }
    const response = await fetch(`${BACKEND_URL}/api/trade/buy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Sell stocks (implement if backend has this endpoint)
  sellStock: async (data: TradeRequest): Promise<Portfolio> => {
    if (!data.user_id || !data.ticker || !data.shares) {
      throw new Error('user_id, ticker, and shares are required');
    }
    const response = await fetch(`${BACKEND_URL}/api/trade/sell`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // ==================== AUTHENTICATION APIs ====================

  // Sign up
  signup: async (email: string, password: string, username: string): Promise<AuthResponse> => {
    if (!email || !password || !username) {
      throw new Error('email, password, and username are required');
    }
    const response = await fetch(`${BACKEND_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username }),
    });
    return handleResponse(response);
  },

  // Log in
  login: async (email: string, password: string): Promise<AuthResponse> => {
    if (!email || !password) {
      throw new Error('email and password are required');
    }
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  // Log out
  logout: async (userId: string): Promise<{ success: boolean }> => {
    if (!userId) throw new Error('User ID is required');
    const response = await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    });
    return handleResponse(response);
  },
};

// ==================== EXPORT ====================

export default api;
