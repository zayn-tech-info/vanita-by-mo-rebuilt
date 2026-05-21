# Strip Integration Plan for Vanita by M.O

This guide breaks down exactly how to integrate Stripe into your Convex + React stack to handle international payments (USD, GBP, and later NGN).

## Overview

We'll use **Stripe Checkout** because it's the easiest, most secure way to handle payments, and it gives you Apple Pay / Google Pay out of the box.

1. User clicks "Pay/Place Order" in your `Checkout.jsx` app.
2. We call a Convex Action that talks to Stripe and creates a `checkout_session`.
3. The Convex Action returns a Stripe Checkout URL.
4. Your React frontend redirects the user to that Stripe URL.
5. The user pays on Stripe.
6. Stripe sends a webhook back to a Convex HTTP endpoint.
7. The Convex HTTP endpoint verifies the webhook, processes the order, and securely saves it to your `orders` table.

---

## 1. Prerequisites (Setup)

### Step 1.1: Install Stripe Packages

You'll need the Stripe Node library for your backend. Run this command in your project root:

```bash
npm install stripe
```

### Step 1.2: Get Stripe API Keys

1. Go to your Stripe Dashboard.
2. Find your **Test Secret Key** (starts with `sk_test_...`).
3. Set it as an environment variable in your Convex dashboard:
   - Go to your project on [dashboard.convex.dev](https://dashboard.convex.dev/)
   - Go to **Settings > Environment Variables**
   - Add a variable named `STRIPE_SECRET_KEY` and paste your key.
   - Also add `CLIENT_URL` (e.g., `http://localhost:5173` for local, or your production URL).

---

## 2. Backend Implementation (Convex)

### Step 2.1: Create Payment Action

Create a new file `convex/payments.ts`. This action creates the Checkout session.

```typescript
import { action } from "./_generated/server";
import { v } from "convex/values";
import Stripe from "stripe";

export const createCheckoutSession = action({
  // Accept cart items and shipping info
  args: {
    items: v.array(
      v.object({
        productId: v.id("products"),
        name: v.string(),
        price: v.number(), // must be in smallest currency unit (cents if USD)
        quantity: v.number(),
        image: v.optional(v.string()),
      }),
    ),
    shippingAddress: v.any(), // Pass the address to save later
    userId: v.id("user"),
  },
  handler: async (ctx, args) => {
    // Initialize stripe inside the action
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2023-10-16",
    });

    // Format your items for Stripe Checkout
    const lineItems = args.items.map((item) => ({
      price_data: {
        currency: "usd", // Set to 'usd' or dynamically pass
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100), // Stripe expects cents
      },
      quantity: item.quantity,
    }));

    // Create the session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout?cancelled=true`,
      // Pass metadata so the webhook knows what order to create when they pay
      metadata: {
        userId: args.userId,
        shippingAddress: JSON.stringify(args.shippingAddress),
        items: JSON.stringify(args.items), // Caution: metadata has a 500 char limit!
        // Better approach: create a "pending" order in Convex first,
        // and just pass the orderId here: `orderId: pendingOrder._id`
      },
    });

    return { url: session.url };
  },
});
```

### Step 2.2: Create the Webhook Endpoint

When a customer pays, we need Stripe to tell Convex so we can mark the order as paid and store it.
Create `convex/http.ts`.

```typescript
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import Stripe from "stripe";

const http = httpRouter();

http.route({
  path: "/stripe",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2023-10-16",
    });

    const payload = await request.text();
    const signature = request.headers.get("Stripe-Signature") as string;

    // You get this from Stripe dashboard when you register the webhook endpoint
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Extract the metadata we passed in Step 2.1
      const userId = session.metadata?.userId;
      const shippingAddress = JSON.parse(
        session.metadata?.shippingAddress || "{}",
      );
      const items = JSON.parse(session.metadata?.items || "[]");

      // Store the order in our database
      await ctx.runMutation(api.orders.create, {
        userId: userId as any,
        items,
        total: session.amount_total! / 100, // convert back to dollars
        shippingAddress,
        status: "pending", // Paid, but shipping is pending
      });

      // (Optional) Call a mutation to clear the user's cart
    }

    return new Response(null, { status: 200 });
  }),
});

export default http;
```

---

## 3. Frontend Implementation (React)

### Step 3.1: Triggering Checkout

In your `Checkout.jsx`, modify the final submit button to call the action we just made.

```jsx
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

export function Checkout() {
  const createStripeSession = useAction(api.payments.createCheckoutSession);
  const [isProcessing, setIsProcessing] = useState(false);
  // ... other hooks (cart, address etc)

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      const result = await createStripeSession({
        items: cartItems.map((i) => ({
          productId: i._id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
        })),
        shippingAddress: addressData,
        userId: localStorage.getItem("userId"),
      });

      // Redirect user to Stripe hosted checkout page
      window.location.href = result.url;
    } catch (error) {
      console.error("Payment failed to initialize", error);
      alert("Failed to start checkout process");
      setIsProcessing(false);
    }
  };

  // ... JSX ...
  <button onClick={handlePlaceOrder} disabled={isProcessing}>
    {isProcessing ? "Processing..." : "Pay Securely"}
  </button>;
}
```

---

## 4. Best Practices regarding Metadata Limits

In the snippet above (Step 2.1), we pass full `items` inside `session.metadata`. **Stripe restricts metadata to 500 characters.** If a cart has lots of items, this will crash.

**The industry standard fix:**

1. In `Checkout.jsx`, call a _mutation_ first to create an `order` document natively in Convex, with `status: "awaiting_payment"`.
2. Extract the newly returned `order._id`.
3. Pass ONLY the `order._id` to the Stripe `checkout_session` creation (metadata).
4. In your webhook (`http.ts`), you just look up `metadata.orderId` and fire a mutation that changes the status of that specific order from `awaiting_payment` to `pending` (which means paid and awaiting shipment).

## 5. Testing locally

Because webhooks come from Stripe's servers, Stripe can't reach your `localhost` by default to trigger `http.ts`.
You need to use Stripe CLI:

```bash
stripe listen --forward-to https://<your-convex-deployment>.convex.site/stripe
```

It will output a Webhook signing secret (`whsec_...`). Take this and set it as `STRIPE_WEBHOOK_SECRET` in your Convex environment variables.

Now when you trigger checkout from `localhost:5173`, Stripe will tunnel the confirmation webhook back down to your local Convex deployment!
