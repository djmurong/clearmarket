# Frontend-Backend Integration Checklist

Track your progress connecting frontend CTAs to backend APIs.

## Environment Setup
- [ ] Add `NEXT_PUBLIC_BACKEND_URL` to `.env.local` (e.g., `http://localhost:3000`)
- [ ] Confirm backend server is running on the correct port
- [ ] Test basic connectivity with one API call

## Authentication (Priority 1)
- [ ] Create signup page `/signup`
- [ ] Connect "Sign up" button to `POST /api/auth/signup`
- [ ] Connect "Log in" button to `POST /api/auth/login`
- [ ] Implement session/token storage (localStorage or cookie)
- [ ] Create auth context for state management
- [ ] Add logout functionality to MainNav
- [ ] Protect dashboard routes (redirect if not authenticated)

## Paper Trading (Priority 1)
- [ ] Load portfolio on page mount with `GET /api/portfolio/:userId`
- [ ] Display portfolio holdings in PortfolioSummary
- [ ] Connect "Buy" button to `POST /api/trade/buy`
- [ ] Show transaction confirmation
- [ ] Update portfolio after trade
- [ ] Connect "Sell" button to `POST /api/trade/sell` (if backend has it)
- [ ] Show trade history

## Stock Details (Priority 2)
- [ ] Fetch stock price with `GET /api/price/:symbol`
- [ ] Fetch sentiment with `GET /api/sentiment?symbols=X`
- [ ] Fetch AI explanation with `GET /api/explain/:symbol`
- [ ] Display all data on `/dashboard/stocks/[ticker]`
- [ ] Add error handling for missing symbols

## Dashboard Home (Priority 2)
- [ ] Fetch trending stocks with `GET /api/trending`
- [ ] Display trending stocks list
- [ ] Link to stock detail pages

## News Page (Priority 2)
- [ ] Implement backend `/api/news` endpoint (if missing)
- [ ] Connect "Refresh" button to API
- [ ] Filter news by category (if available)

## Analyze Page (Priority 3)
- [ ] Verify `/api/analyze` Next.js route is complete
- [ ] Connect to backend analysis service (if needed)
- [ ] Test with sample inputs

## Error Handling (All Priority)
- [ ] Add try-catch to all API calls
- [ ] Display user-friendly error messages
- [ ] Log errors to console/monitoring
- [ ] Add loading states to all CTAs
- [ ] Add retry logic for failed requests

## Testing
- [ ] Test login workflow end-to-end
- [ ] Test buying stocks
- [ ] Test portfolio loading
- [ ] Test logout
- [ ] Test error scenarios (wrong password, insufficient funds, etc.)
- [ ] Test with multiple users (if backend supports)

## Performance & Security
- [ ] Add loading/disabled states to buttons
- [ ] Validate input before sending to backend
- [ ] Don't expose sensitive data in frontend code
- [ ] Use environment variables for API URL
- [ ] Add CORS headers to backend if needed

## Files to Update
- [ ] `frontend/src/app/login/page.tsx`
- [ ] `frontend/src/app/(main)/get-started/page.tsx` (create signup)
- [ ] `frontend/src/components/paper-trading/TradeForm.tsx`
- [ ] `frontend/src/components/paper-trading/PortfolioSummary.tsx`
- [ ] `frontend/src/components/paper-trading/TradeHistory.tsx`
- [ ] `frontend/src/components/MainNav.tsx`
- [ ] `frontend/src/app/(dashboard)/dashboard/page.tsx`
- [ ] `frontend/src/app/(dashboard)/dashboard/stocks/[ticker]/page.tsx`
- [ ] `frontend/src/app/(dashboard)/dashboard/news/page.tsx`
- [ ] `frontend/src/lib/apiClient.ts` (already created)
- [ ] `frontend/.env.local` (create with NEXT_PUBLIC_BACKEND_URL)

## Known Issues / Notes
- [ ] Confirm exact request/response format for auth endpoints
- [ ] Check if `/api/auth/logout` needs user_id or token
- [ ] Verify `/api/trade/sell` endpoint exists on backend
- [ ] Check portfolio userId vs current user session
- [ ] Confirm sentiment API expected symbols format

---

**Last Updated**: 2026-03-21
**Status**: In Progress
