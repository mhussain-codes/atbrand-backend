# AT BRAND Store Console — backend + admin page

This project contains the advanced admin page and a Vercel-ready server API for the Supabase project you supplied. The admin page uses Supabase Auth for sign-in; private store operations go through the API. The API checks the signed-in user and their role before using the server-side Supabase key.

## Security first

The `sb_secret_...` key pasted into chat must be treated as exposed. In Supabase, create a fresh secret key, update Vercel's `SUPABASE_SECRET_KEY` with the new value, then revoke the exposed key. Do not paste any secret key into `public/admin.html`, Hostinger, Git, or chat. The `sb_publishable_...` key and project URL are public frontend configuration; the secret key is server-only. Supabase confirms secret keys bypass RLS and must stay on a trusted backend: https://supabase.com/docs/guides/database/secure-data

The HTML currently has your Supabase project URL and publishable key configured. The API URL is still a placeholder until you deploy this project. You still need to set the new secret key as a Vercel environment variable; it has not been copied into these files.

## What is included

- `public/admin.html`: Hostinger-compatible single-file dashboard with sign-in, overview, order fulfilment, product creation, POS, expenses, and reports.
- `app/api/v1/[...segments]/route.ts`: Vercel/Next server API. It verifies Supabase Auth tokens, checks `user_profiles` roles, validates inputs, limits CORS to your configured website origins, and keeps the Supabase secret on the server.
- `supabase/migrations/202610180001_store_backend.sql`: additive database setup, RLS policies, a safe public product view, storage bucket, audit/inventory records, and atomic/idempotent order/POS SQL functions.
- `.env.example`: variable names only; no secret values.

Implemented endpoints:

- `GET /api/v1/health`
- `GET /api/v1/admin/me`
- `GET|POST /api/v1/admin/products`; `PATCH /api/v1/admin/products/:id`
- `PATCH /api/v1/admin/products/:id/stock` (audited stock changes)
- `GET /api/v1/admin/orders`; `PATCH /api/v1/admin/orders/:id/status`
- `POST /api/v1/orders` (guest checkout; server recalculates prices and stock)
- `POST /api/v1/pos/sales` (transactional and idempotent)
- `GET|POST /api/v1/admin/expenses`
- `GET /api/v1/admin/reports/summary`

## Deploy steps

1. **Back up and inspect the current database.** This migration adds columns/tables and never drops or truncates data. It expects the existing `products` and `orders` tables to have compatible `id`, `name`, `price`, `cost_price`, `stock`, `customer_name`, `phone`, `address`, `total_amount`, `status`, and `created_at` columns. Check the actual column types first. The dashboard's old code suggests UUID order IDs, but the database itself was not accessible from this workspace. If an existing table differs, adjust its migration before running it.
2. In Supabase SQL Editor, run `supabase/migrations/202610180001_store_backend.sql` on a backup/staging project first. Review SQL errors before applying to production. The public storefront must read `storefront_products`, not `products`: the view deliberately hides cost and exact inventory. Existing direct browser writes to `products`/`orders` should be replaced by the API.
3. In Supabase Authentication, create your own admin user. Then promote only that account using the SQL Editor, replacing the email with your exact login email:

   ```sql
   insert into public.user_profiles(id, role)
   select id, 'owner' from auth.users where lower(email)=lower('YOUR-ADMIN-EMAIL')
   on conflict (id) do update set role='owner', is_active=true;
   ```

   Create other accounts in Auth and assign `admin`, `manager`, `cashier`, or `viewer` deliberately. Never make public self-registration an owner flow.

4. Push this folder to a private Git repository or import it into Vercel. Vercel deploys the `app` routes as server functions. Current Vercel Node functions support TypeScript route handlers in this format: https://vercel.com/docs/functions/runtimes/node-js
5. In Vercel → Project → Settings → Environment Variables, add:

   - `SUPABASE_URL` = your project URL
   - `SUPABASE_PUBLISHABLE_KEY` = your `sb_publishable_...` key
   - `SUPABASE_SECRET_KEY` = the **newly rotated** `sb_secret_...` key
   - `ALLOWED_ORIGINS` = comma-separated exact Hostinger website origins, e.g. `https://yourdomain.com,https://www.yourdomain.com`
   - Optional `DELIVERY_FEE_PKR` = server-controlled delivery fee (defaults to `0`)

   Redeploy after setting variables. Do not use `*` for production CORS.

6. Set `ALLOWED_ORIGINS=https://admin.atbrand.store` and redeploy the API. Open `public/admin.html` and replace `API_BASE_URL` with your deployed Vercel origin, such as `https://your-project.vercel.app`. The supplied Supabase URL and publishable key are already in the file.
7. For Hostinger hPanel hosting, create a separate **Custom PHP/HTML** website for `admin.atbrand.store`, then upload this file as `index.html` into that subdomain website's document root. Hostinger's File Manager is not available for an AI Builder website, so the pasted `public_html` instructions apply only to a separate file-based hosting site. Without hPanel/file hosting, use a separate AI Builder site connected to the subdomain and its Code editor if it supports replacing `index.html`; the manual-mode Embed element inserts code into the page body and is not the same as uploading a complete HTML document.
8. Connect `admin.atbrand.store` to this separate website through Hostinger/DNS. Do not reassign the main store's AI Builder site: Hostinger says one AI Builder site can use only one address at a time. DNS changes may take time to propagate.
9. Open `https://YOUR-VERCEL-DEPLOYMENT.vercel.app/api/v1/health`; it should return `{"ok":true,...}`. Then visit `https://admin.atbrand.store` and sign in with the Auth account you promoted.

## Website checkout connection

The uploaded file is an admin dashboard, not the customer's storefront checkout. The API includes `POST /api/v1/orders`, but your actual checkout JavaScript still needs to call it. Send JSON with `customer_name`, `phone`, `address`, and `items: [{product_id, quantity}]`, plus a fresh UUID in the `Idempotency-Key` header. Do not send trusted prices: the server reads current prices, locks the product rows, checks stock, snapshots item cost/price, and deducts stock in one SQL transaction. The response returns the order ID and server total. Payment remains `unpaid` until a real payment process records it; COD delivery is not treated as money received.

For public checkout, add anti-abuse protection (for example, a CAPTCHA/Turnstile verification and a production rate-limit provider) before promoting the endpoint. CORS is not authentication and is not a substitute for abuse controls.

## Important limits to verify before production

- Existing schema and stored data could not be inspected remotely. Back up and verify the migration against the actual Supabase schema before applying it.
- Older orders without `order_items` cost snapshots have unknown profit. The reports intentionally show profit as unavailable while such orders exist, rather than treating missing cost as zero.
- Reports recognize online sales when orders are delivered; collected payments are counted separately. Refunds, taxes, payment gateway webhooks, and historical order-item backfill need the actual business rules and provider details.
- Product image uploads use the public `product-images` bucket; only approved image types up to 5 MB are accepted through the server.
- The admin page is one HTML file for Hostinger AI Builder convenience. The API, database, authentication, and role policies remain the actual security boundary.

## Local run

Use Node.js 20 or newer. Copy `.env.example` to `.env.local` and fill it with local environment values (never commit `.env.local`), then run:

```bash
npm install
npm run dev
```

The local API is at `http://localhost:3000/api/v1/health`. For local browser testing, add the local admin origin to your temporary `ALLOWED_ORIGINS`. Keep production keys in Vercel's protected environment-variable settings.
