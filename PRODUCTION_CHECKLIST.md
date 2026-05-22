# Production checklist — Vanita by M.O

Use this list before going live. Convex and Stripe use **environment variables**; the frontend uses **build-time** vars.

---

## 1. Environment & secrets

### Convex Dashboard (Settings → Environment Variables)

Set these for your **production** deployment:

| Variable | Required | Notes |
|----------|----------|--------|
| `CLIENT_URL` | Yes | Production app URL, e.g. `https://vanitabymo.com`. Used for Stripe redirects and emails. |
| `STRIPE_SECRET_KEY` | Yes | Use **live** key `sk_live_...` in production (not `sk_test_...`). |
| `STRIPE_WEBHOOK_SECRET` | Yes | From Stripe Dashboard → Developers → Webhooks → your **production** endpoint. Do **not** set `STRIPE_WEBHOOK_SKIP_VERIFY` in production. |
| `MAILTRAP_HOST` | Yes* | SMTP host for order/status emails. Use production SMTP (e.g. SendGrid, Mailtrap production). |
| `MAILTRAP_PORT` | Yes* | SMTP port (e.g. 587). |
| `MAILTRAP_USER` | Yes* | SMTP username. |
| `MAILTRAP_PASS` | Yes* | SMTP password. |
| `MAILTRAP_FROM` | No | e.g. `Vanita by M.O <orders@vanitabymo.com>`. |

\* Required for order confirmation and status emails to send.

### Frontend build env

Your hosting (Vercel, Netlify, etc.) needs these at **build** time (or in a `.env.production` that is not committed):

| Variable | Required | Notes |
|----------|----------|--------|
| `VITE_CONVEX_URL` | Yes | Production Convex URL, e.g. `https://your-prod-deployment.convex.cloud`. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Yes | Use **live** key `pk_live_...` in production. |

### Security

- [ ] **No test keys in production** — Use Stripe **live** keys and production Convex deployment.
- [ ] **`.env` and `.env.*` in `.gitignore`** — Already added; never commit secrets.
- [ ] **Convex production deployment** — Create a production deployment in Convex and point the app to it for prod.

---

## 2. Stripe production

- [ ] **Live keys** — In Stripe Dashboard, switch to **Live** and add live API keys to Convex and frontend env.
- [ ] **Webhook endpoint** — In Stripe (Live), add endpoint: `https://<your-production-convex>.convex.site/stripe`. Subscribe to `payment_intent.succeeded` and `checkout.session.completed`.
- [ ] **Webhook signing secret** — Copy the **live** endpoint’s signing secret into Convex as `STRIPE_WEBHOOK_SECRET`. Remove any `STRIPE_WEBHOOK_SKIP_VERIFY`.
- [ ] **No skip-verify in prod** — Ensure `STRIPE_WEBHOOK_SKIP_VERIFY` is not set in production Convex env.

---

## 3. App and DNS

- [ ] **CLIENT_URL** in Convex matches the real production URL (e.g. `https://vanitabymo.com`). Used for Stripe success/cancel redirects and any links in emails.
- [ ] **Custom domain** — If using a custom domain, configure it in your host and (if needed) in Convex/Vite.
- [ ] **HTTPS** — Production site must be served over HTTPS (Stripe and cookies require it).

---

## 4. Vite / dev tunnel (optional)

The repo includes dev tunnel config (OutRay, port 5137). For production **builds** you may want to avoid forcing port 5137 so that `npm run build` and `npm run preview` work in a generic way. Options:

- Use a **separate** config for local tunnel (e.g. `vite.config.tunnel.js` and run with `vite --config vite.config.tunnel.js`) and keep the default `vite.config.js` without tunnel-specific `port` / `allowedHosts` / `hmr`, or
- Keep current config and run production build on a host that ignores `server` (build output is static; `server` only affects `vite` dev). Preview with `npm run preview` (default port 4173) is unaffected by `server.port` in many setups.

If you want a neutral default for production, we can add a `vite.config.production.js` or strip tunnel settings from the main config and document tunnel usage separately.

---

## 5. Email

- [ ] **Production SMTP** — Replace Mailtrap sandbox with a production SMTP provider (SendGrid, Postmark, Mailtrap production, etc.) and set the Convex env vars above.
- [ ] **MAILTRAP_FROM** — Set to a verified sender (e.g. `orders@vanitabymo.com` or your domain).
- [ ] **Test flow** — Place a test order and confirm order confirmation and status-update emails are received and look correct.

---

## 6. Content and legal (recommended)

- [ ] **Privacy policy** — Add a page or link if you collect personal data (e.g. email, address, payments).
- [ ] **Terms / refunds** — If you mention refunds or terms anywhere, add a proper page or link.
- [ ] **Cookie / consent** — If required in your region, add a simple banner or notice for cookies (e.g. session/cart cookie).

---

## 7. Final checks

- [ ] **Admin role** — Ensure at least one user has `role: "admin"` in the Convex `user` table for the production deployment (backend already enforces `requireAdmin` on mutations).
- [ ] **Test checkout** — Run a live-mode test purchase (small amount + refund if needed) and confirm: redirect, webhook, order in DB, cart cleared, confirmation email, and status email after changing status in admin.
- [ ] **Wishlist & cart** — Quick test: add to cart, add to wishlist, move to cart, complete Stripe checkout.

---

## Quick reference: Convex production

1. In Convex Dashboard, create or select a **production** deployment.
2. Set all environment variables for that deployment (see table above).
3. Deploy Convex: `npx convex deploy --prod` (or your CI flow).
4. Build frontend with production Convex URL and Stripe publishable key:  
   `VITE_CONVEX_URL=https://<prod>.convex.cloud VITE_STRIPE_PUBLISHABLE_KEY=pk_live_... npm run build`
5. Deploy the `dist/` folder to your host and point your domain to it.
