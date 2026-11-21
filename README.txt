KHALIS FARM — DESI EGGS & LIVE HENS

- Storefront: index.html
- Vercel API: api/index.js
- Persistent products, stock and orders: Upstash Redis.

VERCEL
1. Connect Upstash for Redis to this project.
2. Confirm KV_REST_API_URL and KV_REST_API_TOKEN exist for Preview and Production.
3. Set ADMIN_PASS to a strong unique password in Vercel Environment Variables.
4. Preview-deploy feature/khalis-farm-production and test before merging to main.

OWNER
Open /admin.html or use the Owner button. Sign in with ADMIN_PASS.
Set actual stock quantities for egg packs and each hen breed before enabling stock enforcement. Products start with stockQty=null (not tracked) until an owner enters the real quantity; setting quantity to zero marks the item sold out.
Orders are stored in Redis. Customers track an order using its order ID and the same phone number used at checkout.

DELIVERY
Configured Twin Cities zones. Orders above Rs. 2,500 currently receive free delivery. Confirm fees and business rules before launch.

SECURITY
No demo PIN or browser-only order fallback. Admin API actions require the x-admin header. Customer tracking requires order ID plus matching phone. Never put ADMIN_PASS or Redis tokens in frontend code.
