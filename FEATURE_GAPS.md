# Feature gaps before production

What’s **already implemented** vs what’s **missing or placeholder** from a product/feature perspective.

---

## Implemented

- **Shop**: Browse, category filter, search (name/category/description), sort, filters (size, color, price), pagination, quick view, skeleton loaders
- **Product detail**: Full info, size/color, add to cart, wishlist heart
- **Cart**: Add/update/remove, quantity, order summary, redeem code at cart, guest + logged-in, merge on login
- **Checkout**: Shipping form, redeem code, Stripe (redirect + embedded), order creation with discount validation
- **Orders**: Order confirmation page, My Orders list with status, status emails (delayed), admin order list + status update
- **Wishlist**: Add/remove, wishlist page, move to cart, toast on add, 2×2 grid
- **Redeem codes**: Validate at cart/checkout, admin create/list, percent + fixed, expiry + max uses
- **Auth**: Login, signup, role (admin/customer), admin-only routes + backend `requireAdmin`
- **SEO**: Basic meta (title, description) on index.html

---

## Missing or placeholder (by priority)

### High impact (fix or remove before launch)

| Feature | Current state | Recommendation |
|--------|----------------|----------------|
| **Blog** | Navbar links to `/blog` but **no route** → 404 | Either add a simple Blog page (or “Coming soon”) or **remove the Blog link** from Navbar until you have content. |
| **Footer “Track Order”** | Links to `#` | Point to **My Orders** (`/my-orders`) for logged-in users, or a dedicated “Track order” page where they enter order ID + email. |
| **Footer “Contact Us”** | Links to `#` | Add a **Contact** page (form or email link) and set `href` to `/contact` (or mailto). |
| **404 page** | No catch-all route | Add a **catch-all route** that renders a friendly “Page not found” and links back to Home/Shop. |

### Medium impact (improve UX / trust)

| Feature | Current state | Recommendation |
|--------|----------------|----------------|
| **Shipping & Returns** | Footer link `#` | Add a **Shipping & Returns** page (or link to a doc) with policy text. |
| **Size Guide** | Footer link `#` | Add a **Size Guide** page (table + copy) or link to a static page/PDF. |
| **FAQs** | Footer link `#` | Add a simple **FAQs** page or link to a doc. |
| **Newsletter** | Footer form submits but **does nothing** (no backend) | Either **wire to an email provider** (e.g. Convex action → Mailchimp/Resend) or show “Coming soon” / remove the form. |
| **Sale** | Footer “Sale” → `/shop` (no sale filter) | Add a **sale** filter (e.g. `?on_sale=1`) and a `salePrice` or `onSale` flag on products if you use sales; otherwise change label to “Shop all” or remove. |

### Lower priority (nice to have)

| Feature | Current state | Recommendation |
|--------|----------------|----------------|
| **Our Story / Sustainability / Careers / Press** | Some link to `/#our-story`, others to `#` | Add real pages or “Coming soon” and update links. |
| **Password reset** | Not implemented | Add “Forgot password?” flow (email link + reset token) when you’re ready. |
| **Account profile** | No account page | Later: profile page (name, email, change password, saved addresses). |
| **Order tracking number** | Orders have status but **no tracking number** | Add optional `trackingNumber` (+ carrier) to orders and show in My Orders + admin; link “Track Order” to this. |
| **Product stock** | No inventory field | Optional: add `stock` and prevent add-to-cart or show “Out of stock” when 0. |

---

## Quick fixes you can do now

1. **Blog**: Remove the Blog link from `Navbar.jsx` (desktop + mobile) **or** add route `path="/blog"` and a simple “Coming soon” page.
2. **Track Order**: In `Footer.jsx`, set “Track Order” to `href="/my-orders"` (or a future `/track` page).
3. **Contact**: Add route `/contact` and a minimal Contact page; in Footer set “Contact Us” to `href="/contact"`.
4. **404**: In `App.jsx`, add `<Route path="*" element={<NotFound />} />` and create a small `NotFound.jsx` with message + link to home.
5. **Placeholder links**: For any footer link you’re not ready to build, use `href="/contact"` for Contact and either real routes (e.g. `/shipping-returns`, `/size-guide`, `/faq`) or `#` with `aria-disabled` and tooltip “Coming soon” so users know they’re not broken.

If you tell me which of these you want (e.g. “remove Blog, add 404, add Contact, point Track Order to My Orders”), I can outline the exact code changes file-by-file.
