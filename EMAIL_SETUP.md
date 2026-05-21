# Order confirmation email (Mailtrap + Nodemailer)

Order confirmation emails are sent automatically when a payment succeeds (Stripe webhook). The Convex action `email.sendOrderConfirmation` uses **Nodemailer** with **Mailtrap** SMTP.

## Flow

1. Customer pays → Stripe sends `payment_intent.succeeded` or `checkout.session.completed` to your Convex webhook.
2. Webhook completes the order (mutation), then calls the action `sendOrderConfirmation(orderId)`.
3. The action loads the order, builds an HTML email (summary, shipping, total), and sends it via Mailtrap. It then marks the order with `confirmationEmailSentAt` so we never send twice.

## Convex environment variables

In **Convex Dashboard** → **Settings** → **Environment Variables**, add:

| Variable          | Description                          | Example (Mailtrap inbox)              |
|-------------------|--------------------------------------|----------------------------------------|
| `MAILTRAP_HOST`   | SMTP host                            | `sandbox.smtp.mailtrap.io`             |
| `MAILTRAP_PORT`   | SMTP port (often 2525 or 587)        | `2525`                                 |
| `MAILTRAP_USER`   | SMTP username                        | From Mailtrap inbox SMTP settings     |
| `MAILTRAP_PASS`   | SMTP password                        | From Mailtrap inbox SMTP settings     |
| `MAILTRAP_FROM`   | Optional "From" address for emails   | `Vanita by M.O <orders@vanitabymo.com>`|

## Where to get the values

1. Log in at [mailtrap.io](https://mailtrap.io).
2. Open your **Inbox** (e.g. for testing) or the SMTP you want to use.
3. Go to **SMTP Settings** (or "Integrations" → Nodemailer / SMTP).
4. Copy **Host**, **Port**, **Username**, and **Password** into the Convex env vars above.

With the **Mailtrap testing inbox**, all messages are caught in Mailtrap and not delivered to real addresses. For production, use Mailtrap’s production SMTP or another provider and set the same env vars for your production Convex deployment.

## Optional

- If `MAILTRAP_FROM` is not set, the default is `Vanita by M.O <orders@vanitabymo.com>`.
- If any of `MAILTRAP_HOST`, `MAILTRAP_PORT`, `MAILTRAP_USER`, or `MAILTRAP_PASS` are missing, the action logs an error and skips sending (the order is still completed).
