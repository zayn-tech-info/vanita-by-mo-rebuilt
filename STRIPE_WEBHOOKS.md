# Stripe webhooks – why orders stay "Awaiting payment" and how to fix it

**Test mode does not change this.** Stripe still sends the same webhook events in test mode. If your order stays "Awaiting payment" after a successful payment, it usually means your Convex backend is not receiving (or not handling) Stripe webhooks.

**Production security:** Never set `STRIPE_WEBHOOK_SKIP_VERIFY` in production. Always use a **Dashboard** webhook endpoint (not Stripe CLI) and set `STRIPE_WEBHOOK_SECRET` in Convex from that endpoint’s signing secret. Keep `STRIPE_SECRET_KEY` only in Convex environment variables—never in frontend `.env` files.

---

## Make verification work (checklist)

To get webhook **signature verification** working (so you don’t need skip-verify):

1. **Do not use Stripe CLI** (`stripe listen`) for forwarding — it can change the body and break the signature. Use a **Dashboard** endpoint instead.
2. In **Stripe Dashboard** (toggle **Test mode** on) → **Developers** → **Webhooks** → **Add endpoint**.
3. **Endpoint URL:** your Convex URL + `/stripe` (e.g. `https://fleet-wombat-210.convex.site/stripe`). No typo, no trailing slash.
4. **Events to send:** enable at least `payment_intent.succeeded` and `checkout.session.completed` → **Add endpoint**.
5. Open the new endpoint → **Signing secret** → **Reveal** → copy the **whsec_...** value (no spaces before/after).
6. In **Convex Dashboard** → **Settings** → **Environment variables**:
   - Set **`STRIPE_WEBHOOK_SECRET`** = that `whsec_...` (paste once, no extra newline).
   - Remove **`STRIPE_WEBHOOK_SKIP_VERIFY`** if it exists (so verification runs).
7. Save and wait for Convex to redeploy, then run a test payment again.

If it still fails, the 400 response now includes a **payload length**. In Stripe Dashboard → **Developers** → **Webhooks** → your endpoint → **Recent events** → open the event and check the payload size; it should match. If it doesn’t, the body is being changed before it reaches Convex.

---

## What needs to happen

1. **Customer pays** (embedded form or Stripe Checkout).
2. **Stripe sends a webhook** to your Convex HTTP endpoint: `payment_intent.succeeded` (embedded) or `checkout.session.completed` (redirect).
3. **Convex runs the webhook handler** and updates the order from `awaiting_payment` to `pending` (and clears the cart).

If step 2 or 3 is missing, the order never updates and the admin dashboard keeps showing "Awaiting payment".

---

## 1. Get your Convex HTTP URL

