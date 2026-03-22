# API Integration Guide: Frontend CTAs to Backend

## Overview
This guide maps all frontend Call-To-Action (CTA) buttons to their corresponding backend API endpoints.

---

## ✅ Already Connected

### 1. **Analyze Page** (`/dashboard/analyze`)
- **CTA**: "Analyze" button in OpinionInput component
- **Endpoint**: `POST /api/analyze` (Next.js route handler)
- **Status**: ✅ CONNECTED (frontend has route handler, needs backend connection)
- **File**: [src/app/(dashboard)/dashboard/analyze/page.tsx](src/app/(dashboard)/dashboard/analyze/page.tsx)

### 2. **News Page** (`/dashboard/news`)
- **CTA**: "Refresh" button 
- **Endpoint**: `GET /api/news?mode=both&limit=30` (needs backend)
- **Status**: ⚠️ PARTIALLY CONNECTED (button exists, backend endpoint needed)
- **File**: [src/app/(dashboard)/dashboard/news/page.tsx](src/app/(dashboard)/dashboard/news/page.tsx)

---

## ⚠️ Needs Connection

### 1. **Login Page** (`/login`)
- **CTA**: "Log in" submit button
- **Current**: Routes directly to `/dashboard` without authentication
- **Should Call**: Backend auth endpoint (TBD from backend)
- **Type**: POST request with email/password
- **File**: [src/app/login/page.tsx](src/app/login/page.tsx)
- **Issue**: No actual API call - just client-side routing
- **TODO**: 
  - ```typescript
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    ```

### 2. **Signup Page** (Mentioned but not implemented)
- **CTA**: "Create account" link (missing implementation)
- **Should Call**: Backend signup endpoint
- **Type**: POST /api/auth/signup (from backend api.js)
- **Status**: ❌ NOT IMPLEMENTED
- **TODO**: Create signup page similar to login page

### 3. **Paper Trading - Buy** (`/dashboard/paper-trading`)
- **CTA**: "Buy" button in TradeForm component
- **Should Call**: `POST /api/trade/buy` 
- **Backend Function**: Exists in server.js (line 45)
- **Status**: ❌ NOT CONNECTED
- **Required Data**:
  ```typescript
  {
    user_id: string,
    ticker: string,
    company_name: string,
    shares: number
  }
  ```
- **File to Update**: [src/components/paper-trading/TradeForm.tsx](src/components/paper-trading/TradeForm.tsx)

### 4. **Paper Trading - Sell** (`/dashboard/paper-trading`)
- **CTA**: "Sell" button (implied)
- **Should Call**: `POST /api/trade/sell` 
- **Status**: ❌ NOT IMPLEMENTED
- **Note**: Backend may have this endpoint (check server.js)

### 5. **Portfolio View** (`/dashboard/paper-trading`)
- **CTA**: Portfolio load on page render
- **Should Call**: `GET /api/portfolio/:userId`
- **Backend Function**: Exists in server.js (line 39)
- **Status**: ❌ NOT CONNECTED
- **File to Update**: [src/components/paper-trading/PortfolioSummary.tsx](src/components/paper-trading/PortfolioSummary.tsx)

### 6. **Stock Details** (`/dashboard/stocks/[ticker]`)
- **CTA**: View stock details button
- **Should Call**: 
  - `GET /api/price/:symbol` (current price)
  - `GET /api/sentiment?symbols=SYMBOL` (sentiment)
  - `GET /api/explain/:symbol` (AI explanation)
- **Status**: ❌ NOT CONNECTED
- **File**: [src/app/(dashboard)/dashboard/stocks/[ticker]/page.tsx](src/app/(dashboard)/dashboard/stocks/[ticker]/page.tsx)

### 7. **Trending Stocks** (Main dashboard)
- **CTA**: Display trending stocks
- **Should Call**: `GET /api/trending`
- **Status**: ❌ NOT CONNECTED
- **File**: Need to check dashboard page

