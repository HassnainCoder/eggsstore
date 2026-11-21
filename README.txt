KHALIS FARM — DESI EGGS & LIVE HENS

- Storefront: index.html
- Owner dashboard: click Owner or open /admin.html (redirects to the secure owner login).
- Vercel API: api/index.js
- Persistent products, stock and orders: Upstash Redis.

VERCEL
1. Upstash for Redis is connected to this Vercel project.
2. KV_REST_API_URL and KV_REST_API_TOKEN are required in Preview and Production.
3. ADMIN_PASS must be a strong unique Vercel Environment Variable.
4. Deployments are created by the connected Git branch.

OWNER
Open /admin.html or click Owner. Sign in with ADMIN_PASS.
Set the real on-hand stock quantity for every egg pack and hen breed before accepting orders. New products start at zero stock and are marked sold out until you enter a real quantity. This prevents orders being accepted against unknown inventory.
Product rates and stock can be updated from the owner dashboard.
Orders are stored in Redis. Customers track an order using the order ID and the same phone number used at checkout.

DELIVERY
Twin Cities delivery zones and fees are configured in the checkout. Orders above Rs. 2,500 currently receive free delivery. Review these business rates before changing them.

SECURITY
No demo PIN or browser-only order persistence. Admin API actions require the x-admin header. Customer tracking requires order ID plus matching phone. Never put ADMIN_PASS or Redis tokens in frontend code.