In the [Convex Dashboard](https://dashboard.convex.dev):

- Open your project → **Settings** (or **Deployments**).
- Find **HTTP URL** or **HTTP Actions URL**. It looks like:
  - `https://your-deployment-name.convex.site`

Your webhook URL will be: **`https://your-deployment-name.convex.site/stripe`**

---

## 2. Local development (e.g. `npm run dev`)

Stripe cannot send webhooks to `localhost`. Use the Stripe CLI to forward events to your Convex URL.

### Installing the Stripe CLI (Windows)

- **Option A – Winget (easiest):** In PowerShell run:
  ```powershell
  winget install Stripe.StripeCLi
  ```
  When asked "Do you agree to all the source agreements terms?", type **Y** and Enter. Then **close and reopen** PowerShell so `stripe` is on your PATH.
- **Option B – Scoop:** If you use [Scoop](https://scoop.sh):
  ```powershell
  scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
  scoop install stripe
  ```
- **Option C – Manual:**  
  1. Download the Windows zip from [Stripe CLI releases](https://github.com/stripe/stripe-cli/releases) (e.g. `stripe_X.X.X_windows_x86_64.zip`).  
  2. Unzip to a folder (e.g. `C:\stripe-cli`).  
  3. Add that folder to your PATH, or run the CLI from that folder with `.\stripe.exe` instead of `stripe`.

Then in a new terminal:

1. **Log in**: `stripe login`
2. **Forward webhooks** (use your Convex HTTP URL and include `/stripe` at the end):

   ```bash
   stripe listen --forward-to https://YOUR_DEPLOYMENT.convex.site/stripe
   ```
   Example: `stripe listen --forward-to https://fleet-wombat-210.convex.site/stripe`

4. The CLI will print a **webhook signing secret** like `whsec_...`.
5. In **Convex Dashboard** → **Settings** → **Environment Variables**, set:
   - **`STRIPE_WEBHOOK_SECRET`** = that `whsec_...` value (from the CLI, not from the Stripe Dashboard).

Keep `stripe listen` running while you test payments. When you pay with a test card, the CLI forwards the event to Convex and your order should move to "Pending".

---

## 3. Production

1. In [Stripe Dashboard](https://dashboard.stripe.com) → **Developers** → **Webhooks** → **Add endpoint**.
2. **Endpoint URL**: `https://YOUR_DEPLOYMENT.convex.site/stripe`
3. **Events to send**: enable at least:
   - `payment_intent.succeeded`
   - `checkout.session.completed`
4. **Add endpoint**. Stripe will show a **Signing secret** (`whsec_...`).
5. In **Convex Dashboard** → **Settings** → **Environment Variables** (for the production deployment), set:
   - **`STRIPE_WEBHOOK_SECRET`** = that signing secret from the Stripe Dashboard.

Use the **production** Convex deployment URL and the **production** Stripe webhook secret in production; use the **CLI** secret only for local dev.

---

## 4. Redirect after payment

- **Embedded payment**: After success, Stripe redirects the customer to the `return_url` (your app’s order-confirmation page). If redirect does not happen, check that the app is served from the same origin you expect (e.g. `http://localhost:5173` in dev).
- **Stripe Checkout (redirect)**: Stripe redirects to `success_url` built from **`CLIENT_URL`** in Convex. In Convex → **Environment Variables** set:
  - **`CLIENT_URL`** = your app’s URL (e.g. `http://localhost:5173` in dev, `https://yourdomain.com` in prod).

If `CLIENT_URL` is wrong, customers may be sent to the wrong URL after paying.

---

## 5. Quick checklist

| Item | Where |
|------|--------|
| `STRIPE_SECRET_KEY` | Convex env (test key for dev, live key for prod) |
| `STRIPE_WEBHOOK_SECRET` | Convex env (from `stripe listen` in dev, from Stripe Dashboard in prod) |
| `CLIENT_URL` | Convex env (e.g. `http://localhost:5173` or your production URL) |
| Webhook endpoint | Stripe Dashboard (prod) or Stripe CLI (dev) → Convex `/stripe` URL |
| Events | `payment_intent.succeeded`, `checkout.session.completed` |

Once webhooks are correctly configured, paid orders will move from "Awaiting payment" to "Pending" and the admin dashboard will reflect the correct status.

---

## Troubleshooting

**Order stays "Awaiting payment" after paying**

1. **Is `stripe listen` running?** In a separate terminal run: `npm run stripe:listen` (or `stripe listen --forward-to https://fleet-wombat-210.convex.site/stripe`). Leave it running while you test.
2. **Correct webhook secret:** In Convex → Environment Variables, `STRIPE_WEBHOOK_SECRET` must be the **whsec_...** value printed when you started `stripe listen` — not the secret from Stripe Dashboard (that’s for production).
3. **Check the terminal** where `stripe listen` is running: you should see `payment_intent.succeeded` (or similar) when a test payment completes. If you don’t, the event isn’t reaching Convex.

**"No signatures found matching the expected signature for payload"**

This often happens when the request body is modified before it reaches your app (e.g. when the **Stripe CLI** forwards the request, it can re-serialize the JSON and break the signature).

**Fix: Use the Dashboard endpoint instead of the CLI (recommended for local testing too):**

1. In **Stripe Dashboard** (make sure you’re in **Test mode**), go to **Developers** → **Webhooks** → **Add endpoint**.
2. **Endpoint URL:** `https://fleet-wombat-210.convex.site/stripe` (or your Convex HTTP URL + `/stripe`).
3. **Events:** select `payment_intent.succeeded` and `checkout.session.completed` (add more if you need them).
4. Click **Add endpoint**, then open the new endpoint and click **Reveal** next to **Signing secret**.
5. Copy the **whsec_...** value and set it in **Convex Dashboard** → **Settings** → **Environment Variables** as **`STRIPE_WEBHOOK_SECRET`** (replace any existing value).
6. **Stop** running `stripe listen` — you don’t need it. Stripe will send events **directly** to Convex when you use test cards, and the body will be unchanged so verification will succeed.
7. Run a test payment again; the webhook should return 200 and the order should update.

If you prefer to keep using the CLI, the secret in Convex must be the one printed when you run `stripe listen` (and restarting the CLI gives a new secret, so update Convex each time).

**Stripe “keeps changing” the secret**

Stripe does **not** change the signing secret on its own. It only changes when you (or someone) **Roll** the secret in the Dashboard (Developers → Webhooks → your endpoint → Signing secret → Roll). Avoid rolling unless you have a security reason. If you did roll, copy the **new** `whsec_...` from the Dashboard and set it as `STRIPE_WEBHOOK_SECRET` in Convex. To avoid downtime during a roll, you can set the **new** secret as `STRIPE_WEBHOOK_SECRET` and the **old** one as `STRIPE_WEBHOOK_SECRET_ALT` in Convex; the app will try both so events signed with either secret will be accepted. Once everything uses the new secret, you can remove `STRIPE_WEBHOOK_SECRET_ALT`.

**Skip verification (local dev only)**

If signature verification keeps failing and you only need to test locally, you can **temporarily** skip it:

1. In **Convex Dashboard** → **Settings** → **Environment Variables**, add **`STRIPE_WEBHOOK_SKIP_VERIFY`** = **`true`**.
2. You do **not** need `STRIPE_WEBHOOK_SECRET` when this is set. Stripe will still send events; the handler will accept the payload without verifying the signature.
3. **Important:** This is **only for local / test**. **Never** set `STRIPE_WEBHOOK_SKIP_VERIFY` in production. Anyone could send fake "payment succeeded" requests to your webhook URL and your app would mark orders as paid. Remove this variable and set a proper `STRIPE_WEBHOOK_SECRET` before going live.

**Not redirected to order confirmation after payment**

The app now redirects you to the order confirmation page as soon as payment succeeds. If you still don’t get redirected, check the browser console for errors and ensure you’re using the embedded payment form (not the “Pay with Stripe” redirect flow) if that’s what you’re testing.