### 8. **Logout** (Navigation)
- **CTA**: Logout button in MainNav
- **Should Call**: Backend logout endpoint
- **Backend Function**: logOut exists in api.js
- **Status**: ❌ NOT CONNECTED
- **File to Update**: [src/components/MainNav.tsx](src/components/MainNav.tsx)

---

## Backend API Summary

### Base URL Configuration
```javascript
// frontend/.env.local
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000  // or your backend URL
```

### Available Endpoints

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| GET | `/api/trending` | Get trending stocks | ✅ Ready |
| GET | `/api/price/:symbol` | Get stock price | ✅ Ready |
| GET | `/api/sentiment?symbols=X,Y` | Get sentiment analysis | ✅ Ready |
| GET | `/api/explain/:symbol` | Get AI explanation | ✅ Ready |
| GET | `/api/portfolio/:userId` | Get user portfolio | ✅ Ready |
| POST | `/api/trade/buy` | Buy stocks | ✅ Ready |
| GET/POST | `/api/auth/login` | User login | ✅ Ready |
| POST | `/api/auth/signup` | User signup | ✅ Ready |
| POST | `/api/auth/logout` | User logout | ✅ Ready |

---

## Integration Priority

**Priority 1 (Critical)**
1. Login & Signup with backend
2. Portfolio loading on paper trading page
3. Buy/Sell trade functionality

**Priority 2 (Important)**
1. Stock details page connections
2. Trending stocks display
3. News fetching

**Priority 3 (Nice-to-have)**
1. Sentiment details
2. AI explanations
3. Logout confirmation

---

## Implementation Steps

### Step 1: Create Environment Config
```typescript
// frontend/lib/api.ts
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export const api = {
  trending: () => fetch(`${BACKEND_URL}/api/trending`).then(r => r.json()),
  price: (symbol: string) => fetch(`${BACKEND_URL}/api/price/${symbol}`).then(r => r.json()),
  sentiment: (symbols: string[]) => fetch(`${BACKEND_URL}/api/sentiment?symbols=${symbols.join(',')}`).then(r => r.json()),
  explain: (symbol: string) => fetch(`${BACKEND_URL}/api/explain/${symbol}`).then(r => r.json()),
  portfolio: (userId: string) => fetch(`${BACKEND_URL}/api/portfolio/${userId}`).then(r => r.json()),
  buyStock: (data: BuyData) => fetch(`${BACKEND_URL}/api/trade/buy`, { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
};
```

### Step 2: Update Login Page
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error('Login failed');
    const { user, token } = await res.json();
    // Store token and redirect
    router.push('/dashboard');
  } catch (err) {
    setError(err.message);
  }
};
```

### Step 3: Update Portfolio Page
```typescript
useEffect(() => {
  const userId = getUserId(); // Get from context/session
  fetch(`${BACKEND_URL}/api/portfolio/${userId}`)
    .then(r => r.json())
    .then(data => setPortfolio(data));
}, [userId]);
```

---

## Files That Need Updates

- [x] Frontend API environment setup (NEEDS: .env.local)
- [ ] [src/app/login/page.tsx](src/app/login/page.tsx) - Connect to backend
- [ ] [src/app/(main)/get-started/page.tsx](src/app/(main)/get-started/page.tsx) - Create signup link
- [ ] [src/components/paper-trading/TradeForm.tsx](src/components/paper-trading/TradeForm.tsx) - Connect buy/sell
- [ ] [src/components/paper-trading/PortfolioSummary.tsx](src/components/paper-trading/PortfolioSummary.tsx) - Load portfolio
- [ ] [src/components/MainNav.tsx](src/components/MainNav.tsx) - Add logout
- [ ] [src/app/(dashboard)/dashboard/stocks/[ticker]/page.tsx](src/app/(dashboard)/dashboard/stocks/[ticker]/page.tsx) - Load stock details

---

## Next Steps

1. **Ask Backend**: Confirm exact authentication endpoints and required request/response formats
2. **Create API Helper**: Build centralized API utility functions
3. **Add Auth Context**: Implement session management for user state
4. **Connect Paper Trading**: Update trade components with API calls
5. **Test Integration**: Verify each CTA works end-to-end

